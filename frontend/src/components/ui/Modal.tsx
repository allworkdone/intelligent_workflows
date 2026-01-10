import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-[400px]',
        md: 'max-w-[500px]',
        lg: 'max-w-[650px]',
        xl: 'max-w-[800px]',
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-[4px] flex items-center justify-center z-50 p-6" onClick={onClose}>
            <div
                ref={modalRef}
                className={`bg-bg-secondary border border-border-default rounded-xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden w-full animate-slide-up ${sizeClasses[size]}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-border-muted">
                    <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="!p-1.5 h-auto text-text-secondary hover:text-text-primary">
                        <X size={20} />
                    </Button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    {children}
                </div>
                {footer && (
                    <div className="flex items-center justify-end gap-3 p-5 border-t border-border-muted">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
