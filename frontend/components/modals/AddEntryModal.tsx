'use client';

import React, { useState } from 'react';
import { X, Send, Sparkles, Lightbulb } from 'lucide-react';
import { aiApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AddEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function AddEntryModal({ isOpen, onClose, onSuccess }: AddEntryModalProps) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleClose = () => {
        setInput('');
        setError(null);
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
            await aiApi.processEntry(input.trim());
            if (onSuccess) onSuccess();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process entry. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const examples = [
        "I ate a chicken salad with balsamic dressing",
        "Had 2 slices of pepperoni pizza and a coke",
        "Ran 5km in 25 minutes",
        "Did 30 minutes of weightlifting at the gym"
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="w-full max-w-[440px] bg-[#1A1A1A] rounded-[32px] p-6 pb-10 animate-in slide-in-from-bottom duration-300 shadow-2xl border border-white/5 mb-4">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <Sparkles size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            AI Entry Log
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm animate-in shake duration-300">
                            {error}
                        </div>
                    )}

                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe what you ate or how you exercised..."
                            className="relative w-full h-40 bg-[#252525] rounded-2xl p-5 text-white placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-lg leading-relaxed"
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
                                    className="text-[13px] bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-3 py-1.5 rounded-full transition-all border border-white/5"
                                >
                                    {example}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="w-full h-14 bg-primary text-black font-black text-lg rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(var(--primary-rgb),0.3)]"
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
                </form>
            </div>
        </div>
    );
}
