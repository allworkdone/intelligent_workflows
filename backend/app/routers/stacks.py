from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..repositories import StackRepository
from ..schemas import (
    StackCreate, 
    StackUpdate, 
    StackResponse, 
    WorkflowData,
    success_response, 
    error_response
)
from ..services import WorkflowEngine

router = APIRouter(prefix="/stacks", tags=["stacks"])


@router.get("")
def get_stacks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all stacks"""
    repo = StackRepository(db)
    stacks = repo.get_all_ordered(skip=skip, limit=limit)
    return success_response(
        data=[StackResponse.model_validate(s).model_dump() for s in stacks],
        message="Stacks retrieved successfully"
    )


@router.post("")
def create_stack(stack: StackCreate, db: Session = Depends(get_db)):
    """Create a new stack"""
    repo = StackRepository(db)
    db_stack = repo.create(stack.model_dump())
    return success_response(
        data=StackResponse.model_validate(db_stack).model_dump(),
        message="Stack created successfully"
    )


@router.get("/{stack_id}")
def get_stack(stack_id: UUID, db: Session = Depends(get_db)):
    """Get a stack by ID"""
    repo = StackRepository(db)
    stack = repo.get_by_id(stack_id)
    if not stack:
        return error_response(
            code="STACK_NOT_FOUND",
            message=f"Stack with ID {stack_id} not found"
        )
    return success_response(
        data=StackResponse.model_validate(stack).model_dump(),
        message="Stack retrieved successfully"
    )


@router.put("/{stack_id}")
def update_stack(stack_id: UUID, stack: StackUpdate, db: Session = Depends(get_db)):
    """Update a stack"""
    repo = StackRepository(db)
    
    update_data = stack.model_dump(exclude_unset=True)
    if "workflow_data" in update_data and update_data["workflow_data"]:
        update_data["workflow_data"] = update_data["workflow_data"].model_dump() if hasattr(update_data["workflow_data"], "model_dump") else update_data["workflow_data"]
    
    db_stack = repo.update(stack_id, update_data)
    if not db_stack:
        return error_response(
            code="STACK_NOT_FOUND",
            message=f"Stack with ID {stack_id} not found"
        )
    return success_response(
        data=StackResponse.model_validate(db_stack).model_dump(),
        message="Stack updated successfully"
    )


@router.delete("/{stack_id}")
def delete_stack(stack_id: UUID, db: Session = Depends(get_db)):
    """Delete a stack"""
    repo = StackRepository(db)
    if not repo.delete(stack_id):
        return error_response(
            code="STACK_NOT_FOUND",
            message=f"Stack with ID {stack_id} not found"
        )
    return success_response(message="Stack deleted successfully")


@router.post("/{stack_id}/workflow")
def save_workflow(stack_id: UUID, workflow: WorkflowData, db: Session = Depends(get_db)):
    """Save workflow data for a stack"""
    repo = StackRepository(db)
    db_stack = repo.update_workflow(stack_id, workflow.model_dump())
    if not db_stack:
        return error_response(
            code="STACK_NOT_FOUND",
            message=f"Stack with ID {stack_id} not found"
        )
    return success_response(
        data=StackResponse.model_validate(db_stack).model_dump(),
        message="Workflow saved successfully"
    )


@router.post("/{stack_id}/build")
def build_stack(stack_id: UUID, db: Session = Depends(get_db)):
    """Validate and build a stack"""
    repo = StackRepository(db)
    stack = repo.get_by_id(stack_id)
    if not stack:
        return error_response(
            code="STACK_NOT_FOUND",
            message=f"Stack with ID {stack_id} not found"
        )
    
    workflow_engine = WorkflowEngine(db)
    validation = workflow_engine.validate_workflow(stack.workflow_data or {})
    
    if not validation["valid"]:
        return error_response(
            code="INVALID_WORKFLOW",
            message="Workflow validation failed",
            details={"errors": validation["errors"], "warnings": validation["warnings"]}
        )
    
    return success_response(
        data={"valid": True, "warnings": validation["warnings"]},
        message="Stack built successfully"
    )
