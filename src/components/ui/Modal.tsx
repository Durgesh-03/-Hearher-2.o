'use client';

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    const sizeClass = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
    }[size];

    return (
        <div className="overlay" onClick={onClose}>
            <div className={`modal ${sizeClass}`} onClick={(e) => e.stopPropagation()}>
                {title && (
                    <div className="modal-header">
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <button onClick={onClose} className="btn-icon">
                            <X size={18} />
                        </button>
                    </div>
                )}
                <div>{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
}
