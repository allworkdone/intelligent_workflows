# Low-Level Design (LLD)
## GenAI Stack - No-Code Workflow Builder

---

## 1. Module Design

### 1.1 Frontend Modules

#### 1.1.1 Pages Module

**Location**: `frontend/src/pages/`

```typescript
// MyStacks.tsx
interface MyStacksProps {}

interface Stack {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const MyStacks: React.FC<MyStacksProps> = () => {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch stacks from API
  // Render stack cards
  // Handle create, delete actions
}

// WorkflowBuilder.tsx
interface WorkflowBuilderProps {}

const WorkflowBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Workflow management logic
  // Save, build, chat handlers
}
```

#### 1.1.2 Workflow Module

**Location**: `frontend/src/components/workflow/`

**Class Diagram**:
```
┌─────────────────────────┐
│   WorkflowCanvas        │
│─────────────────────────│
│ - nodes: Node[]         │
│ - edges: Edge[]         │
│ - onNodesChange()       │
│ - onEdgesChange()       │
│ - onNodeSelect()        │
└─────────────────────────┘
           │
           ├──────┬──────┬──────┐
           ▼      ▼      ▼      ▼
     ┌─────────┬──────┬──────┬────────┐
     │UserQuery│KB    │LLM   │Output  │
     │Node     │Node  │Node  │Node    │
     └─────────┴──────┴──────┴────────┘

┌─────────────────────────┐
│   ComponentPanel        │
│─────────────────────────│
│ - components[]          │
│ - onDragStart()         │
└─────────────────────────┘

┌─────────────────────────┐
│   ConfigPanel           │
│─────────────────────────│
│ - selectedNode: Node    │
│ - stackId: string       │
│ - documents[]           │
│ - onUpdateNode()        │
└─────────────────────────┘
```

**Node Data Structure**:
```typescript
interface WorkflowNode {
  id: string;
  type: 'userQuery' | 'knowledgeBase' | 'llmEngine' | 'output';
  position: { x: number; y: number };
  data: {
    label: string;
    config: NodeConfig;
  };
}

interface NodeConfig {
  // KnowledgeBase
  embeddingModel?: 'openai' | 'gemini';
  documents?: Array<{
    id: string;
    filename: string;
    is_processed: boolean;
  }>;
  
  // LLM Engine
  provider?: 'openai' | 'gemini';
  model?: string;
  temperature?: number;
  systemPrompt?: string;
  enableWebSearch?: boolean;
  webSearchProvider?: 'serpapi' | 'brave';
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}
```

#### 1.1.3 Chat Module

**Location**: `frontend/src/components/chat/`

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  stackId: string;
  stackName: string;
}

const ChatModal: React.FC<ChatModalProps> = (props) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Load history on mount
  // Send message handler
  // Clear history handler
}
```

#### 1.1.4 API Client Module

**Location**: `frontend/src/api/`

```typescript
// client.ts
import axios, { AxiosInstance } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors for error handling, logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// stacks.ts
export const stacksApi = {
  getAll: () => apiClient.get('/api/stacks'),
  getById: (id: string) => apiClient.get(`/api/stacks/${id}`),
  create: (data) => apiClient.post('/api/stacks', data),
  update: (id, data) => apiClient.put(`/api/stacks/${id}`, data),
  delete: (id) => apiClient.delete(`/api/stacks/${id}`),
  saveWorkflow: (id, workflow) => apiClient.post(`/api/stacks/${id}/workflow`, workflow),
  build: (id) => apiClient.post(`/api/stacks/${id}/build`),
};
```

---

### 1.2 Backend Modules

#### 1.2.1 Models Layer

**Location**: `backend/app/models/`

**Stack Model**:
```python
from sqlalchemy import Column, String, Text, JSON, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

