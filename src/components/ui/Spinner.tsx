import { Loader2 } from 'lucide-react';

// ─── Spinner ────────────────────────────────────────────────────────────────

interface SpinnerProps {
    size?: number;
    className?: string;
}

export function Spinner({ size = 24, className = '' }: SpinnerProps) {
    return <Loader2 size={size} className={`animate-spin text-cyan-400 ${className}`} />;
}

// ─── Skeleton Variants ──────────────────────────────────────────────────────

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={className}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={`skeleton ${i === lines - 1 ? 'skeleton-text-short' : 'skeleton-text'}`}
                />
            ))}
        </div>
    );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
    return <div className={`skeleton skeleton-card ${className}`} />;
}

export function SkeletonAvatar({ className = '' }: { className?: string }) {
    return <div className={`skeleton skeleton-avatar ${className}`} />;
}

// ─── Full Page Loader ───────────────────────────────────────────────────────

export function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <Spinner size={40} />
                <p className="text-slate-500 text-sm mt-3">Loading...</p>
            </div>
        </div>
    );
}
