'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Shield, Zap, Brain, Lock, ArrowRight, ChevronDown, Star, Building2, Users } from 'lucide-react';

// ─── Animated Counter ──────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const start = Date.now();
                    const tick = () => {
                        const elapsed = Date.now() - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                        setCount(Math.floor(eased * target));
                        if (progress < 1) requestAnimationFrame(tick);
                    };
                    tick();
                }
            },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
}

// ─── SVG Illustration ──────────────────────────────────────────────────────

function HeroIllustration() {
    return (
        <svg width="280" height="200" viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="140" cy="100" r="80" fill="url(#landingGlow)" opacity="0.12" />
            <g transform="translate(55, 45)">
                <circle cx="16" cy="10" r="11" fill="#d4956b" />
                <path d="M5 4C8-1 14-1 20 1C24 4 24 10 22 12C20 8 16 4 12 4C8 4 6 3 5 4Z" fill="#1a1040" />
                <circle cx="12" cy="10" r="1.2" fill="#1a1040" /><circle cx="20" cy="10" r="1.2" fill="#1a1040" />
                <path d="M13 14C14 15 18 15 19 14" stroke="#b87050" strokeWidth="1" strokeLinecap="round" fill="none" />
                <rect x="5" y="22" width="22" height="35" rx="4" fill="#e855a0" />
                <path d="M27 32L38 28" stroke="#f8c4a0" strokeWidth="3" strokeLinecap="round" />
                <rect x="7" y="57" width="7" height="16" rx="3" fill="#c026a3" />
                <rect x="18" y="57" width="7" height="16" rx="3" fill="#c026a3" />
            </g>
            <g transform="translate(120, 30)">
                <circle cx="20" cy="12" r="13" fill="#f8c4a0" />
                <path d="M8 4C12-1 20-2 26 1C30 5 30 12 27 14C24 10 20 5 14 5C10 5 8 4 8 4Z" fill="#2d1b4e" />
                <circle cx="15" cy="12" r="1.4" fill="#2d1b4e" /><circle cx="25" cy="12" r="1.4" fill="#2d1b4e" />
                <path d="M17 17C18 19 22 19 23 17" stroke="#c8826e" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <rect x="8" y="27" width="24" height="42" rx="4" fill="#a855f7" />
                <path d="M4 20L8 27" stroke="#f8c4a0" strokeWidth="3" strokeLinecap="round" />
                <path d="M36 20L32 27" stroke="#f8c4a0" strokeWidth="3" strokeLinecap="round" />
                <circle cx="4" cy="17" r="4" fill="#f8c4a0" /><circle cx="36" cy="17" r="4" fill="#f8c4a0" />
                <rect x="10" y="69" width="8" height="18" rx="3" fill="#7c3aed" />
                <rect x="22" y="69" width="8" height="18" rx="3" fill="#7c3aed" />
            </g>
            <g transform="translate(195, 45)">
                <circle cx="16" cy="10" r="11" fill="#f0d4b8" />
                <path d="M5 3C8-1 16-1 22 2C26 6 24 12 22 12C20 8 16 4 12 4C8 4 6 3 5 3Z" fill="#3d2060" />
                <circle cx="12" cy="10" r="1.2" fill="#3d2060" /><circle cx="20" cy="10" r="1.2" fill="#3d2060" />
                <path d="M13 14C14 15 18 15 19 14" stroke="#c0a080" strokeWidth="1" strokeLinecap="round" fill="none" />
                <rect x="5" y="22" width="22" height="35" rx="4" fill="#f5a623" />
                <path d="M5 32L-6 28" stroke="#f0d4b8" strokeWidth="3" strokeLinecap="round" />
                <rect x="7" y="57" width="7" height="16" rx="3" fill="#d98e1c" />
                <rect x="18" y="57" width="7" height="16" rx="3" fill="#d98e1c" />
            </g>
            <path d="M93 73L116 65" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" opacity="0.5" />
            <path d="M189 73L168 65" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" opacity="0.5" />
            <path d="M140 5C140 2 143 0 145 3C147 0 150 2 150 5C150 9 145 12 145 12C145 12 140 9 140 5Z" fill="#e855a0" opacity="0.5" />
            <path d="M40 25L42 20L44 25L42 30Z" fill="#a855f7" opacity="0.4" />
            <path d="M240 20L242 16L244 20L242 24Z" fill="#f5a623" opacity="0.4" />
            <defs><radialGradient id="landingGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="transparent" /></radialGradient></defs>
        </svg>
    );
}

