'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Upload, AlertCircle, Shield, Brain, Zap, Mic, MicOff } from 'lucide-react';
import { COMPLAINT_TYPES } from '@/lib/complaint-schema';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createComplaint } from '@/lib/data-service';
import { classifySeverity } from '@/lib/severity-classifier';
import type { ComplaintType } from '@/lib/database.types';

// ─── AI Analysis Types ───────────────────────────────────────────────────────
interface AIFeedback {
    severity_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    sentiment: string;
    keywords: string[];
    recommended_action: string;
}

const RISK_COLORS = { low: '#10b981', medium: '#f5a623', high: '#f97316', critical: '#ef4444' };
const RISK_LABELS = { low: '🟢 Low', medium: '🟡 Medium', high: '🟠 High', critical: '🔴 Critical' };

// ─── Steps ──────────────────────────────────────────────────────────────────

const STEPS = [
    { id: 'details', title: 'Incident Details', icon: '📅' },
    { id: 'desc', title: 'Description', icon: '📝' },
    { id: 'evidence', title: 'Evidence', icon: '📎' },
    { id: 'review', title: 'Review & Submit', icon: '✅' },
];

// ─── Types ──────────────────────────────────────────────────────────────────

interface FormData {
    date: string;
    time: string;
    location: string;
    type: string;
    description: string;
    severity: number;
    accusedName: string;
    witnesses: string;
    isAnonymous: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ComplaintWizard() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const [form, setForm] = useState<FormData>({
        date: new Date().toISOString().split('T')[0],
        time: '',
        location: '',
        type: '',
        description: '',
        severity: 3,
        accusedName: '',
        witnesses: '',
        isAnonymous: false,
    });

    const update = (field: keyof FormData, value: string | number | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    // ─── Live AI Analysis (debounced API + instant local classifier) ────────
    useEffect(() => {
        if (step !== 1 || form.description.length < 30) {
            if (form.description.length < 30) setAiFeedback(null);
            return;
        }

        // Instant local classification (runs immediately, no API call)
        const localResult = classifySeverity(form.description);
        setAiFeedback(prev => ({
            severity_score: localResult.severity_score,
            risk_level: localResult.severity.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
            sentiment: prev?.sentiment || 'analyzing...',
            keywords: localResult.matched_keywords,
            recommended_action: prev?.recommended_action || '',
        }));

        // Debounced API call for deeper Gemini analysis
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setAiLoading(true);
            try {
                const res = await fetch('/api/ai/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description: form.description, type: form.type || 'verbal' }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setAiFeedback(data);
                }
            } catch {
                // AI feedback error - silently ignore
            } finally {
                setAiLoading(false);
            }
        }, 800);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [form.description, form.type, step]);

    // ─── Validation ─────────────────────────────────────────────────────────

