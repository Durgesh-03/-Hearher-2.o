'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getPanicAlerts, resolvePanicAlert } from '@/lib/data-service';
import type { PanicAlert } from '@/lib/database.types';
import { AlertTriangle, MapPin, CheckCircle, Radio, Clock, Shield, Siren, Phone } from 'lucide-react';

// ─── Config ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string; pulse: boolean }> = {
    active: { color: '#ef4444', bg: '#ef444420', label: '🔴 ACTIVE', pulse: true },
    acknowledged: { color: '#f5a623', bg: '#f5a62320', label: '🟡 Responding', pulse: true },
    resolved: { color: '#10b981', bg: '#10b98120', label: '🟢 Resolved', pulse: false },
};

const SOURCE_LABELS: Record<string, string> = {
    panic: '🚨 Panic Button',
    guardian: '🛡️ Guardian Mode',
    shake: '📱 Shake Detection',
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function SecurityDashboard() {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState<PanicAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAlert, setSelectedAlert] = useState<PanicAlert | null>(null);

    useEffect(() => {
        getPanicAlerts(user?.org_id).then((data) => {
            setAlerts(data);
            setLoading(false);
        });
    }, [user]);

    const activeAlerts = alerts.filter((a) => a.status === 'active' || a.status === 'acknowledged');
    const resolvedAlerts = alerts.filter((a) => a.status === 'resolved');

    const handleResolve = async (alertId: string) => {
        await resolvePanicAlert(alertId);
        setAlerts((prev) =>
            prev.map((a) => a.id === alertId ? { ...a, status: 'resolved', resolved_at: new Date().toISOString() } : a)
        );
        setSelectedAlert(null);
    };

    return (
        <div className="page-enter">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#ef444420' }}>
                        <Siren size={20} className="text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">🚨 Security Command Center</h1>
                        <p className="text-sm text-slate-400">Live panic alert monitoring and incident response</p>
                    </div>
                </div>
                {activeAlerts.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl animate-pulse" style={{ background: '#ef444420', border: '1px solid #ef444440' }}>
                        <Radio size={16} className="text-red-400" />
                        <span className="text-sm font-bold text-red-400">{activeAlerts.length} ACTIVE ALERT{activeAlerts.length > 1 ? 'S' : ''}</span>
                    </div>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Active Alerts', value: activeAlerts.length, color: '#ef4444', icon: <AlertTriangle size={18} /> },
                    { label: 'Total Today', value: alerts.length, color: '#f5a623', icon: <Clock size={18} /> },
                    { label: 'Resolved', value: resolvedAlerts.length, color: '#10b981', icon: <CheckCircle size={18} /> },
                    { label: 'Avg Response', value: '2.3 min', color: '#3b82f6', icon: <Shield size={18} /> },
                ].map((s) => (
                    <div key={s.label} className="glass-card flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                            <span style={{ color: s.color }}>{s.icon}</span>
                        </div>
                        <div>
                            <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                            <p className="text-[10px] text-slate-500">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="glass-card text-center py-12">
                    <p className="text-2xl mb-3 animate-pulse">⏳</p>
                    <p className="text-slate-400">Loading alerts...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Map Area */}
                    <div className="lg:col-span-2 glass-card min-h-[400px]">
                        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                            <MapPin size={16} className="text-red-400" /> Live Incident Map
                        </h3>

                        {/* Map with grid visualization */}
                        <div className="relative w-full h-[350px] rounded-xl overflow-hidden" style={{ background: '#0d0a1a', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {/* Grid background */}
                            <div className="absolute inset-0" style={{
                                backgroundImage: `
                                    linear-gradient(rgba(168,85,247,0.05) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(168,85,247,0.05) 1px, transparent 1px)`,
                                backgroundSize: '40px 40px',
                            }} />

                            {/* Center label */}
                            <div className="absolute inset-0 flex items-end justify-center pb-4">
                                <div className="text-center">
                                    <p className="text-xs text-slate-500">🏢 ACME Corp Campus • Bangalore</p>
                                </div>
                            </div>

                            {/* Alert markers */}
                            {alerts.map((a, i) => {
                                const isActive = a.status === 'active';
                                // Spread markers across the map
                                const positions = [
                                    { x: 35, y: 30 }, { x: 65, y: 55 }, { x: 25, y: 65 },
                                    { x: 70, y: 25 }, { x: 50, y: 75 }, { x: 80, y: 45 },
                                ];
                                const pos = positions[i % positions.length];

                                return (
                                    <button
                                        key={a.id}
                                        onClick={() => setSelectedAlert(a)}
                                        className="absolute group transition-transform hover:scale-125"
                                        style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                                    >
                                        {/* Pulse ring */}
                                        {isActive && (
                                            <div className="absolute inset-0 w-8 h-8 rounded-full animate-ping" style={{ background: '#ef444430', left: '-8px', top: '-8px' }} />
                                        )}
                                        <div
                                            className="w-4 h-4 rounded-full relative z-10 border-2"
                                            style={{
                                                background: isActive ? '#ef4444' : '#10b981',
                                                borderColor: isActive ? '#ef4444' : '#10b981',
                                                boxShadow: isActive ? '0 0 20px rgba(239,68,68,0.5)' : 'none',
                                            }}
                                        />
                                        {/* Tooltip */}
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1533] px-2 py-1 rounded-lg text-[10px] text-white whitespace-nowrap border border-white/10 z-20">
                                            {SOURCE_LABELS[a.source] || a.source}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Alert Feed */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                            <Radio size={14} className="text-red-400" /> Alert Feed
                        </h3>

                        {alerts.length === 0 ? (
                            <div className="glass-card text-center py-8">
                                <p className="text-3xl mb-2">✅</p>
                                <p className="text-sm text-slate-400">All clear — no alerts</p>
                            </div>
                        ) : (
                            alerts.map((a) => {
                                const s = STATUS_STYLES[a.status] || STATUS_STYLES.active;
                                return (
                                    <button
                                        key={a.id}
                                        onClick={() => setSelectedAlert(a)}
                                        className="glass-card w-full text-left transition-all hover:scale-[1.01]"
                                        style={{
                                            borderColor: selectedAlert?.id === a.id ? s.color + '40' : 'transparent',
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: s.bg }}>
                                                <AlertTriangle size={14} style={{ color: s.color }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.label}</span>
                                                    <span className="text-[10px] text-slate-500">{SOURCE_LABELS[a.source]}</span>
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    📍 {a.latitude.toFixed(4)}, {a.longitude.toFixed(4)}
                                                </p>
                                                {a.message && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{a.message}</p>}
                                                <p className="text-[10px] text-slate-600 mt-1">{new Date(a.created_at).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Alert Detail Modal */}
            {selectedAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setSelectedAlert(null)}>
                    <div className="glass-card max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()} style={{ background: '#1a1533', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            🚨 Alert Details
                        </h3>

                        <div className="space-y-3 text-sm mb-6">
                            <div className="flex justify-between"><span className="text-slate-500">Source</span><span>{SOURCE_LABELS[selectedAlert.source]}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="font-bold" style={{ color: STATUS_STYLES[selectedAlert.status]?.color }}>{STATUS_STYLES[selectedAlert.status]?.label}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Location</span><span>📍 {selectedAlert.latitude.toFixed(4)}, {selectedAlert.longitude.toFixed(4)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Time</span><span>{new Date(selectedAlert.created_at).toLocaleString()}</span></div>
                            {selectedAlert.message && (
                                <div><span className="text-slate-500 block mb-1">Message</span><p className="text-slate-300">{selectedAlert.message}</p></div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {selectedAlert.status === 'active' && (
                                <>
                                    <button
                                        onClick={() => handleResolve(selectedAlert.id)}
                                        className="flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
                                        style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98130' }}
                                    >
                                        <CheckCircle size={16} /> Resolve
                                    </button>
                                    <button className="flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2" style={{ background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f630' }}>
                                        <Phone size={16} /> Call
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setSelectedAlert(null)}
                                className="flex-1 py-2.5 rounded-xl font-medium text-sm"
                                style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
