'use client';

import { useState, useEffect, use } from 'react';
import { getComplaintById, getComplaintTimeline } from '@/lib/data-service';
import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import type { Complaint, ComplaintTimeline } from '@/lib/database.types';

// ─── Status Colors ──────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
    pending: { color: '#f5a623', bg: '#f5a62315' },
    investigating: { color: '#a855f7', bg: '#a855f715' },
    resolved: { color: '#10b981', bg: '#10b98115' },
    closed: { color: '#64748b', bg: '#64748b15' },
};

const EVENT_ICONS: Record<string, string> = {
    created: '📝',
    ai_analyzed: '🤖',
    hr_notified: '📢',
    assigned: '👩‍⚖️',
    accused_notified: '📩',
    investigating: '🔍',
    resolved: '✅',
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [timeline, setTimeline] = useState<ComplaintTimeline[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        Promise.all([
            getComplaintById(id),
            getComplaintTimeline(id),
        ]).then(([c, t]) => {
            if (!cancelled) {
                setComplaint(c);
                setTimeline(t);
                setLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, [id]);

    if (loading) {
        return (
            <div className="page-enter text-center py-20">
                <p className="text-2xl mb-3 animate-pulse">⏳</p>
                <p className="text-slate-400">Loading case details...</p>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="page-enter text-center py-20">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-slate-400">Case not found</p>
                <Link href="/employee/complaints" className="btn-ghost text-sm mt-4 inline-block">← Back to Cases</Link>
            </div>
        );
    }

    const status = STATUS_STYLES[complaint.status] || STATUS_STYLES.pending;

    return (
        <div className="page-enter max-w-3xl">
            {/* Header */}
            <Link href="/employee/complaints" className="text-slate-400 text-sm flex items-center gap-1 mb-4 hover:text-[#e855a0] transition-colors">
                <ArrowLeft size={14} /> Back to My Cases
            </Link>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold">Case {complaint.case_id}</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Filed on {new Date(complaint.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-sm px-3 py-1.5 rounded-full font-medium" style={{ background: status.bg, color: status.color }}>
                    {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                </span>
            </div>

            {/* Details Card */}
            <div className="glass-card mb-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Incident Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div><span className="text-slate-500">Type:</span> <span className="ml-2 capitalize">{complaint.type.replace('_', ' ')}</span></div>
                    <div><span className="text-slate-500">Severity:</span> <span className="ml-2">{complaint.severity}/10</span></div>
                    <div><span className="text-slate-500">Date:</span> <span className="ml-2">{complaint.date_of_incident}</span></div>
                    <div><span className="text-slate-500">Time:</span> <span className="ml-2">{complaint.time_of_incident}</span></div>
                    <div className="col-span-2"><span className="text-slate-500">Location:</span> <span className="ml-2">{complaint.location}</span></div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed border-t border-white/10 pt-3">{complaint.description}</p>
            </div>

            {/* AI Analysis */}
            {complaint.ai_analysis && (
                <div className="glass-card mb-6" style={{ borderColor: '#a855f720' }}>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <span>🤖</span> AI Analysis
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-slate-500">Sentiment:</span>
                            <span className="ml-2 capitalize">{complaint.ai_analysis.sentiment}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">Risk:</span>
                            <span className="ml-2 capitalize font-medium" style={{
                                color: complaint.ai_analysis.risk_level === 'critical' ? '#ef4444' :
                                    complaint.ai_analysis.risk_level === 'high' ? '#f5a623' : '#a855f7'
                            }}>
                                {complaint.ai_analysis.risk_level}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap mt-3">
                        {complaint.ai_analysis.keywords.map((kw) => (
                            <span key={kw} className="text-xs px-2 py-1 rounded-lg" style={{ background: '#a855f715', color: '#c084fc' }}>
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Timeline */}
            {timeline.length > 0 && (
                <div className="glass-card">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">📜 Case Timeline</h3>
                    <div className="relative pl-6">
                        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-white/10" />
                        {timeline.map((t) => (
                            <div key={t.id} className="relative pb-5 last:pb-0">
                                <div className="absolute -left-4 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ background: '#1a1533', border: '2px solid #e855a050' }}>
                                    <span className="text-[10px]">{EVENT_ICONS[t.event] || '•'}</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium">{t.details}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {new Date(t.occurred_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat CTA */}
            <div className="mt-6 text-center">
                <button className="btn-ghost text-sm flex items-center gap-2 mx-auto">
                    <MessageCircle size={16} /> Message ICC Member (Anonymous)
                </button>
            </div>
        </div>
    );
}
