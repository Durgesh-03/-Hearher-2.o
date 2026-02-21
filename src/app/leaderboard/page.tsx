'use client';

import { useState } from 'react';
import { Trophy, Medal, TrendingUp, Users, Shield, Star, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// ─── Types ──────────────────────────────────────────────────────────────────

interface LeaderEntry {
    rank: number;
    name: string;
    dept: string;
    score: number;
    badges: string[];
    trainingsCompleted: number;
    reportsFiledSafely: number;
    streak: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const LEADERBOARD: LeaderEntry[] = [
    { rank: 1, name: 'Engineering', dept: 'Technology', score: 98, badges: ['🛡️ Zero Incidents', '📚 100% Training', '⚡ Fast Response'], trainingsCompleted: 45, reportsFiledSafely: 8, streak: 180 },
    { rank: 2, name: 'Product Design', dept: 'Design', score: 95, badges: ['📚 100% Training', '💜 Ally Award'], trainingsCompleted: 22, reportsFiledSafely: 3, streak: 120 },
    { rank: 3, name: 'Human Resources', dept: 'Operations', score: 93, badges: ['⚡ Fast Response', '📋 ICC Champion'], trainingsCompleted: 18, reportsFiledSafely: 12, streak: 365 },
    { rank: 4, name: 'Marketing', dept: 'Business', score: 89, badges: ['📚 100% Training'], trainingsCompleted: 15, reportsFiledSafely: 2, streak: 90 },
    { rank: 5, name: 'Sales', dept: 'Business', score: 85, badges: ['💜 Ally Award'], trainingsCompleted: 30, reportsFiledSafely: 5, streak: 60 },
    { rank: 6, name: 'Finance', dept: 'Operations', score: 82, badges: [], trainingsCompleted: 12, reportsFiledSafely: 1, streak: 45 },
    { rank: 7, name: 'Customer Support', dept: 'Operations', score: 78, badges: [], trainingsCompleted: 25, reportsFiledSafely: 4, streak: 30 },
    { rank: 8, name: 'Operations', dept: 'Operations', score: 74, badges: [], trainingsCompleted: 10, reportsFiledSafely: 6, streak: 15 },
];

const INDIVIDUAL_TOP = [
    { name: 'Anjali Desai', dept: 'HR', trainings: 12, title: 'POSH Champion', emoji: '🏆' },
    { name: 'Riya Sharma', dept: 'Engineering', trainings: 10, title: 'Safety Advocate', emoji: '🛡️' },
    { name: 'Kavya Nair', dept: 'Design', trainings: 9, title: 'Ally Star', emoji: '⭐' },
];

function getColor(rank: number) {
    if (rank === 1) return '#f5a623';
    if (rank === 2) return '#94a3b8';
    if (rank === 3) return '#cd7f32';
    return '#64748b';
}

function getMedal(rank: number) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
}

// ─── Leaderboard Page ───────────────────────────────────────────────────────

export default function LeaderboardPage() {
    return (
        <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto page-enter">
            <Link href="/" className="text-sm text-slate-500 hover:text-[#e855a0] flex items-center gap-1 mb-6 transition-colors">
                <ArrowLeft size={14} /> Back
            </Link>

            {/* Header */}
            <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy size={28} className="text-[#f5a623]" />
                    <h1 className="text-3xl font-bold text-white">Safety Leaderboard</h1>
                </div>
                <p className="text-sm text-slate-400">Departments ranked by safety training, incident-free streaks, and compliance scores</p>
            </div>

            {/* Top 3 Individual Champions */}
            <div className="grid grid-cols-3 gap-4 mb-10">
                {INDIVIDUAL_TOP.map((person, i) => (
                    <div key={person.name} className="glass-card text-center !p-5 hover:scale-[1.02] transition-all" style={{ borderColor: i === 0 ? '#f5a62320' : 'rgba(255,255,255,0.06)' }}>
                        <span className="text-3xl">{person.emoji}</span>
                        <p className="text-sm font-semibold text-white mt-2">{person.name}</p>
                        <p className="text-[10px] text-slate-500">{person.dept} • {person.trainings} trainings</p>
                        <span className="text-[9px] mt-2 inline-block px-2 py-0.5 rounded-full" style={{ background: '#f5a62312', color: '#f5a623' }}>
                            {person.title}
                        </span>
                    </div>
                ))}
            </div>

            {/* Department Leaderboard */}
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award size={18} className="text-[#a855f7]" /> Department Rankings
            </h2>

            <div className="space-y-3">
                {LEADERBOARD.map((entry) => (
                    <div key={entry.rank} className="glass-card flex items-center gap-4 hover:scale-[1.005] transition-all">
                        {/* Rank */}
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: entry.rank <= 3 ? `${getColor(entry.rank)}12` : 'rgba(255,255,255,0.03)', color: getColor(entry.rank), border: entry.rank <= 3 ? `1px solid ${getColor(entry.rank)}20` : 'none' }}>
                            {typeof getMedal(entry.rank) === 'string' && getMedal(entry.rank).startsWith('#') ? getMedal(entry.rank) : <span className="text-lg">{getMedal(entry.rank)}</span>}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white">{entry.name}</h3>
                            <p className="text-[10px] text-slate-500">{entry.dept}</p>
                            {entry.badges.length > 0 && (
                                <div className="flex gap-1 flex-wrap mt-1">
                                    {entry.badges.map((b) => (
                                        <span key={b} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: '#f5a62310', color: '#e8d0a0' }}>{b}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="hidden md:flex items-center gap-5 text-xs">
                            <div className="text-center">
                                <div className="flex items-center gap-1 text-slate-400"><Users size={11} /> {entry.trainingsCompleted}</div>
                                <p className="text-[9px] text-slate-600">Trainings</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center gap-1 text-slate-400"><Shield size={11} /> {entry.streak}d</div>
                                <p className="text-[9px] text-slate-600">Streak</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center gap-1 text-slate-400"><Star size={11} /> {entry.reportsFiledSafely}</div>
                                <p className="text-[9px] text-slate-600">Reports</p>
                            </div>
                        </div>

                        {/* Score */}
                        <div className="w-16 text-right">
                            <span className="text-xl font-bold" style={{ color: entry.score >= 90 ? '#10b981' : entry.score >= 80 ? '#f5a623' : '#8b82a8' }}>
                                {entry.score}
                            </span>
                            <p className="text-[9px] text-slate-600">pts</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Note */}
            <div className="mt-8 text-center">
                <p className="text-[10px] text-slate-600">
                    Scores are based on: training completion (40%), incident-free streak (30%), report cooperation (20%), and ICC compliance (10%). Updated weekly.
                </p>
            </div>
        </main>
    );
}
