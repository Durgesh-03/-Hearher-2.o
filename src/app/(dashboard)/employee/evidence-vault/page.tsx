'use client';

import { useState, useEffect } from 'react';
import { Lock, Upload, FileText, Image, Mic, Film, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getEvidenceVault, deleteEvidenceItem, type VaultItem } from '@/lib/data-service';

// ─── Type Icons ─────────────────────────────────────────────────────────────

const TYPE_ICONS: Record<string, React.ReactNode> = {
    image: <Image size={18} className="text-[#e855a0]" />,
    audio: <Mic size={18} className="text-[#a855f7]" />,
    document: <FileText size={18} className="text-[#f5a623]" />,
    video: <Film size={18} className="text-[#10b981]" />,
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function EvidenceVaultPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<VaultItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        getEvidenceVault(user.id).then((data) => {
            if (!cancelled) {
                setItems(data);
                setLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, [user]);

    const remove = async (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        await deleteEvidenceItem(id);
    };

    return (
        <div className="page-enter max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f5a62315' }}>
                    <Lock size={20} className="text-[#f5a623]" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Evidence Vault</h1>
                    <p className="text-xs text-slate-400">Securely store evidence — encrypted and accessible only by you.</p>
                </div>
            </div>

            {/* Upload Zone */}
            <div
                className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer transition-all hover:bg-white/5 mb-6"
                style={{ borderColor: 'rgba(245,166,35,0.25)' }}
            >
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: '#f5a62312' }}>
                    <Upload size={24} className="text-[#f5a623]" />
                </div>
                <h3 className="font-semibold mb-1">Upload Evidence</h3>
                <p className="text-slate-400 text-sm">Drag & drop files or click to browse</p>
                <p className="text-xs text-slate-600 mt-2">Images, Audio, Video, PDFs • Max 10 MB • End-to-end encrypted</p>
            </div>

            {/* Items */}
            {loading ? (
                <div className="glass-card text-center py-10">
                    <p className="text-2xl mb-2 animate-pulse">⏳</p>
                    <p className="text-slate-400 text-sm">Loading vault...</p>
                </div>
            ) : items.length === 0 ? (
                <div className="glass-card text-center py-10">
                    <p className="text-4xl mb-2">🔐</p>
                    <p className="text-slate-400 text-sm">Your vault is empty</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item) => (
                        <div key={item.id} className="glass-card flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                {TYPE_ICONS[item.type]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.name}</p>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span>{item.size}</span>
                                    <span>{item.date}</span>
                                    {item.linked && <span className="text-[#e855a0]">📋 Linked to case</span>}
                                </div>
                            </div>
                            <button onClick={() => remove(item.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-xs text-slate-600 text-center mt-6">
                🔒 All files are encrypted with AES-256. Only you and the ICC can access linked evidence.
            </p>
        </div>
    );
}
