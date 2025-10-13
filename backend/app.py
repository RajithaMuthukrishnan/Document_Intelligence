from flask import Flask, request, jsonify, render_template, session
from flask_session import Session
from flask_cors import CORS
from werkzeug.utils import secure_filename
import uuid
import os
from utils import extract_data, summarize_docs, chunk_embed
import asyncio
from langchain_ollama import OllamaLLM
from langchain_ollama import OllamaEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from typing_extensions import List, TypedDict
from langchain.schema import Document
from langgraph.graph import START, StateGraph
from langchain_community.vectorstores import FAISS

from typing import TypedDict, List
from pydantic import BaseModel, Field
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import ChatPromptTemplate
from langgraph.graph import START, StateGraph
from langgraph.checkpoint.memory import MemorySaver

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://127.0.0.1:5173"])  # Enable CORS with credentials support
app.secret_key = "supersecretkey123"

# Server side session configuration
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = os.path.join(os.path.dirname(__file__), "flask_session")
app.config['SESSION_PERMANENT'] = False
Session(app)

# Temporary storage for uploaded files
PROJECT_TEMP_DIR = os.path.join(os.path.dirname(__file__), "project_temp")
os.makedirs(PROJECT_TEMP_DIR, exist_ok=True)  # create if not exists
UPLOAD_DIR = PROJECT_TEMP_DIR
# Temporary storage for the vectorstore - Global cache for active vector stores
VECTOR_STORE_CACHE = {}

# Instantiate the models and prompt
embedding_model = OllamaEmbeddings(
    model = "all-minilm:l6-v2",
)
llm = OllamaLLM(model="mistral")
# qa_prompt = ChatPromptTemplate.from_template("""Answer the following question based only on the provided context:
#     <context>
#     {context}
#     </context>
#     Question: {question}""")

# class QAState(TypedDict):
#     vector_store: FAISS
#     question: str
#     context: List[Document]
#     answer: str

# def retrieve(state: QAState):
#     vector_store = state['vector_store']
#     retrieved_docs = vector_store.similarity_search(state['question'], k=2)
#     return {'context': retrieved_docs}

# def generate(state: QAState):
#     retrieved_docs_content = '\n\n'.join(doc.page_content for doc in state['context'])
#     messages = qa_prompt.invoke({"question": state['question'], "context": retrieved_docs_content})
#     response = llm.invoke(messages)
#     return {'answer': response}

# # Compile QA application
# qa_workflow_builder = StateGraph(QAState).add_sequence([retrieve, generate])
# qa_workflow_builder.add_edge(START, "retrieve")
# qa_workflow = qa_workflow_builder.compile()

# Compile QA application with LangGraph
# STEP 1: Classification / Tagging
class State(TypedDict):
    question: str
    topic: str
    context: List[Document]
    answer: str
    messages: List[BaseMessage]

class TopicClassification(BaseModel):
    topic:str = Field(description="Intent of the text - greetings, small talk, law, others")

parser = PydanticOutputParser(pydantic_object=TopicClassification)

def classification(state: State):
    
    question = state["question"]
    categories = ["Greetings", "Small Talk", "Law", "Others"]
    format_instructions = parser.get_format_instructions()
    
    prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a text tagging bot. Classify the user's message into three categories: {categories}.\n\n "
     "Output the result in the required JSON format."
     "\n\n{format_instructions}"),
    ("human", "{question}")
    ])
    chain = (
        prompt.partial(format_instructions=format_instructions)
        | llm
        | parser
    )
    response = chain.invoke({"question": question, "categories":", ".join(categories)})
    return {"topic": response.topic}

# STEP 2: Router Logic
def rag_router(state: State):
    print(state['topic'].lower())
    if state["topic"].lower() in ["law","others"]:
        return "RAG"
    else:
        return "LLM"

# STEP 3-1: RAG
# RAG retrieve
def rag_retrieve(state: State, config):
    print("Entering RAG retrieve")
    vector_store = config["configurable"]["vector_store"]
    # Recursive Text Splitter
#     retrieved_docs = faiss_vectorstore.similarity_search(state["question"], k=2)
    # Semantic chunk retriever
    semantic_chunk_retriever = vector_store.as_retriever(search_kwargs={"k" : 1})
    retrieved_docs = semantic_chunk_retriever.invoke(state["question"], k=2)
    return {'context': retrieved_docs}

# RAG generate
def rag_generate(state: State):
    print("Entering RAG generate")
    #Retrieve messages history and append current user question
    messages = state.get("messages", [])
    messages.append(HumanMessage(content=state["question"]))
    
    question = state["question"]
    context = "\n\n".join(doc.page_content for doc in state["context"]) 
    qa_prompt = ChatPromptTemplate.from_template("""Answer the following question based only on the provided context. 
If you cannot answer please respond with "I don't know:
    <context>
    {context}
    </context>
    Question: {question}""")
    
    prompt = qa_prompt.invoke({"question": question, "context":context}).to_string()
    # Append prompt to message history
    messages.append(HumanMessage(content=prompt))
    
    # Call LLM with full conversation history including the current question and context
    answer = llm.invoke(messages)
    messages.append(AIMessage(content=answer))
    
    return {'answer': answer, 'messages':messages}

