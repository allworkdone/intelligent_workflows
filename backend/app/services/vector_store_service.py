from typing import List, Optional, Dict, Any
import chromadb
from chromadb.config import Settings as ChromaSettings
from ..config import settings


class VectorStoreService:
    """Service for managing vector storage using ChromaDB"""
    
    def __init__(self, collection_name: str = "default"):
        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIRECTORY,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        self.collection_name = collection_name
        self._collection = None
    
    @property
    def collection(self):
        if self._collection is None:
            self._collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
        return self._collection
    
    def add_documents(
        self, 
        documents: List[str], 
        embeddings: List[List[float]],
        ids: List[str],
        metadatas: Optional[List[Dict[str, Any]]] = None
    ) -> None:
        """Add documents with their embeddings to the collection"""
        self.collection.add(
            documents=documents,
            embeddings=embeddings,
            ids=ids,
            metadatas=metadatas
        )
    
    def query(
        self, 
        query_embedding: List[float], 
        n_results: int = 5
    ) -> Dict[str, Any]:
        """Query similar documents"""
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            include=["documents", "metadatas", "distances"]
        )
        return results
    
    def delete_by_metadata(self, metadata_filter: Dict[str, Any]) -> None:
        """Delete documents by metadata filter"""
        self.collection.delete(where=metadata_filter)
    
    def get_collection_for_stack(self, stack_id: str) -> "VectorStoreService":
        """Get or create a collection for a specific stack"""
        return VectorStoreService(collection_name=f"stack_{stack_id}")
    
    def clear_collection(self) -> None:
        """Clear all documents from the collection"""
        try:
            self.client.delete_collection(self.collection_name)
            self._collection = None
        except Exception:
            pass