// ─── Data ───────────────────────────────────────────────────────────────────

const stats = [
    { value: '78%', label: 'Women face workplace issues silently', color: '#e855a0' },
    { value: '10x', label: 'Faster resolution with AI analysis', color: '#a855f7' },
    { value: '100%', label: 'Anonymous & POSH Act compliant', color: '#f5a623' },
];

const features = [
    { icon: <Lock size={24} />, title: 'Anonymous Complaints', desc: 'File safely without fear of retaliation. Your identity stays hidden from the accused.', color: '#e855a0' },
    { icon: <Zap size={24} />, title: 'Panic Button & Guardian', desc: 'Instant SOS with live GPS to security. Auto-escalation on missed check-ins.', color: '#ef4444' },
    { icon: <Brain size={24} />, title: 'AI Case Analysis', desc: 'Gemini-powered severity scoring, credibility assessment, and pattern detection.', color: '#a855f7' },
    { icon: <Shield size={24} />, title: 'ICC Investigation Suite', desc: '6-tab investigation view with side-by-side comparison and AI credibility scoring.', color: '#10b981' },
    { icon: <Building2 size={24} />, title: 'HR Command Center', desc: 'Real-time dashboards, compliance tracking, pulse surveys, and annual reports.', color: '#3b82f6' },
    { icon: <Star size={24} />, title: 'Public Safety Ratings', desc: 'Organizational transparency scores. Like a credit score for workplace safety.', color: '#f5a623' },
];

const howItWorks = [
    { step: '01', title: 'Report Safely', desc: 'File a complaint anonymously through our guided wizard. AI analyzes severity in real-time.', emoji: '📋' },
    { step: '02', title: 'AI Analysis', desc: 'Gemini AI assesses sentiment, risk level, and categorizes the complaint automatically.', emoji: '🤖' },
    { step: '03', title: 'ICC Investigation', desc: 'The Internal Complaints Committee reviews with AI credibility scoring and both-sides comparison.', emoji: '⚖️' },
    { step: '04', title: 'Resolution & Justice', desc: 'Verdict and recommendations within 90 days. Complete audit trail for legal compliance.', emoji: '✅' },
];

const techStack = [
    { name: 'Next.js 15', desc: 'App Router + SSR', icon: '⚡' },
    { name: 'Gemini AI', desc: 'Legal reasoning', icon: '🧠' },
    { name: 'Groq LLaMA 3', desc: 'Real-time streaming', icon: '🚀' },
    { name: 'Supabase', desc: 'PostgreSQL + RLS', icon: '🔐' },
    { name: 'pgvector', desc: 'RAG embeddings', icon: '🎯' },
    { name: 'TypeScript', desc: 'Type-safe codebase', icon: '📘' },
];

const testimonials = [
    { quote: "I filed anonymously and the ICC resolved it in 3 weeks. I never thought the system would actually work.", name: 'Anonymous Employee', role: 'Tech Company, Bengaluru', rating: 5 },
    { quote: "The AI analysis helped our ICC make better-informed decisions. The credibility scoring is groundbreaking.", name: 'Anjali Mehta', role: 'HR Director', rating: 5 },
    { quote: "Guardian mode saved me when I was working late. The auto-escalation alerted security when I missed my check-in.", name: 'Anonymous Employee', role: 'Engineering Team', rating: 5 },
];

// ─── Landing Page ───────────────────────────────────────────────────────────

