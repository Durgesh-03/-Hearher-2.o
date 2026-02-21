'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getComplaints } from '@/lib/data-service';
import Link from 'next/link';
import { Search, Clock, AlertTriangle, CheckCircle, Filter, ArrowUpDown } from 'lucide-react';
import type { Complaint } from '@/lib/database.types';

// ─── Config ─────────────────────────────────────────────────────────────────

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

const SEVERITY_COLOR = (s: number) =>
    s >= 9 ? '#ef4444' : s >= 7 ? '#f5a623' : s >= 4 ? '#a855f7' : '#10b981';

// ─── Component ──────────────────────────────────────────────────────────────

export default function HRCasesPage() {
    const { user } = useAuth();
    const [cases, setCases] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'severity'>('date');

    useEffect(() => {
        getComplaints({ orgId: user?.org_id || 'demo-org-001' }).then((data) => {
            setCases(data);
            setLoading(false);
        });
    }, [user]);

    // Filter and sort
    const filtered = cases
        .filter((c) => {
            if (filter !== 'all' && c.status !== filter) return false;
            if (typeFilter !== 'all' && c.type !== typeFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return c.description.toLowerCase().includes(q) || c.case_id.toLowerCase().includes(q) || (c.location || '').toLowerCase().includes(q);
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'severity') return (b.severity || 0) - (a.severity || 0);
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

    const counts = {
        all: cases.length,
        pending: cases.filter((c) => c.status === 'pending').length,
        investigating: cases.filter((c) => c.status === 'investigating').length,
        resolved: cases.filter((c) => c.status === 'resolved').length,
    };

    return (
        <div className="page-enter">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold gradient-text">📋 All Cases</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage and track all complaints in your organization</p>
                </div>
                <Link href="/hr" className="btn-ghost text-sm">← Dashboard</Link>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
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
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f as keyof typeof counts] || 0})
                    </button>
                ))}
            </div>

            {/* Search + Type Filter + Sort */}
            <div className="flex gap-3 mb-6 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        className="w-full bg-[#0d0a1a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#e855a0] outline-none transition-all"
                        placeholder="Search cases, locations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-[#0d0a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white appearance-none cursor-pointer min-w-[140px]"
                >
                    <option value="all">All Types</option>
                    <option value="verbal">🗣️ Verbal</option>
                    <option value="physical">✋ Physical</option>
                    <option value="cyber">💻 Cyber</option>
                    <option value="quid_pro_quo">⚖️ Quid Pro Quo</option>
                </select>

                <button
                    onClick={() => setSortBy(sortBy === 'date' ? 'severity' : 'date')}
                    className="btn-ghost text-sm flex items-center gap-1"
                >
                    <ArrowUpDown size={14} /> {sortBy === 'date' ? 'By Date' : 'By Severity'}
                </button>
            </div>

            {/* Cases Table */}
            {loading ? (
                <div className="glass-card text-center py-12">
                    <p className="text-2xl mb-3 animate-pulse">⏳</p>
                    <p className="text-slate-400">Loading cases...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card text-center py-12">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-slate-400">No cases found</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((c) => {
                        const status = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
                        return (
                            <Link
                                key={c.id}
                                href={`/hr/cases/${c.id}`}
                                className="glass-card flex items-center gap-4 group hover:scale-[1.005] transition-all"
                            >
                                {/* Severity Dot */}
                                <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ background: SEVERITY_COLOR(c.severity) }} />

                                {/* Case ID */}
                                <div className="w-24 flex-shrink-0">
                                    <span className="text-xs font-mono text-slate-400">{c.case_id}</span>
                                </div>

                                {/* Description */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-300 line-clamp-1">{c.description}</p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                        <span>{TYPE_LABELS[c.type]}</span>
                                        <span>📅 {c.date_of_incident}</span>
                                        <span>📍 {c.location}</span>
                                        {c.is_anonymous && <span className="text-[#e855a0]">🔒 Anonymous</span>}
                                    </div>
                                </div>

                                {/* Severity */}
                                <div className="text-center flex-shrink-0 w-12">
                                    <span className="text-sm font-bold" style={{ color: SEVERITY_COLOR(c.severity) }}>{c.severity}</span>
                                    <p className="text-[10px] text-slate-500">/10</p>
                                </div>

                                {/* Status */}
                                <span
                                    className="text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 flex items-center gap-1"
                                    style={{ background: status.bg, color: status.color }}
                                >
                                    {status.icon} {status.label}
                                </span>

                                {/* Arrow */}
                                <span className="text-slate-500 group-hover:text-[#e855a0] transition-colors">→</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