class Stack(Base):
    __tablename__ = "stacks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    workflow_data = Column(JSON)  # Stores nodes and edges
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    documents = relationship("Document", back_populates="stack", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="stack", cascade="all, delete-orphan")
```

**Document Model**:
```python
class Document(Base):
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stack_id = Column(UUID(as_uuid=True), ForeignKey("stacks.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    content_hash = Column(String(64), nullable=False)  # SHA-256
    is_processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    stack = relationship("Stack", back_populates="documents")
```

**ChatMessage Model**:
```python
class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stack_id = Column(UUID(as_uuid=True), ForeignKey("stacks.id"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    stack = relationship("Stack", back_populates="chat_messages")
```

#### 1.2.2 Schemas Layer

**Location**: `backend/app/schemas/`

```python
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

# Stack Schemas
class StackBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

class StackCreate(StackBase):
    pass

class StackUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None

class WorkflowData(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

class StackResponse(StackBase):
    id: UUID
    workflow_data: Optional[WorkflowData] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Document Schemas
class DocumentUploadResponse(BaseModel):
    id: UUID
    filename: str
    message: str

class DocumentResponse(BaseModel):
    id: UUID
    stack_id: UUID
    filename: str
    is_processed: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Chat Schemas
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)

class ChatMessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True
```

#### 1.2.3 Repository Layer

**Location**: `backend/app/repositories/`

**Base Repository**:
```python
from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.orm import Session
from uuid import UUID

ModelType = TypeVar("ModelType")

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model
    
    def get_by_id(self, db: Session, id: UUID) -> Optional[ModelType]:
        return db.query(self.model).filter(self.model.id == id).first()
    
    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()
    
    def create(self, db: Session, obj_in: dict) -> ModelType:
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(self, db: Session, id: UUID, obj_in: dict) -> Optional[ModelType]:
        db_obj = self.get_by_id(db, id)
        if db_obj:
            for field, value in obj_in.items():
                setattr(db_obj, field, value)
            db.commit()
            db.refresh(db_obj)
        return db_obj
    
    def delete(self, db: Session, id: UUID) -> bool:
        db_obj = self.get_by_id(db, id)
        if db_obj:
            db.delete(db_obj)
            db.commit()
            return True
        return False
```

**Stack Repository**:
```python
class StackRepository(BaseRepository[Stack]):
    def __init__(self, db: Session):
        super().__init__(Stack)
        self.db = db
    
    def get_by_id(self, id: UUID) -> Optional[Stack]:
        return super().get_by_id(self.db, id)
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Stack]:
        return super().get_all(self.db, skip, limit)
    
    def create(self, data: dict) -> Stack:
        return super().create(self.db, data)
    
    def update(self, id: UUID, data: dict) -> Optional[Stack]:
        return super().update(self.db, id, data)
    
    def delete(self, id: UUID) -> bool:
        return super().delete(self.db, id)
    
    def save_workflow(self, id: UUID, workflow_data: dict) -> Optional[Stack]:
        return self.update(id, {"workflow_data": workflow_data})
```

#### 1.2.4 Services Layer

**LLM Service**:
```python
from typing import Optional
from openai import OpenAI
import google.generativeai as genai

class LLMService:
    """Service for LLM providers"""
    
    def __init__(self, provider: str = "openai", model: str = None, api_key: str = None):
        self.provider = provider.lower()
        self.api_key = api_key
        
        if self.provider == "openai":
            self.client = OpenAI(api_key=api_key or settings.OPENAI_API_KEY)
            self.model = model or "gpt-4o-mini"
        elif self.provider == "gemini":
            genai.configure(api_key=api_key or settings.GOOGLE_API_KEY)
            self.model = model or "gemini-2.0-flash-exp"
    
    def generate_response(
        self, 
        query: str, 
        context: Optional[str] = None,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7
    ) -> str:
        if self.provider == "openai":
            return self._openai_response(query, context, system_prompt, temperature)
        elif self.provider == "gemini":
            return self._gemini_response(query, context, system_prompt, temperature)
    
    def _openai_response(self, query, context, system_prompt, temperature) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        user_content = query
        if context:
            user_content = f"Context:\n{context}\n\nQuery: {query}"
        messages.append({"role": "user", "content": user_content})
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature
        )
        return response.choices[0].message.content
    
    def _gemini_response(self, query, context, system_prompt, temperature) -> str:
        model_params = {
            "model_name": self.model,
            "generation_config": genai.types.GenerationConfig(temperature=temperature)
        }
        if system_prompt:
            model_params["system_instruction"] = system_prompt
        
        model = genai.GenerativeModel(**model_params)
        user_message = query
        if context:
            user_message = f"Context:\n{context}\n\nQuery: {query}"
        
        response = model.generate_content(user_message)
        return response.text
```

**Embedding Service**:
```python
from typing import List
from openai import OpenAI
import google.generativeai as genai

class EmbeddingService:
    """Service for generating embeddings"""
    
    def __init__(self, provider: str = "openai", api_key: str = None):
        self.provider = provider.lower()
        
        if self.provider == "openai":
            self.client = OpenAI(api_key=api_key or settings.OPENAI_API_KEY)
            self.model = "text-embedding-ada-002"
        elif self.provider == "gemini":
            genai.configure(api_key=api_key or settings.GOOGLE_API_KEY)
            self.model = "models/embedding-001"
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        if self.provider == "openai":
            response = self.client.embeddings.create(
                model=self.model,
                input=texts
            )
            return [item.embedding for item in response.data]
        
        elif self.provider == "gemini":
            embeddings = []
            for text in texts:
                result = genai.embed_content(
                    model=self.model,
                    content=text,
                    task_type="retrieval_document"
                )
                embeddings.append(result['embedding'])
            return embeddings
```

**Vector Store Service**:
```python
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional

class VectorStoreService:
    """Service for ChromaDB vector store operations"""
    
    def __init__(self, collection_name: str):
        self.client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIRECTORY,
            settings=Settings(anonymized_telemetry=False)
        )
        self.collection = self.client.get_or_create_collection(
            name=collection_name
        )
    
    def add_documents(
        self,
        documents: List[str],
        embeddings: List[List[float]],
        ids: List[str],
        metadatas: List[Dict[str, Any]]
    ):
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
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        return results
    
    def delete_by_metadata(self, where: Dict[str, Any]):
        self.collection.delete(where=where)
```

**Workflow Engine**:
```python
from typing import Dict, Any, List
from uuid import UUID

class WorkflowEngine:
    """Engine for executing workflows"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def execute(
        self, 
        stack_id: UUID, 
        workflow_data: Dict[str, Any], 
        query: str
    ) -> str:
        nodes = workflow_data.get("nodes", [])
        edges = workflow_data.get("edges", [])
        
        # Build execution order using topological sort
        execution_order = self._build_execution_order(nodes, edges)
        
        # Initialize context
        context = {
            "query": query,
            "knowledge_context": None,
            "workflow_data": workflow_data
        }
        
        # Execute nodes in order
        for node in execution_order:
            node_type = node.get("type", "")
            config = node.get("data", {}).get("config", {})
            
            if node_type == "userQuery":
                pass  # Query already in context
            elif node_type == "knowledgeBase":
                context["knowledge_context"] = await self._execute_knowledge_base(
                    stack_id, query, config
                )
            elif node_type == "llmEngine":
                response = await self._execute_llm_engine(context, config)
                context["response"] = response
            elif node_type == "output":
                pass  # Terminal node
        
        return context.get("response", "No response generated")
    
    def _build_execution_order(self, nodes: List[Dict], edges: List[Dict]) -> List[Dict]:
        # Kahn's algorithm for topological sort
        graph = {node["id"]: [] for node in nodes}
        in_degree = {node["id"]: 0 for node in nodes}
        
        for edge in edges:
            source = edge["source"]
            target = edge["target"]
            if source in graph:
                graph[source].append(target)
            if target in in_degree:
                in_degree[target] += 1
        
        queue = [node_id for node_id, degree in in_degree.items() if degree == 0]
        result = []
        node_map = {node["id"]: node for node in nodes}
        
        while queue:
            node_id = queue.pop(0)
            if node_id in node_map:
                result.append(node_map[node_id])
            
            for neighbor in graph.get(node_id, []):
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        return result
    
    async def _execute_knowledge_base(
        self, 
        stack_id: UUID, 
        query: str, 
        config: Dict[str, Any]
    ) -> Optional[str]:
        provider = config.get("embeddingModel", "openai")
        
        # Generate query embedding
        embedding_service = EmbeddingService(provider=provider)
        query_embedding = embedding_service.generate_embeddings([query])[0]
        
        # Query vector store
        vector_store = VectorStoreService(collection_name=f"stack_{stack_id}")
        results = vector_store.query(query_embedding, n_results=5)
        
        # Format results as context
        documents = results.get("documents", [[]])[0]
        if documents:
            return "\n\n".join(documents)
        return None
    
    async def _execute_llm_engine(
        self, 
        context: Dict[str, Any], 
        config: Dict[str, Any]
    ) -> str:
        provider = config.get("provider", "openai")
        model = config.get("model", "gpt-4o-mini")
        system_prompt = config.get("systemPrompt")
        temperature = config.get("temperature", 0.7)
        enable_web_search = config.get("enableWebSearch", False)
        
        query = context.get("query", "")
        knowledge_context = context.get("knowledge_context")
        
        # Perform web search if enabled
        web_context = None
        if enable_web_search:
            search_provider = config.get("webSearchProvider", "serpapi")
            web_search = WebSearchService(provider=search_provider)
            results = await web_search.search(query)
            web_context = web_search.format_results_as_context(results)
        
        # Combine contexts
        context_parts = []
        if knowledge_context:
            context_parts.append(f"Document Knowledge:\n{knowledge_context}")
        if web_context:
            context_parts.append(f"\n{web_context}")
        
        full_context = "\n\n".join(context_parts) if context_parts else None
        
        # Generate response
        llm_service = LLMService(provider=provider, model=model)
        response = llm_service.generate_response(
            query=query,
            context=full_context,
            system_prompt=system_prompt,
            temperature=temperature
        )
        
        return response
```

#### 1.2.5 Router Layer

**Location**: `backend/app/routers/`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

router = APIRouter(prefix="/stacks", tags=["stacks"])

@router.post("/", response_model=StackResponse)
def create_stack(
    stack: StackCreate, 
    db: Session = Depends(get_db)
):
    stack_repo = StackRepository(db)
    created_stack = stack_repo.create(stack.model_dump())
    return success_response(
        data=StackResponse.model_validate(created_stack).model_dump(),
        message="Stack created successfully"
    )

@router.get("/{stack_id}", response_model=StackResponse)
def get_stack(
    stack_id: UUID, 
    db: Session = Depends(get_db)
):
    stack_repo = StackRepository(db)
    stack = stack_repo.get_by_id(stack_id)
    if not stack:
        return error_response(
            code="STACK_NOT_FOUND",
            message=f"Stack with ID {stack_id} not found"
        )
    return success_response(
        data=StackResponse.model_validate(stack).model_dump(),
        message="Stack retrieved successfully"
    )

@router.post("/{stack_id}/workflow")
async def save_workflow(
    stack_id: UUID,
    workflow: WorkflowData,
    db: Session = Depends(get_db)
):
    stack_repo = StackRepository(db)
    updated_stack = stack_repo.save_workflow(
        stack_id, 
        workflow.model_dump()
    )
    if not updated_stack:
        return error_response(
            code="STACK_NOT_FOUND",
            message=f"Stack with ID {stack_id} not found"
        )
    return success_response(message="Workflow saved successfully")
```

---

## 2. Algorithm Details

### 2.1 Topological Sort (Kahn's Algorithm)

**Purpose**: Determine execution order of workflow nodes

**Algorithm**:
```python
def topological_sort(nodes: List[Node], edges: List[Edge]) -> List[Node]:
    # Step 1: Build adjacency list and in-degree count
    graph = {node.id: [] for node in nodes}
    in_degree = {node.id: 0 for node in nodes}
    
    for edge in edges:
        graph[edge.source].append(edge.target)
        in_degree[edge.target] += 1
    
    # Step 2: Find all nodes with in-degree 0 (no dependencies)
    queue = [node_id for node_id, degree in in_degree.items() if degree == 0]
    
    # Step 3: Process nodes in order
    result = []
    while queue:
        # Remove node from queue
        current_id = queue.pop(0)
        result.append(nodes_by_id[current_id])
        
        # Decrease in-degree for neighbors
        for neighbor_id in graph[current_id]:
            in_degree[neighbor_id] -= 1
            if in_degree[neighbor_id] == 0:
                queue.append(neighbor_id)
    
    # Step 4: Check for cycles
    if len(result) != len(nodes):
        raise ValueError("Workflow contains a cycle")
    
    return result
```

**Complexity**:
- **Time**: O(V + E) where V = number of nodes, E = number of edges
- **Space**: O(V)

### 2.2 Text Chunking with Overlap

**Purpose**: Split large documents into processable chunks

**Algorithm**:
```python
def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    chunks = []
    start = 0
    
    while start < len(text):
        # Calculate end position
        end = start + chunk_size
        
        # Extract chunk
        chunk = text[start:end]
        
        # Skip empty chunks
        if chunk.strip():
            chunks.append(chunk)
        
        # Move start position (with overlap)
        start = end - overlap
    
    return chunks
```

**Example**:
```
Text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
Chunk size: 10
Overlap: 3

Chunks:
1. "ABCDEFGHIJ"
2. "HIJKLMNOPQ"  # HIJ overlaps
3. "NOPQRSTUVW"  # NOP overlaps
4. "TUVWXYZ"     # TUV overlaps
```

**Rationale**:
- Prevents context loss at chunk boundaries
- Improves semantic continuity
- Better retrieval accuracy

---

## 3. Database Design

### 3.1 Entity-Relationship Diagram

```
┌─────────────────────┐
│      stacks         │
├─────────────────────┤
│ id (PK)            │◄─────────┐
│ name               │          │
│ description        │          │
│ workflow_data      │          │
│ created_at         │          │
│ updated_at         │          │
└─────────────────────┘          │
                                 │
                  ┌──────────────┴───────────────┐
                  │                              │
┌─────────────────┴──────┐          ┌───────────┴──────────┐
│     documents          │          │   chat_messages      │
├────────────────────────┤          ├──────────────────────┤
│ id (PK)               │          │ id (PK)             │
│ stack_id (FK) ────────┤          │ stack_id (FK) ──────┤
│ filename              │          │ role                │
│ file_path             │          │ content             │
│ content_hash          │          │ created_at          │
│ is_processed          │          └─────────────────────┘
│ created_at            │
│ updated_at            │
└───────────────────────┘
```

### 3.2 Indexes

```sql
-- Primary keys (auto-indexed)
CREATE INDEX idx_stacks_id ON stacks(id);
CREATE INDEX idx_documents_id ON documents(id);
CREATE INDEX idx_chat_messages_id ON chat_messages(id);

-- Foreign keys
CREATE INDEX idx_documents_stack_id ON documents(stack_id);
CREATE INDEX idx_chat_messages_stack_id ON chat_messages(stack_id);

-- Query optimization
CREATE INDEX idx_documents_is_processed ON documents(is_processed);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_documents_content_hash ON documents(content_hash);
```

### 3.3 ChromaDB Collections

**Collection Naming**: `stack_{stack_id}`

**Document Structure**:
```python
{
  "id": "document_id_chunk_index",  # e.g., "abc-123_0"
  "document": "chunk text content",
  "embedding": [0.123, 0.456, ...],  # Vector (1536 dims for OpenAI)
  "metadata": {
    "document_id": "abc-123",
    "filename": "example.pdf",
    "chunk_index": 0
  }
}
```

---

## 4. API Specification

### 4.1 Request/Response Formats

**Standard Response**:
```json
{
  "success": true | false,
  "data": object | null,
  "message": string,
  "error": {
    "code": string,
    "message": string
  } | null
}
```

### 4.2 Endpoint Details

#### Create Stack
```
POST /api/stacks
Content-Type: application/json

Request:
{
  "name": "My Stack",
  "description": "Description"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Stack",
    "description": "Description",
    "workflow_data": null,
    "created_at": "2026-01-11T00:00:00Z",
    "updated_at": "2026-01-11T00:00:00Z"
  },
  "message": "Stack created successfully"
}
```

#### Save Workflow
```
POST /api/stacks/{stack_id}/workflow
Content-Type: application/json

Request:
{
  "nodes": [
    {
      "id": "node-1",
      "type": "userQuery",
      "position": {"x": 100, "y": 100},
      "data": {"label": "User Query", "config": {}}
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2"
    }
  ]
}

Response:
{
  "success": true,
  "message": "Workflow saved successfully"
}
```

#### Chat Message
```
POST /api/chat/{stack_id}/message
Content-Type: application/json

Request:
{
  "message": "What is the capital of France?"
}

Response:
{
  "success": true,
  "data": {
    "response": "The capital of France is Paris."
  },
  "message": "Message processed successfully"
}
```

---

## 5. Error Handling

### 5.1 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `STACK_NOT_FOUND` | 404 | Stack does not exist |
| `DOCUMENT_NOT_FOUND` | 404 | Document does not exist |
| `INVALID_FILE_TYPE` | 400 | File is not a PDF |
| `NO_WORKFLOW` | 400 | Stack has no workflow |
| `PROCESSING_ERROR` | 500 | Document processing failed |
| `EXECUTION_ERROR` | 500 | Workflow execution failed |
| `VALIDATION_ERROR` | 422 | Request validation failed |

### 5.2 Exception Handling Pattern

```python
try:
    # Business logic
    result = perform_operation()
    return success_response(data=result)
except ValueError as e:
    return error_response(
        code="VALIDATION_ERROR",
        message=str(e),
        status_code=400
    )
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    return error_response(
        code="INTERNAL_ERROR",
        message="An unexpected error occurred",
        status_code=500
    )
```

---

## 6. Configuration Management

### 6.1 Settings Class

```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "GenAI Stack"
    
    # Database
    DATABASE_URL: str
    
    # File Storage
    UPLOAD_DIR: str = "./uploads"
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_data"
    
    # API Keys
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    SERPAPI_KEY: str = ""
    BRAVE_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

**Repository Tests**:
```python
def test_create_stack():
    stack_data = {
        "name": "Test Stack",
        "description": "Test Description"
    }
    stack = stack_repo.create(stack_data)
    assert stack.name == "Test Stack"
    assert stack.id is not None
```

**Service Tests**:
```python
@pytest.mark.asyncio
async def test_llm_service():
    llm = LLMService(provider="openai")
    response = llm.generate_response(
        query="What is 2+2?",
        temperature=0.0
    )
    assert "4" in response
```

### 7.2 Integration Tests

```python
def test_workflow_execution():
    client = TestClient(app)
    
    # Create stack
    response = client.post("/api/stacks", json={
        "name": "Test Stack"
    })
    stack_id = response.json()["data"]["id"]
    
    # Save workflow
    client.post(f"/api/stacks/{stack_id}/workflow", json={
        "nodes": [...],
        "edges": [...]
    })
    
    # Execute chat
    response = client.post(f"/api/chat/{stack_id}/message", json={
        "message": "Test query"
    })
    
    assert response.status_code == 200
    assert response.json()["success"] is True
```

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Status**: Final
