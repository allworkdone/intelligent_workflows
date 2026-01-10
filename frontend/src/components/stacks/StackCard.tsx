import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Trash2, Calendar } from 'lucide-react';
import type { Stack } from '../../types';
import { Button } from '../ui';

interface StackCardProps {
    stack: Stack;
    onDelete: (id: string) => void;
}

export const StackCard: React.FC<StackCardProps> = ({ stack, onDelete }) => {
    const navigate = useNavigate();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleClick = () => {
        navigate(`/stack/${stack.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this stack?')) {
            onDelete(stack.id);
        }
    };

    const nodeCount = stack.workflow_data?.nodes?.length || 0;

    return (
        <div
            className="bg-bg-card border border-border-default rounded-lg p-6 cursor-pointer transition-all duration-200 flex flex-col gap-4 min-h-[180px] hover:border-accent-primary hover:-translate-y-0.5 hover:shadow-lg group"
            onClick={handleClick}
        >
            <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-md bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white">
                    <Layers size={24} />
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 transition-opacity duration-200 text-text-muted hover:text-accent-danger group-hover:opacity-100"
                    onClick={handleDelete}
                >
                    <Trash2 size={16} />
                </Button>
            </div>
            <div className="flex-1">
                <h3 className="text-base font-semibold text-text-primary mb-1">{stack.name}</h3>
                {stack.description && (
                    <p className="text-[13px] text-text-secondary leading-normal line-clamp-2">
                        {stack.description}
                    </p>
                )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-muted">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <Calendar size={14} />
                    <span>{formatDate(stack.updated_at)}</span>
                </div>
                <div className="text-xs text-text-muted bg-bg-tertiary px-2 py-0.5 rounded-sm">
                    {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'}
                </div>
            </div>
        </div>
    );
};
