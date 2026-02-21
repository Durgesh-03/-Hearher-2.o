'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/lib/database.types';
import { ArrowRight } from 'lucide-react';

// ─── Inline SVG Illustrations ───────────────────────────────────────────────

function HeroIllustration() {
    return (
        <svg width="320" height="240" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
            {/* Glow background */}
            <circle cx="160" cy="120" r="100" fill="url(#heroGlow)" opacity="0.15" />
            <circle cx="160" cy="120" r="60" fill="url(#heroGlow)" opacity="0.1" />

            {/* Woman 1 — Center (leader) */}
            <g transform="translate(140, 55)">
                <circle cx="20" cy="12" r="14" fill="#f8c4a0" />
                <path d="M8 6C8 2 14-2 22 0C30 2 34 8 32 14C30 10 26 6 20 5C14 4 10 5 8 6Z" fill="#2d1b4e" />
                <circle cx="15" cy="12" r="1.5" fill="#2d1b4e" />
                <circle cx="25" cy="12" r="1.5" fill="#2d1b4e" />
                <path d="M17 17C17 17 20 20 23 17" stroke="#c8826e" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <rect x="8" y="28" width="24" height="45" rx="4" fill="#a855f7" />
                <rect x="8" y="28" width="24" height="18" rx="4" fill="url(#purpleShirt)" />
                <path d="M5 36L8 30" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
                <path d="M35 36L32 30" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" />
                {/* Raised fist */}
                <circle cx="36" cy="22" r="5" fill="#f8c4a0" />
                <rect x="34" y="18" width="4" height="3" rx="1" fill="#f8c4a0" />
                <rect x="10" y="73" width="8" height="22" rx="3" fill="#a855f7" />
                <rect x="22" y="73" width="8" height="22" rx="3" fill="#a855f7" />
                <ellipse cx="14" cy="95" rx="5" ry="3" fill="#7c3aed" />
                <ellipse cx="26" cy="95" rx="5" ry="3" fill="#7c3aed" />
            </g>

            {/* Woman 2 — Left (with shield) */}
            <g transform="translate(60, 70)">
                <circle cx="18" cy="10" r="12" fill="#d4956b" />
                <path d="M6 4C8-1 16-2 22 0C28 2 30 8 28 12C26 8 22 4 16 4C12 4 8 3 6 4Z" fill="#1a1040" />
                <circle cx="14" cy="10" r="1.2" fill="#1a1040" />
                <circle cx="22" cy="10" r="1.2" fill="#1a1040" />
                <path d="M15 14C15 14 18 16 21 14" stroke="#b8735c" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <rect x="6" y="24" width="24" height="38" rx="4" fill="#e855a0" />
                {/* Shield */}
                <g transform="translate(-12, 10)">
                    <path d="M6 0L12 3V10C12 16 6 20 6 20C6 20 0 16 0 10V3L6 0Z" fill="url(#shieldGrad)" opacity="0.9" />
                    <path d="M3.5 9L5.5 11L8.5 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </g>
                <rect x="8" y="62" width="7" height="18" rx="3" fill="#e855a0" />
                <rect x="21" y="62" width="7" height="18" rx="3" fill="#e855a0" />
                <ellipse cx="11" cy="80" rx="4" ry="2.5" fill="#c026a3" />
                <ellipse cx="25" cy="80" rx="4" ry="2.5" fill="#c026a3" />
            </g>

            {/* Woman 3 — Right (with megaphone) */}
            <g transform="translate(220, 70)">
                <circle cx="18" cy="10" r="12" fill="#f0d4b8" />
                <path d="M6 2C10-2 20-2 26 2C28 6 27 10 24 12C22 8 18 4 12 4C8 4 6 3 6 2Z" fill="#3d2060" />
                <circle cx="14" cy="10" r="1.2" fill="#3d2060" />
                <circle cx="22" cy="10" r="1.2" fill="#3d2060" />
                <path d="M15 14C15 14 18 16 21 14" stroke="#c0a080" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <rect x="6" y="24" width="24" height="38" rx="4" fill="#f5a623" />
                {/* Megaphone */}
                <g transform="translate(30, 8)">
                    <path d="M0 6L8 2V14L0 10V6Z" fill="#f472b6" />
                    <rect x="-3" y="5" width="4" height="6" rx="1" fill="#e855a0" />
                    <path d="M8 4L14 0V16L8 12" fill="#f472b6" opacity="0.7" />
                    {/* Sound waves */}
                    <path d="M16 4C18 5 18 11 16 12" stroke="#f472b6" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
                    <path d="M19 2C22 4 22 12 19 14" stroke="#f472b6" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
                </g>
                <rect x="8" y="62" width="7" height="18" rx="3" fill="#f5a623" />
                <rect x="21" y="62" width="7" height="18" rx="3" fill="#f5a623" />
                <ellipse cx="11" cy="80" rx="4" ry="2.5" fill="#d98e1c" />
                <ellipse cx="25" cy="80" rx="4" ry="2.5" fill="#d98e1c" />
            </g>

            {/* Sparkles */}
            <g opacity="0.6">
                <path d="M50 40L52 35L54 40L52 45Z" fill="#f472b6" />
                <path d="M270 30L272 25L274 30L272 35Z" fill="#a855f7" />
                <path d="M120 20L121 17L122 20L121 23Z" fill="#f5a623" />
                <path d="M200 180L202 175L204 180L202 185Z" fill="#e855a0" />
                <circle cx="90" cy="190" r="2" fill="#a855f7" opacity="0.5" />
                <circle cx="240" cy="185" r="2" fill="#f472b6" opacity="0.5" />
                <circle cx="160" cy="195" r="1.5" fill="#f5a623" opacity="0.4" />
            </g>

            {/* Hearts */}
            <g opacity="0.4">
                <path d="M80 25C80 22 84 20 86 23C88 20 92 22 92 25C92 30 86 34 86 34C86 34 80 30 80 25Z" fill="#e855a0" />
                <path d="M250 50C250 48 252 47 253 48.5C254 47 256 48 256 50C256 52.5 253 54 253 54C253 54 250 52.5 250 50Z" fill="#f472b6" />
            </g>

            {/* Gradient defs */}
            <defs>
                <radialGradient id="heroGlow" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="#e855a0" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <linearGradient id="purpleShirt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f472b6" />
                    <stop offset="100%" stopColor="#e855a0" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// ─── Floating Particles Background ──────────────────────────────────────────

function FloatingParticles() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <style>{`
                @keyframes float1 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(30px,-40px) rotate(180deg); } }
                @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-20px,30px); } }
                @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(15px,-25px) scale(1.2); } }
                .particle { position: absolute; border-radius: 50%; }
            `}</style>
            <div className="particle" style={{ width: 6, height: 6, background: '#e855a0', top: '15%', left: '10%', opacity: 0.3, animation: 'float1 8s ease-in-out infinite' }} />
            <div className="particle" style={{ width: 4, height: 4, background: '#a855f7', top: '25%', right: '15%', opacity: 0.25, animation: 'float2 10s ease-in-out infinite' }} />
            <div className="particle" style={{ width: 5, height: 5, background: '#f5a623', bottom: '30%', left: '20%', opacity: 0.2, animation: 'float3 12s ease-in-out infinite' }} />
            <div className="particle" style={{ width: 3, height: 3, background: '#f472b6', top: '60%', right: '25%', opacity: 0.3, animation: 'float1 9s ease-in-out infinite 2s' }} />
            <div className="particle" style={{ width: 8, height: 8, background: '#a855f7', bottom: '15%', right: '10%', opacity: 0.15, animation: 'float2 11s ease-in-out infinite 1s' }} />
            <div className="particle" style={{ width: 4, height: 4, background: '#e855a0', top: '40%', left: '80%', opacity: 0.2, animation: 'float3 7s ease-in-out infinite 3s' }} />
        </div>
    );
}

