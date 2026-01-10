from typing import List, Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class ChatMessageCreate(BaseModel):
    role: str
    content: str


class ChatMessageResponse(BaseModel):
    id: UUID
    stack_id: UUID
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = None
