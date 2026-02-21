'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getICCMembers } from '@/lib/data-service';
import type { ICCMember } from '@/lib/database.types';
import { Shield, UserPlus, Crown, User, ExternalLink } from 'lucide-react';

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    presiding: { label: 'Presiding Officer', color: '#f5a623', icon: <Crown size={16} /> },
    member: { label: 'Internal Member', color: '#a855f7', icon: <User size={16} /> },
    external: { label: 'External Member', color: '#10b981', icon: <ExternalLink size={16} /> },
};

export default function ICCManagementPage() {
    const { user } = useAuth();
    const [members, setMembers] = useState<ICCMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getICCMembers(user?.org_id || 'demo-org-001').then((data) => {
            setMembers(data);
            setLoading(false);
        });
    }, [user]);

    return (
        <div className="page-enter max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#a855f715' }}>
                        <Shield size={20} className="text-[#a855f7]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">ICC Committee</h1>
                        <p className="text-xs text-slate-400">Manage Internal Complaints Committee members</p>
                    </div>
                </div>
                <button className="btn-primary text-sm flex items-center gap-1">
                    <UserPlus size={14} /> Add Member
                </button>
            </div>

            <div className="rounded-xl p-4 mb-6" style={{ background: '#f5a62310', border: '1px solid #f5a62320' }}>
                <p className="text-xs text-[#e8d0a0]">
                    ⚖️ <strong>POSH Act Requirement:</strong> The ICC must have a minimum of 4 members — a presiding woman officer,
                    2 internal members committed to women&apos;s causes, and 1 external member from an NGO or legal background.
                </p>
            </div>

            {loading ? (
                <div className="glass-card text-center py-10">
                    <p className="text-2xl mb-2 animate-pulse">⏳</p>
                    <p className="text-slate-400 text-sm">Loading ICC members...</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {members.map((m) => {
                        const role = ROLE_CONFIG[m.role] || ROLE_CONFIG.member;
                        return (
                            <div key={m.id} className="glass-card flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${role.color}15` }}>
                                    <span style={{ color: role.color }}>{role.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{m.user_id}</p>
                                    <p className="text-xs text-slate-500">{role.label} • Appointed {new Date(m.appointed_at).toLocaleDateString()}</p>
                                </div>
                                <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: `${role.color}15`, color: role.color }}>
                                    {m.role}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="glass-card mt-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">✅ Compliance Check</h3>
                <div className="space-y-2">
                    {[
                        { check: 'Presiding woman officer', met: members.some((m) => m.role === 'presiding') },
                        { check: 'At least 2 internal members', met: members.filter((m) => m.role === 'member').length >= 2 },
                        { check: 'At least 1 external member', met: members.some((m) => m.role === 'external') },
                        { check: 'Minimum 4 total members', met: members.length >= 4 },
                    ].map((c) => (
                        <div key={c.check} className="flex items-center gap-2 text-sm">
                            <span>{c.met ? '✅' : '❌'}</span>
                            <span className={c.met ? 'text-slate-300' : 'text-red-400'}>{c.check}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
