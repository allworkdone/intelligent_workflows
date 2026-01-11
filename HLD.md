# High-Level Design (HLD)
## GenAI Stack - No-Code Workflow Builder

---

## 1. Executive Summary

**GenAI Stack** is a full-stack web application that enables users to create AI-powered workflows through a visual drag-and-drop interface without writing code. The system supports Retrieval-Augmented Generation (RAG), multiple LLM providers, and web search integration.

**Key Capabilities:**
- Visual workflow creation using React Flow
- Document-based knowledge retrieval (RAG)
- Multi-LLM support (OpenAI GPT, Google Gemini)
- Real-time web search integration
- Persistent chat with workflow context

---

## 2. System Overview

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Browser)                  │
│                     React 19 + TypeScript                   
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS/REST
┌────────────────────────────┴───────────────────────────────┐
│                    Application Layer                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              FastAPI Backend Server                 │   │
│  │  ┌────────────────┐  ┌────────────────────────┐     │   │
│  │  │ REST API       │  │  Workflow Engine       │     │   │
│  │  │ Endpoints      │  │  (Orchestrator)        │     │   │
│  │  └────────────────┘  └────────────────────────┘     │   │
│  │  ┌────────────────────────────────────────────┐     │   │
│  │  │         Business Services Layer            │     │   │
│  │  │  • LLM Service                             │     │   │
│  │  │  • Embedding Service                       │     │   │
│  │  │  • Vector Store Service                    │     │   │
│  │  │  • Web Search Service                      │     │   │
│  │  └────────────────────────────────────────────┘     │   │
│  │  ┌────────────────────────────────────────────┐     │   │
│  │  │         Data Access Layer                  │     │   │
│  │  │  • Stack Repository                        │     │   │
│  │  │  • Document Repository                     │     │   │
│  │  │  • Chat Repository                         │     │   │
│  │  └────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────┬───────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                    Data Layer                               │
│  ┌──────────────────┐          ┌──────────────────┐         │
│  │   PostgreSQL     │          │    ChromaDB      │         │
│  │   (Metadata)     │          │  (Vector Store)  │         │
│  └──────────────────┘          └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                 External Services                           │
│  • OpenAI API (GPT, Embeddings)                             │
│  • Google Gemini API (Gemini, Embeddings)                   │
│  • SerpAPI / Brave Search (Web Search)                      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | React | 19.2 | UI Framework |
| | TypeScript | 5.9 | Type Safety |
| | React Flow | 12.10 | Workflow Canvas |
| | Zustand | 5.0 | State Management |
| | Vite | 7.2 | Build Tool |
| | TailwindCSS | 4.1 | Styling |
| **Backend** | FastAPI | 0.109 | Web Framework |
| | Python | 3.11 | Runtime |
| | SQLAlchemy | 2.0 | ORM |
| | Pydantic | 2.5 | Validation |
| | Uvicorn | 0.27 | ASGI Server |
| **Databases** | PostgreSQL | 15 | Relational DB |
| | ChromaDB | 0.4 | Vector Store |
| **Infrastructure** | Docker | - | Containerization |
| | Kubernetes | - | Orchestration |
| | Nginx | - | Web Server |

---

## 3. Core Components

### 3.1 Workflow Components

The system provides four core building blocks for creating workflows:

#### 3.1.1 User Query Component
- **Purpose**: Entry point for user questions
- **Type**: Input node
- **Configuration**: None required
- **Output**: User query string

#### 3.1.2 KnowledgeBase Component
- **Purpose**: Document storage and semantic retrieval
- **Type**: Processing node
- **Configuration**:
  - Document upload (PDF)
  - Embedding model selection (OpenAI/Gemini)
  - Document processing controls
- **Features**:
  - PyMuPDF text extraction
  - Configurable chunking (size: 1000, overlap: 200)
  - Vector embedding generation
  - ChromaDB storage
- **Output**: Retrieved document context

#### 3.1.3 LLM Engine Component
- **Purpose**: AI response generation
- **Type**: Processing node
- **Configuration**:
  - Provider selection (OpenAI/Gemini)
  - Model selection
  - Custom system prompt
  - Temperature control
  - Web search toggle
- **Features**:
  - Multi-provider support
  - Context aggregation
  - Web search integration
- **Output**: Generated AI response

#### 3.1.4 Output Component
- **Purpose**: Display results to user
- **Type**: Terminal node
- **Configuration**: None required
- **Features**:
  - Chat interface
  - Markdown rendering
  - History management

### 3.2 Component Interaction Flow

```
User Query → KnowledgeBase → LLM Engine → Output
     ↓            ↓               ↓           ↓
  [Query]    [Context]      [Response]  [Display]
```

---

## 4. Key Design Decisions

### 4.1 Architecture Pattern

**Choice**: **Layered Architecture** with Repository Pattern

**Rationale**:
- **Separation of Concerns**: Clear boundaries between presentation, business logic, and data access
- **Maintainability**: Easy to modify individual layers without affecting others
- **Testability**: Each layer can be tested independently
- **Scalability**: Layers can be scaled independently

