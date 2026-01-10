import os
import hashlib
import uuid as uuid_lib
from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
import fitz  # PyMuPDF
from ..database import get_db
from ..repositories import StackRepository, DocumentRepository
from ..schemas import DocumentResponse, DocumentUploadResponse, success_response, error_response
from ..services import EmbeddingService, VectorStoreService
from ..config import settings

router = APIRouter(prefix="/documents", tags=["documents"])


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file using PyMuPDF"""
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Split text into overlapping chunks"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk)
        start = end - overlap
    return chunks


@router.post("/upload/{stack_id}")
async def upload_document(
    stack_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a document to a stack"""
    # Validate stack exists
    stack_repo = StackRepository(db)
    stack = stack_repo.get_by_id(stack_id)
    if not stack:
        return error_response(
            code="STACK_NOT_FOUND",
            message=f"Stack with ID {stack_id} not found"
        )
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        return error_response(
            code="INVALID_FILE_TYPE",
            message="Only PDF files are supported"
        )
    
    # Create upload directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid_lib.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save file
    content = await file.read()
    content_hash = hashlib.sha256(content).hexdigest()
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Create document record
    doc_repo = DocumentRepository(db)
    doc = doc_repo.create({
        "stack_id": stack_id,
        "filename": file.filename,
        "file_path": file_path,
        "content_hash": content_hash,
        "is_processed": False
    })
    
    return success_response(
        data=DocumentUploadResponse(
            id=doc.id,
            filename=doc.filename,
            message="Document uploaded successfully. Call /process to extract and embed."
        ).model_dump(),
        message="Document uploaded successfully"
    )


@router.post("/{document_id}/process")
async def process_document(
    document_id: UUID,
    embedding_model: str = "openai",
    api_key: str = None,
    db: Session = Depends(get_db)
):
    """Process a document: extract text and generate embeddings"""
    doc_repo = DocumentRepository(db)
    doc = doc_repo.get_by_id(document_id)
    
    if not doc:
        return error_response(
            code="DOCUMENT_NOT_FOUND",
            message=f"Document with ID {document_id} not found"
        )
    
    if doc.is_processed:
        return success_response(
            data=DocumentResponse.model_validate(doc).model_dump(),
            message="Document already processed"
        )
    
    try:
        # Extract text from PDF
        text = extract_text_from_pdf(doc.file_path)
        
        # Chunk text
        chunks = chunk_text(text)
        
        if not chunks:
            return error_response(
                code="EXTRACTION_FAILED",
                message="No text could be extracted from the document"
            )
        
        # Generate embeddings
        embedding_service = EmbeddingService(provider=embedding_model, api_key=api_key)
        embeddings = embedding_service.generate_embeddings(chunks)
        
        # Store in vector database
        vector_store = VectorStoreService(collection_name=f"stack_{doc.stack_id}")
        chunk_ids = [f"{doc.id}_{i}" for i in range(len(chunks))]
        metadatas = [{"document_id": str(doc.id), "filename": doc.filename, "chunk_index": i} for i in range(len(chunks))]
        
        vector_store.add_documents(
            documents=chunks,
            embeddings=embeddings,
            ids=chunk_ids,
            metadatas=metadatas
        )
        
        # Mark as processed
        doc_repo.mark_as_processed(document_id)
        doc = doc_repo.get_by_id(document_id)
        
        return success_response(
            data=DocumentResponse.model_validate(doc).model_dump(),
            message=f"Document processed successfully. {len(chunks)} chunks created."
        )
        
    except Exception as e:
        return error_response(
            code="PROCESSING_ERROR",
            message=f"Error processing document: {str(e)}"
        )


@router.get("/stack/{stack_id}")
def get_stack_documents(stack_id: UUID, db: Session = Depends(get_db)):
    """Get all documents for a stack"""
    doc_repo = DocumentRepository(db)
    documents = doc_repo.get_by_stack_id(stack_id)
    return success_response(
        data=[DocumentResponse.model_validate(d).model_dump() for d in documents],
        message="Documents retrieved successfully"
    )


@router.delete("/{document_id}")
def delete_document(document_id: UUID, db: Session = Depends(get_db)):
    """Delete a document"""
    doc_repo = DocumentRepository(db)
    doc = doc_repo.get_by_id(document_id)
    
    if not doc:
        return error_response(
            code="DOCUMENT_NOT_FOUND",
            message=f"Document with ID {document_id} not found"
        )
    
    # Delete from vector store
    try:
        vector_store = VectorStoreService(collection_name=f"stack_{doc.stack_id}")
        vector_store.delete_by_metadata({"document_id": str(document_id)})
    except Exception:
        pass
    
    # Delete file
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
    
    # Delete record
    doc_repo.delete(document_id)
    
    return success_response(message="Document deleted successfully")
