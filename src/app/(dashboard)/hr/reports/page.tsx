'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';

const REPORT_TYPES = [
    { id: 'quarterly', title: 'Quarterly POSH Report', desc: 'Summary of all cases, resolutions, and compliance status.', icon: '📊', color: '#e855a0' },
    { id: 'annual', title: 'Annual Compliance Report', desc: 'Full annual report as required by the POSH Act for submission to District Officer.', icon: '📋', color: '#a855f7' },
    { id: 'incident', title: 'Incident Report', desc: 'Detailed report for a specific case including timeline and evidence summary.', icon: '📄', color: '#f5a623' },
    { id: 'training', title: 'Training Report', desc: 'Employee training completion status and compliance metrics.', icon: '🎓', color: '#10b981' },
    { id: 'audit', title: 'Audit Trail Report', desc: 'Complete system audit log for regulatory compliance.', icon: '🔍', color: '#3b82f6' },
];

const GENERATED_REPORTS = [
    { id: 'r-1', name: 'Q4-2025-POSH-Report.pdf', type: 'Quarterly', date: '2026-01-15', size: '2.4 MB' },
    { id: 'r-2', name: 'Annual-2025-Compliance.pdf', type: 'Annual', date: '2026-01-01', size: '5.8 MB' },
    { id: 'r-3', name: 'Training-Status-Feb2026.pdf', type: 'Training', date: '2026-02-01', size: '1.2 MB' },
];

export default function ReportsPage() {
    const [generating, setGenerating] = useState<string | null>(null);

    const handleGenerate = async (id: string) => {
        setGenerating(id);
        await new Promise((r) => setTimeout(r, 2000));
        setGenerating(null);
    };

    return (
        <div className="page-enter max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e855a015' }}>
                    <FileText size={20} className="text-[#e855a0]" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Reports</h1>
                    <p className="text-xs text-slate-400">Generate and download compliance reports</p>
                </div>
            </div>

            {/* Generate New Report */}
            <h3 className="text-sm font-semibold text-slate-300 mb-3">📄 Generate Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {REPORT_TYPES.map((r) => (
                    <button
                        key={r.id}
                        onClick={() => handleGenerate(r.id)}
                        disabled={generating === r.id}
                        className="glass-card text-left group hover:scale-[1.01] transition-all"
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">{r.icon}</span>
                            <div className="flex-1">
                                <p className="text-sm font-medium" style={{ color: r.color }}>{r.title}</p>
                                <p className="text-xs text-slate-500 mt-1">{r.desc}</p>
                            </div>
                            {generating === r.id ? (
                                <span className="text-sm animate-spin">⏳</span>
                            ) : (
                                <span className="text-xs text-slate-500 group-hover:text-[#e855a0] transition-colors">Generate →</span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Past Reports */}
            <h3 className="text-sm font-semibold text-slate-300 mb-3">📁 Past Reports</h3>
            <div className="space-y-2">
                {GENERATED_REPORTS.map((r) => (
                    <div key={r.id} className="glass-card flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <FileText size={18} className="text-[#e855a0]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{r.name}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span>{r.type}</span>
                                <span>📅 {r.date}</span>
                                <span>{r.size}</span>
                            </div>
                        </div>
                        <button className="btn-ghost text-xs flex items-center gap-1">
                            <Download size={14} /> Download
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