    const validateStep = (s: number): boolean => {
        const errs: Record<string, string> = {};

        if (s === 0) {
            if (!form.date) errs.date = 'Date is required';
            if (!form.time) errs.time = 'Approximate time is required';
            if (!form.location || form.location.length < 2) errs.location = 'Location is required';
            if (!form.type) errs.type = 'Please select a complaint type';
        }

        if (s === 1) {
            if (!form.description || form.description.length < 20)
                errs.description = 'Please provide at least 20 characters';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const next = () => {
        if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
    };
    const prev = () => setStep((s) => Math.max(s - 1, 0));

    const submit = async () => {
        setSubmitting(true);
        try {
            // Use AI-determined severity (from local classifier) as the authoritative score
            const aiResult = classifySeverity(form.description);
            const finalSeverity = Math.max(aiResult.severity_score, form.severity * 2);

            await createComplaint({
                orgId: user?.org_id || 'demo-org-001',
                complainantId: user?.id || null,
                isAnonymous: form.isAnonymous,
                type: form.type as ComplaintType,
                description: form.description,
                dateOfIncident: form.date,
                timeOfIncident: form.time,
                location: form.location,
                severity: finalSeverity,
            });
        } catch (e) {
            // Error handling for complaint submission
        }
        router.push('/employee/complaints?submitted=true');
    };

    // ─── Shared Styles ──────────────────────────────────────────────────────

    const inputCls =
        'w-full bg-[#0d0a1a] border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-[#e855a0] focus:ring-1 focus:ring-[#e855a0] outline-none transition-all text-sm';
    const labelCls = 'text-sm font-medium text-slate-300 block mb-1.5';
    const errorCls = 'text-red-400 text-xs mt-1';

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Anonymous Toggle */}
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl" style={{ background: '#e855a008', border: '1px solid #e855a015' }}>
                <Shield size={18} className="text-[#e855a0]" />
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                        type="checkbox"
                        checked={form.isAnonymous}
                        onChange={(e) => update('isAnonymous', e.target.checked)}
                        className="accent-[#e855a0]"
                    />
                    <span className="text-slate-300">File anonymously</span>
                </label>
                <span className="text-xs text-slate-500 ml-auto">Your identity stays hidden from the accused</span>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-10 relative px-4">
                <div className="absolute top-5 left-8 right-8 h-0.5 bg-white/10" />
                {STEPS.map((s, i) => (
                    <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-300"
                            style={{
                                background: i < step ? '#10b981' : i === step ? '#e855a0' : '#1a1533',
                                borderColor: i < step ? '#10b981' : i === step ? '#e855a0' : 'rgba(255,255,255,0.15)',
                                color: i <= step ? '#fff' : '#64748b',
                                boxShadow: i === step ? '0 0 20px rgba(232,85,160,0.3)' : 'none',
                                transform: i === step ? 'scale(1.1)' : 'scale(1)',
                            }}
                        >
                            {i < step ? <Check size={18} /> : s.icon}
                        </div>
                        <span
                            className="text-xs font-medium absolute -bottom-6 w-28 text-center"
                            style={{ color: i === step ? '#fff' : '#64748b' }}
                        >
                            {s.title}
                        </span>
                    </div>
                ))}
            </div>

            {/* Card */}
            <div className="glass-card p-8 min-h-[420px] flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.25 }}
                        className="flex-1"
                    >
                        {/* ── Step 0: Incident Details ───────────────────────────────── */}
                        {step === 0 && (
                            <div className="space-y-5">
                                <h2 className="text-xl font-semibold">When and where did it happen?</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Date of Incident</label>
                                        <input type="date" className={inputCls} value={form.date} onChange={(e) => update('date', e.target.value)} />
                                        {errors.date && <p className={errorCls}>{errors.date}</p>}
                                    </div>
                                    <div>
                                        <label className={labelCls}>Time (Approx)</label>
                                        <input type="time" className={inputCls} value={form.time} onChange={(e) => update('time', e.target.value)} />
                                        {errors.time && <p className={errorCls}>{errors.time}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>Location</label>
                                    <input
                                        className={inputCls}
                                        placeholder="e.g. Office Cafeteria, Zoom Call, Parking Lot"
                                        value={form.location}
                                        onChange={(e) => update('location', e.target.value)}
                                    />
                                    {errors.location && <p className={errorCls}>{errors.location}</p>}
                                </div>

                                <div>
                                    <label className={labelCls}>Complaint Type</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {COMPLAINT_TYPES.map((t) => (
                                            <label
                                                key={t.value}
                                                className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                                                style={{
                                                    background: form.type === t.value ? '#e855a012' : 'rgba(255,255,255,0.03)',
                                                    borderColor: form.type === t.value ? '#e855a0' : 'rgba(255,255,255,0.1)',
                                                    boxShadow: form.type === t.value ? '0 0 15px rgba(232,85,160,0.15)' : 'none',
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    className="hidden"
                                                    checked={form.type === t.value}
                                                    onChange={() => update('type', t.value)}
                                                />
                                                <span className="text-2xl">{t.icon}</span>
                                                <div>
                                                    <span className="font-medium text-sm" style={{ color: form.type === t.value ? '#e855a0' : '#cbd5e1' }}>
                                                        {t.label}
                                                    </span>
                                                    <p className="text-xs text-slate-500">{t.desc}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.type && <p className={errorCls}>{errors.type}</p>}
                                </div>
                            </div>
                        )}

                        {/* ── Step 1: Description ────────────────────────────────────── */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <h2 className="text-xl font-semibold">Describe the incident</h2>

                                <div>
                                    <label className={labelCls}>What happened?</label>
                                    <div className="relative">
                                        <textarea
                                            className={`${inputCls} min-h-[140px] resize-none pr-12`}
                                            placeholder={isRecording ? '🎙️ Listening... speak now' : 'Please describe the incident in as much detail as you can. Include what was said/done, the context, and how it made you feel...'}
                                            value={form.description}
                                            onChange={(e) => update('description', e.target.value)}
                                            disabled={isRecording}
                                        />
                                        {/* Mic button inside textarea */}
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
                                                        update('description', form.description ? form.description + ' ' + transcript.trim() : transcript.trim());
                                                    }
                                                };
                                                recognition.onerror = () => setIsRecording(false);
                                                recognition.onend = () => setIsRecording(false);
                                                recognitionRef.current = recognition;
                                                recognition.start();
                                                setIsRecording(true);
                                            }}
                                            className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                            style={{
                                                background: isRecording ? '#ef4444' : 'rgba(232,85,160,0.15)',
                                                border: isRecording ? '1px solid #ef4444' : '1px solid rgba(232,85,160,0.3)',
                                                boxShadow: isRecording ? '0 0 15px rgba(239,68,68,0.4)' : 'none',
                                            }}
                                            title={isRecording ? 'Stop recording' : 'Speak to describe'}
                                        >
                                            {isRecording && <span className="absolute inset-0 rounded-lg animate-ping" style={{ background: '#ef444430' }} />}
                                            {isRecording ? <MicOff size={14} className="text-white relative z-10" /> : <Mic size={14} className="text-[#e855a0]" />}
                                        </button>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        {errors.description ? (
                                            <p className={errorCls}>{errors.description}</p>
                                        ) : (
                                            <span className="text-xs text-slate-500">{form.description.length}/20 min characters</span>
                                        )}
                                        <span className="text-[10px] text-slate-500">🎙️ Click mic to speak</span>
                                    </div>
                                </div>

                                {/* ── Live AI Feedback Card ──────────────────────── */}
                                <AnimatePresence>
                                    {(aiLoading || aiFeedback) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, y: -10, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="rounded-xl p-4 overflow-hidden"
                                            style={{ background: 'linear-gradient(135deg, #a855f708, #e855a008)', border: '1px solid #a855f720' }}
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                {aiLoading ? (
                                                    <Zap size={14} className="text-[#f5a623] animate-pulse" />
                                                ) : (
                                                    <Brain size={14} className="text-[#a855f7]" />
                                                )}
                                                <span className="text-xs font-semibold text-slate-300">
                                                    {aiLoading ? 'AI analyzing...' : 'AI Analysis'}
                                                </span>
                                            </div>

                                            {aiFeedback && !aiLoading && (
                                                <div className="space-y-3">
                                                    {/* Severity Bar */}
                                                    <div>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-slate-400">Severity</span>
                                                            <span className="font-bold" style={{ color: aiFeedback.severity_score >= 7 ? '#ef4444' : aiFeedback.severity_score >= 4 ? '#f5a623' : '#10b981' }}>
                                                                {aiFeedback.severity_score}/10
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-2 rounded-full bg-white/5">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${aiFeedback.severity_score * 10}%` }}
                                                                className="h-full rounded-full"
                                                                style={{ background: aiFeedback.severity_score >= 7 ? '#ef4444' : aiFeedback.severity_score >= 4 ? '#f5a623' : '#10b981' }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Risk Level + Sentiment */}
                                                    <div className="flex gap-2">
                                                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: `${RISK_COLORS[aiFeedback.risk_level]}15`, color: RISK_COLORS[aiFeedback.risk_level] }}>
                                                            {RISK_LABELS[aiFeedback.risk_level]}
                                                        </span>
                                                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: '#a855f715', color: '#a855f7' }}>
                                                            {aiFeedback.sentiment}
                                                        </span>
                                                    </div>

                                                    {/* Keywords */}
                                                    {aiFeedback.keywords.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {aiFeedback.keywords.map((kw, i) => (
                                                                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#e855a010', color: '#e8a0c0', border: '1px solid #e855a020' }}>
                                                                    {kw}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Recommended Action */}
                                                    {aiFeedback.recommended_action && (
                                                        <p className="text-xs text-slate-400 italic">
                                                            💡 {aiFeedback.recommended_action}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div>
                                    <label className={labelCls}>Name of Accused (Optional)</label>
                                    <input
                                        className={inputCls}
                                        placeholder="Leave blank if unknown"
                                        value={form.accusedName}
                                        onChange={(e) => update('accusedName', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>Severity Level</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={form.severity}
                                        onChange={(e) => update('severity', Number(e.target.value))}
                                        className="w-full accent-[#e855a0]"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>1 – Minor</span>
                                        <span>2</span>
                                        <span>3 – Moderate</span>
                                        <span>4</span>
                                        <span>5 – Severe</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Evidence ───────────────────────────────────────── */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <h2 className="text-xl font-semibold">Add Evidence (Optional)</h2>

                                <div
                                    className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center text-center cursor-pointer transition-all hover:bg-white/5"
                                    style={{ borderColor: 'rgba(232,85,160,0.25)' }}
                                >
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#e855a015' }}>
                                        <Upload size={28} className="text-[#e855a0]" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-1">Drag & drop files here</h3>
                                    <p className="text-slate-400 text-sm max-w-xs">
                                        Upload screenshots, chat logs, audio recordings, or any relevant documents.
                                    </p>
                                    <p className="text-xs text-slate-600 mt-3">JPG, PNG, PDF, MP3, MP4 • Max 10 MB each</p>
                                </div>

                                <div>
                                    <label className={labelCls}>Witnesses (Optional)</label>
                                    <input
                                        className={inputCls}
                                        placeholder="Names of anyone who witnessed the incident"
                                        value={form.witnesses}
                                        onChange={(e) => update('witnesses', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Review & Submit ─────────────────────────────────── */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <h2 className="text-xl font-semibold">Review Your Complaint</h2>

                                <div className="rounded-xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    {[
                                        ['Type', COMPLAINT_TYPES.find((t) => t.value === form.type)?.label || form.type],
                                        ['Date & Time', `${form.date} at ${form.time}`],
                                        ['Location', form.location],
                                        ['Severity', `${form.severity} / 5 ${aiFeedback ? `(AI: ${aiFeedback.risk_level?.toUpperCase()})` : ''}`],
                                        ['Anonymous', form.isAnonymous ? 'Yes ✅' : 'No'],
                                    ].map(([label, val]) => (
                                        <div key={label} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                                            <span className="text-slate-400 text-sm">{label}</span>
                                            <span className="text-sm font-medium" style={{ color: '#e8b4d0' }}>{val}</span>
                                        </div>
                                    ))}
                                    <div className="pt-2">
                                        <span className="text-slate-400 text-sm block mb-1">Description</span>
                                        <p className="text-sm text-slate-300 italic leading-relaxed">&ldquo;{form.description}&rdquo;</p>
                                    </div>
                                    {form.accusedName && (
                                        <div className="flex justify-between pt-2 border-t border-white/5">
                                            <span className="text-slate-400 text-sm">Accused</span>
                                            <span className="text-sm">{form.accusedName}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#f5a62310', border: '1px solid #f5a62325' }}>
                                    <AlertCircle className="text-[#f5a623] shrink-0 mt-0.5" size={18} />
                                    <p className="text-sm text-[#e8d0a0]">
                                        By submitting, you confirm this information is true to the best of your knowledge.
                                        Your complaint will be reviewed by the Internal Complaints Committee (ICC).
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-5 border-t border-white/10">
                    <button
                        onClick={prev}
                        disabled={step === 0 || submitting}
                        className="btn-ghost flex items-center gap-1 disabled:opacity-30"
                        type="button"
                    >
                        <ChevronLeft size={18} /> Back
                    </button>

                    {step < STEPS.length - 1 ? (
                        <button onClick={next} className="btn-primary flex items-center gap-1" type="button">
                            Next <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={submit}
                            disabled={submitting}
                            className="btn-primary flex items-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #e855a0, #a855f7)' }}
                            type="button"
                        >
                            {submitting ? (
                                <>
                                    <span className="animate-spin">⏳</span> Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Complaint <Check size={18} />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
