'use client';

import { useAuth } from '@/lib/auth-context';

// ─── Quick Actions ──────────────────────────────────────────────────────────

const quickActions = [
    {
        href: '/employee/complaints/new',
        emoji: '✍️',
        title: 'File Complaint',
        desc: 'Report an incident anonymously',
        color: '#e855a0',
        borderColor: '#e855a025',
    },
    {
        href: '/employee/panic',
        emoji: '🚨',
        title: 'Panic Button',
        desc: 'Emergency? Get help now',
        color: '#ef4444',
        borderColor: '#ef444425',
    },
    {
        href: '/employee/guardian',
        emoji: '🛡️',
        title: 'Guardian Mode',
        desc: 'Walking alone? Stay protected',
        color: '#a855f7',
        borderColor: '#a855f725',
    },
    {
        href: '/employee/complaints',
        emoji: '📋',
        title: 'My Cases',
        desc: 'Track your filed complaints',
        color: '#f5a623',
        borderColor: '#f5a62325',
    },
];

const secondaryActions = [
    { href: '/employee/complaints/bystander', emoji: '👁️', label: 'Bystander Report', color: '#e855a0' },
    { href: '/employee/evidence-vault', emoji: '🔐', label: 'Evidence Vault', color: '#a855f7' },
    { href: '/employee/resources', emoji: '📚', label: 'Resources', color: '#f5a623' },
    { href: '#', emoji: '💬', label: 'AI Assistant', color: '#10b981' },
];

// ─── Motivational SVG ───────────────────────────────────────────────────────

function WelcomeArt() {
    return (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#e855a010" stroke="#e855a030" strokeWidth="1" />
            <circle cx="32" cy="22" r="10" fill="#f8c4a0" />
            <path d="M22 16C25 10 32 8 36 12C40 16 38 22 35 24C33 20 30 16 26 16C23 16 22 16 22 16Z" fill="#2d1b4e" />
            <circle cx="28" cy="22" r="1.2" fill="#2d1b4e" />
            <circle cx="36" cy="22" r="1.2" fill="#2d1b4e" />
            <path d="M30 26C30 26 32 28 34 26" stroke="#c8826e" strokeWidth="1" strokeLinecap="round" fill="none" />
            <rect x="22" y="34" width="20" height="20" rx="4" fill="url(#dressGrad)" />
            <path d="M18 40L22 35" stroke="#f8c4a0" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M46 40L42 35" stroke="#f8c4a0" strokeWidth="2.5" strokeLinecap="round" />
            {/* Waving hand */}
            <circle cx="46" cy="38" r="3.5" fill="#f8c4a0" />
            <path d="M46 34L48 30" stroke="#f8c4a0" strokeWidth="2" strokeLinecap="round" />
            {/* Sparkles */}
            <path d="M50 26L51 23L52 26L51 29Z" fill="#f5a623" opacity="0.6" />
            <path d="M14 30L15 28L16 30L15 32Z" fill="#e855a0" opacity="0.4" />
            <defs>
                <linearGradient id="dressGrad" x1="22" y1="34" x2="42" y2="54">
                    <stop stopColor="#e855a0" />
                    <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// ─── Employee Home ──────────────────────────────────────────────────────────

export default function EmployeeHome() {
    const { user } = useAuth();
    const firstName = user?.name?.split(' ')[0] || 'there';

    return (
        <div className="page-enter max-w-4xl">
            {/* Welcome Header */}
            <div className="flex items-center gap-4 mb-8">
                <WelcomeArt />
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#f5f0ff' }}>
                        Welcome back, <span style={{ color: '#e855a0' }}>{firstName}</span>! 💜
                    </h1>
                    <p style={{ color: '#8b82a8' }} className="text-sm">
                        Your safety matters. What would you like to do today?
                    </p>
                </div>
            </div>

            {/* Motivational Banner */}
            <div
                className="rounded-2xl p-5 mb-8 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #e855a015 0%, #a855f710 50%, #f5a62308 100%)', border: '1px solid #e855a015' }}
            >
                <div className="relative z-10">
                    <p className="text-sm font-medium" style={{ color: '#f472b6' }}>💡 Did you know?</p>
                    <p className="text-xs mt-1" style={{ color: '#a8a0c0' }}>
                        Under the POSH Act 2013, every organization with 10+ employees must have an Internal Complaints Committee.
                        You have the right to file complaints anonymously and without fear of retaliation.
                    </p>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-20">⚖️</div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {quickActions.map((action) => (
                    <a
                        key={action.title}
                        href={action.href}
                        className="glass-card flex items-center gap-4 group transition-all duration-300 hover:scale-[1.02]"
                        style={{ borderColor: action.borderColor }}
                    >
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                            style={{ background: `${action.color}12`, border: `1px solid ${action.color}20` }}
                        >
                            {action.emoji}
                        </div>
                        <div>
                            <h3 className="font-bold text-base" style={{ color: action.color }}>{action.title}</h3>
                            <p className="text-xs mt-0.5" style={{ color: '#8b82a8' }}>{action.desc}</p>
                        </div>
                    </a>
                ))}
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {secondaryActions.map((action) => (
                    <a
                        key={action.label}
                        href={action.href}
                        className="glass-card text-center p-4 group transition-all duration-300 hover:scale-[1.03]"
                    >
                        <div
                            className="text-2xl mb-2 transition-transform duration-300 group-hover:scale-110 inline-block"
                        >
                            {action.emoji}
                        </div>
                        <p className="text-xs" style={{ color: '#8b82a8' }}>{action.label}</p>
                    </a>
                ))}
            </div>

            {/* Help Footer */}
            <div className="mt-8 text-center">
                <p className="text-xs" style={{ color: '#4a4460' }}>
                    Need help? Press <kbd className="px-1.5 py-0.5 rounded border text-[10px]" style={{ borderColor: '#3d3560', color: '#6b6285' }}>Ctrl+H</kbd> for AI assistant or call the helpline
                </p>
            </div>
        </div>
    );
}
