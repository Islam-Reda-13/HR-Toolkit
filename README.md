# HR-ToolKit

This project showcases a domain-specific conversational AI system designed to interact with customers about product features and forecast new product prices. The system was developed during a 6-month internship at Samsung Innovation Campus, focusing on balancing accuracy and efficiency under strict computational constraints.

# Overview

The goal was to build a conversational model that could:

Understand product-related queries (e.g., comparing models, explaining specs, etc.)

Predict future product prices based on historical data and market trends.

Operate efficiently on limited GPU memory resources (Google Colab’s A100).

To achieve this, the project explored:

4-bit quantization using QLoRA

Fine-tuning vs. RAG (Retrieval-Augmented Generation)

Performance–efficiency trade-offs for domain-specific NLP tasks

# Key Features

Conversational Interface — Handles natural queries about product specifications, comparisons, and recommendations.

Price Forecasting Module — Predicts new product prices using domain patterns captured during training.

Quantization with QLoRA — Reduced model memory usage from 32 GB → 8 GB with negligible accuracy loss.

Custom Fine-Tuning — Optimized model performance using AdamW, rank = 32, alpha = 64 configuration.

Comparative Study — Evaluated Fine-Tuning vs. RAG-based retrieval, demonstrating the strength of targeted fine-tuning for domain tasks.

# Results
Approach	Accuracy	RMSLE	GPU Memory	Notes
Fine-Tuned QLoRA Model	75%	0.36	~8 GB	Captured domain-specific patterns effectively
GPT-4o mini + RAG	69.2%	0.41	N/A	Weaker on domain-specific structure

## Requirements

- Python 3.8 or later

#### Install Python using MiniConda

1) Download and install MiniConda from [here](https://docs.anaconda.com/free/miniconda/#quick-command-line-install)
2) Create a new environment using the following command:
```bash
$ conda create -n mini-rag python=3.8
```
3) Activate the environment:
```bash
$ conda activate mini-rag
```

### (Optional) Setup you command line interface for better readability

```bash
export PS1="\[\033[01;32m\]\u@\h:\w\n\[\033[00m\]\$ "
```

## Installation

### Install the required packages

```bash
$ pip install -r requirements.txt
```

### Setup the environment variables

```bash
$ cp .env.example .env
```

Set your environment variables in the `.env` file. Like `OPENAI_API_KEY` value.

## Run Docker Compose Services

```bash
$ cd docker
$ cp .env.example .env
```

- update `.env` with your credentials



```bash
$ cd docker
$ sudo docker compose up -d
```

## Run the FastAPI server

```bash
$ uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

## POSTMAN Collection

Download the POSTMAN collection from [/assets/mini-rag-app.postman_collection.json](/assets/mini-rag-app.postman_collection.json)