// ─── Role Cards Config ──────────────────────────────────────────────────────

const ROLE_OPTIONS: {
    role: UserRole;
    label: string;
    description: string;
    emoji: string;
    color: string;
    redirectTo: string;
}[] = [
        {
            role: 'employee',
            label: 'Employee',
            description: 'File complaints, trigger panic alerts, access safety resources',
            emoji: '👩‍💻',
            color: '#e855a0',
            redirectTo: '/employee',
        },
        {
            role: 'hr',
            label: 'HR Admin',
            description: 'Manage cases, view analytics, generate compliance reports',
            emoji: '👩‍💼',
            color: '#a855f7',
            redirectTo: '/hr',
        },
        {
            role: 'icc',
            label: 'ICC Member',
            description: 'Investigate assigned cases, review evidence & testimony',
            emoji: '⚖️',
            color: '#f5a623',
            redirectTo: '/icc',
        },
        {
            role: 'security',
            label: 'Security',
            description: 'Monitor live map, respond to emergency panic alerts',
            emoji: '🛡️',
            color: '#10b981',
            redirectTo: '/security',
        },
    ];

// ─── Login Page ─────────────────────────────────────────────────────────────

export default function LoginPage() {
    const router = useRouter();
    const { signInAsRole, user } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(false);

    // If already logged in, redirect
    if (user) {
        const roleRedirects: Record<UserRole, string> = {
            employee: '/employee',
            hr: '/hr',
            icc: '/icc',
            security: '/security',
        };
        router.push(roleRedirects[user.role]);
        return null;
    }

    const handleLogin = async (role: UserRole) => {
        setSelectedRole(role);
        setLoading(true);
        await new Promise((r) => setTimeout(r, 500));
        signInAsRole(role);
        const redirect = ROLE_OPTIONS.find((r) => r.role === role)?.redirectTo || '/employee';
        router.push(redirect);
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: 'var(--gradient-hero)' }}>
            <FloatingParticles />

            <div className="w-full max-w-3xl relative z-10 page-enter">
                {/* Hero Illustration */}
                <div className="mb-2" style={{ animation: 'float2 6s ease-in-out infinite' }}>
                    <HeroIllustration />
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-2 tracking-tight">
                        <span className="gradient-text">HearHer</span>
                    </h1>
                    <p className="text-lg md:text-xl font-light" style={{ color: '#a8a0c0' }}>
                        Every voice matters. Every woman deserves safety.
                    </p>
                    <p className="text-sm mt-2" style={{ color: '#6b6285' }}>
                        AI-Powered POSH Compliance & Workplace Safety Platform
                    </p>
                </div>

                {/* Role Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-2xl mx-auto">
                    {ROLE_OPTIONS.map((option) => {
                        const isSelected = selectedRole === option.role;
                        const isLoading = loading && isSelected;

                        return (
                            <button
                                key={option.role}
                                onClick={() => handleLogin(option.role)}
                                disabled={loading}
                                className="glass-card text-left group relative overflow-hidden transition-all duration-300"
                                style={{
                                    borderColor: isSelected ? option.color : undefined,
                                    boxShadow: isSelected ? `0 0 40px ${option.color}40` : undefined,
                                }}
                            >
                                {/* Hover glow */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{ background: `radial-gradient(circle at 30% 50%, ${option.color}10, transparent 70%)` }}
                                />

                                <div className="relative flex items-center gap-4">
                                    {/* Emoji Avatar */}
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                                        style={{ background: `${option.color}15`, border: `1px solid ${option.color}25` }}
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${option.color} transparent transparent transparent` }} />
                                        ) : (
                                            option.emoji
                                        )}
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-bold" style={{ color: '#f5f0ff' }}>{option.label}</h3>
                                            <ArrowRight
                                                size={16}
                                                className="opacity-30 group-hover:opacity-70 group-hover:translate-x-1 transition-all duration-300"
                                                style={{ color: option.color }}
                                            />
                                        </div>
                                        <p className="text-xs mt-1 leading-relaxed" style={{ color: '#8b82a8' }}>
                                            {option.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="text-center space-y-2">
                    <p className="text-xs" style={{ color: '#6b6285' }}>
                        ✨ Demo mode — pick a role to explore • No credentials needed
                    </p>
                    <p className="text-[10px]" style={{ color: '#4a4460' }}>
                        Built with 💜 for safer workplaces
                    </p>
                </div>
            </div>
        </main>
    );
}
