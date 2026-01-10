from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class NodeData(BaseModel):
    """Node configuration data"""
    label: str
    type: str
    config: Optional[Dict[str, Any]] = None


class NodePosition(BaseModel):
    x: float
    y: float


class WorkflowNode(BaseModel):
    id: str
    type: str
    position: NodePosition
    data: NodeData


class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class WorkflowData(BaseModel):
    """Complete workflow definition"""
    nodes: List[WorkflowNode] = []
    edges: List[WorkflowEdge] = []


class StackCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class StackUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    workflow_data: Optional[WorkflowData] = None


class StackResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    workflow_data: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
