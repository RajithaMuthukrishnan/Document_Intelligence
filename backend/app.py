from flask import Flask, request, jsonify, render_template, session
from flask_session import Session
from flask_cors import CORS
from werkzeug.utils import secure_filename
import uuid
import os
from utils import extract_data, summarize_docs
import asyncio

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

# Extract the text from each file and store it in a variable for now
# Chuck each file's text
# Create embeddings for each chunk
# Store the embeddings in a variable for now. Later use vector database (Pinecone, Weaviate, etc.)
# Send the embeddings to send to the LLM model Mistral and get the response back
# Send the response back to the frontend

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_files():
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

    # Store file paths in the session for the respective user
    session["uploaded_files"] = file_paths
    session.modified = True  # Mark the session as modified to ensure it gets saved
    return jsonify({"message":"uploaded", "files": [file.filename for file in uploaded_files]}), 200

@app.route("/generatesummary", methods=["POST"])
async def generate_summary():
    # Retreive the respective user's files from the session
    file_paths = session.get("uploaded_files", [])

    if not file_paths:
        return jsonify({"error": "No files found for the session"}), 400
    
    # file_data = process_files(file_paths)
    file_data = extract_data(file_paths)
    print("******Data received for summary generation:******")

    # Placeholder for summary generation 
    summarized_docs = await summarize_docs(file_data)
    print("******Summary generated:******")
    # Convert each Document → dict
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


