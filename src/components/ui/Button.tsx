'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'danger' | 'ghost' | 'outline' | 'success' | 'icon';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }, ref) => {
        const variantClass = {
            primary: 'btn-primary',
            danger: 'btn-danger',
            ghost: 'btn-ghost',
            outline: 'btn-outline',
            success: 'btn-success',
            icon: 'btn-icon',
        }[variant];

        const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

        return (
            <button
                ref={ref}
                className={`${variantClass} ${sizeClass} ${loading ? 'btn-loading' : ''} ${className}`}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
export { Button };
export default Button;

