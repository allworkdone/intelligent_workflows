from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..repositories import StackRepository, ChatRepository
from ..schemas import ChatRequest, ChatMessageResponse, success_response, error_response
from ..services import WorkflowEngine

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/{stack_id}/message")
async def send_message(stack_id: UUID, request: ChatRequest, db: Session = Depends(get_db)):
    """Send a message to a stack and get a response"""
    # Validate stack exists
    stack_repo = StackRepository(db)
    stack = stack_repo.get_by_id(stack_id)
    if not stack:
        return error_response(
            code="STACK_NOT_FOUND",
            message=f"Stack with ID {stack_id} not found"
        )
    
    if not stack.workflow_data or not stack.workflow_data.get("nodes"):
        return error_response(
            code="NO_WORKFLOW",
            message="Stack has no workflow configured"
        )
    
    # Save user message
    chat_repo = ChatRepository(db)
    chat_repo.add_message(stack_id, "user", request.message)
    
    try:
        # Execute workflow
        workflow_engine = WorkflowEngine(db)
        response = await workflow_engine.execute(
            stack_id=stack_id,
            workflow_data=stack.workflow_data,
            query=request.message
        )
        
        # Save assistant response
        chat_repo.add_message(stack_id, "assistant", response)
        
        return success_response(
            data={"response": response},
            message="Message processed successfully"
        )
        
    except Exception as e:
        return error_response(
            code="EXECUTION_ERROR",
            message=f"Error executing workflow: {str(e)}"
        )


@router.get("/{stack_id}/history")
def get_chat_history(stack_id: UUID, limit: int = 50, db: Session = Depends(get_db)):
    """Get chat history for a stack"""
    # Validate stack exists
    stack_repo = StackRepository(db)
    stack = stack_repo.get_by_id(stack_id)
    if not stack:
        return error_response(
            code="STACK_NOT_FOUND",
            message=f"Stack with ID {stack_id} not found"
        )
    
    chat_repo = ChatRepository(db)
    messages = chat_repo.get_by_stack_id(stack_id, limit=limit)
    
    return success_response(
        data=[ChatMessageResponse.model_validate(m).model_dump() for m in messages],
        message="Chat history retrieved successfully"
    )


@router.delete("/{stack_id}/history")
def clear_chat_history(stack_id: UUID, db: Session = Depends(get_db)):
    """Clear chat history for a stack"""
    chat_repo = ChatRepository(db)
    count = chat_repo.clear_history(stack_id)
    
    return success_response(
        data={"deleted_count": count},
        message="Chat history cleared successfully"
    )
