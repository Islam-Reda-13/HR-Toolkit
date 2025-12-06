# HR-Toolkit

A comprehensive FastAPI-based application for HR document processing, intelligent question answering, web scraping, and automated email generation using RAG (Retrieval-Augmented Generation) technology.

## Features

- **Document Processing**: Upload and process various document types (PDF, TXT, Markdown)
- **RAG Question Answering**: Intelligent question answering based on your document corpus
- **Web Scraping & Summarization**: Scrape company websites and generate detailed summaries
- **HR Email Generation**: Automated generation of professional HR emails for various scenarios
- **Vector Database Integration**: Semantic search capabilities using Qdrant
- **Multiple LLM Providers**: Support for OpenAI, Cohere, and HuggingFace models
- **Folder Upload**: Batch upload of documents while preserving folder structure

## Requirements

- Python 3.10 or later
- MongoDB (via Docker)
- Qdrant Vector Database (via Docker)

## Installation

### Install Python using MiniConda

1. Download and install MiniConda from the [official documentation](https://docs.anaconda.com/free/miniconda/#quick-command-line-install)

2. Create a new environment:
```bash
conda create -n hr-toolkit python=3.10
```

3. Activate the environment:
```bash
conda activate hr-toolkit
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
- Set your API keys (OpenAI/OpenRouter, Cohere, HuggingFace)
- Configure MongoDB connection settings
- Set LLM model preferences
- Adjust file upload and processing parameters

## Docker Services Setup

### Configure Docker Environment

```bash
cd docker
cp .env.example .env
```

Update the Docker `.env` file with your credentials.

### Start Services

```bash
cd docker
docker compose up -d
```

This will start:
- MongoDB instance on port 27007
- Qdrant vector database

## Run the Application

Start the FastAPI server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

The API will be available at `http://localhost:5000`

API documentation will be available at `http://localhost:5000/docs`

## API Endpoints

### Base
- `GET /api/v1/` - Welcome endpoint with app information

### Data Management
- `POST /api/v1/data/upload/{project_id}` - Upload a single file
- `POST /api/v1/data/upload-folder/{project_id}` - Upload multiple files
- `POST /api/v1/data/process/{project_id}` - Process uploaded files into chunks

### NLP & RAG
- `POST /api/v1/nlp/index/push/{project_id}` - Index processed chunks into vector database
- `GET /api/v1/nlp/index/info/{project_id}` - Get vector database collection information
- `POST /api/v1/nlp/index/search/{project_id}` - Semantic search in document collection
- `POST /api/v1/nlp/index/answer/{project_id}` - Get RAG-based answers to questions

### Web Scraping
- `POST /api/v1/web-scraping/summarize` - Scrape and summarize a website

### HR Email Generation
- `POST /api/v1/hr-email/generate` - Generate professional HR emails


## Configuration

### LLM Providers

The application supports multiple LLM providers:

- **OpenAI/OpenRouter**: For generation (configured via `OPENROUTER_API_KEY`)
- **Cohere**: Alternative generation provider
- **HuggingFace**: For embeddings (sentence-transformers)

### Vector Database

Qdrant is used for vector storage with configurable:
- Distance method (cosine, euclidean, dot)
- Embedding size
- Collection management

### File Processing

Supported formats:
- Text files (.txt)
- PDF documents (.pdf)
- Markdown files (.md)

Configurable parameters:
- Maximum file size
- Chunk size for processing
- Chunk overlap for context preservation

