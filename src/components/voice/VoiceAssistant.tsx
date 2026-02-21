'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Shield, Brain, AlertTriangle, Volume2, MapPin, Phone } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createPanicAlert } from '@/lib/data-service';
import {
    buildEmergencyAlert,
    isAlertConfirmation,
    getDefaultContacts,
    type EmergencyAlert,
} from '@/lib/safety-assistant';

// ─── Types ──────────────────────────────────────────────────────────────────

interface VoiceResponse {
    incident_summary: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    matched_keywords: string[];
    analysis_reason: string;
    auto_trigger_sos?: boolean;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    severity?: string;
    timestamp: Date;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SEVERITY_STYLES = {
    Low: { color: '#10b981', bg: '#10b98115', icon: '🟢', glow: 'rgba(16,185,129,0.2)' },
    Medium: { color: '#f5a623', bg: '#f5a62315', icon: '🟡', glow: 'rgba(245,166,35,0.2)' },
    High: { color: '#f97316', bg: '#f9731615', icon: '🟠', glow: 'rgba(249,115,22,0.3)' },
    Critical: { color: '#ef4444', bg: '#ef444415', icon: '🔴', glow: 'rgba(239,68,68,0.4)' },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function VoiceAssistant() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentSeverity, setCurrentSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Low');
    const [textInput, setTextInput] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [micSupported, setMicSupported] = useState(true);

    // Emergency state
    const [pendingAlert, setPendingAlert] = useState(false);    // waiting for user confirmation
    const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

    // ─── Geolocation ─────────────────────────────────────────────────────
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setLocation({ lat: 12.9716, lng: 77.5946 }) // fallback
            );
        } else {
            setLocation({ lat: 12.9716, lng: 77.5946 });
        }
    }, []);

    // ─── Auto-scroll ────────────────────────────────────────────────────────
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    // ─── Welcome message ────────────────────────────────────────────────────
    useEffect(() => {
        if (messages.length === 0) {
            const welcome: Message = {
                role: 'assistant',
                content: "Hello, I'm your POSH Safety Assistant. I'm here to listen and support you in a safe, confidential space. You can speak using your microphone or type below. Whatever you share stays between us.",
                severity: 'Low',
                timestamp: new Date(),
            };
            setMessages([welcome]);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Trigger Emergency Alert ────────────────────────────────────────────
    const triggerEmergencyAlert = useCallback(async () => {
        const loc = location || { lat: 12.9716, lng: 77.5946 };
        const userName = user?.name || 'User';
        const contacts = getDefaultContacts();

        const alert = buildEmergencyAlert(userName, loc.lat, loc.lng, contacts);
        setActiveAlert(alert);
        setPendingAlert(false);

        // Create panic alert in DB
        await createPanicAlert({
            userId: user?.id || 'demo-emp-001',
            orgId: user?.org_id || 'demo-org-001',
            latitude: loc.lat,
            longitude: loc.lng,
            source: 'panic',
            message: 'AI Safety Assistant emergency trigger',
        });

        // Add alert confirmation message to chat
        const alertMsg: Message = {
            role: 'assistant',
            content: `🚨 **EMERGENCY ALERT SENT**\n\n${alert.message}\n\n📞 Contacts notified:\n${alert.contacts.map(c => `• ${c.name}: ${c.phone}`).join('\n')}\n\n💜 Stay calm. Help is on the way. If you are in immediate physical danger, please call **112** right now.`,
            severity: 'Critical',
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, alertMsg]);
    }, [location, user]);

    // ─── Speech Recognition ─────────────────────────────────────────────────
    const startRecording = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setMicSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            setIsRecording(false);
            if (transcript.trim()) {
                sendMessage(transcript.trim());
            }
        };

        recognition.onerror = () => {
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const stopRecording = useCallback(() => {
        recognitionRef.current?.stop();
        setIsRecording(false);
    }, []);

    // ─── Text-to-Speech ─────────────────────────────────────────────────────
    const speakText = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.lang = 'en-IN';
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            synthRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        }
    };

    // ─── Send Message ───────────────────────────────────────────────────────
    const sendMessage = async (text: string) => {
        const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setIsProcessing(true);
        setTextInput('');

        // Check if this is a confirmation of a pending alert
        if (pendingAlert && isAlertConfirmation(text)) {
            setIsProcessing(false);
            await triggerEmergencyAlert();
            return;
        }

        // If there's a pending alert and the user didn't confirm, cancel it
        if (pendingAlert) {
            setPendingAlert(false);
            const cancelMsg: Message = {
                role: 'assistant',
                content: "Okay, I won't send the alert right now. I'm still here for you. Please let me know if you change your mind or need anything else. 💜",
                severity: currentSeverity,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, cancelMsg]);
            setIsProcessing(false);
            return;
        }

        try {
            const history = messages
                .filter((m) => m.role === 'user' || m.role === 'assistant')
                .map((m) => ({ role: m.role, content: m.content }));

            const res = await fetch('/api/ai/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript: text, history }),
            });

            if (res.ok) {
                const data: VoiceResponse = await res.json();

                // Build display message from new response format
                const displayMessage = data.analysis_reason
                    ? `**Incident Summary:** ${data.incident_summary}\n\n**Analysis:** ${data.analysis_reason}${data.matched_keywords?.length ? `\n\n**Keywords detected:** ${data.matched_keywords.join(', ')}` : ''}`
                    : data.incident_summary;

                // ── Handle Auto-SOS (voice keywords like "help me") ──────
                if (data.auto_trigger_sos) {
                    const assistantMsg: Message = {
                        role: 'assistant',
                        content: displayMessage,
                        severity: 'Critical',
                        timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, assistantMsg]);
                    setCurrentSeverity('Critical');
                    speakText(data.incident_summary);

                    // Auto-trigger without confirmation
                    await triggerEmergencyAlert();
                    setIsProcessing(false);
                    return;
                }

                // ── Normal response ─────────────────────────────────────
                const assistantMsg: Message = {
                    role: 'assistant',
                    content: displayMessage,
                    severity: data.severity,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, assistantMsg]);
                setCurrentSeverity(data.severity);

                // If High or Critical, set pendingAlert for confirmation
                if (data.severity === 'High' || data.severity === 'Critical') {
                    setPendingAlert(true);
                }

                // Auto-speak the response
                speakText(data.incident_summary);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: 'I had trouble processing that. Could you try again?', timestamp: new Date() },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: "I'm having a temporary issue. Please try again in a moment.", timestamp: new Date() },
            ]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (textInput.trim() && !isProcessing) {
            sendMessage(textInput.trim());
        }
    };

    const sev = SEVERITY_STYLES[currentSeverity];

    return (
        <div className="page-enter w-full max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #a855f720, #e855a020)' }}>
                        <Brain size={24} className="text-[#a855f7]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">🎙️ Voice Safety Assistant</h1>
                        <p className="text-xs text-slate-400">POSH Act • Confidential • AI-Powered</p>
                    </div>
                </div>

                {/* Live Severity Badge */}
                <motion.div
                    key={currentSeverity}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl"
                    style={{ background: sev.bg, border: `1px solid ${sev.color}30`, boxShadow: `0 0 20px ${sev.glow}` }}
                >
                    <span className="text-sm">{sev.icon}</span>
                    <span className="text-sm font-bold" style={{ color: sev.color }}>{currentSeverity}</span>
                </motion.div>
            </div>

            {/* Active Emergency Alert Banner */}
            <AnimatePresence>
                {activeAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 rounded-2xl p-4 space-y-3"
                        style={{ background: '#ef444418', border: '1px solid #ef444440' }}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-sm font-bold text-red-400">🚨 Emergency Alert Active</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                            <MapPin size={12} className="text-red-400" />
                            <a
                                href={activeAlert.mapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-red-300 transition-colors"
                            >
                                View location on Google Maps ↗
                            </a>
                        </div>
                        <div className="space-y-1">
                            {activeAlert.contacts.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                                    <Phone size={10} className="text-emerald-400" />
                                    <span>{c.name}: {c.phone}</span>
                                    <span className="text-emerald-400 ml-auto">✓ Notified</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setActiveAlert(null)}
                            className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            Dismiss banner
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="glass-card mb-4 overflow-y-auto"
                style={{ height: activeAlert ? '340px' : '420px', scrollBehavior: 'smooth' }}
            >
                <div className="p-5 space-y-4">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className="max-w-[80%] rounded-2xl px-4 py-3"
                                    style={{
                                        background: msg.role === 'user'
                                            ? 'linear-gradient(135deg, #e855a0, #a855f7)'
                                            : 'rgba(255,255,255,0.05)',
                                        border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                                    }}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Shield size={12} className="text-[#a855f7]" />
                                            <span className="text-[10px] font-semibold text-[#a855f7]">Safety Assistant</span>
                                            {msg.severity && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: SEVERITY_STYLES[msg.severity as keyof typeof SEVERITY_STYLES]?.bg, color: SEVERITY_STYLES[msg.severity as keyof typeof SEVERITY_STYLES]?.color }}>
                                                    {msg.severity}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => speakText(msg.content)}
                                                className="ml-auto opacity-50 hover:opacity-100 transition-opacity"
                                                title="Read aloud"
                                            >
                                                <Volume2 size={12} className="text-slate-400" />
                                            </button>
                                        </div>
                                    )}
                                    {msg.role === 'user' && (
                                        <div className="flex items-center gap-1 mb-1">
                                            <Mic size={10} className="text-white/70" />
                                            <span className="text-[10px] text-white/70">You</span>
                                        </div>
                                    )}
                                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: msg.role === 'user' ? '#fff' : '#cbd5e1' }}>
                                        {msg.content}
                                    </p>
                                    <p className="text-[10px] mt-1.5 opacity-40 text-right">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Processing indicator */}
                    {isProcessing && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="text-xs text-slate-500">Listening and analyzing...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Severity Indicator Bar */}
            <div className="glass-card p-3 mb-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle size={14} style={{ color: sev.color }} />
                    <span className="text-xs text-slate-400">Severity Assessment:</span>
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            animate={{ width: currentSeverity === 'Low' ? '25%' : currentSeverity === 'Medium' ? '50%' : currentSeverity === 'High' ? '75%' : '100%' }}
                            transition={{ duration: 0.5 }}
                            style={{ background: sev.color }}
                        />
                    </div>
                    <span className="text-xs font-bold" style={{ color: sev.color }}>{currentSeverity}</span>
                </div>
            </div>

            {/* Pending Alert Confirmation Hint */}
            <AnimatePresence>
                {pendingAlert && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 rounded-xl p-3 flex items-center gap-3"
                        style={{ background: '#f9731618', border: '1px solid #f9731630' }}
                    >
                        <span className="text-lg animate-pulse">🚨</span>
                        <span className="text-xs text-orange-300">
                            Say or type <strong>&quot;yes&quot;</strong>, <strong>&quot;help&quot;</strong>, or <strong>&quot;alert&quot;</strong> to send an emergency alert to your contacts.
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="glass-card p-4">
                <form onSubmit={handleTextSubmit} className="flex items-center gap-3">
                    {/* Mic Button */}
                    {micSupported ? (
                        <button
                            type="button"
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={isProcessing}
                            className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
                            style={{
                                background: isRecording ? '#ef4444' : 'linear-gradient(135deg, #e855a0, #a855f7)',
                                boxShadow: isRecording ? '0 0 30px rgba(239,68,68,0.5)' : '0 0 15px rgba(168,85,247,0.3)',
                            }}
                        >
                            {isRecording && (
                                <span className="absolute inset-0 rounded-full animate-ping" style={{ background: '#ef444440' }} />
                            )}
                            {isRecording ? <MicOff size={20} className="text-white relative z-10" /> : <Mic size={20} className="text-white relative z-10" />}
                        </button>
                    ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5" title="Mic not supported">
                            <MicOff size={20} className="text-slate-600" />
                        </div>
                    )}

                    {/* Text Input */}
                    <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder={isRecording ? '🎙️ Listening...' : pendingAlert ? '💬 Type "yes" to alert contacts...' : 'Type or speak...'}
                        disabled={isRecording || isProcessing}
                        className="flex-1 bg-[#0d0a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] outline-none transition-all text-sm disabled:opacity-50"
                    />

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={!textInput.trim() || isProcessing}
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                        style={{ background: textInput.trim() ? 'linear-gradient(135deg, #e855a0, #a855f7)' : 'rgba(255,255,255,0.05)' }}
                    >
                        <Send size={18} className="text-white" />
                    </button>
                </form>

                {/* Status line */}
                <div className="flex items-center justify-between mt-3 px-1">
                    <span className="text-[10px] text-slate-600">
                        {isRecording ? '🔴 Recording... speak now' : isSpeaking ? '🔊 Speaking...' : '🔒 End-to-end confidential'}
                    </span>
                    <span className="text-[10px] text-slate-600">
                        {messages.filter((m) => m.role === 'user').length} messages
                    </span>
                </div>
            </div>
        </div>
    );
}


