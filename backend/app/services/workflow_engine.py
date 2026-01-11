from typing import Dict, Any, List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from .embedding_service import EmbeddingService
from .llm_service import LLMService
from .vector_store_service import VectorStoreService
from .web_search_service import WebSearchService
from ..repositories import DocumentRepository


class WorkflowEngine:
    """Engine for executing workflows based on node configurations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def execute(
        self, 
        stack_id: UUID, 
        workflow_data: Dict[str, Any], 
        query: str
    ) -> str:
        """Execute the workflow and return the final response"""
        nodes = workflow_data.get("nodes", [])
        edges = workflow_data.get("edges", [])
        
        # Build execution order
        execution_order = self._build_execution_order(nodes, edges)
        
        # Execute nodes in order
        context = {
            "query": query, 
            "knowledge_context": None, 
            "web_context": None,
            "workflow_data": workflow_data
        }
        
        for node in execution_order:
            node_type = node.get("type", "")
            node_config = node.get("data", {}).get("config", {})
            
            if node_type == "userQuery":
                # User query is already in context
                pass
            elif node_type == "knowledgeBase":
                context["knowledge_context"] = await self._execute_knowledge_base(
                    stack_id, query, node_config
                )
            elif node_type == "llmEngine":
                response = await self._execute_llm_engine(context, node_config)
                context["response"] = response
            elif node_type == "output":
                # Output node just returns the response
                pass
        
        return context.get("response", "No response generated")
    
    def _build_execution_order(
        self, 
        nodes: List[Dict], 
        edges: List[Dict]
    ) -> List[Dict]:
        """Build execution order based on node connections"""
        # Create adjacency list
        graph = {node["id"]: [] for node in nodes}
        in_degree = {node["id"]: 0 for node in nodes}
        
        for edge in edges:
            source = edge["source"]
            target = edge["target"]
            if source in graph:
                graph[source].append(target)
            if target in in_degree:
                in_degree[target] += 1
        
        # Topological sort using Kahn's algorithm
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
        """Execute knowledge base retrieval"""
        provider = config.get("embeddingModel", "openai")
        api_key = config.get("apiKey")
        
        try:
            # Generate query embedding
            embedding_service = EmbeddingService(provider=provider, api_key=api_key)
            query_embedding = embedding_service.generate_embeddings([query])[0]
            
            # Query vector store
            vector_store = VectorStoreService(collection_name=f"stack_{stack_id}")
            results = vector_store.query(query_embedding, n_results=5)
            
            # Format results as context
            documents = results.get("documents", [[]])[0]
            if documents:
                return "\n\n".join(documents)
            return None
        except Exception as e:
            print(f"Knowledge base error: {e}")
            return None
    
    def _format_workflow_context(self, workflow_data: Dict[str, Any]) -> str:
        """Format workflow structure as readable context for the LLM"""
        nodes = workflow_data.get("nodes", [])
        edges = workflow_data.get("edges", [])
        
        if not nodes:
            return "No workflow configured."
        
        parts = ["Current Workflow Configuration:"]
        parts.append("\n=== Workflow Components ===")
        
        # List all nodes
        for node in nodes:
            node_type = node.get("type", "unknown")
            node_data = node.get("data", {})
            node_label = node_data.get("label", "Unnamed")
            node_config = node_data.get("config", {})
            
            type_names = {
                "userQuery": "User Query Input",
                "knowledgeBase": "Knowledge Base (RAG)",
                "llmEngine": "LLM Engine",
                "output": "Output"
            }
            
            parts.append(f"\n• {node_label} ({type_names.get(node_type, node_type)}):")
            
            # Add configuration details
            if node_type == "knowledgeBase" and node_config:
                if node_config.get("embeddingModel"):
                    parts.append(f"  - Embedding Model: {node_config['embeddingModel']}")
            
            elif node_type == "llmEngine" and node_config:
                if node_config.get("provider"):
                    parts.append(f"  - Provider: {node_config['provider']}")
                if node_config.get("model"):
                    parts.append(f"  - Model: {node_config['model']}")
                if node_config.get("temperature") is not None:
                    parts.append(f"  - Temperature: {node_config['temperature']}")
                if node_config.get("systemPrompt"):
                    prompt_preview = node_config['systemPrompt'][:100] + "..." if len(node_config['systemPrompt']) > 100 else node_config['systemPrompt']
                    parts.append(f"  - System Prompt: {prompt_preview}")
                if node_config.get("enableWebSearch"):
                    parts.append(f"  - Web Search: Enabled")
        
        # Show data flow
        if edges:
            parts.append("\n=== Data Flow ===")
            node_map = {node["id"]: node.get("data", {}).get("label", "Unnamed") for node in nodes}
            for edge in edges:
                source_label = node_map.get(edge.get("source", ""), "Unknown")
                target_label = node_map.get(edge.get("target", ""), "Unknown")
                parts.append(f"  {source_label} → {target_label}")
        
        return "\n".join(parts)
    
    async def _execute_llm_engine(
        self, 
        context: Dict[str, Any], 
        config: Dict[str, Any]
    ) -> str:
        """Execute LLM generation"""
        provider = config.get("provider", "openai")
        model = config.get("model", "gpt-4o-mini")
        api_key = config.get("apiKey")
        system_prompt = config.get("systemPrompt")
        temperature = config.get("temperature", 0.7)
        enable_web_search = config.get("enableWebSearch", False)
        
        query = context.get("query", "")
        knowledge_context = context.get("knowledge_context")
        
        # Perform web search if enabled
        web_context = None
        if enable_web_search:
            search_provider = config.get("webSearchProvider", "serpapi")  # Default to serpapi
            web_search = WebSearchService(provider=search_provider)
            results = await web_search.search(query)
            web_context = web_search.format_results_as_context(results)
        
        # Combine contexts
        full_context = None
        context_parts = []
        
        # Add workflow context first
        workflow_data = context.get("workflow_data")
        if workflow_data:
            workflow_context = self._format_workflow_context(workflow_data)
            context_parts.append(workflow_context)
        
        if knowledge_context:
            context_parts.append(f"\nDocument Knowledge:\n{knowledge_context}")
        if web_context:
            context_parts.append(f"\n{web_context}")
        if context_parts:
            full_context = "\n\n".join(context_parts)
        
        # Generate response
        llm_service = LLMService(provider=provider, model=model, api_key=api_key)
        response = llm_service.generate_response(
            query=query,
            context=full_context,
            system_prompt=system_prompt,
            temperature=temperature
        )
        
        return response
    
    def validate_workflow(self, workflow_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate the workflow structure"""
        nodes = workflow_data.get("nodes", [])
        edges = workflow_data.get("edges", [])
        
        errors = []
        warnings = []
        
        # Check for required node types
        node_types = [node.get("type") for node in nodes]
        
        if "userQuery" not in node_types:
            errors.append("Workflow must have a User Query component")
        
        if "output" not in node_types:
            errors.append("Workflow must have an Output component")
        
        if "llmEngine" not in node_types:
            warnings.append("Workflow has no LLM Engine - responses will be limited")
        
        # Check for disconnected nodes
        connected_nodes = set()
        for edge in edges:
            connected_nodes.add(edge["source"])
            connected_nodes.add(edge["target"])
        
        for node in nodes:
            if node["id"] not in connected_nodes and len(nodes) > 1:
                warnings.append(f"Node '{node.get('data', {}).get('label', node['id'])}' is not connected")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }
