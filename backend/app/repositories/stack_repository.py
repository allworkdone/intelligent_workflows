from typing import Optional, List
from sqlalchemy.orm import Session
from uuid import UUID
from .base import BaseRepository
from ..models.stack import Stack


class StackRepository(BaseRepository[Stack]):
    """Repository for Stack model operations"""
    
    def __init__(self, db: Session):
        super().__init__(Stack, db)
    
    def get_by_name(self, name: str) -> Optional[Stack]:
        return self.db.query(Stack).filter(Stack.name == name).first()
    
    def get_all_ordered(self, skip: int = 0, limit: int = 100) -> List[Stack]:
        return self.db.query(Stack).order_by(Stack.updated_at.desc()).offset(skip).limit(limit).all()
    
    def update_workflow(self, id: UUID, workflow_data: dict) -> Optional[Stack]:
        stack = self.get_by_id(id)
        if stack:
            stack.workflow_data = workflow_data
            self.db.commit()
            self.db.refresh(stack)
        return stack
