'use client';

import { useState } from 'react';
import { GraduationCap, Play, CheckCircle, Clock, BookOpen, Video, Award } from 'lucide-react';

const MODULES = [
    {
        id: 'm-1', title: 'Understanding the POSH Act 2013', duration: '15 min', type: 'video',
        desc: 'Complete overview of the Prevention of Sexual Harassment Act and its implications for Indian workplaces.',
        status: 'completed', icon: <Video size={18} />,
    },
    {
        id: 'm-2', title: 'Recognizing Workplace Harassment', duration: '20 min', type: 'interactive',
        desc: 'Learn to identify verbal, physical, cyber, and quid pro quo harassment with real-world scenarios.',
        status: 'completed', icon: <BookOpen size={18} />,
    },
    {
        id: 'm-3', title: 'ICC Roles & Responsibilities', duration: '12 min', type: 'video',
        desc: 'What every ICC member should know — investigation protocols, timelines, and confidentiality.',
        status: 'in_progress', icon: <Video size={18} />,
    },
    {
        id: 'm-4', title: 'Filing & Managing Complaints', duration: '10 min', type: 'interactive',
        desc: 'Step-by-step guide for employees on how to file complaints and what to expect during investigation.',
        status: 'locked', icon: <BookOpen size={18} />,
    },
    {
        id: 'm-5', title: 'Bystander Intervention Training', duration: '18 min', type: 'video',
        desc: 'Learn the 5D approach: Direct, Distract, Delegate, Document, Delay.',
        status: 'locked', icon: <Video size={18} />,
    },
    {
        id: 'm-6', title: 'Creating a Safe Workplace Culture', duration: '25 min', type: 'interactive',
        desc: 'Best practices for HR leaders to build and maintain a harassment-free workplace.',
        status: 'locked', icon: <Award size={18} />,
    },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    completed: { label: 'Completed', color: '#10b981', icon: <CheckCircle size={14} /> },
    in_progress: { label: 'In Progress', color: '#f5a623', icon: <Play size={14} /> },
    locked: { label: 'Start', color: '#64748b', icon: <Clock size={14} /> },
};

export default function TrainingPage() {
    const completedCount = MODULES.filter((m) => m.status === 'completed').length;
    const progress = Math.round((completedCount / MODULES.length) * 100);

    return (
        <div className="page-enter max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#10b98115' }}>
                    <GraduationCap size={20} className="text-[#10b981]" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">POSH Training</h1>
                    <p className="text-xs text-slate-400">Mandatory training modules for workplace safety awareness</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="glass-card mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm font-bold" style={{ color: '#10b981' }}>{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #10b981, #a855f7)' }} />
                </div>
                <p className="text-xs text-slate-500 mt-2">{completedCount} of {MODULES.length} modules completed</p>
            </div>

            {/* Module Cards */}
            <div className="space-y-3">
                {MODULES.map((m, idx) => {
                    const s = STATUS_CONFIG[m.status] || STATUS_CONFIG.locked;
                    return (
                        <div key={m.id} className="glass-card flex items-center gap-4 group hover:scale-[1.005] transition-all cursor-pointer">
                            {/* Number */}
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                                style={{
                                    background: m.status === 'completed' ? '#10b98120' : m.status === 'in_progress' ? '#f5a62320' : 'rgba(255,255,255,0.04)',
                                    color: s.color,
                                }}
                            >
                                {m.status === 'completed' ? '✓' : idx + 1}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{m.title}</p>
                                <p className="text-xs text-slate-500 line-clamp-1">{m.desc}</p>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <span className="flex items-center gap-1">{m.icon} {m.type}</span>
                                    <span>⏱️ {m.duration}</span>
                                </div>
                            </div>

                            {/* Status */}
                            <span className="text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 flex-shrink-0"
                                style={{ background: `${s.color}15`, color: s.color }}
                            >
                                {s.icon} {s.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Certificate Banner */}
            <div className="glass-card mt-6 text-center" style={{ borderColor: '#f5a62320' }}>
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-sm font-medium">Complete all modules to earn your POSH Certification</p>
                <p className="text-xs text-slate-500 mt-1">Valid for 1 year • Required for ICC members</p>
            </div>
        </div>
    );
}
