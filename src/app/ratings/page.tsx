'use client';

import { useState, useEffect } from 'react';
import { Trophy, Building2, ArrowUpRight, Star, Shield, TrendingUp, Search } from 'lucide-react';
import Link from 'next/link';

interface OrgRating {
    id: string;
    name: string;
    industry: string;
    city: string;
    score: number;
    badges: string[];
    totalCases: number;
    resolvedRate: number;
    avgResponseDays: number;
}

const MOCK_ORGS: OrgRating[] = [
    { id: 'org-1', name: 'TechNova Solutions', industry: 'Technology', city: 'Bengaluru', score: 92, badges: ['🛡️ Zero Tolerance', '⚡ Fast Response', '🏆 Top 10%'], totalCases: 12, resolvedRate: 100, avgResponseDays: 4 },
    { id: 'org-2', name: 'GreenLeaf Pharma', industry: 'Healthcare', city: 'Mumbai', score: 88, badges: ['🛡️ Zero Tolerance', '📋 ICC Compliant'], totalCases: 8, resolvedRate: 88, avgResponseDays: 7 },
    { id: 'org-3', name: 'Skyline Financial', industry: 'Finance', city: 'Delhi', score: 85, badges: ['📋 ICC Compliant', '🎓 Training 100%'], totalCases: 15, resolvedRate: 87, avgResponseDays: 9 },
    { id: 'org-4', name: 'Bloom Creative Agency', industry: 'Media', city: 'Hyderabad', score: 82, badges: ['🎓 Training 100%'], totalCases: 5, resolvedRate: 80, avgResponseDays: 12 },
    { id: 'org-5', name: 'Pinnacle Manufacturing', industry: 'Manufacturing', city: 'Chennai', score: 78, badges: ['📋 ICC Compliant'], totalCases: 20, resolvedRate: 75, avgResponseDays: 15 },
    { id: 'org-6', name: 'ClearView Analytics', industry: 'Technology', city: 'Pune', score: 76, badges: [], totalCases: 10, resolvedRate: 70, avgResponseDays: 18 },
    { id: 'org-7', name: 'Metro Logistics', industry: 'Logistics', city: 'Kolkata', score: 71, badges: [], totalCases: 18, resolvedRate: 67, avgResponseDays: 22 },
    { id: 'org-8', name: 'Horizon Retail', industry: 'Retail', city: 'Jaipur', score: 65, badges: [], totalCases: 25, resolvedRate: 60, avgResponseDays: 28 },
];

function getScoreColor(score: number) {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#f5a623';
    return '#ef4444';
}

function getMedal(rank: number) {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return `#${rank + 1}`;
}

export default function RatingsPage() {
    const [search, setSearch] = useState('');
    const [industry, setIndustry] = useState('All');
    const [orgs, setOrgs] = useState(MOCK_ORGS);
    const industries = ['All', ...new Set(MOCK_ORGS.map((o) => o.industry))];

    useEffect(() => {
        let filtered = MOCK_ORGS;
        if (industry !== 'All') filtered = filtered.filter((o) => o.industry === industry);
        if (search) filtered = filtered.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()) || o.city.toLowerCase().includes(search.toLowerCase()));
        setOrgs(filtered);
    }, [search, industry]);

    return (
        <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto page-enter">
            {/* Header */}
            <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <Trophy size={28} className="text-[#f5a623]" />
                    <h1 className="text-3xl font-bold">Organization Safety Ratings</h1>
                </div>
                <p className="text-slate-400 text-sm max-w-lg mx-auto">
                    Public transparency for workplace safety. Every score is derived from case resolution, response time, ICC compliance, and employee satisfaction.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search organizations..."
                        className="w-full bg-[#0d0a1a] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-slate-500 focus:border-[#e855a0] outline-none"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {industries.map((ind) => (
                        <button
                            key={ind}
                            onClick={() => setIndustry(ind)}
                            className="text-xs px-3 py-2 rounded-lg font-medium transition-all"
                            style={{
                                background: industry === ind ? '#e855a018' : 'rgba(255,255,255,0.04)',
                                color: industry === ind ? '#e855a0' : '#8b82a8',
                                border: `1px solid ${industry === ind ? '#e855a030' : 'rgba(255,255,255,0.08)'}`,
                            }}
                        >
                            {ind}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top 3 Podium */}
            {orgs.length >= 3 && (
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {orgs.slice(0, 3).map((org, i) => (
                        <Link key={org.id} href={`/ratings/${org.id}`} className="block">
                            <div
                                className="rounded-2xl p-5 text-center transition-all hover:scale-[1.02] relative overflow-hidden"
                                style={{
                                    background: i === 0
                                        ? 'linear-gradient(135deg, #f5a62310, #e855a008)'
                                        : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${i === 0 ? '#f5a62320' : 'rgba(255,255,255,0.08)'}`,
                                    boxShadow: i === 0 ? '0 0 30px rgba(245,166,35,0.1)' : 'none',
                                }}
                            >
                                <span className="text-3xl mb-2 block">{getMedal(i)}</span>
                                <Building2 size={20} className="mx-auto mb-2 text-slate-400" />
                                <h3 className="font-semibold text-sm text-white">{org.name}</h3>
                                <p className="text-[10px] text-slate-500">{org.city} • {org.industry}</p>
                                <div className="mt-3 text-2xl font-bold" style={{ color: getScoreColor(org.score) }}>
                                    {org.score}<span className="text-sm font-normal text-slate-500">/100</span>
                                </div>
                                <div className="flex justify-center gap-1 mt-2 flex-wrap">
                                    {org.badges.slice(0, 2).map((b, j) => (
                                        <span key={j} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: '#f5a62310', color: '#e8d0a0' }}>{b}</span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Full Leaderboard */}
            <div className="space-y-3">
                {orgs.map((org, i) => (
                    <Link key={org.id} href={`/ratings/${org.id}`} className="block">
                        <div className="glass-card flex items-center gap-4 group hover:scale-[1.01] transition-all">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(255,255,255,0.04)', color: i < 3 ? '#f5a623' : '#64748b' }}>
                                {typeof getMedal(i) === 'string' && getMedal(i).startsWith('#') ? getMedal(i) : <span className="text-lg">{getMedal(i)}</span>}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-sm">{org.name}</h3>
                                    <ArrowUpRight size={12} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-[10px] text-slate-500">{org.city} • {org.industry}</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="text-center">
                                    <div className="flex items-center gap-1 text-slate-400"><Shield size={11} /> {org.resolvedRate}%</div>
                                    <p className="text-[9px] text-slate-600">Resolved</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center gap-1 text-slate-400"><TrendingUp size={11} /> {org.avgResponseDays}d</div>
                                    <p className="text-[9px] text-slate-600">Avg Response</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center gap-1 text-slate-400"><Star size={11} /> {org.badges.length}</div>
                                    <p className="text-[9px] text-slate-600">Badges</p>
                                </div>
                            </div>
                            <div className="text-xl font-bold w-16 text-right" style={{ color: getScoreColor(org.score) }}>
                                {org.score}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
