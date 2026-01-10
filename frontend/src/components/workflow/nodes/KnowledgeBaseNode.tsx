import React from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Database, File } from 'lucide-react';
import { type NodeData } from '../../../types';

type CustomNode = Node<NodeData>;

export const KnowledgeBaseNode: React.FC<NodeProps<CustomNode>> = ({ data, selected }) => {
    const config = data.config || {};
    const fileCount = (config.files as any[])?.length || 0;

    return (
        <div className={`bg-bg-card border rounded-lg p-4 min-w-[200px] max-w-[280px] transition-all duration-200 border-l-[3px] border-l-node-knowledge hover:border-text-muted ${selected ? '!border-accent-primary ring-2 ring-accent-primary/20' : 'border-border-default'}`}>
            <Handle
                type="target"
                position={Position.Left}
                id="query"
                className="!w-3 !h-3 !border-2 !border-bg-primary !bg-accent-primary -left-[6px] transition-transform duration-200 hover:scale-[1.3]"
            />
            <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded bg-node-knowledge flex items-center justify-center text-white shrink-0">
                    <Database size={16} />
                </div>
                <span className="text-sm font-semibold text-text-primary">{data.label || 'Knowledge Base'}</span>
            </div>
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <File size={14} />
                    <span>{fileCount} document{fileCount !== 1 ? 's' : ''}</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                    {config.embeddingModel ? `Using ${config.embeddingModel}` : 'Configure embedding model'}
                </p>
            </div>
            <Handle
                type="source"
                position={Position.Right}
                id="context"
                className="!w-3 !h-3 !border-2 !border-bg-primary !bg-accent-primary -right-[6px] transition-transform duration-200 hover:scale-[1.3]"
            />
        </div>
    );
};
