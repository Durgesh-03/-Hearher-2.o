import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';

// ─── Input ──────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = '', ...props }, ref) => (
        <div className="form-group">
            {label && <label className="form-label">{label}</label>}
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        {icon}
                    </span>
                )}
                <input
                    ref={ref}
                    className={`glass-input ${icon ? 'pl-10' : ''} ${error ? '!border-red-500' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="form-error">{error}</p>}
        </div>
    )
);
Input.displayName = 'Input';

// ─── Textarea ───────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', ...props }, ref) => (
        <div className="form-group">
            {label && <label className="form-label">{label}</label>}
            <textarea
                ref={ref}
                className={`glass-textarea ${error ? '!border-red-500' : ''} ${className}`}
                {...props}
            />
            {error && <p className="form-error">{error}</p>}
        </div>
    )
);
Textarea.displayName = 'Textarea';

// ─── Select ─────────────────────────────────────────────────────────────────

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className = '', ...props }, ref) => (
        <div className="form-group">
            {label && <label className="form-label">{label}</label>}
            <select
                ref={ref}
                className={`glass-select ${error ? '!border-red-500' : ''} ${className}`}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="form-error">{error}</p>}
        </div>
    )
);
Select.displayName = 'Select';
