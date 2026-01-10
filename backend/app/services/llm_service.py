from typing import Optional, List
from openai import OpenAI
import google.generativeai as genai
from ..config import settings


class LLMService:
    """Service for interacting with LLM providers (OpenAI GPT, Gemini)"""
    
    def __init__(self, provider: str = "openai", model: str = None, api_key: str = None):
        self.provider = provider.lower()
        self.api_key = api_key
        
        if self.provider == "openai":
            self.client = OpenAI(api_key=api_key or settings.OPENAI_API_KEY)
            self.model = model or "gpt-4o-mini"
        elif self.provider == "gemini":
            genai.configure(api_key=api_key or settings.GOOGLE_API_KEY)
            self.model = model or "gemini-2.5-flash"
    
    def generate_response(
        self, 
        query: str, 
        context: Optional[str] = None,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7
    ) -> str:
        """Generate a response from the LLM"""
        if self.provider == "openai":
            return self._openai_response(query, context, system_prompt, temperature)
        elif self.provider == "gemini":
            return self._gemini_response(query, context, system_prompt, temperature)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")
    
    def _build_prompt(self, query: str, context: Optional[str], system_prompt: Optional[str]) -> str:
        """Build the full prompt with context and query"""
        prompt_parts = []
        
        if system_prompt:
            # Replace placeholders
            formatted_prompt = system_prompt
            formatted_prompt = formatted_prompt.replace("{query}", query)
            formatted_prompt = formatted_prompt.replace("{context}", context or "No context provided.")
            prompt_parts.append(formatted_prompt)
        else:
            if context:
                prompt_parts.append(f"Context:\n{context}\n")
            prompt_parts.append(f"Query: {query}")
        
        return "\n".join(prompt_parts)
    
    def _openai_response(
        self, 
        query: str, 
        context: Optional[str], 
        system_prompt: Optional[str],
        temperature: float
    ) -> str:
        """Generate response using OpenAI"""
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        user_content = query
        if context:
            user_content = f"Context:\n{context}\n\nQuery: {query}"
        
        messages.append({"role": "user", "content": user_content})
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature
        )
        return response.choices[0].message.content
    
    def _gemini_response(
        self, 
        query: str, 
        context: Optional[str], 
        system_prompt: Optional[str],
        temperature: float
    ) -> str:
        """Generate response using Gemini"""
        # Build model initialization parameters
        model_params = {
            "model_name": self.model,
            "generation_config": genai.types.GenerationConfig(temperature=temperature)
        }
        
        # Add system instruction if provided
        if system_prompt:
            model_params["system_instruction"] = system_prompt
        
        model = genai.GenerativeModel(**model_params)
        
        # Build user message with context if provided
        user_message = query
        if context:
            user_message = f"Context:\n{context}\n\nQuery: {query}"
        
        response = model.generate_content(user_message)
        return response.text
