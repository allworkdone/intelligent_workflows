from typing import List, Dict, Any, Optional
import httpx
from ..config import settings


class WebSearchService:
    """Service for performing web searches using SerpAPI"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.SERPAPI_KEY
        self.base_url = "https://serpapi.com/search"
    
    async def search(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """Perform a web search and return results"""
        if not self.api_key:
            return []
        
        params = {
            "q": query,
            "api_key": self.api_key,
            "engine": "google",
            "num": num_results
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(self.base_url, params=params, timeout=30)
                response.raise_for_status()
                data = response.json()
                
                results = []
                for item in data.get("organic_results", [])[:num_results]:
                    results.append({
                        "title": item.get("title", ""),
                        "link": item.get("link", ""),
                        "snippet": item.get("snippet", "")
                    })
                return results
            except Exception as e:
                print(f"Web search error: {e}")
                return []
    
    def format_results_as_context(self, results: List[Dict[str, Any]]) -> str:
        """Format search results as context for LLM"""
        if not results:
            return ""
        
        context_parts = ["Web search results:"]
        for i, result in enumerate(results, 1):
            context_parts.append(
                f"{i}. {result['title']}\n   {result['snippet']}\n   Source: {result['link']}"
            )
        return "\n".join(context_parts)
