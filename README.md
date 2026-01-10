# GenAI Stack - No-Code Workflow Builder

Enable users to visually create and interact with intelligent workflows.

## Quick Start

```bash
# Start the full stack application
docker-compose up -d --build
```

Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000/docs

## Features
- **Visual Builder**: React Flow based drag-and-drop interface
- **RAG Support**: Upload PDFs, chunking, and vector embedding
- **Multi-LLM**: Support for OpenAI GPT and Google Gemini
- **Web Search**: Integrated SerpAPI for real-time info
- **Modular Backend**: FastAPI with clean architecture

## Tech Stack
- **Frontend**: React, TypeScript, Vite, React Flow, Zustand
- **Backend**: FastAPI, SQLAlchemy, Pydantic, ChromaDB, PyMuPDF
- **Database**: PostgreSQL (Metadata), ChromaDB (Vector Store)
- **Infrastructure**: Docker, Docker Compose
