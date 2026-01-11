# GenAI Stack - No-Code Workflow Builder

A full-stack web application that enables users to visually create and interact with intelligent AI workflows using a drag-and-drop interface. Build custom RAG (Retrieval-Augmented Generation) pipelines without writing code.

![GenAI Stack](https://img.shields.io/badge/React-19.2-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue) ![Docker](https://img.shields.io/badge/Docker-Ready-blue)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Core Components](#-core-components)
- [API Documentation](#-api-documentation)
- [Usage Guide](#-usage-guide)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Architecture](#-architecture)
- [Contributing](#-contributing)

---

## ✨ Features

### Visual Workflow Builder
- **Drag-and-Drop Interface**: Build AI workflows visually using React Flow
- **4 Core Components**: User Query, KnowledgeBase, LLM Engine, Output
- **Real-time Validation**: Instant feedback on workflow correctness
- **Workflow Persistence**: Save and load workflows from database

### RAG (Retrieval-Augmented Generation)
- **Document Upload**: Support for PDF documents
- **Text Extraction**: Automatic text extraction using PyMuPDF
- **Smart Chunking**: Configurable chunk size with overlap
- **Vector Embeddings**: OpenAI and Google Gemini embedding models
- **Semantic Search**: ChromaDB vector store for efficient retrieval

### Multi-LLM Support
- **OpenAI GPT**: GPT-4, GPT-3.5-turbo support
- **Google Gemini**: Gemini Pro integration
- **Custom Prompts**: Configure system prompts per workflow
- **Web Search**: Integrated SerpAPI for real-time information

### Chat Interface
- **Interactive Chat**: Ask questions and get AI-powered responses
- **Chat History**: Persistent conversation history
- **Follow-up Questions**: Maintain context across multiple queries
- **Markdown Support**: Rich text formatting in responses

---

## 🛠 Tech Stack

### Frontend
- **React 19.2** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **React Flow** - Visual workflow canvas
- **Zustand** - State management
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first styling
- **Axios** - HTTP client

### Backend
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **Pydantic** - Data validation
- **ChromaDB** - Vector database
- **OpenAI** - GPT and embeddings
- **Google Generative AI** - Gemini models
- **PyMuPDF** - PDF text extraction
- **HTTPX** - Async HTTP client

### Infrastructure
- **PostgreSQL 15** - Relational database
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Frontend web server

---

## 📦 Prerequisites

### Required
- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Git**

### For Local Development (Without Docker)
- **Node.js** (version 18+)
- **Python** (version 3.11+)
- **PostgreSQL** (version 15+)

### API Keys
You'll need API keys for the LLM and search services:
- **OpenAI API Key** - [Get it here](https://platform.openai.com/api-keys)
- **Google API Key** - [Get it here](https://makersuite.google.com/app/apikey)
- **SerpAPI Key** (Optional) - [Get it here](https://serpapi.com/)

---

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assignment
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Start the application**
   ```bash
   docker-compose up -d --build
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

5. **Create your first workflow**
   - Click "Create New Stack"
   - Drag components onto the canvas
   - Connect them in order: User Query → KnowledgeBase → LLM Engine → Output
   - Configure each component
   - Click "Build Stack"
   - Click "Chat with Stack" to start asking questions

### Local Development Setup

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/genai_stack"
export OPENAI_API_KEY="your-key-here"
export GOOGLE_API_KEY="your-key-here"
export SERPAPI_KEY="your-key-here"

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🔐 Environment Variables

### Backend Environment Variables

Create a `.env` file in the project root:

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@db:5432/genai_stack

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Google Gemini Configuration
GOOGLE_API_KEY=your-google-api-key-here

# SerpAPI Configuration (Optional)
SERPAPI_KEY=your-serpapi-key-here

# Application Settings
APP_NAME="GenAI Stack"
UPLOAD_DIR=/app/uploads
CHROMA_DIR=/app/chroma_data
```

### Frontend Environment Variables

Frontend uses Vite, so create `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📁 Project Structure

```
assignment/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── models/            # SQLAlchemy models
│   │   ├── repositories/      # Data access layer
│   │   ├── routers/           # API endpoints
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   ├── config.py          # Configuration
│   │   ├── database.py        # Database setup
│   │   └── main.py            # FastAPI app
│   ├── uploads/               # Uploaded documents
│   ├── chroma_data/           # ChromaDB vector store
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── chat/         # Chat components
│   │   │   ├── layout/       # Layout components
│   │   │   ├── stacks/       # Stack management
│   │   │   ├── ui/           # UI primitives
│   │   │   └── workflow/     # Workflow builder
│   │   ├── pages/            # Page components
│   │   ├── api/              # API client
│   │   ├── types/            # TypeScript types
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env
└── README.md
```

---

## 🧩 Core Components

### 1. User Query Component
- **Purpose**: Entry point for user questions
- **Configuration**: None required
- **Connections**: Must connect to LLM Engine or KnowledgeBase

### 2. KnowledgeBase Component
- **Purpose**: Document storage and retrieval
- **Configuration**:
  - Upload PDF documents
  - Select embedding model (OpenAI/Gemini)
  - Process documents to generate embeddings
- **Connections**: Optional input, connects to LLM Engine

### 3. LLM Engine Component
- **Purpose**: Generate AI responses
- **Configuration**:
  - Select provider (OpenAI/Gemini)
  - Choose model (GPT-4, Gemini Pro, etc.)
  - Custom system prompt
  - Enable web search (optional)
- **Connections**: Receives from User Query/KnowledgeBase, outputs to Output

### 4. Output Component
- **Purpose**: Display responses to user
- **Configuration**: None required
- **Connections**: Terminal node, receives from LLM Engine

---

## 📚 API Documentation

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Stacks
- `GET /api/stacks` - List all stacks
- `POST /api/stacks` - Create a new stack
- `GET /api/stacks/{id}` - Get stack details
- `PUT /api/stacks/{id}` - Update stack
- `DELETE /api/stacks/{id}` - Delete stack
- `POST /api/stacks/{id}/workflow` - Save workflow
- `POST /api/stacks/{id}/build` - Validate workflow

#### Documents
- `POST /api/documents/upload/{stack_id}` - Upload document
- `POST /api/documents/{id}/process` - Process document
- `GET /api/documents/stack/{stack_id}` - List stack documents
- `DELETE /api/documents/{id}` - Delete document

#### Chat
- `POST /api/chat/{stack_id}/message` - Send message
- `GET /api/chat/{stack_id}/history` - Get chat history
- `DELETE /api/chat/{stack_id}/history` - Clear chat history

---

## 📖 Usage Guide

### Creating a Workflow

1. **Create a New Stack**
   - Click "Create New Stack" on the homepage
   - Enter a name and description
   - Click "Create"

2. **Build Your Workflow**
   - Drag "User Query" component to canvas
   - (Optional) Add "KnowledgeBase" for document-based answers
   - Add "LLM Engine" component
   - Add "Output" component
   - Connect components in logical order

3. **Configure Components**
   - Click on each component to open configuration panel
   - For KnowledgeBase:
     - Upload PDF documents
     - Select embedding model
     - Click "Process" for each document
   - For LLM Engine:
     - Select AI provider (OpenAI/Gemini)
     - Choose model
     - Add custom prompt (optional)
     - Enable web search (optional)

4. **Validate Workflow**
   - Click "Build Stack" to validate
   - Fix any configuration errors

5. **Chat with Your Workflow**
   - Click "Chat with Stack"
   - Ask questions in the chat interface
   - Workflow processes your query through connected components

### Example Workflows

#### Simple Q&A Bot
```
User Query → LLM Engine → Output
```
Best for: General questions, no document context needed

#### RAG Pipeline (Document Q&A)
```
User Query → KnowledgeBase → LLM Engine → Output
```
Best for: Answering questions about uploaded documents

#### Web-Enhanced Q&A
```
User Query → LLM Engine (with web search) → Output
```
Best for: Real-time information, current events

---

## 🐳 Deployment

### Docker Compose (Production)

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Kubernetes (Optional)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Kubernetes deployment instructions.

---

## 🔧 Troubleshooting

### Common Issues

#### Docker containers won't start

**Problem**: Port already in use  
**Solution**:
```bash
# Check what's using the ports
lsof -i :5173  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # PostgreSQL

# Kill the process or change ports in docker-compose.yml
```

#### Database connection errors

**Problem**: Backend can't connect to PostgreSQL  
**Solution**:
```bash
# Check if database container is running
docker-compose ps

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

#### ChromaDB errors

**Problem**: "Collection not found" or embedding errors  
**Solution**:
```bash
# Delete ChromaDB data and restart
docker-compose down
rm -rf backend/chroma_data
docker-compose up -d
```

#### API Key errors

**Problem**: "API key not found" or authentication errors  
**Solution**:
1. Check `.env` file has correct API keys
2. Restart backend container: `docker-compose restart backend`
3. Verify keys are valid at provider websites

#### Document upload fails

**Problem**: File upload returns 500 error  
**Solution**:
1. Check file is a valid PDF
2. Ensure `backend/uploads` directory exists and has write permissions
3. Check backend logs: `docker-compose logs backend`

#### Frontend shows "Network Error"

**Problem**: Can't connect to backend  
**Solution**:
1. Verify backend is running: http://localhost:8000/api/health
2. Check CORS settings in `backend/app/main.py`
3. Clear browser cache and reload

---

## 🏗 Architecture

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

### High-Level Overview

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────────┐
│           React Frontend                │
│  (Workflow Builder + Chat Interface)    │
└──────────────────┬──────────────────────┘
                   │ HTTP/REST
                   ↓
┌─────────────────────────────────────────┐
│          FastAPI Backend                │
│  ┌──────────────────────────────────┐   │
│  │     Workflow Engine              │   │
│  │  ┌────────┐  ┌───────────────┐  │   │
│  │  │  LLM   │  │ Web Search    │  │   │
│  │  └────────┘  └───────────────┘  │   │
│  │  ┌────────────────────────────┐ │   │
│  │  │   Vector Store (ChromaDB)  │ │   │
│  │  └────────────────────────────┘ │   │
│  └──────────────────────────────────┘   │
└──────────────────┬──────────────────────┘
                   │
                   ↓
          ┌────────────────┐
          │   PostgreSQL   │
          │   (Metadata)   │
          └────────────────┘
```

---

## 👥 Contributing

This is an assignment project. For the actual implementation team:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is part of a full-stack engineering assignment.

---

## 🙏 Acknowledgments

- **React Flow** - For the excellent workflow visualization library
- **FastAPI** - For the fast and intuitive Python web framework
- **OpenAI & Google** - For providing powerful LLM APIs
- **ChromaDB** - For the efficient vector database

---

## 📞 Support

For questions or issues:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [API Documentation](http://localhost:8000/docs)
3. Check Docker logs: `docker-compose logs`

---

**Built with ❤️ as part of a Full-Stack Engineering Assignment**
