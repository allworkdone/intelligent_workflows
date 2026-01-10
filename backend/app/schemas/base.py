from typing import Any, Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None


class BaseResponse(BaseModel, Generic[T]):
    """Base response structure for all API endpoints"""
    success: bool
    data: Optional[T] = None
    message: Optional[str] = None
    error: Optional[ErrorDetail] = None


def success_response(data: Any = None, message: str = "Operation successful") -> dict:
    """Create a standardized success response"""
    return {
        "success": True,
        "data": data,
        "message": message,
        "error": None
    }


def error_response(code: str, message: str, details: dict = None) -> dict:
    """Create a standardized error response"""
    return {
        "success": False,
        "data": None,
        "message": None,
        "error": {
            "code": code,
            "message": message,
            "details": details
        }
    }
