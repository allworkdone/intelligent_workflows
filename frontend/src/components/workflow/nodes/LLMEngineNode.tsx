import React from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Cpu, Globe } from 'lucide-react';
import { type NodeData } from '../../../types';

type CustomNode = Node<NodeData>;

export const LLMEngineNode: React.FC<NodeProps<CustomNode>> = ({ data, selected }) => {
    const config = data.config || {};

    return (
        <div className={`bg-bg-card border rounded-lg p-4 min-w-[200px] max-w-[280px] transition-all duration-200 border-l-[3px] border-l-node-llm hover:border-text-muted ${selected ? '!border-accent-primary ring-2 ring-accent-primary/20' : 'border-border-default'}`}>
            <Handle
                type="target"
                position={Position.Left}
                id="input"
                className="!w-3 !h-3 !border-2 !border-bg-primary !bg-accent-primary -left-[6px] transition-transform duration-200 hover:scale-[1.3]"
            />
            <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded bg-node-llm flex items-center justify-center text-white shrink-0">
                    <Cpu size={16} />
                </div>
                <span className="text-sm font-semibold text-text-primary">{data.label || 'LLM Engine'}</span>
            </div>
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                    <span className="bg-bg-tertiary px-1.5 py-0.5 rounded text-[11px] font-medium">{config.provider || 'OpenAI'}</span>
                    <span className="bg-bg-tertiary px-1.5 py-0.5 rounded text-[11px] font-medium">{config.model || 'gpt-4o-mini'}</span>
                </div>
                {config.enableWebSearch && (
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <Globe size={14} />
                        <span>Web Search Enabled</span>
                    </div>
                )}
                <p className="text-xs text-text-muted leading-relaxed">
                    Temp: {config.temperature ?? 0.7}
                </p>
            </div>
            <Handle
                type="source"
                position={Position.Right}
                id="response"
                className="!w-3 !h-3 !border-2 !border-bg-primary !bg-accent-primary -right-[6px] transition-transform duration-200 hover:scale-[1.3]"
            />
        </div>
    );
};