export default function LandingPage() {
    return (
        <main className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>
            <style>{`
                @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-20px,30px); } }
                @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(15px,-25px) scale(1.2); } }
                @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                .fade-up { animation: fadeUp 0.8s ease-out forwards; }
                .delay-1 { animation-delay: 0.1s; opacity: 0; }
                .delay-2 { animation-delay: 0.3s; opacity: 0; }
                .delay-3 { animation-delay: 0.5s; opacity: 0; }
                .delay-4 { animation-delay: 0.7s; opacity: 0; }
                .shimmer-text {
                    background: linear-gradient(90deg, #e855a0, #a855f7, #f5a623, #e855a0);
                    background-size: 200%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmer 4s linear infinite;
                }
            `}</style>

            {/* ─── Navbar ──────────────────────────────────────────────────── */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-md" style={{ background: 'rgba(10,8,20,0.7)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">💜</span>
                        <span className="font-bold text-lg text-white">HearHer</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-xs text-slate-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
                        <a href="#tech" className="hover:text-white transition-colors">Technology</a>
                        <a href="#sdgs" className="hover:text-white transition-colors">SDGs</a>
                        <Link href="/ratings" className="hover:text-white transition-colors">Ratings</Link>
                    </div>
                    <Link href="/login" className="text-xs px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #e855a0, #a855f7)', color: '#fff' }}>
                        Launch App
                    </Link>
                </div>
            </nav>

            {/* ─── Hero ──────────────────────────────────────────────────── */}
            <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden pt-16">
                <div className="absolute w-64 h-64 rounded-full blur-3xl" style={{ background: '#e855a020', top: '10%', left: '10%', animation: 'float2 8s ease-in-out infinite' }} />
                <div className="absolute w-48 h-48 rounded-full blur-3xl" style={{ background: '#a855f715', bottom: '20%', right: '15%', animation: 'float3 10s ease-in-out infinite' }} />

                <div className="relative z-10 max-w-3xl">
                    <div className="fade-up"><HeroIllustration /></div>

                    <div className="fade-up delay-1">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ background: '#e855a015', border: '1px solid #e855a025', color: '#f472b6' }}>
                            <span className="text-sm">✨</span>
                            <span className="text-xs font-medium">AI-Powered POSH Compliance Platform</span>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight fade-up delay-2">
                        <span className="shimmer-text">HearHer</span>
                    </h1>

                    <p className="text-xl md:text-2xl font-light mb-3 fade-up delay-2" style={{ color: '#c4b8e0' }}>
                        Because every woman deserves a <strong style={{ color: '#e855a0' }}>safe workplace</strong>
                    </p>

                    <p className="text-sm mb-8 max-w-md mx-auto fade-up delay-3" style={{ color: '#6b6285' }}>
                        Anonymous complaint filing, panic alerts, AI-powered case analysis, and guardian mode — all in one platform.
                    </p>

                    <div className="flex gap-4 justify-center fade-up delay-4">
                        <Link href="/login" className="group px-8 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #e855a0, #a855f7)', boxShadow: '0 4px 20px rgba(232, 85, 160, 0.3)' }}>
                            Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/ratings" className="px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.25)', color: '#c4b8e0' }}>
                            View Ratings
                        </Link>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="mt-16 flex flex-wrap gap-6 justify-center fade-up delay-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center px-6">
                            <div className="text-3xl font-extrabold" style={{ color: stat.color }}>{stat.value}</div>
                            <div className="text-xs mt-1 max-w-[160px]" style={{ color: '#8b82a8' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                <a href="#features" className="mt-12 text-slate-500 animate-bounce"><ChevronDown size={24} /></a>
            </section>

            {/* ─── Features ──────────────────────────────────────────────── */}
            <section id="features" className="py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-2 text-white">
                        Everything she needs to feel <span style={{ color: '#e855a0' }}>safe</span>
                    </h2>
                    <p className="text-center mb-14 text-sm" style={{ color: '#6b6285' }}>
                        End-to-end safety infrastructure — from emergency response to legal compliance
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map((f) => (
                            <div key={f.title} className="glass-card group hover:border-white/10 hover:scale-[1.02] transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110" style={{ background: `${f.color}12`, color: f.color }}>
                                    {f.icon}
                                </div>
                                <h3 className="text-sm font-bold mb-1 text-white">{f.title}</h3>
                                <p className="text-xs leading-relaxed" style={{ color: '#8b82a8' }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── How It Works ──────────────────────────────────────────── */}
            <section id="how-it-works" className="py-24 px-4" style={{ background: 'rgba(168,85,247,0.03)' }}>
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-2 text-white">
                        How <span style={{ color: '#a855f7' }}>HearHer</span> works
                    </h2>
                    <p className="text-center mb-14 text-sm" style={{ color: '#6b6285' }}>
                        From report to resolution — every step is tracked, secure, and AI-assisted
                    </p>

                    <div className="space-y-6">
                        {howItWorks.map((item, i) => (
                            <div key={item.step} className="flex gap-6 items-start group">
                                <div className="flex flex-col items-center">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110" style={{ background: 'linear-gradient(135deg, #e855a015, #a855f710)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        {item.emoji}
                                    </div>
                                    {i < howItWorks.length - 1 && (
                                        <div className="w-0.5 h-8 mt-2" style={{ background: 'linear-gradient(to bottom, #a855f730, transparent)' }} />
                                    )}
                                </div>
                                <div className="pt-2 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#a855f715', color: '#a855f7' }}>Step {item.step}</span>
                                        <h3 className="font-bold text-white">{item.title}</h3>
                                    </div>
                                    <p className="text-xs leading-relaxed" style={{ color: '#8b82a8' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Impact Numbers ─────────────────────────────────────────── */}
            <section className="py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-14 text-white">
                        Built for <span style={{ color: '#f5a623' }}>real impact</span>
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { target: 450, suffix: 'M+', label: 'Working women in India', color: '#e855a0' },
                            { target: 17, suffix: '', label: 'Database tables with RLS', color: '#a855f7' },
                            { target: 7, suffix: '', label: 'AI-powered API routes', color: '#3b82f6' },
                            { target: 90, suffix: '%', label: 'Cases go unreported', color: '#ef4444' },
                        ].map((item) => (
                            <div key={item.label} className="glass-card text-center !p-6">
                                <p className="text-3xl md:text-4xl font-extrabold mb-1" style={{ color: item.color }}>
                                    <AnimatedCounter target={item.target} suffix={item.suffix} />
                                </p>
                                <p className="text-[10px] text-slate-500">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Tech Stack ─────────────────────────────────────────────── */}
            <section id="tech" className="py-24 px-4" style={{ background: 'rgba(232,85,160,0.02)' }}>
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-2 text-white">
                        Powered by <span className="shimmer-text">cutting-edge tech</span>
                    </h2>
                    <p className="text-sm mb-12" style={{ color: '#6b6285' }}>
                        Enterprise-grade stack built for security, speed, and intelligence
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {techStack.map((t) => (
                            <div key={t.name} className="glass-card !p-4 hover:scale-[1.03] transition-all duration-300 group">
                                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">{t.icon}</span>
                                <p className="text-sm font-semibold text-white">{t.name}</p>
                                <p className="text-[10px] text-slate-500">{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── UN SDGs ──────────────────────────────────────────────── */}
            <section id="sdgs" className="py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-4">
                        <span className="text-xs px-3 py-1 rounded-full font-medium inline-flex items-center gap-1.5" style={{ background: '#00689d15', border: '1px solid #00689d25', color: '#4da6db' }}>
                            🌍 United Nations Sustainable Development Goals
                        </span>
                    </div>
                    <h2 className="text-3xl font-bold text-center mb-2 text-white">
                        Aligned with <span style={{ color: '#4da6db' }}>Global Goals</span>
                    </h2>
                    <p className="text-center mb-14 text-sm max-w-lg mx-auto" style={{ color: '#6b6285' }}>
                        HearHer directly contributes to 5 UN Sustainable Development Goals, driving measurable impact for workplace safety and gender equality
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        {[
                            { num: 3, title: 'Good Health & Well-Being', color: '#4c9f38', desc: 'Protecting mental health through safe reporting, counseling referrals, and reducing workplace trauma' },
                            { num: 5, title: 'Gender Equality', color: '#ff3a21', desc: 'Empowering women with anonymous complaint filing, AI-backed investigation, and zero-tolerance enforcement' },
                            { num: 8, title: 'Decent Work & Economic Growth', color: '#a21942', desc: 'Creating safe workplaces where talent can thrive without fear of harassment or discrimination' },
                            { num: 10, title: 'Reduced Inequalities', color: '#dd1367', desc: 'Ensuring equal protection for all employees regardless of position, with public transparency scores' },
                            { num: 16, title: 'Peace, Justice & Strong Institutions', color: '#00689d', desc: 'Strengthening ICC compliance, POSH Act enforcement, and institutional accountability through AI' },
                        ].map((sdg) => (
                            <div key={sdg.num} className="group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03]" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                                {/* SDG Color Bar */}
                                <div className="h-2" style={{ background: sdg.color }} />
                                <div className="p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm text-white" style={{ background: sdg.color }}>
                                            {sdg.num}
                                        </div>
                                    </div>
                                    <h3 className="text-xs font-bold text-white mb-1.5 leading-tight">{sdg.title}</h3>
                                    <p className="text-[10px] leading-relaxed" style={{ color: '#8b82a8' }}>{sdg.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* SDG Impact Summary */}
                    <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, #00689d08, #ff3a2108)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            <strong className="text-white">Our Commitment:</strong> Every feature in HearHer is designed with the 2030 Agenda in mind — from AI-powered case analysis (SDG 16) to anonymous reporting that protects survivors (SDG 5). We measure our impact through resolution rates, training completion, and organizational safety scores.
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── Testimonials ──────────────────────────────────────────── */}
            <section className="py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-14 text-white">
                        What people are <span style={{ color: '#10b981' }}>saying</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {testimonials.map((t, i) => (
                            <div key={i} className="glass-card hover:scale-[1.02] transition-all duration-300">
                                <div className="flex gap-0.5 mb-3">
                                    {Array.from({ length: t.rating }).map((_, j) => (
                                        <Star key={j} size={14} fill="#f5a623" color="#f5a623" />
                                    ))}
                                </div>
                                <p className="text-xs leading-relaxed mb-4 italic" style={{ color: '#c4b8e0' }}>
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#a855f715', color: '#a855f7' }}>
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-300">{t.name}</p>
                                        <p className="text-[10px] text-slate-500">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA ──────────────────────────────────────────────────── */}
            <section className="py-20 px-4 text-center">
                <div className="max-w-lg mx-auto rounded-2xl p-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e855a010, #a855f708)', border: '1px solid #e855a020' }}>
                    <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 50% 50%, #e855a0, transparent 70%)' }} />
                    <div className="relative z-10">
                        <div className="text-5xl mb-4">💜</div>
                        <h2 className="text-2xl font-bold mb-2 text-white">Make your workplace safer</h2>
                        <p className="text-sm mb-6" style={{ color: '#8b82a8' }}>
                            Join organizations building trust and transparency. Every report matters.
                        </p>
                        <Link href="/login" className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105" style={{ background: 'linear-gradient(135deg, #e855a0, #a855f7)', boxShadow: '0 4px 25px rgba(232, 85, 160, 0.35)' }}>
                            Start Free Demo <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── Footer ──────────────────────────────────────────────── */}
            <footer className="py-8 px-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span>💜</span>
                        <span className="text-sm font-semibold text-white">HearHer</span>
                        <span className="text-xs text-slate-600 ml-2">© 2026</span>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500">
                        <Link href="/ratings" className="hover:text-white transition-colors">Safety Ratings</Link>
                        <Link href="/login" className="hover:text-white transition-colors">Login</Link>
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                    </div>
                    <p className="text-[10px] text-slate-600">Built with 💜 for safer workplaces</p>
                </div>
            </footer>
        </main>
    );
}
