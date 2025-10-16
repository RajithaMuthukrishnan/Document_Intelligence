# Legal Document Intelligence Tool

An **LLM-powered web application** designed for document intelligence. 
Although this tool is architected to be adaptable to various domains, the current implementation focuses specifically on **legal documents**, providing a specialized use case.

This project showcases a modern approach to retrieval-augmented generation (RAG) within a web interface.

## Features

* **Document Summarization:** Provides an **individual summary** for every uploaded document and a **global, consolidated summary** across the entire document set.
* **Conversational QA (Question Answering):** A **conversational bot** that uses the document corpus to accurately answer user questions.

## Models and Datasets

| Component | Model/Source | Notes |
| :--- | :--- | :--- |
| **Large Language Model (LLM)** | `Mistral - mistral:latest` | Utilized for generation and conversational intelligence. |
| **Embedding Model** | `all-minilm:l6-v2` | Used for creating high-quality, dense vector embeddings. |
| **Dataset** | [Caselaw Access Project](https://case.law/caselaw/) | Obtained data from bulk download|

## Development Progress

| Status | Feature Description | 
| :--- | :--- | 
| **Completed** | Document Summarization (Individual and Global) | 
| **Completed** | Logic for QA (Question Answering) via RAG. |
| **In Progress** | Front end integration for QA tool. |

## References
1. The President and Fellows of Harvard University. "Caselaw Access Project." 2024, [https://case.law/caselaw/]

## Demo
### Homepage
<img width="1158" height="806" alt="Homepage" src="https://github.com/user-attachments/assets/cd73ce47-900a-4e74-92ba-9a3e9da588a7" />

### Summary Tool
<img width="1155" height="726" alt="Summarytool" src="https://github.com/user-attachments/assets/0472fa68-cd0b-4cda-bef4-d8fc2137ebcd" />
<img width="1159" height="866" alt="summaries" src="https://github.com/user-attachments/assets/7ee3270e-64c6-4553-86f6-37b735872b4a" />
<img width="1159" height="863" alt="summarymodal" src="https://github.com/user-attachments/assets/b97b3a3c-fb7b-4ba7-8a63-11af67f37c25" />

### QA Tool
<img width="1459" height="638" alt="QATool" src="https://github.com/user-attachments/assets/053cdaa4-0970-4a5e-9941-6efd9697e3d7" />
<img width="1451" height="1229" alt="QATool1" src="https://github.com/user-attachments/assets/7ee7d924-3ea7-4ec3-842e-1c6aafe56c74" />
<img width="1452" height="1229" alt="QATool2" src="https://github.com/user-attachments/assets/da4ad606-4844-4c99-9538-680eef78a73a" />
