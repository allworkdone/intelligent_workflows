import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    fullWidth = false,
    disabled,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 cursor-pointer border focus:outline-none';

    const variants = {
        primary: 'bg-gradient-to-br from-accent-primary to-blue-500 text-white border-transparent hover:from-accent-primary-hover hover:to-blue-400 shadow-sm hover:-translate-y-[1px]',
        secondary: 'bg-bg-tertiary text-text-primary border-border-default hover:bg-bg-hover hover:border-text-muted',
        ghost: 'bg-transparent text-text-secondary border-transparent hover:bg-bg-hover hover:text-text-primary',
        danger: 'bg-accent-danger text-white border-transparent hover:bg-red-600 hover:-translate-y-[1px]',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const widthStyle = fullWidth ? 'w-full' : '';
    const disabledStyle = (disabled || loading) ? 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none pointer-events-none' : '';

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${disabledStyle} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-custom" />
            ) : icon ? (
                <span className="flex items-center justify-center">{icon}</span>
            ) : null}
            {children && <span>{children}</span>}
        </button>
    );
};
