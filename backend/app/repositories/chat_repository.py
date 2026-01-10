from typing import List
from sqlalchemy.orm import Session
from uuid import UUID
from .base import BaseRepository
from ..models.chat import ChatMessage


class ChatRepository(BaseRepository[ChatMessage]):
    """Repository for ChatMessage model operations"""
    
    def __init__(self, db: Session):
        super().__init__(ChatMessage, db)
    
    def get_by_stack_id(self, stack_id: UUID, limit: int = 50) -> List[ChatMessage]:
        return self.db.query(ChatMessage).filter(
            ChatMessage.stack_id == stack_id
        ).order_by(ChatMessage.created_at.asc()).limit(limit).all()
    
    def add_message(self, stack_id: UUID, role: str, content: str) -> ChatMessage:
        return self.create({
            "stack_id": stack_id,
            "role": role,
            "content": content
        })
    
    def clear_history(self, stack_id: UUID) -> int:
        count = self.db.query(ChatMessage).filter(
            ChatMessage.stack_id == stack_id
        ).delete()
        self.db.commit()
        return count
