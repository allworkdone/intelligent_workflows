# Architecture Documentation

## Table of Contents

- [System Architecture](#system-architecture)
- [Component Diagram](#component-diagram)
- [Data Flow](#data-flow)
- [Database Schema](#database-schema)
- [API Architecture](#api-architecture)
- [Workflow Execution Flow](#workflow-execution-flow)
- [Deployment Architecture](#deployment-architecture)

---

## System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
    end
    
    subgraph "Frontend - React Application"
        UI[React UI Components]
        WB[Workflow Builder<br/>React Flow]
        Chat[Chat Interface]
        State[Zustand State Management]
    end
    
    subgraph "Backend - FastAPI Application"
        API[REST API<br/>FastAPI Routes]
        WE[Workflow Engine]
        
        subgraph "Services Layer"
            LLM[LLM Service<br/>OpenAI/Gemini]
            Embed[Embedding Service]
            Search[Web Search Service<br/>SerpAPI]
            Vector[Vector Store Service<br/>ChromaDB]
        end
        
        subgraph "Data Layer"
            Repos[Repositories]
            ORM[SQLAlchemy ORM]
        end
    end
    
    subgraph "Databases"
        PG[(PostgreSQL<br/>Metadata)]
        Chroma[(ChromaDB<br/>Vectors)]
    end
    
    subgraph "External Services"
        OpenAI[OpenAI API]
        Gemini[Google Gemini]
        SERP[SerpAPI]
    end
    
    Browser --> UI
    UI --> WB
    UI --> Chat
    UI --> State
    State --> API
    
    API --> WE
    WE --> LLM
    WE --> Embed
    WE --> Search
    WE --> Vector
    
    API --> Repos
    Repos --> ORM
    ORM --> PG
    
    Embed --> Chroma
    Vector --> Chroma
    
    LLM --> OpenAI
    LLM --> Gemini
    Search --> SERP
    
    style Browser fill:#e1f5ff
    style UI fill:#fff4e1
    style WE fill:#f0e1ff
    style PG fill:#e1ffe1
    style Chroma fill:#e1ffe1
```

---

## Component Diagram

### Frontend Components

```mermaid
graph TB
    subgraph "Pages"
        MyStacks[MyStacks Page]
        Builder[WorkflowBuilder Page]
    end
    
    subgraph "Layout Components"
        Layout[Layout]
        Header[Header]
        Sidebar[Sidebar]
    end
    
    subgraph "Workflow Components"
        Canvas[WorkflowCanvas]
        CompPanel[Component Panel]
        ConfigPanel[Config Panel]
        
        subgraph "Node Components"
            UserNode[UserQueryNode]
            KBNode[KnowledgeBaseNode]
            LLMNode[LLMEngineNode]
            OutNode[OutputNode]
        end
    end
    
    subgraph "Chat Components"
        ChatModal[ChatModal]
        ChatInput[ChatInput]
        ChatMsg[ChatMessage]
    end
    
    subgraph "UI Components"
        Button[Button]
        Input[Input]
        Select[Select]
        Modal[Modal]
    end
    
    MyStacks --> Layout
    Builder --> Layout
    Layout --> Header
    Layout --> Sidebar
    
    Builder --> Canvas
    Builder --> CompPanel
    Builder --> ConfigPanel
    Builder --> ChatModal
    
    Canvas --> UserNode
    Canvas --> KBNode
    Canvas --> LLMNode
    Canvas --> OutNode
    
    ChatModal --> ChatInput
    ChatModal --> ChatMsg
    
    ConfigPanel --> Button
    ConfigPanel --> Input
    ConfigPanel --> Select
    
    style MyStacks fill:#e1f5ff
    style Builder fill:#e1f5ff
    style Canvas fill:#fff4e1
```

### Backend Services

```mermaid
graph TB
    subgraph "API Layer"
        StacksRouter[Stacks Router<br/>/api/stacks]
        DocsRouter[Documents Router<br/>/api/documents]
        ChatRouter[Chat Router<br/>/api/chat]
    end
    
    subgraph "Business Logic"
        WE[Workflow Engine]
        
        subgraph "Core Services"
            LLM[LLM Service]
            Embed[Embedding Service]
            Vector[Vector Store Service]
            Search[Web Search Service]
        end
    end
    
    subgraph "Data Access"
        StackRepo[Stack Repository]
        DocRepo[Document Repository]
        ChatRepo[Chat Repository]
        BaseRepo[Base Repository]
    end
    
    subgraph "Models"
        StackModel[Stack Model]
        DocModel[Document Model]
        ChatModel[ChatMessage Model]
    end
    
    StacksRouter --> WE
    DocsRouter --> Embed
    DocsRouter --> Vector
    ChatRouter --> WE
    
    WE --> LLM
    WE --> Vector
    WE --> Search
    
    StacksRouter --> StackRepo
    DocsRouter --> DocRepo
    ChatRouter --> ChatRepo
    
    StackRepo --> BaseRepo
    DocRepo --> BaseRepo
    ChatRepo --> BaseRepo
    
    BaseRepo --> StackModel
    BaseRepo --> DocModel
    BaseRepo --> ChatModel
    
    style WE fill:#f0e1ff
    style LLM fill:#fff4e1
    style StackModel fill:#e1ffe1
```

---

## Data Flow

### Workflow Creation and Execution

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant DB
    participant WorkflowEngine
    participant LLM
    participant VectorDB
    
    Note over User,VectorDB: 1. Create Workflow
    User->>Frontend: Create new stack
    Frontend->>API: POST /api/stacks
    API->>DB: Save stack metadata
    DB-->>API: Stack created
    API-->>Frontend: Stack ID
    
    Note over User,VectorDB: 2. Build Workflow
    User->>Frontend: Drag & drop components
    User->>Frontend: Configure components
    Frontend->>API: POST /api/stacks/{id}/workflow
    API->>DB: Save workflow data
    DB-->>API: Saved
    API-->>Frontend: Success
    
    Note over User,VectorDB: 3. Upload & Process Document
    User->>Frontend: Upload PDF
    Frontend->>API: POST /api/documents/upload/{stack_id}
    API->>DB: Save document metadata
    API-->>Frontend: Document ID
    
    User->>Frontend: Process document
    Frontend->>API: POST /api/documents/{id}/process
    API->>API: Extract text (PyMuPDF)
    API->>API: Chunk text
    API->>LLM: Generate embeddings
    LLM-->>API: Embeddings
    API->>VectorDB: Store embeddings
    VectorDB-->>API: Stored
    API->>DB: Mark as processed
    API-->>Frontend: Success
    
    Note over User,VectorDB: 4. Chat with Workflow
    User->>Frontend: Send message
    Frontend->>API: POST /api/chat/{stack_id}/message
    API->>DB: Save user message
    API->>WorkflowEngine: Execute workflow
    
    alt Has KnowledgeBase
        WorkflowEngine->>VectorDB: Query similar docs
        VectorDB-->>WorkflowEngine: Retrieved context
    end
    
    alt Has Web Search
        WorkflowEngine->>LLM: Search web
        LLM-->>WorkflowEngine: Search results
    end
    
    WorkflowEngine->>LLM: Generate response
    LLM-->>WorkflowEngine: AI response
    WorkflowEngine-->>API: Response
    API->>DB: Save assistant message
    API-->>Frontend: Response
    Frontend-->>User: Display response
```

### Document Processing Flow

```mermaid
flowchart TD
    Start([User uploads PDF])
    
    Upload[Upload to /api/documents/upload]
    SaveFile[Save file to disk]
    CreateRecord[Create database record]
    ReturnID[Return document ID]
    
    Process[User clicks Process]
    Extract[Extract text with PyMuPDF]
    Chunk[Split into chunks<br/>Size: 1000, Overlap: 200]
    SelectModel{Embedding<br/>Model?}
    
    OpenAI[OpenAI Embeddings<br/>text-embedding-ada-002]
    Gemini[Gemini Embeddings<br/>models/embedding-001]
    
    Store[Store in ChromaDB]
    MarkProcessed[Mark document as processed]
    Complete([Processing complete])
    
    Start --> Upload
    Upload --> SaveFile
    SaveFile --> CreateRecord
    CreateRecord --> ReturnID
    ReturnID --> Process
    
    Process --> Extract
    Extract --> Chunk
    Chunk --> SelectModel
    
    SelectModel -->|OpenAI| OpenAI
    SelectModel -->|Gemini| Gemini
    
    OpenAI --> Store
    Gemini --> Store
    
    Store --> MarkProcessed
    MarkProcessed --> Complete
    
    style Start fill:#e1f5ff
    style Complete fill:#e1ffe1
    style SelectModel fill:#fff4e1
```

---

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    STACK ||--o{ DOCUMENT : contains
    STACK ||--o{ CHAT_MESSAGE : has
    
    STACK {
        uuid id PK
        string name
        text description
        json workflow_data
        datetime created_at
        datetime updated_at
    }
    
    DOCUMENT {
        uuid id PK
        uuid stack_id FK
        string filename
        string file_path
        string content_hash
        boolean is_processed
        datetime created_at
        datetime updated_at
    }
    
    CHAT_MESSAGE {
        uuid id PK
        uuid stack_id FK
        string role
        text content
        datetime created_at
    }
```

### Schema Details

#### stacks table
- **id** (UUID, PK): Unique identifier
- **name** (VARCHAR): Stack name
- **description** (TEXT): Stack description
- **workflow_data** (JSON): Stores nodes and edges
  ```json
  {
    "nodes": [
      {
        "id": "node-1",
        "type": "userQuery",
        "position": {"x": 100, "y": 100},
        "data": {}
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
  ```
- **created_at** (TIMESTAMP): Creation timestamp
- **updated_at** (TIMESTAMP): Last update timestamp

#### documents table
- **id** (UUID, PK): Unique identifier
- **stack_id** (UUID, FK): Reference to stack
- **filename** (VARCHAR): Original filename
- **file_path** (VARCHAR): Path on disk
- **content_hash** (VARCHAR): SHA-256 hash for deduplication
- **is_processed** (BOOLEAN): Processing status
- **created_at** (TIMESTAMP): Upload timestamp
- **updated_at** (TIMESTAMP): Last update timestamp

#### chat_messages table
- **id** (UUID, PK): Unique identifier
- **stack_id** (UUID, FK): Reference to stack
- **role** (VARCHAR): 'user' or 'assistant'
- **content** (TEXT): Message content
- **created_at** (TIMESTAMP): Message timestamp

---

## API Architecture

### RESTful Endpoints

```mermaid
graph LR
    subgraph "Stacks API"
        S1[GET /api/stacks]
        S2[POST /api/stacks]
        S3[GET /api/stacks/:id]
        S4[PUT /api/stacks/:id]
        S5[DELETE /api/stacks/:id]
        S6[POST /api/stacks/:id/workflow]
        S7[POST /api/stacks/:id/build]
    end
    
    subgraph "Documents API"
        D1[POST /api/documents/upload/:stack_id]
        D2[POST /api/documents/:id/process]
        D3[GET /api/documents/stack/:stack_id]
        D4[DELETE /api/documents/:id]
    end
    
    subgraph "Chat API"
        C1[POST /api/chat/:stack_id/message]
        C2[GET /api/chat/:stack_id/history]
        C3[DELETE /api/chat/:stack_id/history]
    end
    
    style S1 fill:#e1f5ff
    style D1 fill:#fff4e1
    style C1 fill:#f0e1ff
```

### API Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

---

## Workflow Execution Flow

### Execution Order Determination

```mermaid
flowchart TD
    Start([Receive query])
    LoadWorkflow[Load workflow_data<br/>from database]
    Validate{Valid<br/>workflow?}
    
    FindStart[Find User Query node]
    BuildOrder[Build execution order<br/>using BFS from User Query]
    
    Execute[Execute nodes in order]
    
    subgraph "Node Execution"
        UserQuery[User Query Node<br/>Pass query forward]
        KB{Knowledge Base<br/>Node?}
        RetrieveDocs[Query vector DB<br/>for relevant chunks]
        
        LLMNode{LLM Engine<br/>Node?}
        CheckSearch{Web search<br/>enabled?}
        WebSearch[Fetch web results<br/>via SerpAPI]
        BuildPrompt[Build prompt with<br/>query + context + search]
        CallLLM[Call OpenAI/Gemini]
        
        Output[Output Node<br/>Return response]
    end
    
    Complete([Return to user])
    Error([Return error])
    
    Start --> LoadWorkflow
    LoadWorkflow --> Validate
    Validate -->|No| Error
    Validate -->|Yes| FindStart
    FindStart --> BuildOrder
    BuildOrder --> Execute
    
    Execute --> UserQuery
    UserQuery --> KB
    KB -->|Yes| RetrieveDocs
    KB -->|No| LLMNode
    RetrieveDocs --> LLMNode
    
    LLMNode -->|Yes| CheckSearch
    CheckSearch -->|Yes| WebSearch
    CheckSearch -->|No| BuildPrompt
    WebSearch --> BuildPrompt
    BuildPrompt --> CallLLM
    CallLLM --> Output
    
    LLMNode -->|No| Output
    Output --> Complete
    
    style Start fill:#e1f5ff
    style Complete fill:#e1ffe1
    style Error fill:#ffe1e1
```

### Context Building

The workflow engine builds context from multiple sources:

```mermaid
graph TB
    Query[User Query]
    
    subgraph "Context Sources"
        WorkflowMeta[Workflow Structure<br/>Nodes & Connections]
        KBContext[Document Context<br/>Retrieved from ChromaDB]
        WebContext[Web Search Results<br/>From SerpAPI]
        SystemPrompt[Custom System Prompt<br/>From LLM config]
    end
    
    Combine[Combine Context]
    LLM[Send to LLM]
    Response[Generate Response]
    
    Query --> Combine
    WorkflowMeta --> Combine
    KBContext --> Combine
    WebContext --> Combine
    SystemPrompt --> Combine
    
    Combine --> LLM
    LLM --> Response
    
    style Query fill:#e1f5ff
    style Response fill:#e1ffe1
```

---

## Deployment Architecture

### Docker Compose Deployment

```mermaid
graph TB
    subgraph "Host Machine"
        subgraph "Docker Network: genai-network"
            Frontend[Frontend Container<br/>nginx:alpine<br/>Port: 5173:80]
            Backend[Backend Container<br/>python:3.11-slim<br/>Port: 8000:8000]
            DB[PostgreSQL Container<br/>postgres:15-alpine<br/>Port: 5432:5432]
        end
        
        subgraph "Volumes"
            V1[postgres_data<br/>Database files]
            V2[./backend/uploads<br/>Uploaded PDFs]
            V3[./backend/chroma_data<br/>Vector embeddings]
        end
    end
    
    Frontend -.->|HTTP| Backend
    Backend -.->|SQL| DB
    Backend --> V2
    Backend --> V3
    DB --> V1
    
    style Frontend fill:#e1f5ff
    style Backend fill:#fff4e1
    style DB fill:#e1ffe1
```

### Kubernetes Deployment (Optional)

```mermaid
graph TB
    subgraph "Kubernetes Cluster"
        subgraph "Namespace: genai-stack"
            LB[LoadBalancer Service<br/>frontend-service]
            
            subgraph "Frontend Deployment"
                FP1[Frontend Pod 1]
                FP2[Frontend Pod 2]
            end
            
            SVC[ClusterIP Service<br/>backend-service]
            
            subgraph "Backend Deployment"
                BP1[Backend Pod 1]
                BP2[Backend Pod 2]
                BP3[Backend Pod 3]
            end
            
            DBSVC[ClusterIP Service<br/>postgres-service]
            
            subgraph "PostgreSQL StatefulSet"
                PG[PostgreSQL Pod<br/>+ PVC]
            end
            
            CM[ConfigMap<br/>Environment Config]
            SEC[Secret<br/>API Keys]
        end
    end
    
    LB --> FP1
    LB --> FP2
    FP1 --> SVC
    FP2 --> SVC
    SVC --> BP1
    SVC --> BP2
    SVC --> BP3
    BP1 --> DBSVC
    BP2 --> DBSVC
    BP3 --> DBSVC
    DBSVC --> PG
    
    BP1 -.->|Config| CM
    BP1 -.->|Secrets| SEC
    
    style LB fill:#e1f5ff
    style FP1 fill:#e1f5ff
    style BP1 fill:#fff4e1
    style PG fill:#e1ffe1
```

---

## Technology Stack Details

### Frontend Technology Choices

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **React 19** | UI Framework | Modern, component-based, extensive ecosystem |
| **TypeScript** | Type Safety | Catch errors at compile-time, better IDE support |
| **React Flow** | Workflow Canvas | Purpose-built for node-based UIs, excellent DX |
| **Zustand** | State Management | Lightweight, simple API, no boilerplate |
| **Vite** | Build Tool | Fast HMR, modern ESM-based, optimized builds |
| **TailwindCSS** | Styling | Utility-first, rapid development, consistent design |
| **Axios** | HTTP Client | Promise-based, interceptors, request cancellation |

### Backend Technology Choices

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **FastAPI** | Web Framework | Fast, async, automatic OpenAPI docs, type hints |
| **SQLAlchemy** | ORM | Mature, flexible, supports migrations |
| **Pydantic** | Validation | Type-safe data validation, integrates with FastAPI |
| **ChromaDB** | Vector Store | Embedded, simple API, efficient similarity search |
| **PyMuPDF** | PDF Processing | Fast, accurate text extraction, well-maintained |

---

## Security Considerations

### API Key Management
- All API keys stored in environment variables
- Never committed to version control
- Separated between development and production

### Database Security
- Passwords managed via environment variables
- Connection pooling with limits
- SQL injection prevention via ORM

### File Upload Security
- File type validation (PDF only)
- File size limits
- Content hash for deduplication
- Isolated upload directory

### CORS Configuration
- Configured for specific origins in production
- Development allows localhost

---

## Performance Considerations

### Frontend Optimization
- Code splitting for lazy loading
- React.memo for expensive components
- Debounced API calls
- Optimized re-renders

### Backend Optimization
- Async/await for I/O operations
- Database connection pooling
- Efficient vector similarity search
- Chunked document processing

### Caching Strategy
- Browser caching for static assets
- API response caching (future enhancement)
- Vector store persistent storage

---

## Monitoring and Observability

### Logging
- Structured logging format
- Request/response logging
- Error tracking with stack traces
- Performance metrics

### Health Checks
- `/api/health` endpoint
- Database connectivity check
- Vector store availability

### Metrics (Optional)
- Request latency
- Error rates
- LLM API usage
- Database query performance

---

**Next Steps**: For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
