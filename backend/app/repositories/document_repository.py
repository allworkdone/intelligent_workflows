from typing import List
from sqlalchemy.orm import Session
from uuid import UUID
from .base import BaseRepository
from ..models.document import Document


class DocumentRepository(BaseRepository[Document]):
    """Repository for Document model operations"""
    
    def __init__(self, db: Session):
        super().__init__(Document, db)
    
    def get_by_stack_id(self, stack_id: UUID) -> List[Document]:
        return self.db.query(Document).filter(Document.stack_id == stack_id).all()
    
    def get_processed_by_stack_id(self, stack_id: UUID) -> List[Document]:
        return self.db.query(Document).filter(
            Document.stack_id == stack_id,
            Document.is_processed == True
        ).all()
    
    def mark_as_processed(self, id: UUID) -> bool:
        doc = self.get_by_id(id)
        if doc:
            doc.is_processed = True
            self.db.commit()
            return True
        return False
