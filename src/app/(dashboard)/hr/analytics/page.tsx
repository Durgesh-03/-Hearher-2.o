'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getDashboardStats, type DashboardStats } from '@/lib/data-service';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';

const COLORS = ['#e855a0', '#a855f7', '#10b981', '#f5a623', '#3b82f6', '#ef4444'];

export default function AnalyticsPage() {
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
                <p className="text-slate-400">Loading analytics...</p>
            </div>
        );
    }

    const resolutionData = [
        { range: '< 7 days', count: 8 },
        { range: '7-14 days', count: 15 },
        { range: '15-30 days', count: 14 },
        { range: '30-60 days', count: 7 },
        { range: '60+ days', count: 3 },
    ];

    const ttStyle = { background: '#1a1533', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 };

    return (
        <div className="page-enter">
            <h1 className="text-2xl font-bold mb-1">📊 Advanced Analytics</h1>
            <p className="text-slate-400 text-sm mb-8">Deep-dive into workplace safety data and trends</p>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                {[
                    { label: 'Total Cases', value: stats.totalCases, color: '#e855a0' },
                    { label: 'Avg Resolution', value: `${stats.avgResolutionDays}d`, color: '#3b82f6' },
                    { label: 'Resolution Rate', value: `${Math.round((stats.resolvedCases / Math.max(1, stats.totalCases)) * 100)}%`, color: '#10b981' },
                    { label: 'Compliance', value: `${stats.complianceScore}%`, color: '#a855f7' },
                    { label: 'Satisfaction', value: `${stats.employeeSatisfaction}/5`, color: '#f5a623' },
                ].map((k) => (
                    <div key={k.label} className="glass-card !p-3 text-center">
                        <p className="text-lg font-bold" style={{ color: k.color }}>{k.value}</p>
                        <p className="text-[10px] text-slate-500">{k.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Trend Area Chart */}
                <div className="glass-card">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">📈 Case Trend (6 Month)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={stats.monthlyTrend}>
                            <defs>
                                <linearGradient id="areaPink" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#e855a0" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#e855a0" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                            <Tooltip contentStyle={ttStyle} />
                            <Area type="monotone" dataKey="cases" stroke="#e855a0" fill="url(#areaPink)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Cases by Type Pie */}
                <div className="glass-card">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">🗂️ Breakdown by Type</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={stats.casesByType} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={4} strokeWidth={0}>
                                {stats.casesByType.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                            </Pie>
                            <Tooltip contentStyle={ttStyle} />
                            <Legend formatter={(v) => <span className="text-xs text-slate-400">{v}</span>} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Severity Bar */}
                <div className="glass-card">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">⚠️ Severity Distribution</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={stats.severityDistribution} barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="level" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                            <Tooltip contentStyle={ttStyle} />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                {stats.severityDistribution.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Resolution Time */}
                <div className="glass-card">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">⏱️ Resolution Time Distribution</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={resolutionData} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                            <Tooltip contentStyle={ttStyle} />
                            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
