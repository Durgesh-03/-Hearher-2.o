'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, AlertTriangle, MapPin, Phone, Mic, MicOff } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createPanicAlert } from '@/lib/data-service';
import { classifySeverity, type SeverityLevel } from '@/lib/severity-classifier';
import {
    buildEmergencyAlert,
    isAlertConfirmation,
    getDefaultContacts,
    getSafetyResponse,
    getEmergencyPrompt,
    type EmergencyAlert,
} from '@/lib/safety-assistant';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    severity?: SeverityLevel;
}

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
    Low: '#10b981',
    Medium: '#f5a623',
    High: '#f97316',
    Critical: '#ef4444',
};

export default function POSHChatbot() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm **Aasha**, your POSH Safety Assistant. 💜 Ask me anything about workplace safety, your rights, or the complaint process. If you're in danger, I can alert your emergency contacts.", severity: 'Low' },
    ]);
    const [streaming, setStreaming] = useState(false);
    const [currentSeverity, setCurrentSeverity] = useState<SeverityLevel>('Low');
    const [pendingAlert, setPendingAlert] = useState(false);
    const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(null);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, open]);

    // Fetch GPS location once
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setLocation({ lat: 12.9716, lng: 77.5946 })
            );
        } else {
            setLocation({ lat: 12.9716, lng: 77.5946 });
        }
    }, []);

    // ─── Trigger Emergency Alert ────────────────────────────────────────────
    const triggerEmergencyAlert = useCallback(async () => {
        const loc = location || { lat: 12.9716, lng: 77.5946 };
        const userName = user?.name || 'User';
        const contacts = getDefaultContacts();

        const alert = buildEmergencyAlert(userName, loc.lat, loc.lng, contacts);
        setActiveAlert(alert);
        setPendingAlert(false);

        await createPanicAlert({
            userId: user?.id || 'demo-emp-001',
            orgId: user?.org_id || 'demo-org-001',
            latitude: loc.lat,
            longitude: loc.lng,
            source: 'panic',
            message: 'AI Safety Assistant emergency trigger (chat)',
        });

        const alertMsg: Message = {
            role: 'assistant',
            content: `🚨 **EMERGENCY ALERT SENT**\n\n${alert.message}\n\n📞 Contacts notified:\n${alert.contacts.map(c => `• ${c.name}: ${c.phone}`).join('\n')}\n\n💜 Stay calm. Help is on the way. If you are in immediate physical danger, please call **112** right now.`,
            severity: 'Critical',
        };
        setMessages((prev) => [...prev, alertMsg]);
    }, [location, user]);

    const sendMessage = async () => {
        const msg = input.trim();
        if (!msg || streaming) return;
        setInput('');

        const userMsg: Message = { role: 'user', content: msg };
        setMessages((prev) => [...prev, userMsg]);

        // Handle pending alert confirmation
        if (pendingAlert && isAlertConfirmation(msg)) {
            await triggerEmergencyAlert();
            return;
        }
        if (pendingAlert) {
            setPendingAlert(false);
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: "Okay, I won't send the alert right now. I'm still here for you. 💜", severity: currentSeverity },
            ]);
            return;
        }

        setStreaming(true);

        // Pre-classify the user's message for severity
        const allUserText = [...messages.filter(m => m.role === 'user').map(m => m.content), msg].join(' ');
        const classification = classifySeverity(allUserText);
        const severity = classification.severity;

        // Add empty assistant message for streaming
        setMessages((prev) => [...prev, { role: 'assistant', content: '', severity }]);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msg,
                    history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
                }),
            });

            if (!res.ok) throw new Error('Chat failed');

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                let fullResponse = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value);
                    const lines = text.split('\n').filter((l) => l.startsWith('data: '));

                    for (const line of lines) {
                        const data = line.slice(6);
                        if (data === '[DONE]') break;
                        try {
                            const parsed = JSON.parse(data);
                            fullResponse += parsed.token || '';
                            setMessages((prev) => {
                                const updated = [...prev];
                                updated[updated.length - 1] = { role: 'assistant', content: fullResponse, severity };
                                return updated;
                            });
                        } catch {
                            // skip malformed chunks
                        }
                    }
                }

                // After streaming is done, append emergency prompt for High/Critical
                if (severity === 'High' || severity === 'Critical') {
                    const safetyPrefix = getSafetyResponse(severity);
                    const emergPrompt = getEmergencyPrompt();
                    setMessages((prev) => {
                        const updated = [...prev];
                        const last = updated[updated.length - 1];
                        updated[updated.length - 1] = {
                            ...last,
                            content: `${safetyPrefix}\n\n${last.content}\n\n${emergPrompt}`,
                            severity,
                        };
                        return updated;
                    });
                    setPendingAlert(true);
                }

                setCurrentSeverity(severity);
            }
        } catch (err) {
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: 'assistant',
                    content: "I'm sorry, I couldn't process that. Please try again or contact your HR directly.",
                };
                return updated;
            });
        } finally {
            setStreaming(false);
        }
    };

    const sevColor = SEVERITY_COLORS[currentSeverity];

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setOpen((p) => !p)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #e855a0, #a855f7)' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Open POSH assistant"
            >
                <AnimatePresence mode="wait">
                    {open ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X size={22} color="white" />
                        </motion.div>
                    ) : (
                        <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <MessageCircle size={22} color="white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[560px] rounded-2xl overflow-hidden flex flex-col"
                        style={{ background: '#0f0c1e', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
                    >
                        {/* Header */}
                        <div className="p-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #e855a015, #a855f710)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e855a0, #a855f7)' }}>
                                <Sparkles size={16} color="white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-white">Aasha — Safety Assistant</p>
                                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Online • Powered by AI
                                </p>
                            </div>
                            {/* Severity dot */}
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: `${sevColor}15`, border: `1px solid ${sevColor}30` }}>
                                <div className="w-2 h-2 rounded-full" style={{ background: sevColor }} />
                                <span className="text-[10px] font-bold" style={{ color: sevColor }}>{currentSeverity}</span>
                            </div>
                        </div>

                        {/* Active Alert Banner (compact) */}
                        <AnimatePresence>
                            {activeAlert && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-3 py-2 overflow-hidden"
                                    style={{ background: '#ef444418', borderBottom: '1px solid #ef444430' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-red-400">🚨 Alert Active</span>
                                        <a href={activeAlert.mapsLink} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-400 underline hover:text-red-300 ml-auto flex items-center gap-1">
                                            <MapPin size={9} /> Maps ↗
                                        </a>
                                    </div>
                                    <div className="flex gap-3 mt-1">
                                        {activeAlert.contacts.map((c, i) => (
                                            <span key={i} className="text-[9px] text-slate-400 flex items-center gap-1">
                                                <Phone size={8} className="text-emerald-400" /> {c.name} ✓
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[350px]">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: msg.role === 'user' ? '#3b82f620' : '#e855a015' }}>
                                        {msg.role === 'user' ? <User size={13} className="text-blue-400" /> : <Bot size={13} className="text-[#e855a0]" />}
                                    </div>
                                    <div
                                        className="max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed"
                                        style={{
                                            background: msg.role === 'user' ? '#3b82f618' : 'rgba(255,255,255,0.04)',
                                            color: msg.role === 'user' ? '#93c5fd' : '#c4bdd6',
                                            border: `1px solid ${msg.role === 'user' ? '#3b82f620' : msg.severity && (msg.severity === 'High' || msg.severity === 'Critical') ? SEVERITY_COLORS[msg.severity] + '30' : 'rgba(255,255,255,0.06)'}`,
                                        }}
                                    >
                                        {msg.role === 'assistant' && msg.severity && (msg.severity === 'High' || msg.severity === 'Critical') && (
                                            <div className="flex items-center gap-1 mb-1">
                                                <AlertTriangle size={10} style={{ color: SEVERITY_COLORS[msg.severity] }} />
                                                <span className="text-[9px] font-bold" style={{ color: SEVERITY_COLORS[msg.severity] }}>{msg.severity}</span>
                                            </div>
                                        )}
                                        {msg.content ? (
                                            <span className="whitespace-pre-line">{msg.content}</span>
                                        ) : (
                                            <span className="inline-flex gap-1">
                                                <span className="animate-bounce">·</span>
                                                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>·</span>
                                                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>·</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pending Alert Confirmation */}
                        <AnimatePresence>
                            {pendingAlert && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-3 py-2 flex items-center gap-2"
                                    style={{ background: '#f9731618', borderTop: '1px solid #f9731630' }}
                                >
                                    <span className="text-sm animate-pulse">🚨</span>
                                    <span className="text-[10px] text-orange-300">
                                        Type <strong>&quot;yes&quot;</strong> to alert contacts
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input */}
                        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                    placeholder={isRecording ? '🎙️ Listening...' : pendingAlert ? '💬 Type "yes" to alert contacts...' : 'Ask about POSH Act, your rights...'}
                                    className="flex-1 bg-[#1a1533] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#e855a040] transition-colors"
                                    disabled={streaming || isRecording}
                                />
                                {/* Mic Button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isRecording) {
                                            recognitionRef.current?.stop();
                                            setIsRecording(false);
                                            return;
                                        }
                                        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                                        if (!SR) return;
                                        const recognition = new SR();
                                        recognition.continuous = false;
                                        recognition.interimResults = false;
                                        recognition.lang = 'en-IN';
                                        recognition.onresult = (event: SpeechRecognitionEvent) => {
                                            const transcript = event.results[0][0].transcript;
                                            setIsRecording(false);
                                            if (transcript.trim()) {
                                                setInput(transcript.trim());
                                            }
                                        };
                                        recognition.onerror = () => setIsRecording(false);
                                        recognition.onend = () => setIsRecording(false);
                                        recognitionRef.current = recognition;
                                        recognition.start();
                                        setIsRecording(true);
                                    }}
                                    disabled={streaming}
                                    className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                                    style={{
                                        background: isRecording ? '#ef4444' : 'rgba(255,255,255,0.05)',
                                        border: isRecording ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: isRecording ? '0 0 15px rgba(239,68,68,0.4)' : 'none',
                                    }}
                                    title={isRecording ? 'Stop recording' : 'Speak your message'}
                                >
                                    {isRecording && <span className="absolute inset-0 rounded-xl animate-ping" style={{ background: '#ef444430' }} />}
                                    {isRecording ? <MicOff size={14} className="text-white relative z-10" /> : <Mic size={14} className="text-slate-400" />}
                                </button>
                                <button
                                    onClick={sendMessage}
                                    disabled={streaming || !input.trim()}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                                    style={{ background: 'linear-gradient(135deg, #e855a0, #a855f7)' }}
                                >
                                    <Send size={14} color="white" />
                                </button>
                            </div>
                            <p className="text-[9px] text-slate-600 text-center mt-2">
                                🔒 Your conversations are secure and anonymous
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

