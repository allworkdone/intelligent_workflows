import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { type Node, type Edge } from '@xyflow/react';
import { Layout } from '../components/layout';
import { ComponentPanel, ConfigPanel, WorkflowCanvas } from '../components/workflow';
import { ChatModal } from '../components/chat';
import { stacksApi, documentsApi } from '../api';
import { type Stack, type Document, type NodeType, type WorkflowNode, type WorkflowEdge } from '../types';

export const WorkflowBuilder: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [stack, setStack] = useState<Stack | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [buildStatus, setBuildStatus] = useState<{ valid?: boolean; message?: string } | null>(null);

    const fetchStack = useCallback(async () => {
        if (!id) return;
        try {
            const response = await stacksApi.getById(id);
            if (response.success && response.data) {
                setStack(response.data);
                if (response.data.workflow_data) {
                    // Cast the data from API to React Flow types
                    setNodes((response.data.workflow_data.nodes as unknown) as Node[]);
                    setEdges((response.data.workflow_data.edges as unknown) as Edge[]);
                }
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Failed to fetch stack:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    const fetchDocuments = useCallback(async () => {
        if (!id) return;
        try {
            const response = await documentsApi.getByStack(id);
            if (response.success && response.data) {
                setDocuments(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        }
    }, [id]);

    useEffect(() => {
        fetchStack();
        fetchDocuments();
    }, [fetchStack, fetchDocuments]);

    const handleSave = async () => {
        if (!id) return;
        setSaving(true);
        try {
            // Cast React Flow types back to API types
            const workflowData = {
                nodes: (nodes as unknown) as WorkflowNode[],
                edges: (edges as unknown) as WorkflowEdge[]
            };
            await stacksApi.saveWorkflow(id, workflowData);
            setBuildStatus({ message: 'Workflow saved!' });
            setTimeout(() => setBuildStatus(null), 2000);
        } catch (error) {
            console.error('Failed to save workflow:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleBuild = async () => {
        if (!id) return;
        // First save the workflow
        await handleSave();

        try {
            const response = await stacksApi.build(id);
            if (response.success && response.data) {
                setBuildStatus({ valid: true, message: 'Stack built successfully!' });
            } else {
                setBuildStatus({ valid: false, message: response.error?.message || 'Build failed' });
            }
        } catch (error) {
            setBuildStatus({ valid: false, message: 'Build failed' });
        }
    };

    const handleChat = async () => {
        // Save before opening chat
        await handleSave();
        setIsChatOpen(true);
    };

    const handleDragStart = (event: React.DragEvent, nodeType: NodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleUpdateNode = (nodeId: string, data: any) => {
        setNodes((nds) =>
            nds.map((node) => (node.id === nodeId ? { ...node, data } : node))
        );
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4 text-text-secondary">
                    <div className="w-8 h-8 border-2 border-text-muted border-t-accent-primary rounded-full animate-spin-custom" />
                    <span>Loading workflow...</span>
                </div>
            </Layout>
        );
    }

    return (
        <Layout
            title={stack?.name || 'Workflow Builder'}
            showBack
            stackId={id}
            onSave={handleSave}
            onBuild={handleBuild}
            onChat={handleChat}
            isSaving={saving}
        >
            <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
                <ComponentPanel onDragStart={handleDragStart} />

                <div className="flex-1 flex flex-col relative bg-bg-primary">
                    {buildStatus && (
                        <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md text-sm font-medium z-10 animate-slide-up ${buildStatus.valid === false ? 'bg-accent-danger/15 text-accent-danger border border-accent-danger' : 'bg-accent-success-light text-accent-success border border-accent-success'}`}>
                            {buildStatus.message}
                        </div>
                    )}
                    <WorkflowCanvas
                        initialNodes={nodes}
                        initialEdges={edges}
                        onNodesChange={setNodes}
                        onEdgesChange={setEdges}
                        onNodeSelect={setSelectedNode}
                    />
                </div>

                {selectedNode && (
                    <ConfigPanel
                        selectedNode={selectedNode}
                        stackId={id || ''}
                        documents={documents}
                        onUpdateNode={handleUpdateNode}
                        onClose={() => setSelectedNode(null)}
                        onDocumentsChange={fetchDocuments}
                    />
                )}
            </div>

            {id && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    stackId={id}
                    stackName={stack?.name || 'Stack'}
                />
            )}
        </Layout>
    );
};
