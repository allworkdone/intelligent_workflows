import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
    message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-3 max-w-[85%] animate-slide-up ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${isUser ? 'bg-gradient-to-br from-accent-primary to-blue-500' : 'bg-gradient-to-br from-accent-secondary to-purple-600'}`}>
                {isUser ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className="flex flex-col gap-1">
                <div className={`p-3 rounded-lg text-sm leading-relaxed prose prose-invert prose-sm max-w-none ${isUser ? 'bg-accent-primary text-white rounded-br-sm' : 'bg-bg-tertiary text-text-primary border border-border-default rounded-bl-sm'}`}>
                    {isUser ? (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                    ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} className="markdown-content">
                            {message.content}
                        </ReactMarkdown>
                    )}
                </div>
            </div>
        </div>
    );
};
