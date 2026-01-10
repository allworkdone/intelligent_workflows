import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    fullWidth = true,
    className = '',
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
            {label && <label className="text-[13px] font-medium text-text-secondary">{label}</label>}
            <input
                className={`w-full px-3 py-2 bg-bg-tertiary border border-border-default rounded-md text-text-primary text-sm transition-all duration-200 focus:border-border-focus focus:ring-4 focus:ring-accent-primary/15 focus:outline-none placeholder:text-text-placeholder ${error ? 'border-accent-danger focus:ring-accent-danger/15' : ''} ${className}`}
                {...props}
            />
            {error && <span className="text-xs text-accent-danger">{error}</span>}
        </div>
    );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
    label,
    error,
    fullWidth = true,
    className = '',
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
            {label && <label className="text-[13px] font-medium text-text-secondary">{label}</label>}
            <textarea
                className={`w-full px-3 py-2 bg-bg-tertiary border border-border-default rounded-md text-text-primary text-sm transition-all duration-200 focus:border-border-focus focus:ring-4 focus:ring-accent-primary/15 focus:outline-none placeholder:text-text-placeholder min-h-[100px] resize-y font-sans ${error ? 'border-accent-danger focus:ring-accent-danger/15' : ''} ${className}`}
                {...props}
            />
            {error && <span className="text-xs text-accent-danger">{error}</span>}
        </div>
    );
};