### 4.2 Workflow Execution Model

**Choice**: **Graph-based Execution** with Topological Sort

**Rationale**:
- **Flexibility**: Supports arbitrary component connections
- **Deterministic**: Ensures correct execution order
- **Validation**: Can detect cycles and disconnected nodes
- **Extensibility**: Easy to add new component types

**Algorithm**: Kahn's Algorithm for topological sorting
- Time Complexity: O(V + E) where V = nodes, E = edges
- Space Complexity: O(V)

### 4.3 State Management

**Frontend Choice**: **Zustand**

**Rationale**:
- Minimal boilerplate compared to Redux
- React hooks-based API
- No provider wrapping needed
- Built-in TypeScript support
- Small bundle size (~1KB)

**Backend Choice**: **Request-scoped transactions**

**Rationale**:
- Ensures data consistency
- Automatic rollback on errors
- Simplified error handling

### 4.4 Data Storage Strategy

**Dual Database Approach**:

1. **PostgreSQL** (Relational)
   - Use Case: Metadata, relationships, transactions
   - Data: Stacks, documents, chat history
   - Why: ACID compliance, complex queries, proven reliability

2. **ChromaDB** (Vector)
   - Use Case: Semantic search, embeddings
   - Data: Document chunks, embeddings
   - Why: Optimized for similarity search, embedded database

### 4.5 API Design

**Choice**: **RESTful API** with consistent response format

**Standard Response**:
```json
{
  "success": boolean,
  "data": object | null,
  "message": string,
  "error": { "code": string, "message": string } | null
}
```

**Rationale**:
- Predictable response structure
- Easy client-side handling
- Clear error reporting
- Self-documenting with FastAPI/OpenAPI

---

## 5. System Features

### 5.1 Functional Requirements

| Feature | Description | Priority |
|---------|-------------|----------|
| Workflow Builder | Drag-and-drop interface | P0 |
| Document Processing | PDF upload, text extraction, embedding | P0 |
| Chat Interface | Interactive Q&A with context| P0 |
| Multi-LLM Support | OpenAI & Gemini integration | P0 |
| Web Search | Real-time information retrieval | P1 |
| Workflow Persistence | Save/load workflows | P1 |
| Chat History | Conversation persistence | P1 |

### 5.2 Non-Functional Requirements

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **Performance** | < 3s response time | 95th percentile |
| **Availability** | 99.9% uptime | Monthly |
| **Scalability** | 100+ concurrent users | Horizontal scaling |
| **Security** | API key encryption | At rest & transit |
| **Reliability** | < 0.1% error rate | Per 1000 requests |

---

## 6. Data Flow

### 6.1 Document Processing Flow

```
1. User uploads PDF
   ↓
2. Save file to disk (SHA-256 hash for dedup)
   ↓
3. Create database record
   ↓
4. Extract text with PyMuPDF
   ↓
5. Chunk text (size: 1000, overlap: 200)
   ↓
6. Generate embeddings (OpenAI/Gemini)
   ↓
7. Store in ChromaDB (collection: stack_{id})
   ↓
8. Mark document as processed
```

### 6.2 Query Execution Flow

```
1. User sends message
   ↓
2. Save user message to DB
   ↓
3. Load workflow definition
   ↓
4. Build execution order (topological sort)
   ↓
5. Execute nodes sequentially:
   a. User Query: Pass query forward
   b. KnowledgeBase: Retrieve context (if configured)
   c. LLM Engine: Generate response
      - Aggregate: query + context + workflow metadata
      - Optional: Fetch web search results
      - Call LLM API
   d. Output: Return response
   ↓
6. Save AI response to DB
   ↓
7. Return to user
```

---

## 7. Security Architecture

### 7.1 Authentication & Authorization

**Current State**: No authentication (optional feature)

**Planned** (if implemented):
- JWT-based authentication
- Role-based access control (RBAC)
- User-stack ownership model

### 7.2 Data Protection

| Layer | Protection Mechanism |
|-------|---------------------|
| **API Keys** | Environment variables, never committed |
| **Database** | Connection pooling, parameterized queries |
| **File Upload** | Type validation (PDF only), size limits |
| **CORS** | Configured origins, credentials handling |
| **Secrets** | Kubernetes Secrets, Docker secrets |

### 7.3 Input Validation

- **Pydantic schemas** for all API inputs
- **File type validation** for uploads
- **SQL injection prevention** via ORM
- **XSS prevention** via React's automatic escaping

---

## 8. Scalability & Performance

### 8.1 Horizontal Scaling Strategy

**Frontend**:
- Stateless React app
- Nginx load balancing
- CDN for static assets

**Backend**:
- Multiple FastAPI instances
- Shared PostgreSQL database
- Shared ChromaDB (with session affinity)
- Shared file storage (NFS/S3)

**Database**:
- PostgreSQL read replicas
- Connection pooling
- Query optimization

### 8.2 Caching Strategy

