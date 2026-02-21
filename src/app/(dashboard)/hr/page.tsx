'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getDashboardStats, type DashboardStats } from '@/lib/data-service';
import Link from 'next/link';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { FileText, Shield, AlertTriangle, Clock, Users, TrendingUp, CheckCircle, Activity } from 'lucide-react';

// ─── Colors ─────────────────────────────────────────────────────────────────

const COLORS = ['#e855a0', '#a855f7', '#10b981', '#f5a623', '#3b82f6', '#ef4444'];
const SEVERITY_COLORS = ['#10b981', '#f5a623', '#e855a0', '#ef4444'];

// ─── Component ──────────────────────────────────────────────────────────────

export default function HRDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardStats(user?.org_id || 'demo-org-001').then((data) => {
            setStats(data);
            setLoading(false);
        });
    }, [user]);

    if (loading || !stats) {
        return (
            <div className="page-enter text-center py-20">
                <p className="text-2xl mb-3 animate-pulse">📊</p>
                <p className="text-slate-400">Loading dashboard...</p>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Cases', value: stats.totalCases, icon: <FileText size={20} />, color: '#e855a0', link: '/hr/cases' },
        { label: 'Active', value: stats.activeCases, icon: <AlertTriangle size={20} />, color: '#a855f7', link: '/hr/cases?status=investigating' },
        { label: 'Pending', value: stats.pendingCases, icon: <Clock size={20} />, color: '#f5a623', link: '/hr/cases?status=pending' },
        { label: 'Resolved', value: stats.resolvedCases, icon: <CheckCircle size={20} />, color: '#10b981', link: '/hr/cases?status=resolved' },
    ];

    const metricCards = [
        { label: 'Avg Resolution', value: `${stats.avgResolutionDays}d`, icon: <TrendingUp size={18} />, color: '#3b82f6' },
        { label: 'Satisfaction', value: `${stats.employeeSatisfaction}/5`, icon: <Users size={18} />, color: '#10b981' },
        { label: 'Panic Alerts', value: stats.panicAlertsThisMonth, icon: <Shield size={18} />, color: '#ef4444' },
        { label: 'Compliance', value: `${stats.complianceScore}%`, icon: <Activity size={18} />, color: '#a855f7' },
    ];

    return (
        <div className="page-enter">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">📊 HR Dashboard</h1>
                    <p className="text-slate-400 text-sm mt-1">Overview of workplace safety metrics</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/hr/cases" className="btn-ghost text-sm flex items-center gap-1">
                        <FileText size={14} /> All Cases
                    </Link>
                    <Link href="/hr/reports" className="btn-primary text-sm flex items-center gap-1">
                        📄 Generate Report
                    </Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {statCards.map((s) => (
                    <Link
                        key={s.label}
                        href={s.link}
                        className="glass-card group hover:scale-[1.02] transition-all"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                                <span style={{ color: s.color }}>{s.icon}</span>
                            </div>
                            <span className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</span>
                        </div>
                        <p className="text-xs text-slate-400">{s.label}</p>
                    </Link>
                ))}
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {metricCards.map((m) => (
                    <div key={m.label} className="glass-card !p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${m.color}12` }}>
                            <span style={{ color: m.color }}>{m.icon}</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold">{m.value}</p>
                            <p className="text-[10px] text-slate-500">{m.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly Trend */}
                <div className="glass-card">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">📈 Monthly Trend</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={stats.monthlyTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                            <Tooltip
                                contentStyle={{ background: '#1a1533', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                                labelStyle={{ color: '#e855a0' }}
                            />
                            <Line type="monotone" dataKey="cases" stroke="#e855a0" strokeWidth={2} dot={{ fill: '#e855a0', r: 4 }} activeDot={{ fill: '#e855a0', r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Cases by Type */}
                <div className="glass-card">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">🗂️ Cases by Type</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={stats.casesByType}
                                dataKey="count"
                                nameKey="type"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                innerRadius={40}
                                paddingAngle={4}
                                strokeWidth={0}
                            >
                                {stats.casesByType.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: '#1a1533', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                            />
                            <Legend
                                formatter={(value) => <span className="text-xs text-slate-400">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Severity Distribution */}
            <div className="glass-card mb-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">⚠️ Severity Distribution</h3>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={stats.severityDistribution} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="level" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                        <Tooltip
                            contentStyle={{ background: '#1a1533', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {stats.severityDistribution.map((_, i) => (
                                <Cell key={i} fill={SEVERITY_COLORS[i % SEVERITY_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { href: '/hr/cases', emoji: '📋', label: 'All Cases', color: '#e855a0' },
                    { href: '/hr/icc', emoji: '⚖️', label: 'ICC Members', color: '#a855f7' },
                    { href: '/hr/pulse', emoji: '💓', label: 'Pulse Survey', color: '#f5a623' },
                    { href: '/hr/training', emoji: '🎓', label: 'Training', color: '#10b981' },
                    { href: '/hr/analytics', emoji: '📊', label: 'Analytics', color: '#3b82f6' },
                    { href: '/hr/reports', emoji: '📄', label: 'Reports', color: '#e855a0' },
                    { href: '/hr/users', emoji: '👥', label: 'Users', color: '#a855f7' },
                    { href: '/employee', emoji: '🏠', label: 'Switch View', color: '#64748b' },
                ].map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className="glass-card !p-3 text-center group hover:scale-[1.03] transition-all"
                    >
                        <div className="text-xl mb-1 group-hover:scale-110 transition-transform inline-block">{action.emoji}</div>
                        <p className="text-xs text-slate-400">{action.label}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
