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
