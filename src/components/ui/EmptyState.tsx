import { Button } from './Button';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
    className?: string;
}

export default function EmptyState({ icon = '📭', title, description, action, className = '' }: EmptyStateProps) {
    return (
        <div className={`empty-state ${className}`}>
            <div className="empty-state-icon">{icon}</div>
            <div className="empty-state-title">{title}</div>
            {description && <div className="empty-state-desc">{description}</div>}
            {action && (
                <div className="mt-4">
                    <Button variant="primary" size="sm" onClick={action.onClick}>
                        {action.label}
                    </Button>
                </div>
            )}
        </div>
    );
}
