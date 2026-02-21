'use client';

import { useState } from 'react';
import { Users, Search, Shield, UserPlus } from 'lucide-react';

interface OrgUser {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    status: string;
    joinedAt: string;
}

const MOCK_USERS: OrgUser[] = [
    { id: 'u-1', name: 'Priya Sharma', email: 'priya@acmecorp.in', role: 'employee', department: 'Engineering', status: 'active', joinedAt: '2024-06-15' },
    { id: 'u-2', name: 'Anjali Mehta', email: 'hr@acmecorp.in', role: 'hr', department: 'Human Resources', status: 'active', joinedAt: '2023-03-01' },
    { id: 'u-3', name: 'Justice Raman', email: 'icc@acmecorp.in', role: 'icc', department: 'Legal', status: 'active', joinedAt: '2023-06-01' },
    { id: 'u-4', name: 'Rajesh Kumar', email: 'security@acmecorp.in', role: 'security', department: 'Security', status: 'active', joinedAt: '2024-01-10' },
    { id: 'u-5', name: 'Sneha Reddy', email: 'sneha@acmecorp.in', role: 'employee', department: 'Marketing', status: 'active', joinedAt: '2024-08-20' },
    { id: 'u-6', name: 'Arjun Patel', email: 'arjun@acmecorp.in', role: 'employee', department: 'Sales', status: 'active', joinedAt: '2024-04-12' },
    { id: 'u-7', name: 'Kavitha Nair', email: 'kavitha@acmecorp.in', role: 'icc', department: 'Operations', status: 'active', joinedAt: '2023-09-15' },
    { id: 'u-8', name: 'Deepa Joshi', email: 'deepa@acmecorp.in', role: 'employee', department: 'Engineering', status: 'inactive', joinedAt: '2023-01-05' },
];

const ROLE_COLORS: Record<string, string> = {
    employee: '#3b82f6',
    hr: '#e855a0',
    icc: '#a855f7',
    security: '#f5a623',
};

export default function UserManagementPage() {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const filtered = MOCK_USERS.filter((u) => {
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
        }
        return true;
    });

    const counts = {
        all: MOCK_USERS.length,
        employee: MOCK_USERS.filter((u) => u.role === 'employee').length,
        hr: MOCK_USERS.filter((u) => u.role === 'hr').length,
        icc: MOCK_USERS.filter((u) => u.role === 'icc').length,
        security: MOCK_USERS.filter((u) => u.role === 'security').length,
    };

    return (
        <div className="page-enter max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#a855f715' }}>
                        <Users size={20} className="text-[#a855f7]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">User Management</h1>
                        <p className="text-xs text-slate-400">Manage organization users and roles</p>
                    </div>
                </div>
                <button className="btn-primary text-sm flex items-center gap-1">
                    <UserPlus size={14} /> Add User
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {(['all', 'employee', 'hr', 'icc', 'security'] as const).map((r) => (
                    <button
                        key={r}
                        onClick={() => setRoleFilter(r)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                        style={{
                            background: roleFilter === r ? '#e855a018' : 'rgba(255,255,255,0.04)',
                            color: roleFilter === r ? '#e855a0' : '#8b82a8',
                            border: `1px solid ${roleFilter === r ? '#e855a030' : 'rgba(255,255,255,0.08)'}`,
                        }}
                    >
                        {r === 'all' ? 'All' : r.toUpperCase()} ({counts[r]})
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    className="w-full bg-[#0d0a1a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#e855a0] outline-none transition-all"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* User List */}
            <div className="space-y-2">
                {filtered.map((u) => (
                    <div key={u.id} className="glass-card flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: `${ROLE_COLORS[u.role] || '#64748b'}20`, color: ROLE_COLORS[u.role] || '#64748b' }}>
                            {u.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{u.name}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span>{u.email}</span>
                                <span>📁 {u.department}</span>
                            </div>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize" style={{ background: `${ROLE_COLORS[u.role]}15`, color: ROLE_COLORS[u.role] }}>
                            {u.role}
                        </span>
                        <span className={`text-xs ${u.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {u.status === 'active' ? '🟢' : '⚫'} {u.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
