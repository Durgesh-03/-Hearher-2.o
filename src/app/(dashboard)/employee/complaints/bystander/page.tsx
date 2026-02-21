'use client';

import { useState } from 'react';
import { Eye, Send, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createBystanderReport } from '@/lib/data-service';

export default function BystanderReportPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '',
        location: '',
        description: '',
        relationship: '', // witness, colleague, manager
    });

    const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

    const inputCls = 'w-full bg-[#0d0a1a] border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-[#e855a0] focus:ring-1 focus:ring-[#e855a0] outline-none transition-all text-sm';
    const labelCls = 'text-sm font-medium text-slate-300 block mb-1.5';

    const submit = async () => {
        if (!form.description || form.description.length < 10) return;
        setSubmitted(true);
        try {
            await createBystanderReport({
                orgId: user?.org_id || 'demo-org-001',
                description: form.description,
                dateOfIncident: form.date,
                timeOfIncident: form.time,
                location: form.location,
                relationship: form.relationship,
            });
        } catch {
        }
    };

    if (submitted) {
        return (
            <div className="page-enter flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
                <div className="text-6xl">💜</div>
                <h2 className="text-xl font-bold text-emerald-400">Thank You for Speaking Up</h2>
                <p className="text-sm text-slate-400 max-w-sm">
                    Your bystander report has been filed anonymously. The ICC will review it sensitively.
                </p>
                <button onClick={() => router.push('/employee')} className="btn-ghost text-sm mt-4">
                    ← Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="page-enter max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e855a015' }}>
                    <Eye size={20} className="text-[#e855a0]" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Bystander Report</h1>
                    <p className="text-xs text-slate-400">Witnessed something wrong? Report it anonymously.</p>
                </div>
            </div>

            {/* Info Banner */}
            <div className="rounded-xl p-4 mb-6 flex items-start gap-3" style={{ background: '#a855f710', border: '1px solid #a855f720' }}>
                <AlertCircle size={18} className="text-[#a855f7] shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">
                    As a bystander, your report is <strong>completely anonymous</strong>. You won&apos;t be identified or contacted unless you choose to.
                    Speaking up can protect someone who may be afraid to report on their own.
                </p>
            </div>

            <div className="glass-card space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>When?</label>
                        <input type="date" className={inputCls} value={form.date} onChange={(e) => update('date', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelCls}>Time (Approx)</label>
                        <input type="time" className={inputCls} value={form.time} onChange={(e) => update('time', e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className={labelCls}>Where?</label>
                    <input className={inputCls} placeholder="e.g. Break room, parking lot, Slack channel" value={form.location} onChange={(e) => update('location', e.target.value)} />
                </div>

                <div>
                    <label className={labelCls}>Your relationship to the incident</label>
                    <div className="flex gap-2 flex-wrap">
                        {['Witnessed directly', 'Heard about it', 'Colleague told me'].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => update('relationship', opt)}
                                className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                                style={{
                                    background: form.relationship === opt ? '#e855a015' : 'rgba(255,255,255,0.04)',
                                    color: form.relationship === opt ? '#e855a0' : '#8b82a8',
                                    border: `1px solid ${form.relationship === opt ? '#e855a030' : 'rgba(255,255,255,0.08)'}`,
                                }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className={labelCls}>What did you witness?</label>
                    <textarea
                        className={`${inputCls} min-h-[120px] resize-none`}
                        placeholder="Describe what you saw or heard. Be as specific as possible — details help the investigation."
                        value={form.description}
                        onChange={(e) => update('description', e.target.value)}
                    />
                </div>

                <button
                    onClick={submit}
                    disabled={!form.description || form.description.length < 10}
                    className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #e855a0, #a855f7)', color: '#fff' }}
                >
                    <Send size={16} /> Submit Anonymously
                </button>
            </div>
        </div>
    );
}
