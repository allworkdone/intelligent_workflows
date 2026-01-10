import React, { useState, useRef } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import type { Node } from '@xyflow/react';
import { Button, Input, Textarea, Select } from '../ui';
import { documentsApi } from '../../api';
import type { Document } from '../../types';

interface ConfigPanelProps {
    selectedNode: Node | null;
    stackId: string;
    documents: Document[];
    onUpdateNode: (nodeId: string, data: any) => void;
    onClose: () => void;
    onDocumentsChange: () => void;
}

const EMBEDDING_MODELS = [
    { value: 'openai', label: 'OpenAI Embeddings' },
    { value: 'gemini', label: 'Gemini Embeddings' },
];

const LLM_PROVIDERS = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'gemini', label: 'Google Gemini' },
];

const LLM_MODELS = {
    openai: [
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    ],
    gemini: [
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
        { value: 'gemini-pro', label: 'Gemini Pro' },
    ],
};

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
    selectedNode,
    stackId,
    documents,
    onUpdateNode,
    onClose,
    onDocumentsChange,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState<string | null>(null);

    if (!selectedNode) {
        return (
            <div className="w-[320px] bg-bg-secondary border-l border-border-default flex flex-col shrink-0 overflow-hidden">
                <div className="flex-1 flex items-center justify-center text-text-muted">
                    <p>Select a node to configure</p>
                </div>
            </div>
        );
    }

    const nodeData = selectedNode.data as any;
    const config = nodeData.config || {};

    const updateConfig = (updates: Record<string, any>) => {
        onUpdateNode(selectedNode.id, {
            ...nodeData,
            config: { ...config, ...updates },
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                await documentsApi.upload(stackId, file);
            }
            onDocumentsChange();
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleProcessDocument = async (docId: string) => {
        setProcessing(docId);
        try {
            await documentsApi.process(docId, config.embeddingModel || 'openai', config.apiKey);
            onDocumentsChange();
        } catch (error) {
            console.error('Processing failed:', error);
        } finally {
            setProcessing(null);
        }
    };

    const handleDeleteDocument = async (docId: string) => {
        try {
            await documentsApi.delete(docId);
            onDocumentsChange();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const renderKnowledgeBaseConfig = () => (
        <>
            <div className="flex flex-col gap-2">
                <h4 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wide mb-1">Documents</h4>
                <div className="flex flex-col gap-1.5 mb-2">
                    {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-bg-tertiary rounded gap-2">
                            <span className="text-[13px] text-text-primary truncate flex-1">{doc.filename}</span>
                            <div className="flex items-center gap-1">
                                {!doc.is_processed ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleProcessDocument(doc.id)}
                                        loading={processing === doc.id}
                                    >
                                        Process
                                    </Button>
                                ) : (
                                    <span className="text-xs text-accent-success">✓ Ready</span>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteDocument(doc.id)}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                />
                <Button
                    variant="secondary"
                    fullWidth
                    icon={<Upload size={16} />}
                    onClick={() => fileInputRef.current?.click()}
                    loading={uploading}
                >
                    Upload PDF
                </Button>
            </div>
            <div className="flex flex-col gap-2">
                <Select
                    label="Embedding Model"
                    options={EMBEDDING_MODELS}
                    value={config.embeddingModel || 'openai'}
                    onChange={(e) => updateConfig({ embeddingModel: e.target.value })}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Input
                    label="API Key (optional)"
                    type="password"
                    placeholder="Leave empty to use server key"
                    value={config.apiKey || ''}
                    onChange={(e) => updateConfig({ apiKey: e.target.value })}
                />
            </div>
        </>
    );

    const renderLLMConfig = () => (
        <>
            <div className="flex flex-col gap-2">
                <Select
                    label="Provider"
                    options={LLM_PROVIDERS}
                    value={config.provider || 'openai'}
                    onChange={(e) => updateConfig({ provider: e.target.value, model: '' })}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Select
                    label="Model"
                    options={LLM_MODELS[config.provider as keyof typeof LLM_MODELS] || LLM_MODELS.openai}
                    value={config.model || 'gpt-4o-mini'}
                    onChange={(e) => updateConfig({ model: e.target.value })}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Input
                    label="API Key (optional)"
                    type="password"
                    placeholder="Leave empty to use server key"
                    value={config.apiKey || ''}
                    onChange={(e) => updateConfig({ apiKey: e.target.value })}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Textarea
                    label="System Prompt"
                    placeholder="Enter system prompt... Use {query} and {context} as placeholders"
                    value={config.systemPrompt || ''}
                    onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
                    rows={4}
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-text-secondary">Temperature: {config.temperature ?? 0.7}</label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.temperature ?? 0.7}
                    onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
                    className="w-full h-1.5 appearance-none bg-bg-tertiary rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg-secondary"
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
                    <input
                        type="checkbox"
                        checked={config.enableWebSearch || false}
                        onChange={(e) => updateConfig({ enableWebSearch: e.target.checked })}
                        className="w-[18px] h-[18px] accent-accent-primary"
                    />
                    <span>Enable Web Search</span>
                </label>
            </div>
        </>
    );

    const renderConfig = () => {
        switch (selectedNode.type) {
            case 'knowledgeBase':
                return renderKnowledgeBaseConfig();
            case 'llmEngine':
                return renderLLMConfig();
            default:
                return (
                    <div className="flex flex-col gap-2">
                        <p className="text-text-muted text-sm text-center p-6">No configuration options available</p>
                    </div>
                );
        }
    };

    return (
        <div className="w-[320px] bg-bg-secondary border-l border-border-default flex flex-col shrink-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
                <h3 className="text-base font-semibold text-text-primary">{nodeData.label || 'Configure Node'}</h3>
                <Button variant="ghost" size="sm" onClick={onClose} className="!p-1.5 h-auto">
                    <X size={18} />
                </Button>
            </div>
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-5">{renderConfig()}</div>
        </div>
    );
};
