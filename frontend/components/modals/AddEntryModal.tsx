'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, Lightbulb } from 'lucide-react';
import { aiApi, userApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RankUpOverlay } from '@/components/ui/RankUpOverlay';
import Link from 'next/link';

interface AddEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function AddEntryModal({ isOpen, onClose, onSuccess }: AddEntryModalProps) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasGroqKey, setHasGroqKey] = useState<boolean | null>(null);
    const [rankUpData, setRankUpData] = useState<{ rank: string; tier: number } | null>(null);

    useEffect(() => {
        if (isOpen) {
            userApi.getProfile().then(res => setHasGroqKey(!!res.user.hasGroqKey)).catch(() => setHasGroqKey(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        setInput('');
        setError(null);
        setRankUpData(null);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) {
            setError('Please describe what you ate or your exercise');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await aiApi.processEntry(input.trim());
            if (onSuccess) onSuccess();

            if (res.rrResult?.rankUp) {
                setRankUpData({ rank: res.rrResult.newRank, tier: res.rrResult.newTier });
            } else {
                handleClose();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process entry. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const examples = [
        "I ate a chicken salad with balsamic dressing",
        "Ran 5km in 25 minutes"
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-4">
            <div className="w-full max-w-[440px] clip-card p-6 pb-10 animate-in slide-in-from-bottom duration-300 shadow-2xl border border-[var(--primary)] mb-4" style={{ background: 'var(--bg-base)' }}>
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--primary)]/10 clip-card-sm text-[var(--primary)]">
                            <Sparkles size={20} />
                        </div>
                        <h2 className="text-2xl font-game uppercase text-white tracking-widest text-glow-red">
                            AI ENTRY LOG
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 bg-white/5 clip-card-sm hover:bg-[var(--primary)] hover:text-black transition-colors text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm animate-in shake duration-300">
                            {error}
                        </div>
                    )}

                    {hasGroqKey === false ? (
                        <div className="bg-white/5 border border-[var(--primary)] clip-card p-6 text-center space-y-4 slide-up">
                            <p className="text-gray-300 text-sm">
                                To use the AI Entry Log, you need to provide your own Groq API Key. 
                            </p>
                            <Link href="/profile/details" onClick={handleClose} className="inline-block bg-[var(--primary)] text-black font-game uppercase tracking-widest px-6 py-3 clip-btn hover:bg-[var(--primary)]/90 transition-all">
                                Add API Key
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--cyan)]/20 blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Describe what you ate or how you exercised..."
                                    className="relative w-full h-40 resize-none text-lg leading-relaxed !bg-black/50"
                                    autoFocus
                                />
                                <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-medium">
                                    {input.length} characters
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                                    <Lightbulb size={16} className="text-primary/60" />
                                    <span>Try saying:</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {examples.map((example, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setInput(example)}
                                            className="text-[11px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-gray-400 hover:text-[var(--cyan)] px-3 py-1.5 clip-btn transition-all border border-white/5"
                                        >
                                            {example}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="w-full h-14 bg-[var(--primary)] text-black font-game text-xl tracking-widest uppercase clip-btn hover:bg-[var(--primary)]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_var(--primary-glow)]"
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        <span className="animate-pulse">Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Log Entry
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </form>
            </div>

            {rankUpData && (
                <RankUpOverlay 
                    rank={rankUpData.rank} 
                    tier={rankUpData.tier} 
                    onClose={handleClose} 
                />
            )}
        </div>
    );
}
