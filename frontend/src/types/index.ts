// Stack types
export interface Stack {
  id: string;
  name: string;
  description: string | null;
  workflow_data: WorkflowData | null;
  created_at: string;
  updated_at: string;
}

export interface StackCreate {
  name: string;
  description?: string;
}

export interface StackUpdate {
  name?: string;
  description?: string;
  workflow_data?: WorkflowData;
}

// Workflow types
export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeConfig {
  [key: string]: any;
}

export interface NodeData {
  label: string;
  type: string;
  config?: NodeConfig;
  [key: string]: unknown;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: NodePosition;
  data: NodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface WorkflowData {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

// Document types
export interface Document {
  id: string;
  stack_id: string;
  filename: string;
  is_processed: boolean;
  created_at: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  stack_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  sources?: string[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Node component types
export type NodeType = 'userQuery' | 'knowledgeBase' | 'llmEngine' | 'output';

export interface DraggableNode {
  type: NodeType;
  label: string;
  icon: string;
  color: string;
}
