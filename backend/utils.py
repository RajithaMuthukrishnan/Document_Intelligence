import copy
import operator
from typing import Annotated, List, TypedDict
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from langchain.schema import Document
from langchain_core.output_parsers import StrOutputParser
from langgraph.types import Send
from langgraph.graph import END, START, StateGraph
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_experimental.text_splitter import SemanticChunker
from langchain_community.vectorstores import FAISS


# HELPER FUNCTIONS FOR BACKEND
# from langchain_community.document_loaders import UnstructuredHTMLLoader
from bs4 import BeautifulSoup

def create_lang_documents(raw_docs):
    lang_docs = [Document(page_content=doc['body_text'], metadata={**doc['metadata']})
       for doc in raw_docs]
    return lang_docs

def extract_case_metadata(html_content: str) -> dict:
    soup = BeautifulSoup(html_content, "html.parser")
    
    body_text = soup.get_text(separator=" ", strip=True)
    # Extract - case id
    section = soup.find("section", {"class": "casebody"})
    case_id = section.get("data-case-id") if section else None
    # Extract - case title / name
    h4 = soup.find("h4", {"parties"})
    name = h4.get_text(strip=True) if h4 else None
    # Extract - attorneys
    attorneys = [
        tag.get_text(strip=True) for tag in soup.find_all("p",{"class", "attorneys"})
    ]
    # Extract - author
    author = soup.find("p",{"class","author"}).get_text(strip=True) if soup.find("p",{"class","author"}) else None
    
    return {
        "metadata":{
            "case_id": case_id,
            "case_name": name,
            "attorneys": attorneys,
            "author": author
        },
        "body_text": body_text
    }

def extract_data(file_list):
    data = []
    for file in file_list:
        if file.endswith('.html') or file.endswith('.htm'):
            with open(file, "r", encoding="utf-8") as f:
                html_content = f.read()
                data.append(extract_case_metadata(html_content)) 
                docs = create_lang_documents(data)
        else:
            print(f"Unsupported file type: {file}") 
    return docs



async def summarize_docs(documents, llm):
    new_docs = copy.deepcopy(documents)
    
    map_template = "Write a concise summary based only on the context given below and not on your knowledge:\n{context}"
    reduce_template = """
The following is a set of summaries:
{summaries}
Take these and distill it into a final, consolidated summary of the main themes.
"""
    map_prompt = ChatPromptTemplate([("human"), map_template])
    reduce_prompt = ChatPromptTemplate([("human"), reduce_template])
    
    map_chain = map_prompt | llm | StrOutputParser()
    reduce_chain = reduce_prompt | llm | StrOutputParser()
    
    # overall state of the main graph - contains the input document contents,
    # corresponding summaries, and a final summary.
    class OverallState(TypedDict):
        contents: List[str]
        summaries: Annotated[list, operator.add]
        final_summary: str

    # state of the node that will "map" all documents in order to generate summaries
    class SummaryState(TypedDict):
        content: str
        
    async def generate_summary(state: SummaryState):
        response = await map_chain.ainvoke(state["content"])
        return {"summaries": [response]}

    def map_summaries(state: OverallState):
        return[
            Send("generate_summary", {"content": content}) for content in state["contents"]
        ]

    async def generate_final_summary(state: OverallState):
        response = await reduce_chain.ainvoke(state["summaries"])
        return {"final_summary": response}

    graph = StateGraph(OverallState)
    graph.add_node("generate_summary", generate_summary)
    graph.add_node("generate_final_summary", generate_final_summary)
    graph.add_conditional_edges(START, map_summaries, ["generate_summary"])
    graph.add_edge("generate_summary", "generate_final_summary")
    graph.add_edge("generate_final_summary", END)
    app = graph.compile()
    
    results = await app.ainvoke({"contents": new_docs})
    for doc, summary in zip(new_docs, results['summaries']):
        doc.metadata['summary'] = summary
    new_docs.append(Document(metadata={'title':'final_summary'}, page_content=results['final_summary']))

    return new_docs


async def chunk_embed(documents, embedding_model):
    # chunk the docs
    # Recursive Text Splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
        add_start_index=True,
    )
    print(documents)
    chunks = text_splitter.split_documents(documents)

    # Semantic Chunker
    semantic_chunker = SemanticChunker(embedding_model, breakpoint_threshold_type="percentile")
    chunks = semantic_chunker.create_documents([d.page_content for d in chunks])

    # # Embed and store the chunks in-memory [MVP] : To be changed to persistance DB in the next iteration
    # # Recursive Text Splitter
    # faiss_vectorstore = FAISS.from_documents(chunks, embedding_model)

    # Semantic Chunker
    faiss_vectorstore = FAISS.from_documents(chunks, embedding_model)
     
    return faiss_vectorstore

# 