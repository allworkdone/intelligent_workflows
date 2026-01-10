import React, { useCallback, useRef } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    type Connection,
    type Edge,
    type Node,
    addEdge,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { UserQueryNode, KnowledgeBaseNode, LLMEngineNode, OutputNode } from './nodes';
import type { NodeType } from '../../types';

const nodeTypes = {
    userQuery: UserQueryNode,
    knowledgeBase: KnowledgeBaseNode,
    llmEngine: LLMEngineNode,
    output: OutputNode,
} as const;

interface WorkflowCanvasProps {
    initialNodes?: Node[];
    initialEdges?: Edge[];
    onNodesChange: (nodes: Node[]) => void;
    onEdgesChange: (edges: Edge[]) => void;
    onNodeSelect: (node: Node | null) => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
    initialNodes = [],
    initialEdges = [],
    onNodesChange,
    onEdgesChange,
    onNodeSelect,
}) => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, handleNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, handleEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => {
            const newEdges = addEdge(
                {
                    ...params,
                    animated: true,
                    style: { stroke: '#58a6ff', strokeWidth: 2 },
                },
                edges
            );
            setEdges(newEdges);
            onEdgesChange(newEdges);
        },
        [edges, setEdges, onEdgesChange]
    );

    const onNodesChangeHandler = useCallback(
        (changes: any) => {
            handleNodesChange(changes);
            // Get updated nodes after change
            const updatedNodes = nodes.map((node) => {
                const change = changes.find((c: any) => c.id === node.id);
                if (change) {
                    if (change.type === 'position' && change.position) {
                        return { ...node, position: change.position };
                    }
                    if (change.type === 'select') {
                        return { ...node, selected: change.selected };
                    }
                }
                return node;
            });
            onNodesChange(updatedNodes);
        },
        [nodes, handleNodesChange, onNodesChange]
    );

    const onEdgesChangeHandler = useCallback(
        (changes: any) => {
            handleEdgesChange(changes);
            onEdgesChange(edges);
        },
        [edges, handleEdgesChange, onEdgesChange]
    );

    const onSelectionChange = useCallback(
        ({ nodes: selectedNodes }: { nodes: Node[] }) => {
            if (selectedNodes.length === 1) {
                onNodeSelect(selectedNodes[0]);
            } else {
                onNodeSelect(null);
            }
        },
        [onNodeSelect]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow') as NodeType;
            if (!type || !reactFlowWrapper.current) return;

            const bounds = reactFlowWrapper.current.getBoundingClientRect();
            const position = {
                x: event.clientX - bounds.left - 100,
                y: event.clientY - bounds.top - 25,
            };

            const labels: Record<NodeType, string> = {
                userQuery: 'User Query',
                knowledgeBase: 'Knowledge Base',
                llmEngine: 'LLM Engine',
                output: 'Output',
            };

            const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: {
                    label: labels[type],
                    type,
                    config: {},
                },
            };

            const updatedNodes = [...nodes, newNode];
            setNodes(updatedNodes);
            onNodesChange(updatedNodes);
        },
        [nodes, setNodes, onNodesChange]
    );

    return (
        <div className="flex-1 h-full bg-bg-primary" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChangeHandler}
                onEdgesChange={onEdgesChangeHandler}
                onConnect={onConnect}
                onSelectionChange={onSelectionChange}
                onDragOver={onDragOver}
                onDrop={onDrop}
                nodeTypes={nodeTypes}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
                defaultEdgeOptions={{
                    animated: true,
                    style: { stroke: '#30363d', strokeWidth: 2 },
                }}
                proOptions={{ hideAttribution: true }}
            >
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#21262d" />
                <Controls className="!bg-bg-secondary !border-border-default !shadow-md !rounded-lg" />
                <MiniMap
                    className="!bg-bg-secondary !border-border-default !shadow-md !rounded-lg"
                    nodeColor={(node) => {
                        const colors: Record<string, string> = {
                            userQuery: '#238636',
                            knowledgeBase: '#d29922',
                            llmEngine: '#1f6feb',
                            output: '#8957e5',
                        };
                        return colors[node.type || ''] || '#21262d';
                    }}
                />
            </ReactFlow>
        </div>
    );
};
