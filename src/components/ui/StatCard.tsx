import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    trend?: { value: number; label: string };
    color?: 'cyan' | 'emerald' | 'danger' | 'warning' | 'purple';
    className?: string;
}

const COLOR_MAP = {
    cyan: { bg: 'rgba(6, 182, 212, 0.12)', text: '#22d3ee', glow: 'rgba(6, 182, 212, 0.2)' },
    emerald: { bg: 'rgba(16, 185, 129, 0.12)', text: '#34d399', glow: 'rgba(16, 185, 129, 0.2)' },
    danger: { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171', glow: 'rgba(239, 68, 68, 0.2)' },
    warning: { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24', glow: 'rgba(245, 158, 11, 0.2)' },
    purple: { bg: 'rgba(139, 92, 246, 0.12)', text: '#a78bfa', glow: 'rgba(139, 92, 246, 0.2)' },
};

export default function StatCard({ icon, label, value, trend, color = 'cyan', className = '' }: StatCardProps) {
    const colors = COLOR_MAP[color];

    return (
        <div className={`stats-card ${className}`}>
            <div className="flex items-start justify-between">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: colors.bg, color: colors.text }}
                >
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trend.value > 0 ? 'text-emerald-400' : trend.value < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                        {trend.value > 0 ? <TrendingUp size={14} /> : trend.value < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
                        <span>{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>
            <div className="mt-3">
                <div className="text-2xl font-bold text-slate-100">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
            {trend && (
                <div className="text-[10px] text-slate-600 mt-1">{trend.label}</div>
            )}
        </div>
    );
}
