'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getActivePulseSurvey, submitPulseResponse } from '@/lib/data-service';
import type { PulseSurvey } from '@/lib/database.types';
import { Heart, Send, CheckCircle } from 'lucide-react';

export default function PulseSurveyPage() {
    const { user } = useAuth();
    const [survey, setSurvey] = useState<PulseSurvey | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, string | number>>({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        getActivePulseSurvey(user?.org_id || 'demo-org-001').then((data) => {
            setSurvey(data);
            setLoading(false);
        });
    }, [user]);

    const handleSubmit = async () => {
        if (!survey || !user) return;
        setSubmitted(true);
        await submitPulseResponse(survey.id, user.id, answers);
    };

    if (loading) {
        return (
            <div className="page-enter text-center py-20">
                <p className="text-2xl mb-3 animate-pulse">💓</p>
                <p className="text-slate-400">Loading survey...</p>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="page-enter flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
                <div className="text-6xl">💜</div>
                <h2 className="text-xl font-bold text-emerald-400">Thank You!</h2>
                <p className="text-sm text-slate-400 max-w-sm">Your responses help us build a safer workplace for everyone.</p>
                <CheckCircle size={24} className="text-emerald-400" />
            </div>
        );
    }

    if (!survey) {
        return (
            <div className="page-enter text-center py-20">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-slate-400">No active survey right now</p>
            </div>
        );
    }

    const inputCls = 'w-full bg-[#0d0a1a] border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-[#e855a0] outline-none transition-all text-sm';

    return (
        <div className="page-enter max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e855a015' }}>
                    <Heart size={20} className="text-[#e855a0]" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">{survey.title}</h1>
                    <p className="text-xs text-slate-400">Anonymous workplace safety pulse check</p>
                </div>
            </div>

            <div className="space-y-6">
                {survey.questions.map((q, idx) => (
                    <div key={q.id} className="glass-card">
                        <p className="text-sm font-medium mb-3">
                            <span className="text-[#e855a0] mr-2">{idx + 1}.</span>
                            {q.text}
                        </p>

                        {q.type === 'rating' && (
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setAnswers((p) => ({ ...p, [q.id]: r }))}
                                        className="w-12 h-12 rounded-xl text-lg font-bold transition-all"
                                        style={{
                                            background: answers[q.id] === r ? '#e855a020' : 'rgba(255,255,255,0.04)',
                                            color: answers[q.id] === r ? '#e855a0' : '#8b82a8',
                                            border: `1px solid ${answers[q.id] === r ? '#e855a040' : 'rgba(255,255,255,0.08)'}`,
                                        }}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        )}

                        {q.type === 'choice' && q.options && (
                            <div className="flex gap-2 flex-wrap">
                                {q.options.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => setAnswers((p) => ({ ...p, [q.id]: opt }))}
                                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                                        style={{
                                            background: answers[q.id] === opt ? '#a855f718' : 'rgba(255,255,255,0.04)',
                                            color: answers[q.id] === opt ? '#a855f7' : '#8b82a8',
                                            border: `1px solid ${answers[q.id] === opt ? '#a855f730' : 'rgba(255,255,255,0.08)'}`,
                                        }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}

                        {q.type === 'text' && (
                            <textarea
                                className={`${inputCls} min-h-[80px] resize-none`}
                                placeholder="Your thoughts..."
                                value={(answers[q.id] as string) || ''}
                                onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                            />
                        )}
                    </div>
                ))}

                <button
                    onClick={handleSubmit}
                    className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{ background: 'linear-gradient(135deg, #e855a0, #a855f7)', color: '#fff' }}
                >
                    <Send size={16} /> Submit Anonymously
                </button>
            </div>
        </div>
    );
}
