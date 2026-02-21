'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data';

export default function TopBar({ title }: { title?: string }) {
    const { user } = useAuth();
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const notifRef = useRef<HTMLDivElement>(null);

    // Filter notifications for current user
    const userNotifs = user
        ? MOCK_NOTIFICATIONS.filter((n) => n.user_id === user.id)
        : [];
    const unreadCount = userNotifs.filter((n) => !n.read).length;

    // Close notification panel on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const getInitials = (name: string) =>
        name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

    const notifTypeColors: Record<string, string> = {
        alert: '#ef4444',
        warning: '#f59e0b',
        info: '#06b6d4',
        success: '#10b981',
    };

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className="topbar">
            {/* Left — Page Title */}
            <div className="flex items-center gap-4">
                {title && (
                    <h1 className="text-lg font-semibold text-slate-100 hide-mobile">{title}</h1>
                )}
            </div>

            {/* Center — Search */}
            <div className="hide-mobile">
                <input
                    type="text"
                    placeholder="Search cases, users..."
                    className="topbar-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Right — Notifications + Avatar */}
            <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <div ref={notifRef} className="relative">
                    <button
                        className="notification-bell"
                        onClick={() => setNotifOpen(!notifOpen)}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {notifOpen && (
                        <div
                            className="absolute right-0 top-full mt-2 w-80 glass-card p-0 overflow-hidden"
                            style={{ animation: 'scaleIn 0.15s ease-out' }}
                        >
                            <div className="px-4 py-3 border-b border-white/[0.06]">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sm">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="badge badge-info text-[10px]">{unreadCount} new</span>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-80 overflow-y-auto">
                                {userNotifs.length === 0 ? (
                                    <div className="empty-state py-8">
                                        <div className="empty-state-icon">🔔</div>
                                        <div className="empty-state-title text-sm">No notifications</div>
                                    </div>
                                ) : (
                                    userNotifs.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors ${!notif.read ? 'bg-white/[0.02]' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div
                                                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                                                    style={{ background: notifTypeColors[notif.type] || '#64748b' }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-slate-200 truncate">
                                                        {notif.title}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                        {notif.message}
                                                    </div>
                                                    <div className="text-[10px] text-slate-600 mt-1">
                                                        {timeAgo(notif.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Avatar */}
                {user && (
                    <div className="flex items-center gap-2.5 cursor-pointer">
                        <div className="avatar avatar-sm">
                            {getInitials(user.name)}
                        </div>
                        <div className="hide-mobile">
                            <div className="text-sm font-medium text-slate-200 leading-tight">{user.name}</div>
                            <div className="text-[11px] text-slate-500 leading-tight">{user.department}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
