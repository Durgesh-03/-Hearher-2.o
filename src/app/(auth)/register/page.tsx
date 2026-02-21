'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/lib/database.types';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
    { value: 'employee', label: 'Employee' },
    { value: 'hr', label: 'HR Administrator' },
    { value: 'icc', label: 'ICC Committee Member' },
    { value: 'security', label: 'Security Personnel' },
];

export default function RegisterPage() {
    const router = useRouter();
    const { signInAsRole } = useAuth();
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<UserRole>('employee');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise((r) => setTimeout(r, 800));

        // Demo mode: just sign in as selected role
        signInAsRole(role);

        const redirects: Record<UserRole, string> = {
            employee: '/employee',
            hr: '/hr',
            icc: '/icc',
            security: '/security',
        };
        router.push(redirects[role]);
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
            <div className="w-full max-w-md page-enter">
                {/* Back Link */}
                <Link href="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors">
                    <ArrowLeft size={16} />
                    <span>Back to login</span>
                </Link>

                <div className="glass-card">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
                            <Sparkles size={12} />
                            <span>Create Account</span>
                        </div>
                        <h1 className="text-2xl font-bold">
                            Join <span className="gradient-text">HearHer</span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Set up your organization profile</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" placeholder="Priya Sharma" className="glass-input" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" placeholder="priya@organization.com" className="glass-input" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Organization</label>
                            <input type="text" placeholder="Your company name" className="glass-input" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select
                                className="glass-select"
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                            >
                                {ROLE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input type="password" placeholder="••••••••" className="glass-input" />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <p className="text-slate-600 text-xs">
                            Demo mode — picks a preset user for the selected role
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