# STEP 3-2: LLM
# LLM for small talk
def small_talk(state: State):
    print("Entering small talk")
#     question = state["question"]
    messages = state.get("messages", [])
    messages.append(HumanMessage(content=state["question"]))
#     answer = model.invoke(question)
    answer = llm.invoke(messages)
    messages.append(AIMessage(content=answer))
    
    return {"answer": answer, "messages": messages}

# STEP 4: Graph
graph = StateGraph(State)
graph.add_node("classify", classification)
graph.add_node("small_talk_llm", small_talk)
graph.add_node("rag_retrieve", rag_retrieve)
graph.add_node("rag_generate", rag_generate)

graph.add_edge(START, "classify")
graph.add_conditional_edges("classify", rag_router, {
    "LLM": "small_talk_llm",
    "RAG": "rag_retrieve",
})
graph.add_edge("rag_retrieve", "rag_generate")

qa_workflow = graph.compile(checkpointer=MemorySaver())


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
async def upload_files():
    tool = request.form.get('tool')
    
    if "files" not in request.files:
        return jsonify({"error": "No files uploaded in the request"}), 400
    
    # Fetch files from the frontend
    uploaded_files = request.files.getlist("files")
    file_paths = []

    for file in uploaded_files:
        filename = secure_filename(file.filename)
        unique_name = f"{uuid.uuid4()}_{filename}"
        path = os.path.join(UPLOAD_DIR, unique_name)
        file.save(path)
        file_paths.append(path)

    if tool == 'summary':
        # Store file paths in the session for the respective user
        session["uploaded_files"] = file_paths
        session.modified = True  # Mark the session as modified to ensure it gets saved
        return jsonify({"message":"uploaded", "files": [file.filename for file in uploaded_files]}), 200
    
    elif tool == 'qa':
        session_id = session.get("session_id")
        if not session_id:
            session_id = str(uuid.uuid4())
            session["session_id"] = session_id

        # Extract data from files
        file_data = extract_data(file_paths)
        print("******Data received for qa tool******")

        # Chunk, embed and store in vector DB (im-memory for MVP, persistance DB for the next iteration)
        vector_store = await chunk_embed(file_data, embedding_model)
        VECTOR_STORE_CACHE[session_id] = vector_store

        # PERSISTANT STORAGE
        # vector_store.save_local(f"vectorstores/{session_id}")


        return jsonify({"message":"uploaded and embedded", "files": [file.filename for file in uploaded_files]}), 200

@app.route("/generatesummary", methods=["POST"])
async def generate_summary():
    # Retreive the respective user's files from the session
    file_paths = session.get("uploaded_files", [])

    if not file_paths:
        return jsonify({"error": "No files found for the session"}), 400
    
    # file_data = process_files(file_paths)
    file_data = extract_data(file_paths)
    print("******Data received for summary generation******")

    # Generate summary 
    summarized_docs = await summarize_docs(file_data, llm)
    print("******Summary generated:******")
    # Convert each Document -> dict
    serialized_docs = [
        {"page_content": doc.page_content, "metadata": doc.metadata}
        for doc in summarized_docs
    ]
    return jsonify(serialized_docs)

@app.route("/clear", methods=["POST"])
def clear():
    file_paths = session.get("uploaded_files", [])
    for path in file_paths:
        try:
            os.remove(path)
        except OSError:
            pass
    session.pop("uploaded_files", None)
    return {"message": "Cleared session and files"}


@app.route("/ask", methods=["POST"])
async def ask_llm():
    session_id = session.get("session_id")
    if not session_id or session_id not in VECTOR_STORE_CACHE:
        return {"error": "No vector store found. Please upload documents first."}, 400
    thread_id = f"{session_id}_{uuid.uuid4()}"

    vector_store = VECTOR_STORE_CACHE[session_id]
    question = request.json["query"]

    # PERSISTANT DB RETRIEVAL
    # faiss_vectorstore = FAISS.load_local(f"vectorstores/{session_id}", embedding_model)

    # Ask LLM
    # response = qa_workflow.invoke({"vector_store": vector_store, "question": question})
    config = {
    "configurable": {
        "thread_id": thread_id,
        "vector_store": VECTOR_STORE_CACHE[session_id],
    }
}
    response = qa_workflow.invoke({"question":question}, config) 

    # Retrieve context and answer
    answer = response['answer']
    # sources = [doc.page_content for doc in response['context']]
    sources = [doc.page_content for doc in response.get('context', [])] if response.get('context') else ["No relevant sources found."]

    return  {"answer":answer, "sources":sources}

