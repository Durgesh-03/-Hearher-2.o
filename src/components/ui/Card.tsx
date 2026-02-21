interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

export default function Card({
    children,
    className = '',
    hover = true,
    padding = 'md',
    header,
    footer,
}: CardProps) {
    const paddingMap = {
        none: '',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-7',
    };

    return (
        <div className={`glass-card ${hover ? '' : '!transform-none !shadow-none'} ${paddingMap[padding]} ${className}`}>
            {header && (
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                    {header}
                </div>
            )}
            {children}
            {footer && (
                <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/[0.06]">
                    {footer}
                </div>
            )}
        </div>
    );
}
