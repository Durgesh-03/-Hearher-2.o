'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Star, Shield, TrendingUp, Award, Calendar, Users } from 'lucide-react';

interface OrgDetail {
    id: string;
    name: string;
    industry: string;
    city: string;
    score: number;
    badges: string[];
    totalCases: number;
    resolvedRate: number;
    avgResponseDays: number;
    iccCompliant: boolean;
    trainingCompletion: number;
    description: string;
    breakdowns: { label: string; score: number }[];
    monthlyScores: { month: string; score: number }[];
}

const MOCK_ORG: OrgDetail = {
    id: 'org-1',
    name: 'TechNova Solutions',
    industry: 'Technology',
    city: 'Bengaluru',
    score: 92,
    badges: ['🛡️ Zero Tolerance', '⚡ Fast Response', '🏆 Top 10%', '📋 ICC Compliant', '🎓 Training 100%'],
    totalCases: 12,
    resolvedRate: 100,
    avgResponseDays: 4,
    iccCompliant: true,
    trainingCompletion: 100,
    description: 'TechNova Solutions has demonstrated exemplary commitment to workplace safety and POSH compliance, maintaining a zero-tolerance policy and resolving all reported cases within the statutory 90-day window.',
    breakdowns: [
        { label: 'Case Resolution', score: 95 },
        { label: 'Response Time', score: 93 },
        { label: 'ICC Compliance', score: 100 },
        { label: 'Training Coverage', score: 100 },
        { label: 'Employee Satisfaction', score: 72 },
    ],
    monthlyScores: [
        { month: 'Sep', score: 85 }, { month: 'Oct', score: 87 }, { month: 'Nov', score: 89 },
        { month: 'Dec', score: 90 }, { month: 'Jan', score: 91 }, { month: 'Feb', score: 92 },
    ],
};

function scoreColor(score: number) {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#f5a623';
    return '#ef4444';
}

export default function OrgDetailPage({ params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = use(params);
    const org = { ...MOCK_ORG, id: orgId };

    return (
        <main className="min-h-screen px-6 py-10 max-w-4xl mx-auto page-enter">
            <Link href="/ratings" className="text-sm text-slate-400 hover:text-[#e855a0] flex items-center gap-1 mb-6 transition-colors">
                <ArrowLeft size={14} /> Back to Rankings
            </Link>

            {/* Header */}
            <div className="flex items-start gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#a855f710', border: '1px solid #a855f720' }}>
                    <Building2 size={28} className="text-[#a855f7]" />
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{org.name}</h1>
                    <p className="text-sm text-slate-400">{org.city} • {org.industry}</p>
                    <p className="text-xs text-slate-500 mt-1">{org.description}</p>
                </div>
                <div className="text-right">
                    <div className="text-4xl font-bold" style={{ color: scoreColor(org.score) }}>
                        {org.score}<span className="text-base font-normal text-slate-500">/100</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Safety Score</p>
                </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-8">
                {org.badges.map((b, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: '#f5a62310', color: '#e8d0a0', border: '1px solid #f5a62318' }}>
                        {b}
                    </span>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {[
                    { icon: <Shield size={18} />, label: 'Cases Resolved', value: `${org.resolvedRate}%`, color: '#10b981' },
                    { icon: <TrendingUp size={18} />, label: 'Avg Response', value: `${org.avgResponseDays} days`, color: '#3b82f6' },
                    { icon: <Users size={18} />, label: 'Total Cases', value: org.totalCases, color: '#a855f7' },
                    { icon: <Calendar size={18} />, label: 'Training Done', value: `${org.trainingCompletion}%`, color: '#f5a623' },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card text-center !p-4">
                        <div className="flex justify-center mb-2" style={{ color: stat.color }}>{stat.icon}</div>
                        <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-[10px] text-slate-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Score Breakdown */}
            <div className="glass-card mb-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <Award size={16} className="text-[#f5a623]" /> Score Breakdown
                </h3>
                <div className="space-y-3">
                    {org.breakdowns.map((b) => (
                        <div key={b.label}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">{b.label}</span>
                                <span className="font-bold" style={{ color: scoreColor(b.score) }}>{b.score}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-white/5">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${b.score}%`, background: scoreColor(b.score) }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly Trend */}
            <div className="glass-card">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#3b82f6]" /> 6-Month Trend
                </h3>
                <div className="flex items-end justify-between gap-2 h-32">
                    {org.monthlyScores.map((m) => {
                        const height = ((m.score - 50) / 50) * 100; // normalize 50-100 range
                        return (
                            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[10px] font-bold" style={{ color: scoreColor(m.score) }}>{m.score}</span>
                                <div className="w-full rounded-t-lg transition-all duration-500" style={{ height: `${height}%`, background: `linear-gradient(to top, ${scoreColor(m.score)}40, ${scoreColor(m.score)})` }} />
                                <span className="text-[10px] text-slate-500">{m.month}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ICC Compliance Badge */}
            <div className="mt-6 rounded-xl p-4" style={{ background: org.iccCompliant ? '#10b98110' : '#ef444410', border: `1px solid ${org.iccCompliant ? '#10b98120' : '#ef444420'}` }}>
                <p className="text-xs font-medium" style={{ color: org.iccCompliant ? '#6ee7b7' : '#fca5a5' }}>
                    {org.iccCompliant ? '✅ ICC committee is fully constituted and compliant with POSH Act 2013 requirements.' : '⚠️ This organization is not fully POSH Act compliant. ICC formation pending.'}
                </p>
            </div>

            <div className="mt-4 text-center">
                <p className="text-[10px] text-slate-600">Scores are calculated based on case resolution metrics, ICC compliance, and employee feedback. Updated monthly.</p>
            </div>
        </main>
    );
}
