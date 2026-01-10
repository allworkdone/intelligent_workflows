import React from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    error?: string;
    fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
    label,
    options,
    error,
    fullWidth = true,
    className = '',
    ...props
}) => {
    return (
        <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
            {label && <label className="text-[13px] font-medium text-text-secondary">{label}</label>}
            <div className="relative">
                <select
                    className={`w-full pl-3 pr-10 py-2 bg-bg-tertiary border border-border-default rounded-md text-text-primary text-sm cursor-pointer transition-all duration-200 focus:border-border-focus focus:ring-4 focus:ring-accent-primary/15 focus:outline-none appearance-none ${error ? 'border-accent-danger focus:ring-accent-danger/15' : ''} ${className}`}
                    value={props.value}
                    disabled={false}
                    {...props}
                >

                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="bg-bg-secondary text-text-primary">
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {error && <span className="text-xs text-accent-danger">{error}</span>}
        </div>
    );
};
