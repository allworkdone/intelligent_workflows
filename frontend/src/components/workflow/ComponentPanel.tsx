import React from 'react';
import { MessageSquare, Database, Cpu, MessageCircle } from 'lucide-react';
import type { NodeType, DraggableNode } from '../../types';

const AVAILABLE_NODES: DraggableNode[] = [
    {
        type: 'userQuery',
        label: 'User Query',
        icon: 'MessageSquare',
        color: 'var(--node-input)',
    },
    {
        type: 'knowledgeBase',
        label: 'Knowledge Base',
        icon: 'Database',
        color: 'var(--node-knowledge)',
    },
    {
        type: 'llmEngine',
        label: 'LLM Engine',
        icon: 'Cpu',
        color: 'var(--node-llm)',
    },
    {
        type: 'output',
        label: 'Output',
        icon: 'MessageCircle',
        color: 'var(--node-output)',
    },
];

const IconMap: Record<string, React.FC<{ size?: number }>> = {
    MessageSquare,
    Database,
    Cpu,
    MessageCircle,
};

const ColorMap: Record<string, string> = {
    'var(--node-input)': '#238636',
    'var(--node-knowledge)': '#d29922',
    'var(--node-llm)': '#1f6feb',
    'var(--node-output)': '#8957e5',
}

interface ComponentPanelProps {
    onDragStart: (event: React.DragEvent, nodeType: NodeType) => void;
}

export const ComponentPanel: React.FC<ComponentPanelProps> = ({ onDragStart }) => {
    return (
        <div className="w-64 bg-bg-secondary border-r border-border-default flex flex-col shrink-0">
            <div className="px-5 py-4 border-b border-border-default">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Components</h3>
            </div>
            <div className="p-4 flex flex-col gap-3">
                {AVAILABLE_NODES.map((node) => {
                    const Icon = IconMap[node.icon];
                    return (
                        <div
                            key={node.type}
                            className="flex items-center gap-3 p-3 bg-bg-tertiary border border-border-default rounded-md cursor-grab transition-all duration-200 hover:border-text-muted hover:bg-bg-hover hover:translate-x-1 active:cursor-grabbing"
                            draggable
                            onDragStart={(e) => onDragStart(e, node.type)}
                        >
                            <div
                                className="w-9 h-9 rounded flex items-center justify-center text-white shrink-0"
                                style={{ background: ColorMap[node.color] || node.color }}
                            >
                                <Icon size={18} />
                            </div>
                            <span className="text-sm font-medium text-text-primary">{node.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
