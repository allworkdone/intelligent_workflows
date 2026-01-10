import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '../ui';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { chatApi } from '../../api';
import type { ChatMessage as ChatMessageType } from '../../types';

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    stackId: string;
    stackName: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
    isOpen,
    onClose,
    stackId,
    stackName,
}) => {
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await chatApi.getHistory(stackId);
            if (response.success && response.data) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch chat history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen, stackId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (message: string) => {
        if (!message.trim() || sending) return;

        // Add user message optimistically
        const userMessage: ChatMessageType = {
            id: `temp-${Date.now()}`,
            stack_id: stackId,
            role: 'user',
            content: message,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setSending(true);

        try {
            const response = await chatApi.sendMessage(stackId, message);
            if (response.success && response.data) {
                const assistantMessage: ChatMessageType = {
                    id: `temp-${Date.now()}-assistant`,
                    stack_id: stackId,
                    role: 'assistant',
                    content: response.data.response,
                    created_at: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleClearHistory = async () => {
        if (!confirm('Are you sure you want to clear chat history?')) return;
        try {
            await chatApi.clearHistory(stackId);
            setMessages([]);
        } catch (error) {
            console.error('Failed to clear history:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-[4px] flex items-center justify-center z-50 p-6" onClick={onClose}>
            <div
                className="w-full max-w-[700px] h-[80vh] bg-bg-secondary border border-border-default rounded-xl flex flex-col overflow-hidden shadow-xl animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-border-default">
                    <h2 className="text-lg font-semibold text-text-primary">Chat with {stackName}</h2>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleClearHistory} className="text-text-secondary hover:text-accent-danger !p-2 h-auto">
                            <Trash2 size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onClose} className="text-text-secondary hover:text-text-primary !p-2 h-auto">
                            <X size={20} />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-text-muted">
                            <div className="w-6 h-6 border-2 border-text-muted border-t-accent-primary rounded-full animate-spin-custom" />
                            <span>Loading messages...</span>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-text-muted">
                            <p className="text-base font-medium text-text-secondary">Start a conversation</p>
                            <span className="text-sm">Ask anything about your knowledge base</span>
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => (
                                <ChatMessage key={message.id} message={message} />
                            ))}
                            {sending && (
                                <div className="flex items-center gap-3 p-4 bg-bg-tertiary rounded-lg self-start text-text-secondary text-sm">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both_-0.32s]" />
                                        <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both_-0.16s]" />
                                        <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both]" />
                                    </div>
                                    <span>Thinking...</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                <ChatInput onSend={handleSend} disabled={sending} />
            </div>
        </div>
    );
};
