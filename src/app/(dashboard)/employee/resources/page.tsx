'use client';

import { BookOpen, ExternalLink } from 'lucide-react';

const RESOURCES = [
    {
        title: 'What is the POSH Act?',
        desc: 'The Sexual Harassment of Women at Workplace Act, 2013 — your right to a safe workplace.',
        icon: '⚖️',
        color: '#a855f7',
        link: '#',
    },
    {
        title: 'How to File a Complaint',
        desc: 'Step-by-step guide on filing a complaint through HearHer or directly with the ICC.',
        icon: '📝',
        color: '#e855a0',
        link: '#',
    },
    {
        title: 'Understanding Your Rights',
        desc: 'Know your rights as an employee, including protection against retaliation.',
        icon: '🛡️',
        color: '#f5a623',
        link: '#',
    },
    {
        title: 'What Happens After Filing?',
        desc: 'The ICC process: investigation timeline, confidentiality, and possible outcomes.',
        icon: '🔍',
        color: '#10b981',
        link: '#',
    },
    {
        title: 'Support Resources',
        desc: 'Helpline numbers, counseling services, and external support organizations.',
        icon: '💜',
        color: '#e855a0',
        link: '#',
    },
    {
        title: 'FAQ',
        desc: 'Common questions about POSH, anonymity, evidence, and the ICC process.',
        icon: '❓',
        color: '#a855f7',
        link: '#',
    },
];

const HELPLINE = [
    { name: 'Women Helpline', number: '181', desc: '24/7 toll-free' },
    { name: 'NCW Helpline', number: '7827-170-170', desc: 'National Commission for Women' },
    { name: 'Police (Emergency)', number: '112', desc: 'All emergencies' },
];

export default function ResourcesPage() {
    return (
        <div className="page-enter max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#a855f715' }}>
                    <BookOpen size={20} className="text-[#a855f7]" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Resources & Learn</h1>
                    <p className="text-xs text-slate-400">Know your rights. Knowledge is power.</p>
                </div>
            </div>

            {/* Resource Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {RESOURCES.map((r) => (
                    <a key={r.title} href={r.link} className="glass-card group hover:scale-[1.02] transition-all">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">{r.icon}</span>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm mb-1 group-hover:text-[#e855a0] transition-colors">{r.title}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
                            </div>
                            <ExternalLink size={14} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </a>
                ))}
            </div>

            {/* Emergency Numbers */}
            <div className="glass-card" style={{ borderColor: '#ef444420' }}>
                <h3 className="text-sm font-semibold mb-3">🚨 Emergency Helplines</h3>
                <div className="space-y-2">
                    {HELPLINE.map((h) => (
                        <div key={h.number} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <div>
                                <p className="text-sm font-medium">{h.name}</p>
                                <p className="text-xs text-slate-500">{h.desc}</p>
                            </div>
                            <a href={`tel:${h.number}`} className="text-sm font-bold text-[#e855a0] hover:underline">{h.number}</a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
