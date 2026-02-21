'use client';

import { useState, useEffect, use } from 'react';
import { getComplaintById, getComplaintTimeline, updateComplaintStatus, assignICCToComplaint, getICCMembers } from '@/lib/data-service';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { ArrowLeft, UserPlus, CheckCircle, AlertTriangle, Clock, Shield } from 'lucide-react';
import type { Complaint, ComplaintTimeline, ICCMember } from '@/lib/database.types';

// ─── Status Config ──────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
    pending: { color: '#f5a623', bg: '#f5a62315', label: 'Pending' },
    investigating: { color: '#a855f7', bg: '#a855f715', label: 'Investigating' },
    resolved: { color: '#10b981', bg: '#10b98115', label: 'Resolved' },
    closed: { color: '#64748b', bg: '#64748b15', label: 'Closed' },
};

const EVENT_ICONS: Record<string, string> = {
    created: '📝', ai_analyzed: '🤖', hr_notified: '📢', assigned: '👩‍⚖️',
    accused_notified: '📩', investigating: '🔍', resolved: '✅', closed: '🔒',
    pending: '⏳',
};

const SEVERITY_COLOR = (s: number) =>
    s >= 9 ? '#ef4444' : s >= 7 ? '#f5a623' : s >= 4 ? '#a855f7' : '#10b981';

// ─── Component ──────────────────────────────────────────────────────────────

