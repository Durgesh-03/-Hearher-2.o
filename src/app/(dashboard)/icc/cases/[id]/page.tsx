'use client';

import { useState, useEffect, use } from 'react';
import { getComplaintById, getComplaintTimeline } from '@/lib/data-service';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { ArrowLeft, User, MessageCircle, FileText, Scale, Brain, Shield, Send } from 'lucide-react';
import type { Complaint, ComplaintTimeline } from '@/lib/database.types';

// ─── Types & Config ─────────────────────────────────────────────────────────

const TABS = [
    { id: 'complainant', label: 'Complainant', icon: <User size={14} /> },
    { id: 'accused', label: 'Accused Response', icon: <Shield size={14} /> },
    { id: 'evidence', label: 'Evidence', icon: <FileText size={14} /> },
    { id: 'chat', label: 'Anonymous Chat', icon: <MessageCircle size={14} /> },
    { id: 'decision', label: 'Decision', icon: <Scale size={14} /> },
    { id: 'ai', label: 'AI Credibility', icon: <Brain size={14} /> },
];

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
    pending: { color: '#f5a623', bg: '#f5a62315', label: 'Pending' },
    investigating: { color: '#a855f7', bg: '#a855f715', label: 'Investigating' },
    resolved: { color: '#10b981', bg: '#10b98115', label: 'Resolved' },
    closed: { color: '#64748b', bg: '#64748b15', label: 'Closed' },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function ICCCaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [timeline, setTimeline] = useState<ComplaintTimeline[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('complainant');
    const [chatMsg, setChatMsg] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { from: 'complainant', msg: 'I have additional information about the incident.', time: '2:30 PM' },
        { from: 'icc', msg: 'Thank you. Please share the details — your identity remains protected.', time: '2:35 PM' },
    ]);
    const [verdict, setVerdict] = useState('');
    const [recommendation, setRecommendation] = useState('');

    useEffect(() => {
        let cancelled = false;
        Promise.all([getComplaintById(id), getComplaintTimeline(id)]).then(([c, t]) => {
            if (!cancelled) { setComplaint(c); setTimeline(t); setLoading(false); }
        });
        return () => { cancelled = true; };
    }, [id]);

    const sendChat = () => {
        if (!chatMsg.trim()) return;
        setChatHistory((prev) => [...prev, { from: 'icc', msg: chatMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setChatMsg('');
    };

    if (loading) return <div className="page-enter text-center py-20"><p className="text-2xl mb-3 animate-pulse">⏳</p><p className="text-slate-400">Loading investigation...</p></div>;
    if (!complaint) return <div className="page-enter text-center py-20"><p className="text-4xl mb-3">🔍</p><p className="text-slate-400">Case not found</p><Link href="/icc" className="btn-ghost text-sm mt-4 inline-block">← Back</Link></div>;

    const status = STATUS_STYLES[complaint.status] || STATUS_STYLES.pending;

    return (
        <div className="page-enter max-w-5xl">
            {/* Header */}
            <Link href="/hr/cases" className="text-slate-400 text-sm flex items-center gap-1 mb-4 hover:text-[#e855a0] transition-colors">
                <ArrowLeft size={14} /> Back to Cases
            </Link>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-3">
                        🔍 Investigation — Case {complaint.case_id}
                        <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: status.bg, color: status.color }}>{status.label}</span>
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Both sides comparison, evidence, and AI analysis</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className="px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all"
                        style={{
                            background: tab === t.id ? '#a855f718' : 'rgba(255,255,255,0.04)',
                            color: tab === t.id ? '#a855f7' : '#8b82a8',
                            border: `1px solid ${tab === t.id ? '#a855f730' : 'rgba(255,255,255,0.08)'}`,
                        }}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* ── Complainant Tab ────────────────────────────────────────── */}
            {tab === 'complainant' && (
                <div className="space-y-6">
                    <div className="glass-card">
                        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><User size={16} /> Complainant Statement</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <div><span className="text-slate-500">Type:</span> <span className="capitalize ml-2">{complaint.type.replace('_', ' ')}</span></div>
                            <div><span className="text-slate-500">Severity:</span> <span className="ml-2">{complaint.severity}/10</span></div>
                            <div><span className="text-slate-500">Date:</span> <span className="ml-2">{complaint.date_of_incident}</span></div>
                            <div><span className="text-slate-500">Location:</span> <span className="ml-2">{complaint.location}</span></div>
                            <div className="col-span-2"><span className="text-slate-500">Anonymous:</span> <span className="ml-2">{complaint.is_anonymous ? '🔒 Yes' : 'No'}</span></div>
                        </div>
                        <div className="border-t border-white/10 pt-3">
                            <p className="text-sm text-slate-300 leading-relaxed">{complaint.description}</p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="glass-card">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4">📜 Timeline</h3>
                        <div className="relative pl-6">
                            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-white/10" />
                            {timeline.map((t) => (
                                <div key={t.id} className="relative pb-4 last:pb-0">
                                    <div className="absolute -left-4 top-0.5 w-3 h-3 rounded-full" style={{ background: '#a855f7' }} />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium">{t.details}</p>
                                        <p className="text-xs text-slate-500">{new Date(t.occurred_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Accused Response Tab ──────────────────────────────────── */}
            {tab === 'accused' && (
                <div className="space-y-6">
                    <div className="glass-card" style={{ borderColor: '#f5a62320' }}>
                        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><Shield size={16} className="text-[#f5a623]" /> Accused Response</h3>
                        <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <p className="text-sm text-slate-300 italic leading-relaxed">
                                &ldquo;I deny all allegations. The interactions described were professional in nature. I believe there has been a misunderstanding
                                regarding the context of our conversations. I have always maintained professional boundaries with all colleagues.&rdquo;
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><span className="text-slate-500">Response Date:</span> <span className="ml-2">2026-02-15</span></div>
                            <div><span className="text-slate-500">Witnesses Cited:</span> <span className="ml-2">2 colleagues</span></div>
                            <div><span className="text-slate-500">Counter Evidence:</span> <span className="ml-2">1 email thread</span></div>
                            <div><span className="text-slate-500">Deadline:</span> <span className="ml-2 text-[#f5a623]">2026-02-20</span></div>
                        </div>
                    </div>

                    {/* Comparison */}
                    <div className="glass-card">
                        <h3 className="text-sm font-semibold text-slate-300 mb-3">⚖️ Side-by-Side Comparison</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl" style={{ background: '#e855a008', border: '1px solid #e855a015' }}>
                                <p className="text-xs font-medium text-[#e855a0] mb-2">Complainant Says</p>
                                <p className="text-xs text-slate-400 leading-relaxed">{complaint.description.slice(0, 150)}...</p>
                            </div>
                            <div className="p-3 rounded-xl" style={{ background: '#f5a62308', border: '1px solid #f5a62315' }}>
                                <p className="text-xs font-medium text-[#f5a623] mb-2">Accused Says</p>
                                <p className="text-xs text-slate-400 leading-relaxed">Denies all allegations. Claims professional interactions and a misunderstanding of context...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Evidence Tab ──────────────────────────────────────────── */}
            {tab === 'evidence' && (
                <div className="space-y-4">
                    <div className="glass-card">
                        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><FileText size={16} /> Submitted Evidence</h3>
                        {[
                            { name: 'chat_screenshot_01.png', type: 'Image', from: 'Complainant', date: '2026-02-10', icon: '🖼️' },
                            { name: 'email_thread.pdf', type: 'Document', from: 'Complainant', date: '2026-02-11', icon: '📄' },
                            { name: 'witness_statement_1.pdf', type: 'Document', from: 'ICC', date: '2026-02-14', icon: '📄' },
                            { name: 'professional_emails.pdf', type: 'Document', from: 'Accused', date: '2026-02-15', icon: '📧' },
                        ].map((e, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-all">
                                <span className="text-xl">{e.icon}</span>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{e.name}</p>
                                    <div className="flex gap-3 text-xs text-slate-500">
                                        <span>{e.type}</span>
                                        <span>From: {e.from}</span>
                                        <span>{e.date}</span>
                                    </div>
                                </div>
                                <button className="text-xs text-[#a855f7] hover:underline">View</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Anonymous Chat Tab ────────────────────────────────────── */}
            {tab === 'chat' && (
                <div className="glass-card">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><MessageCircle size={16} /> Anonymous Chat with Complainant</h3>

                    <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto p-2">
                        {chatHistory.map((m, i) => (
                            <div key={i} className={`flex ${m.from === 'icc' ? 'justify-end' : 'justify-start'}`}>
                                <div className="max-w-[70%] p-3 rounded-2xl text-sm" style={{
                                    background: m.from === 'icc' ? '#a855f720' : 'rgba(255,255,255,0.05)',
                                    borderBottomRightRadius: m.from === 'icc' ? 4 : 16,
                                    borderBottomLeftRadius: m.from === 'icc' ? 16 : 4,
                                }}>
                                    <p className="text-xs text-slate-500 mb-1">{m.from === 'icc' ? '👩‍⚖️ ICC' : '🔒 Complainant'}</p>
                                    <p className="text-slate-300">{m.msg}</p>
                                    <p className="text-[10px] text-slate-600 text-right mt-1">{m.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input
                            className="flex-1 bg-[#0d0a1a] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#a855f7] outline-none"
                            placeholder="Type a message..."
                            value={chatMsg}
                            onChange={(e) => setChatMsg(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                        />
                        <button onClick={sendChat} className="btn-primary px-4" style={{ background: '#a855f7' }}>
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Decision Tab ──────────────────────────────────────────── */}
            {tab === 'decision' && (
                <div className="space-y-6">
                    <div className="glass-card">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Scale size={16} /> ICC Decision & Verdict</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300 block mb-1.5">Verdict</label>
                                <select
                                    className="w-full bg-[#0d0a1a] border border-white/15 rounded-xl px-4 py-3 text-sm text-white appearance-none cursor-pointer"
                                    value={verdict}
                                    onChange={(e) => setVerdict(e.target.value)}
                                >
                                    <option value="">Select verdict...</option>
                                    <option value="substantiated">Complaint Substantiated</option>
                                    <option value="not_substantiated">Complaint Not Substantiated</option>
                                    <option value="inconclusive">Inconclusive — More Investigation Needed</option>
                                    <option value="malicious">Complaint Found Malicious</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-300 block mb-1.5">Recommendation</label>
                                <textarea
                                    className="w-full bg-[#0d0a1a] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#a855f7] outline-none min-h-[120px] resize-none"
                                    placeholder="Write your recommendation for action to be taken..."
                                    value={recommendation}
                                    onChange={(e) => setRecommendation(e.target.value)}
                                />
                            </div>

                            <button
                                disabled={!verdict || !recommendation}
                                className="w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-40"
                                style={{ background: 'linear-gradient(135deg, #a855f7, #e855a0)', color: '#fff' }}
                            >
                                Submit Decision
                            </button>
                        </div>
                    </div>

                    {/* POSH Act Guidelines */}
                    <div className="glass-card" style={{ borderColor: '#f5a62320' }}>
                        <h3 className="text-sm font-semibold text-slate-300 mb-2">⚖️ POSH Act Guidelines</h3>
                        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                            <li>ICC must complete inquiry within 90 days</li>
                            <li>Both parties must be heard before verdict</li>
                            <li>Recommendations must be sent to employer within 10 days</li>
                            <li>Employer must act on recommendations within 60 days</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* ── AI Credibility Tab ────────────────────────────────────── */}
            {tab === 'ai' && (
                <div className="space-y-6">
                    <div className="glass-card" style={{ borderColor: '#a855f720' }}>
                        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Brain size={16} className="text-[#a855f7]" /> AI Credibility Analysis</h3>

                        {complaint.ai_analysis ? (
                            <>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    {[
                                        { label: 'Sentiment', value: complaint.ai_analysis.sentiment, color: '#3b82f6' },
                                        { label: 'Risk Level', value: complaint.ai_analysis.risk_level, color: complaint.ai_analysis.risk_level === 'critical' ? '#ef4444' : complaint.ai_analysis.risk_level === 'high' ? '#f5a623' : '#a855f7' },
                                        { label: 'AI Severity', value: `${complaint.ai_analysis.severity_score}/10`, color: '#e855a0' },
                                        { label: 'Category', value: complaint.ai_analysis.category.replace(/_/g, ' '), color: '#10b981' },
                                    ].map((m) => (
                                        <div key={m.label} className="p-3 rounded-xl" style={{ background: `${m.color}08`, border: `1px solid ${m.color}15` }}>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{m.label}</p>
                                            <p className="text-sm font-bold capitalize" style={{ color: m.color }}>{m.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Keywords */}
                                <div className="mb-4">
                                    <p className="text-xs text-slate-500 mb-2">Detected Keywords</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {complaint.ai_analysis.keywords.map((kw) => (
                                            <span key={kw} className="text-xs px-2 py-1 rounded-lg" style={{ background: '#a855f715', color: '#c084fc' }}>{kw}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Credibility Scores (mock) */}
                                <div className="border-t border-white/10 pt-4">
                                    <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Credibility Indicators</p>
                                    {[
                                        { label: 'Internal Consistency', score: 87, color: '#10b981' },
                                        { label: 'Detail Specificity', score: 92, color: '#3b82f6' },
                                        { label: 'Emotional Coherence', score: 78, color: '#a855f7' },
                                        { label: 'Timeline Plausibility', score: 95, color: '#e855a0' },
                                    ].map((c) => (
                                        <div key={c.label} className="mb-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-400">{c.label}</span>
                                                <span style={{ color: c.color }}>{c.score}%</span>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full bg-white/10">
                                                <div className="h-full rounded-full" style={{ width: `${c.score}%`, background: c.color }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-slate-500">AI analysis not available for this case.</p>
                        )}
                    </div>

                    <div className="glass-card text-center !p-3">
                        <p className="text-xs text-slate-500">⚠️ AI analysis is advisory only. It should not be the sole basis for any decision.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
