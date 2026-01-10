from typing import List
from openai import OpenAI
import google.generativeai as genai
from ..config import settings


class EmbeddingService:
    """Service for generating embeddings using OpenAI or Gemini"""
    
    def __init__(self, provider: str = "openai", api_key: str = None):
        self.provider = provider.lower()
        self.api_key = api_key
        
        if self.provider == "openai":
            self.client = OpenAI(api_key=api_key or settings.OPENAI_API_KEY)
        elif self.provider == "gemini":
            genai.configure(api_key=api_key or settings.GOOGLE_API_KEY)
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts"""
        if self.provider == "openai":
            return self._openai_embeddings(texts)
        elif self.provider == "gemini":
            return self._gemini_embeddings(texts)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")
    
    def _openai_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using OpenAI"""
        response = self.client.embeddings.create(
            model="text-embedding-3-small",
            input=texts
        )
        return [item.embedding for item in response.data]
    
    def _gemini_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using Gemini"""
        embeddings = []
        for text in texts:
            result = genai.embed_content(
                model="models/embedding-001",
                content=text,
                task_type="retrieval_document"
            )
            embeddings.append(result['embedding'])
        return embeddings