export default function HRCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [timeline, setTimeline] = useState<ComplaintTimeline[]>([]);
    const [iccMembers, setIccMembers] = useState<ICCMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAssign, setShowAssign] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            getComplaintById(id),
            getComplaintTimeline(id),
            getICCMembers(user?.org_id || 'demo-org-001'),
        ]).then(([c, t, m]) => {
            if (!cancelled) {
                setComplaint(c);
                setTimeline(t);
                setIccMembers(m);
                setLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, [id, user]);

    const handleStatusChange = async (newStatus: string) => {
        if (!complaint) return;
        setActionLoading(true);
        await updateComplaintStatus(complaint.id, newStatus, user?.id);
        setComplaint({ ...complaint, status: newStatus as Complaint['status'], updated_at: new Date().toISOString() });
        setTimeline((prev) => [...prev, {
            id: `t-${Date.now()}`,
            complaint_id: complaint.id,
            event: newStatus,
            details: `Status changed to ${newStatus} by HR`,
            actor_id: user?.id || null,
            occurred_at: new Date().toISOString(),
        }]);
        setActionLoading(false);
    };

    const handleAssignICC = async (iccUserId: string) => {
        if (!complaint) return;
        setActionLoading(true);
        await assignICCToComplaint(complaint.id, iccUserId, user?.id);
        setComplaint({ ...complaint, assigned_icc_id: iccUserId, status: 'investigating', updated_at: new Date().toISOString() });
        setTimeline((prev) => [...prev, {
            id: `t-${Date.now()}`,
            complaint_id: complaint.id,
            event: 'assigned',
            details: `ICC member assigned to case by HR`,
            actor_id: user?.id || null,
            occurred_at: new Date().toISOString(),
        }]);
        setShowAssign(false);
        setActionLoading(false);
    };

    if (loading) {
        return (
            <div className="page-enter text-center py-20">
                <p className="text-2xl mb-3 animate-pulse">⏳</p>
                <p className="text-slate-400">Loading case...</p>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="page-enter text-center py-20">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-slate-400">Case not found</p>
                <Link href="/hr/cases" className="btn-ghost text-sm mt-4 inline-block">← Back to Cases</Link>
            </div>
        );
    }

    const status = STATUS_STYLES[complaint.status] || STATUS_STYLES.pending;

    return (
        <div className="page-enter max-w-4xl">
            {/* Back */}
            <Link href="/hr/cases" className="text-slate-400 text-sm flex items-center gap-1 mb-4 hover:text-[#e855a0] transition-colors">
                <ArrowLeft size={14} /> Back to Cases
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-3">
                        Case {complaint.case_id}
                        <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: status.bg, color: status.color }}>
                            {status.label}
                        </span>
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Filed {new Date(complaint.created_at).toLocaleDateString()} • Severity{' '}
                        <span className="font-bold" style={{ color: SEVERITY_COLOR(complaint.severity) }}>{complaint.severity}/10</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Details + AI Analysis */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Incident Card */}
                    <div className="glass-card">
                        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">📋 Incident Details</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <div><span className="text-slate-500">Type:</span> <span className="ml-2 capitalize">{complaint.type.replace('_', ' ')}</span></div>
                            <div><span className="text-slate-500">Severity:</span> <span className="ml-2 font-bold" style={{ color: SEVERITY_COLOR(complaint.severity) }}>{complaint.severity}/10</span></div>
                            <div><span className="text-slate-500">Date:</span> <span className="ml-2">{complaint.date_of_incident}</span></div>
                            <div><span className="text-slate-500">Time:</span> <span className="ml-2">{complaint.time_of_incident}</span></div>
                            <div className="col-span-2"><span className="text-slate-500">Location:</span> <span className="ml-2">{complaint.location}</span></div>
                            <div className="col-span-2"><span className="text-slate-500">Anonymous:</span> <span className="ml-2">{complaint.is_anonymous ? '🔒 Yes' : 'No'}</span></div>
                        </div>
                        <div className="border-t border-white/10 pt-3">
                            <p className="text-sm text-slate-300 leading-relaxed">{complaint.description}</p>
                        </div>
                    </div>

                    {/* AI Analysis */}
                    {complaint.ai_analysis && (
                        <div className="glass-card" style={{ borderColor: '#a855f720' }}>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">🤖 AI Analysis</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-slate-500">Sentiment:</span> <span className="ml-2 capitalize">{complaint.ai_analysis.sentiment}</span></div>
                                <div><span className="text-slate-500">AI Severity:</span> <span className="ml-2">{complaint.ai_analysis.severity_score}/10</span></div>
                                <div><span className="text-slate-500">Category:</span> <span className="ml-2 capitalize">{complaint.ai_analysis.category.replace(/_/g, ' ')}</span></div>
                                <div>
                                    <span className="text-slate-500">Risk:</span>
                                    <span className="ml-2 capitalize font-bold" style={{
                                        color: complaint.ai_analysis.risk_level === 'critical' ? '#ef4444' :
                                            complaint.ai_analysis.risk_level === 'high' ? '#f5a623' : '#a855f7'
                                    }}>
                                        {complaint.ai_analysis.risk_level}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap mt-3">
                                {complaint.ai_analysis.keywords.map((kw) => (
                                    <span key={kw} className="text-xs px-2 py-1 rounded-lg" style={{ background: '#a855f715', color: '#c084fc' }}>{kw}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="glass-card">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4">📜 Case Timeline</h3>
                        {timeline.length === 0 ? (
                            <p className="text-sm text-slate-500">No timeline events yet.</p>
                        ) : (
                            <div className="relative pl-6">
                                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-white/10" />
                                {timeline.map((t) => (
                                    <div key={t.id} className="relative pb-5 last:pb-0">
                                        <div className="absolute -left-4 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ background: '#1a1533', border: '2px solid #e855a050' }}>
                                            <span className="text-[10px]">{EVENT_ICONS[t.event] || '•'}</span>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium">{t.details}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{new Date(t.occurred_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Actions Sidebar */}
                <div className="space-y-4">
                    {/* Actions Card */}
                    <div className="glass-card">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                            <Shield size={16} className="text-[#a855f7]" /> Actions
                        </h3>

                        {/* Assign ICC */}
                        {!complaint.assigned_icc_id && (
                            <button
                                onClick={() => setShowAssign(!showAssign)}
                                disabled={actionLoading}
                                className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 mb-3 transition-all hover:scale-[1.02]"
                                style={{ background: '#a855f715', color: '#a855f7', border: '1px solid #a855f730' }}
                            >
                                <UserPlus size={16} /> Assign ICC Member
                            </button>
                        )}

                        {/* ICC Assignment Dropdown */}
                        {showAssign && (
                            <div className="space-y-2 mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <p className="text-xs text-slate-400 mb-2">Select ICC Member:</p>
                                {iccMembers.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => handleAssignICC(m.user_id)}
                                        disabled={actionLoading}
                                        className="w-full text-left p-2 rounded-lg text-sm hover:bg-white/5 transition-all flex items-center justify-between"
                                    >
                                        <span className="capitalize">{m.role} Member</span>
                                        <span className="text-xs text-slate-500">{m.user_id.slice(0, 8)}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {complaint.assigned_icc_id && (
                            <div className="p-3 rounded-xl mb-3" style={{ background: '#a855f710', border: '1px solid #a855f720' }}>
                                <p className="text-xs text-slate-400">Assigned ICC</p>
                                <p className="text-sm font-medium text-[#c084fc]">ICC #{complaint.assigned_icc_id.slice(0, 8)}</p>
                            </div>
                        )}

                        {/* Status Actions */}
                        <div className="space-y-2">
                            {complaint.status === 'pending' && (
                                <button
                                    onClick={() => handleStatusChange('investigating')}
                                    disabled={actionLoading}
                                    className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                    style={{ background: '#a855f715', color: '#a855f7', border: '1px solid #a855f730' }}
                                >
                                    <AlertTriangle size={16} /> Start Investigation
                                </button>
                            )}
                            {complaint.status === 'investigating' && (
                                <button
                                    onClick={() => handleStatusChange('resolved')}
                                    disabled={actionLoading}
                                    className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                    style={{ background: '#10b98115', color: '#10b981', border: '1px solid #10b98130' }}
                                >
                                    <CheckCircle size={16} /> Mark Resolved
                                </button>
                            )}
                            {(complaint.status === 'resolved' || complaint.status === 'investigating') && (
                                <button
                                    onClick={() => handleStatusChange('closed')}
                                    disabled={actionLoading}
                                    className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                    style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}
                                >
                                    Close Case
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="glass-card">
                        <h3 className="text-sm font-semibold text-slate-300 mb-3">ℹ️ Quick Info</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Created</span>
                                <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Updated</span>
                                <span>{new Date(complaint.updated_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Days Open</span>
                                <span>{Math.max(1, Math.floor((Date.now() - new Date(complaint.created_at).getTime()) / 86400000))}d</span>
                            </div>
                        </div>
                    </div>

                    {/* Link to ICC view */}
                    <Link
                        href={`/icc/cases/${complaint.id}`}
                        className="glass-card block text-center hover:scale-[1.02] transition-all"
                    >
                        <p className="text-sm text-[#a855f7] font-medium">🔍 View ICC Investigation</p>
                        <p className="text-xs text-slate-500 mt-1">See both sides + evidence + AI analysis</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
