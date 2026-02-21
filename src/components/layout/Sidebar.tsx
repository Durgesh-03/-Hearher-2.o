'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/lib/database.types';
import {
    Home,
    FileText,
    AlertTriangle,
    Shield,
    Archive,
    BookOpen,
    LayoutDashboard,
    Briefcase,
    Users,
    Scale,
    BarChart3,
    FileBarChart,
    ClipboardList,
    GraduationCap,
    Map,
    ChevronDown,
    Menu,
    X,
    LogOut,
} from 'lucide-react';
import { useState } from 'react';

// ─── Navigation Config Per Role ─────────────────────────────────────────────

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const ICON_SIZE = 18;

const NAV_CONFIG: Record<UserRole, NavSection[]> = {
    employee: [
        {
            title: 'Main',
            items: [
                { label: 'Home', href: '/employee', icon: <Home size={ICON_SIZE} /> },
                { label: 'File Complaint', href: '/employee/complaints/new', icon: <FileText size={ICON_SIZE} /> },
                { label: 'My Cases', href: '/employee/complaints', icon: <Briefcase size={ICON_SIZE} /> },
                { label: 'Bystander Report', href: '/employee/complaints/bystander', icon: <Users size={ICON_SIZE} /> },
            ],
        },
        {
            title: 'Safety',
            items: [
                { label: 'Panic Button', href: '/employee/panic', icon: <AlertTriangle size={ICON_SIZE} /> },
                { label: 'Guardian Mode', href: '/employee/guardian', icon: <Shield size={ICON_SIZE} /> },
                { label: 'Evidence Vault', href: '/employee/evidence-vault', icon: <Archive size={ICON_SIZE} /> },
            ],
        },
        {
            title: 'Learn',
            items: [
                { label: 'Resources', href: '/employee/resources', icon: <BookOpen size={ICON_SIZE} /> },
            ],
        },
    ],
    hr: [
        {
            title: 'Dashboard',
            items: [
                { label: 'Overview', href: '/hr', icon: <LayoutDashboard size={ICON_SIZE} /> },
                { label: 'Cases', href: '/hr/cases', icon: <Briefcase size={ICON_SIZE} /> },
                { label: 'Users', href: '/hr/users', icon: <Users size={ICON_SIZE} /> },
            ],
        },
        {
            title: 'Management',
            items: [
                { label: 'ICC Committee', href: '/hr/icc', icon: <Scale size={ICON_SIZE} /> },
                { label: 'Pulse Surveys', href: '/hr/pulse', icon: <ClipboardList size={ICON_SIZE} /> },
                { label: 'Training', href: '/hr/training', icon: <GraduationCap size={ICON_SIZE} /> },
            ],
        },
        {
            title: 'Reports',
            items: [
                { label: 'Analytics', href: '/hr/analytics', icon: <BarChart3 size={ICON_SIZE} /> },
                { label: 'Annual Report', href: '/hr/reports', icon: <FileBarChart size={ICON_SIZE} /> },
            ],
        },
    ],
    icc: [
        {
            title: 'Investigation',
            items: [
                { label: 'Assigned Cases', href: '/icc', icon: <Briefcase size={ICON_SIZE} /> },
            ],
        },
    ],
    security: [
        {
            title: 'Command Center',
            items: [
                { label: 'Live Map & Alerts', href: '/security', icon: <Map size={ICON_SIZE} /> },
            ],
        },
    ],
};

// ─── Role Display Config ────────────────────────────────────────────────────

const ROLE_DISPLAY: Record<UserRole, { label: string; color: string; emoji: string }> = {
    employee: { label: 'Employee', color: '#e855a0', emoji: '👩‍💻' },
    hr: { label: 'HR Admin', color: '#a855f7', emoji: '👩‍💼' },
    icc: { label: 'ICC Member', color: '#f5a623', emoji: '⚖️' },
    security: { label: 'Security', color: '#10b981', emoji: '🛡️' },
};

const ALL_ROLES: UserRole[] = ['employee', 'hr', 'icc', 'security'];

// ─── Sidebar Component ──────────────────────────────────────────────────────

export default function Sidebar() {
    const pathname = usePathname();
    const { user, switchRole, signOut } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

    const currentRole = user?.role || 'employee';
    const sections = NAV_CONFIG[currentRole];
    const roleInfo = ROLE_DISPLAY[currentRole];

    const isActive = (href: string) => {
        if (href === `/${currentRole}` || href === '/icc' || href === '/security') {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 mb-2">
                <span className="text-2xl">💜</span>
                <span className="text-lg font-bold gradient-text">HearHer</span>
            </div>

            {/* Role Badge */}
            <div className="mx-3 mb-4 px-3 py-2 rounded-xl" style={{ background: `${roleInfo.color}15`, border: `1px solid ${roleInfo.color}30` }}>
                <div className="flex items-center gap-2">
                    <span>{roleInfo.emoji}</span>
                    <span className="text-sm font-semibold" style={{ color: roleInfo.color }}>{roleInfo.label}</span>
                </div>
                {user && <div className="text-xs text-slate-500 mt-0.5 ml-6">{user.name}</div>}
            </div>

            {/* Nav Sections */}
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {sections.map((section) => (
                    <div key={section.title}>
                        <div className="nav-section-title">{section.title}</div>
                        {section.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-item ${isActive(item.href) ? 'nav-item-active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Footer — Role Switcher (Demo) + Sign Out */}
            <div className="px-3 pb-4 mt-auto border-t border-white/[0.06] pt-3">
                {/* Role Switcher */}
                <div className="relative">
                    <button
                        onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                        className="nav-item w-full justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <span>{roleInfo.emoji}</span>
                            <span className="text-xs">Switch Role</span>
                        </div>
                        <ChevronDown size={14} className={`transition-transform ${roleSwitcherOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {roleSwitcherOpen && (
                        <div className="absolute bottom-full left-0 right-0 mb-1 glass-card p-2 space-y-0.5" style={{ animation: 'scaleIn 0.15s ease-out' }}>
                            {ALL_ROLES.map((role) => (
                                <button
                                    key={role}
                                    onClick={() => {
                                        switchRole(role);
                                        setRoleSwitcherOpen(false);
                                        setMobileOpen(false);
                                    }}
                                    className={`nav-item w-full ${currentRole === role ? 'nav-item-active' : ''}`}
                                >
                                    <span>{ROLE_DISPLAY[role].emoji}</span>
                                    <span>{ROLE_DISPLAY[role].label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sign Out */}
                <button onClick={signOut} className="nav-item w-full text-red-400 hover:text-red-300 mt-1">
                    <LogOut size={ICON_SIZE} />
                    <span>Sign Out</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="glass-sidebar w-64 hidden md:flex flex-col h-screen sticky top-0">
                {sidebarContent}
            </aside>

            {/* Mobile Menu Button */}
            <button
                className="show-mobile-only fixed top-4 left-4 z-50 btn-icon"
                onClick={() => setMobileOpen(true)}
            >
                <Menu size={22} />
            </button>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <>
                    <div className="drawer-overlay" onClick={() => setMobileOpen(false)} />
                    <div className="drawer flex flex-col">
                        <button
                            className="absolute top-4 right-4 btn-icon"
                            onClick={() => setMobileOpen(false)}
                        >
                            <X size={20} />
                        </button>
                        {sidebarContent}
                    </div>
                </>
            )}
        </>
    );
}
