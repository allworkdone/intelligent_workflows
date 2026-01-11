from typing import List, Dict, Any, Optional
import httpx
from ..config import settings


class WebSearchService:
    """Service for performing web searches using SerpAPI or Brave Search"""
    
    def __init__(self, provider: str = "serpapi", api_key: str = None):
        """
        Initialize web search service
        
        Args:
            provider: "serpapi" or "brave"
            api_key: API key for the provider (uses settings if not provided)
        """
        self.provider = provider.lower()
        
        if self.provider == "serpapi":
            self.api_key = api_key or settings.SERPAPI_KEY
            self.base_url = "https://serpapi.com/search"
        elif self.provider == "brave":
            self.api_key = api_key or getattr(settings, 'BRAVE_API_KEY', None)
            self.base_url = "https://api.search.brave.com/res/v1/web/search"
        else:
            raise ValueError(f"Unsupported provider: {provider}. Use 'serpapi' or 'brave'")
    
    async def search(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """Perform a web search and return results"""
        if not self.api_key:
            return []
        
        if self.provider == "serpapi":
            return await self._search_serpapi(query, num_results)
        elif self.provider == "brave":
            return await self._search_brave(query, num_results)
        
        return []
    
    async def _search_serpapi(self, query: str, num_results: int) -> List[Dict[str, Any]]:
        """Perform search using SerpAPI"""
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
                print(f"SerpAPI search error: {e}")
                return []
    
    async def _search_brave(self, query: str, num_results: int) -> List[Dict[str, Any]]:
        """Perform search using Brave Search API"""
        headers = {
            "Accept": "application/json",
            "X-Subscription-Token": self.api_key
        }
        
        params = {
            "q": query,
            "count": num_results
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    self.base_url, 
                    headers=headers, 
                    params=params, 
                    timeout=30
                )
                response.raise_for_status()
                data = response.json()
                
                results = []
                for item in data.get("web", {}).get("results", [])[:num_results]:
                    results.append({
                        "title": item.get("title", ""),
                        "link": item.get("url", ""),
                        "snippet": item.get("description", "")
                    })
                return results
            except Exception as e:
                print(f"Brave Search error: {e}")
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

