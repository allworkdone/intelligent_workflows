# Mock Stack Reference Guide

## Overview
This reference stack demonstrates a complete AI workflow using:
- **RAG (Retrieval-Augmented Generation)** with knowledge base
- **Web search integration** for real-time information
- **Gemini 2.5 Flash** for AI processing
- **Proper system prompts** for context-aware responses

## Stack Details

**Name:** AI Research Assistant  
**ID:** `1b7f49c2-2df7-4c0e-a970-d982a8145c0c`  
**Description:** A comprehensive reference stack that demonstrates RAG with knowledge base, web search integration, and Gemini AI processing

## Workflow Architecture

```
User Query → Knowledge Base → Gemini AI → Output
     ↓              ↓              ↑
     └──────────────┴──────────────┘
           (with web search)
```

### Components

#### 1. User Query Node
- **ID:** `userQuery-1`
- **Type:** `userQuery`
- **Purpose:** Entry point for user questions
- **Configuration:** None required

#### 2. Knowledge Base Node
- **ID:** `knowledgeBase-1`
- **Type:** `knowledgeBase`
- **Purpose:** Retrieves relevant context from uploaded documents
- **Configuration:**
  ```json
  {
    "embeddingModel": "openai",
    "description": "Retrieves relevant information from uploaded documents"
  }
  ```

#### 3. LLM Engine Node (Gemini 2.5 Flash)
- **ID:** `llmEngine-1`
- **Type:** `llmEngine`
- **Purpose:** AI processing with context awareness
- **Configuration:**
  ```json
  {
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "temperature": 0.7,
    "systemPrompt": "You are a helpful AI research assistant...",
    "enableWebSearch": true
  }
  ```

#### 4. Output Node
- **ID:** `output-1`
- **Type:** `output`
- **Purpose:** Final response delivery
- **Configuration:** None required

### Data Flow (Edges)

1. **User Query → Knowledge Base**
   - Sends query to retrieve relevant documents
   
2. **User Query → LLM Engine**
   - Forwards original question to AI
   
3. **Knowledge Base → LLM Engine**
   - Provides document context to AI
   
4. **LLM Engine → Output**
   - Delivers final AI-generated response

## Testing the Stack

### 1. Validate Workflow
```bash
curl -X POST http://localhost:8000/api/stacks/1b7f49c2-2df7-4c0e-a970-d982a8145c0c/build
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "warnings": []
  }
}
```

### 2. Send Test Message
```bash
curl -X POST http://localhost:8000/api/chat/1b7f49c2-2df7-4c0e-a970-d982a8145c0c/message \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the capital of France?"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "response": "The capital of France is Paris."
  },
  "message": "Message processed successfully"
}
```

## Key Features Demonstrated

### ✅ RAG Implementation
- Knowledge base integration for document retrieval
- Context-aware responses using embeddings
- Semantic search capabilities

### ✅ Multi-Source Intelligence
- Documents from knowledge base
- Real-time web search results
- LLM reasoning and synthesis

### ✅ Gemini 2.5 Flash Integration
- Latest model version (not deprecated 1.5)
- Proper `system_instruction` usage
- Temperature control for creativity

### ✅ Robust System Prompt
The system prompt guides the AI to:
- Use provided context effectively
- Acknowledge when context is insufficient
- Maintain research assistant persona
- Cite sources when applicable

## Files Reference

- **Stack Configuration:** [mock_stack.json](file:///Users/allworkdone/react_development/assignment/mock_stack.json)
- **Workflow Definition:** [mock_workflow.json](file:///Users/allworkdone/react_development/assignment/mock_workflow.json)

## Usage Tips

1. **For Simple Q&A:** The stack works without documents, using web search and Gemini's knowledge
2. **For Document Analysis:** Upload PDFs first, then query the stack
3. **For Research:** Enable web search for latest information
4. **For Customization:** Modify system prompt and temperature to suit your needs

## API Endpoints

- **View Stack:** `GET /api/stacks/1b7f49c2-2df7-4c0e-a970-d982a8145c0c`
- **Update Workflow:** `POST /api/stacks/1b7f49c2-2df7-4c0e-a970-d982a8145c0c/workflow`
- **Build/Validate:** `POST /api/stacks/1b7f49c2-2df7-4c0e-a970-d982a8145c0c/build`
- **Send Message:** `POST /api/chat/1b7f49c2-2df7-4c0e-a970-d982a8145c0c/message`
- **Chat History:** `GET /api/chat/1b7f49c2-2df7-4c0e-a970-d982a8145c0c/history`

## Access from Frontend

Open the application at `http://localhost:5173` and look for the **AI Research Assistant** stack in your stack list.