| Component | Cache Type | TTL |
|-----------|-----------|-----|
| Static Assets | Browser cache | 1 year |
| API Responses | (Future) Redis | 5 min |
| Vector Embeddings | Persistent ChromaDB | Permanent |

### 8.3 Performance Optimizations

**Frontend**:
- Code splitting
- Lazy loading
- React.memo for expensive components
- Debounced API calls

**Backend**:
- Async/await for I/O operations
- Database connection pooling
- Efficient vector similarity search
- Chunked document processing

---

## 9. Deployment Architecture

### 9.1 Docker Compose (Development)

```
Services:
  - frontend (nginx:alpine, port 5173)
  - backend (python:3.11-slim, port 8000)
  - db (postgres:15-alpine, port 5432)

Networks:
  - genai-network (bridge)

Volumes:
  - postgres_data (database persistence)
  - ./backend/uploads (document storage)
  - ./backend/chroma_data (vector store)
```

### 9.2 Kubernetes (Production)

```
Namespace: genai-stack

Deployments:
  - frontend (2 replicas, LoadBalancer)
  - backend (3 replicas, ClusterIP)
  - postgres (StatefulSet, 1 replica, ClusterIP)

Persistent Volumes:
  - postgres-pvc (10Gi)
  - backend-uploads-pvc (20Gi, ReadWriteMany)
  - backend-chroma-pvc (10Gi, ReadWriteMany)

ConfigMaps:
  - genai-stack-config (app configuration)

Secrets:
  - genai-stack-secrets (API keys, DB credentials)
```

---

## 10. Integration Points

### 10.1 External Services

| Service | Purpose | Protocol | Authentication |
|---------|---------|----------|----------------|
| OpenAI API | LLM, Embeddings | HTTPS/REST | API Key (Bearer) |
| Google Gemini | LLM, Embeddings | HTTPS/REST | API Key (Header) |
| SerpAPI | Web Search | HTTPS/REST | API Key (Query) |
| Brave Search | Web Search | HTTPS/REST | API Key (Header) |

### 10.2 API Contracts

**Base URL**: `/api`

**Endpoints**:
- `/stacks` - Stack CRUD operations
- `/documents` - Document management
- `/chat` - Chat interactions

**Authentication**: None (optional feature)

**Content-Type**: `application/json`

---

## 11. Monitoring & Observability

### 11.1 Health Checks

- **Endpoint**: `/api/health`
- **Response**: `{ "status": "healthy" }`
- **Checks**: Database connectivity, service availability

### 11.2 Logging Strategy

**Levels**:
- ERROR: Application errors, exceptions
- WARNING: Degraded performance, retries
- INFO: Normal operations, requests
- DEBUG: Detailed information (dev only)

**Format**: Structured JSON (optional)

### 11.3 Metrics (Optional)

**Backend**:
- Request latency (p50, p95, p99)
- Error rate
- LLM API usage
- Database query performance

**Infrastructure**:
- CPU utilization
- Memory usage
- Disk I/O
- Network throughput

---

## 12. Disaster Recovery

### 12.1 Backup Strategy

| Component | Backup Frequency | Retention |
|-----------|------------------|-----------|
| PostgreSQL | Daily (2 AM) | 30 days |
| Uploads | Daily | 30 days |
| ChromaDB | Daily | 7 days |

### 12.2 Recovery Procedures

**Database**: Restore from pg_dump
**Files**: Restore from volume snapshots
**Kubernetes**: Redeploy from manifests

---

## 13. Future Enhancements

### 13.1 Planned Features

- **User Authentication**: JWT-based auth, RBAC
- **Workflow Templates**: Pre-built workflow library
- **Advanced Analytics**: Usage metrics, performance dashboards
- **Batch Processing**: Multiple document processing
- **Export/Import**: Workflow sharing
- **API Versioning**: v2 API with breaking changes

### 13.2 Scalability Improvements

- **Separate ChromaDB**: Dedicated vector store service
- **Message Queue**: RabbitMQ for async processing
- **Caching Layer**: Redis for API responses
- **CDN Integration**: CloudFlare for static assets

---

## 14. Constraints & Assumptions

### 14.1 Constraints

- **API Rate Limits**: OpenAI, Gemini have rate limits
- **File Size**: PDF uploads limited to reasonable size (configurable)
- **Concurrent Users**: Limited by PostgreSQL connections
- **Embedding Dimensions**: Fixed by embedding model

### 14.2 Assumptions

- Users have valid API keys for LLM providers
- Documents are primarily text-based PDFs
- English language primary (LLM dependent)
- Stable internet connection required
- Modern browsers (Chrome, Firefox, Safari, Edge)

---

## 15. Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| API Key Exposure | High | Environment variables, gitignore |
| LLM API Downtime | Medium | Graceful degradation, error handling |
| Database Corruption | High | Regular backups, WAL archiving |
| Excessive API Costs | Medium | Rate limiting, usage monitoring |
| ChromaDB Data Loss | Medium | Regular backups, document reprocessing |

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Status**: Final
