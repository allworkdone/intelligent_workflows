from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import stacks_router, documents_router, chat_router
from .config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="API for GenAI Stack - No-Code Workflow Builder",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(stacks_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(chat_router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {
        "success": True,
        "data": {"status": "healthy"},
        "message": "API is running"
    }


@app.get("/")
def root():
    return {
        "success": True,
        "data": {"name": settings.APP_NAME, "version": "1.0.0"},
        "message": "Welcome to GenAI Stack API"
    }
