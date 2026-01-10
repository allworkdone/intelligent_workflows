import React from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { MessageCircle } from 'lucide-react';
import { type NodeData } from '../../../types';

type CustomNode = Node<NodeData>;

export const OutputNode: React.FC<NodeProps<CustomNode>> = ({ data, selected }) => {
    return (
        <div className={`bg-bg-card border rounded-lg p-4 min-w-[200px] max-w-[280px] transition-all duration-200 border-l-[3px] border-l-node-output hover:border-text-muted ${selected ? '!border-accent-primary ring-2 ring-accent-primary/20' : 'border-border-default'}`}>
            <Handle
                type="target"
                position={Position.Left}
                id="response"
                className="!w-3 !h-3 !border-2 !border-bg-primary !bg-accent-primary -left-[6px] transition-transform duration-200 hover:scale-[1.3]"
            />
            <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded bg-node-output flex items-center justify-center text-white shrink-0">
                    <MessageCircle size={16} />
                </div>
                <span className="text-sm font-semibold text-text-primary">{data.label || 'Output'}</span>
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-xs text-text-muted leading-relaxed">Displays final response in chat</p>
            </div>
        </div>
    );
};
