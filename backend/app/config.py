import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "GenAI Stack API"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/genai_stack"
    
    # ChromaDB
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_data"
    
    # OpenAI
    OPENAI_API_KEY: str = ""
    
    # Google AI (Gemini)
    GOOGLE_API_KEY: str = ""
    
    # SerpAPI
    SERPAPI_KEY: str = ""
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
