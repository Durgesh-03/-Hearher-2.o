'use client';

import { useState, useEffect } from 'react';
import { getComplaints } from '@/lib/data-service';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Clock, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import type { Complaint } from '@/lib/database.types';

// ─── Status Config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', color: '#f5a623', bg: '#f5a62315', icon: <Clock size={14} /> },
    investigating: { label: 'Investigating', color: '#a855f7', bg: '#a855f715', icon: <AlertTriangle size={14} /> },
    resolved: { label: 'Resolved', color: '#10b981', bg: '#10b98115', icon: <CheckCircle size={14} /> },
    closed: { label: 'Closed', color: '#64748b', bg: '#64748b15', icon: <CheckCircle size={14} /> },
};

const TYPE_LABELS: Record<string, string> = {
    verbal: '🗣️ Verbal',
    physical: '✋ Physical',
    cyber: '💻 Cyber',
    quid_pro_quo: '⚖️ Quid Pro Quo',
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function MyCasesPage() {
    const { user } = useAuth();
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [cases, setCases] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch complaints from data service
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getComplaints({ complainantId: user?.id }).then((data) => {
            if (!cancelled) {
                setCases(data);
                setLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, [user?.id]);

    // Client-side filtering
    const myCases = cases.filter((c) => {
        if (filter !== 'all' && c.status !== filter) return false;
        if (search && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const counts = {
        all: cases.length,
        pending: cases.filter((c) => c.status === 'pending').length,
        investigating: cases.filter((c) => c.status === 'investigating').length,
        resolved: cases.filter((c) => c.status === 'resolved').length,
    };

    return (
        <div className="page-enter max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold gradient-text">📋 My Cases</h1>
                    <p className="text-sm text-slate-400 mt-1">Track the status of your filed complaints</p>
                </div>
                <Link href="/employee/complaints/new" className="btn-primary text-sm flex items-center gap-2">
                    + New Complaint
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-5 flex-wrap">
                {(['all', 'pending', 'investigating', 'resolved'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{
                            background: filter === f ? '#e855a018' : 'rgba(255,255,255,0.04)',
                            color: filter === f ? '#e855a0' : '#8b82a8',
                            border: `1px solid ${filter === f ? '#e855a030' : 'rgba(255,255,255,0.08)'}`,
                        }}
                    >
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    className="w-full bg-[#0d0a1a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#e855a0] outline-none transition-all"
                    placeholder="Search cases..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Loading */}
            {loading ? (
                <div className="glass-card text-center py-12">
                    <p className="text-2xl mb-3 animate-pulse">⏳</p>
                    <p className="text-slate-400">Loading your cases...</p>
                </div>
            ) : myCases.length === 0 ? (
                <div className="glass-card text-center py-12">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-slate-400">No cases found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {myCases.map((c) => {
                        const status = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
                        return (
                            <Link
                                key={c.id}
                                href={`/employee/complaints/${c.id}`}
                                className="glass-card flex items-start gap-4 group hover:scale-[1.01] transition-all duration-200"
                            >
                                {/* Status Dot */}
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: status.bg }}>
                                    <span style={{ color: status.color }}>{status.icon}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-slate-500">{c.case_id}</span>
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{ background: status.bg, color: status.color }}
                                        >
                                            {status.label}
                                        </span>
                                        <span className="text-xs text-slate-500">{TYPE_LABELS[c.type]}</span>
                                        {c.is_anonymous && <span className="text-xs text-slate-500">🔒 Anonymous</span>}
                                    </div>
                                    <p className="text-sm text-slate-300 line-clamp-2">{c.description}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                        <span>📅 {c.date_of_incident}</span>
                                        <span>📍 {c.location}</span>
                                        {c.ai_analysis && (
                                            <span style={{ color: c.ai_analysis.risk_level === 'critical' ? '#ef4444' : c.ai_analysis.risk_level === 'high' ? '#f5a623' : '#a855f7' }}>
                                                Risk: {c.ai_analysis.risk_level}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Arrow */}
                                <span className="text-slate-500 group-hover:text-[#e855a0] transition-colors text-lg">→</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
