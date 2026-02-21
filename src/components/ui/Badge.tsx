type BadgeVariant = 'pending' | 'investigating' | 'resolved' | 'critical' | 'closed' | 'info' | 'success' | 'warning' | 'danger' | 'purple';

interface BadgeProps {
    variant: BadgeVariant;
    children: React.ReactNode;
    className?: string;
    dot?: boolean;
}

export default function Badge({ variant, children, className = '', dot }: BadgeProps) {
    return (
        <span className={`badge badge-${variant} ${className}`}>
            {dot && (
                <span
                    className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                    style={{ background: 'currentColor' }}
                />
            )}
            {children}
        </span>
    );
}

// Convenience: Status-to-variant mapping
export function statusToBadgeVariant(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
        pending: 'pending',
        investigating: 'investigating',
        resolved: 'resolved',
        closed: 'closed',
        active: 'danger',
        acknowledged: 'warning',
        critical: 'critical',
    };
    return map[status] || 'info';
}
