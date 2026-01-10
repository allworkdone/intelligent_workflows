import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle } from 'lucide-react';
import { Button } from '../ui';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (message.trim() && !disabled) {
            onSend(message);
            setMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    return (
        <div className="p-4 bg-bg-secondary border-t border-border-default">
            <form
                onSubmit={handleSubmit}
                className="flex items-end gap-2 bg-bg-tertiary border border-border-default rounded-lg p-2 transition-colors focus-within:border-border-focus focus-within:ring-2 focus-within:ring-accent-primary/15"
            >
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none text-text-primary text-sm leading-6 px-2 resize-none min-h-[24px] max-h-[120px] outline-none placeholder:text-text-placeholder font-sans"
                    rows={1}
                    disabled={disabled}
                />
                <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!message.trim() || disabled}
                    className="shrink-0 w-8 h-8 !p-0 rounded-md"
                >
                    {disabled ? <StopCircle size={18} /> : <Send size={18} />}
                </Button>
            </form>
        </div>
    );
};
