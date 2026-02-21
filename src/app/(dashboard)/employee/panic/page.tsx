'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { createPanicAlert, resolvePanicAlert } from '@/lib/data-service';

// ─── States ─────────────────────────────────────────────────────────────────

type PanicState = 'idle' | 'countdown' | 'active' | 'resolved';

export default function PanicButtonPage() {
    const { user } = useAuth();
    const [state, setState] = useState<PanicState>('idle');
    const [countdown, setCountdown] = useState(5);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const alertIdRef = useRef<string | null>(null);

    // ─── Geolocation ────────────────────────────────────────────────────────

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setLocation({ lat: 12.9716, lng: 77.5946 }) // fallback
            );
        }
    }, []);

    // ─── Countdown Timer ────────────────────────────────────────────────────

    useEffect(() => {
        if (state !== 'countdown') return;
        if (countdown <= 0) {
            setState('active');
            return;
        }
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [state, countdown]);

    // When state goes active, create the alert in DB
    useEffect(() => {
        if (state !== 'active') return;
        const loc = location || { lat: 12.9716, lng: 77.5946 };
        createPanicAlert({
            userId: user?.id || 'demo-emp-001',
            orgId: user?.org_id || 'demo-org-001',
            latitude: loc.lat,
            longitude: loc.lng,
            source: 'panic',
        }).then((id) => {
            alertIdRef.current = id;
        });
    }, [state, location, user]);

    const triggerPanic = () => {
        setState('countdown');
        setCountdown(5);
    };

    const cancel = () => {
        setState('idle');
        setCountdown(5);
    };

    const resolve = async () => {
        if (alertIdRef.current) {
            await resolvePanicAlert(alertIdRef.current);
            alertIdRef.current = null;
        }
        setState('resolved');
        setTimeout(() => setState('idle'), 3000);
    };

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="page-enter flex flex-col items-center justify-center min-h-[70vh] text-center">
            <AnimatePresence mode="wait">
                {/* ── IDLE ──────────────────────────────────────────────────── */}
                {state === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-6">
                        <h1 className="text-2xl font-bold gradient-text">🚨 Panic Button</h1>
                        <p className="text-sm text-slate-400 max-w-sm">
                            Feeling unsafe? Tap the button below to send an immediate SOS alert to Security and your trusted contacts.
                        </p>

                        <button
                            onClick={triggerPanic}
                            className="w-44 h-44 rounded-full flex items-center justify-center text-6xl transition-all duration-300 hover:scale-110 active:scale-95"
                            style={{
                                background: 'radial-gradient(circle, #ef4444 0%, #b91c1c 100%)',
                                boxShadow: '0 0 60px rgba(239,68,68,0.4), 0 0 120px rgba(239,68,68,0.15)',
                                border: '4px solid rgba(239,68,68,0.3)',
                            }}
                        >
                            🆘
                        </button>

                        <p className="text-xs text-slate-500">You'll have 5 seconds to cancel after pressing</p>

                        {location && (
                            <p className="text-xs text-slate-600">
                                📍 Location ready: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                            </p>
                        )}
                    </motion.div>
                )}

                {/* ── COUNTDOWN ─────────────────────────────────────────────── */}
                {state === 'countdown' && (
                    <motion.div key="countdown" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
                        <h2 className="text-xl font-bold text-red-400">⚠️ Sending SOS in...</h2>

                        <div
                            className="w-36 h-36 rounded-full flex items-center justify-center text-6xl font-bold animate-pulse"
                            style={{
                                background: 'radial-gradient(circle, #ef444430, #b91c1c10)',
                                border: '3px solid #ef4444',
                                color: '#ef4444',
                            }}
                        >
                            {countdown}
                        </div>

                        <button onClick={cancel} className="btn-ghost text-sm border border-white/20 px-6">
                            ✕ Cancel
                        </button>
                    </motion.div>
                )}

                {/* ── ACTIVE ────────────────────────────────────────────────── */}
                {state === 'active' && (
                    <motion.div key="active" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl animate-pulse" style={{ background: '#ef444420', border: '2px solid #ef4444' }}>
                            🚨
                        </div>
                        <h2 className="text-xl font-bold text-red-400">SOS Alert Active!</h2>
                        <p className="text-sm text-slate-400 max-w-sm">
                            Your location has been shared with Security and your trusted contacts. Help is on the way.
                        </p>

                        <div className="glass-card p-4 w-full max-w-xs text-left space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Status:</span><span className="text-red-400 font-medium">🔴 Active</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Location:</span><span>{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Fetching...'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Notified:</span><span className="text-emerald-400">Security Team ✓</span></div>
                        </div>

                        <button onClick={resolve} className="btn-primary text-sm px-6" style={{ background: '#10b981' }}>
                            ✓ I'm Safe — Resolve Alert
                        </button>
                    </motion.div>
                )}

                {/* ── RESOLVED ──────────────────────────────────────────────── */}
                {state === 'resolved' && (
                    <motion.div key="resolved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                        <div className="text-6xl">💚</div>
                        <h2 className="text-xl font-bold text-emerald-400">Alert Resolved</h2>
                        <p className="text-sm text-slate-400">Glad you&apos;re safe. Stay strong. 💜</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
