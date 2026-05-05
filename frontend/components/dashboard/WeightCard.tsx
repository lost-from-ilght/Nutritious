'use client';

import React, { useState } from 'react';
import { TrendingDown, TrendingUp, Minus, Plus, BarChart2 } from 'lucide-react';
import { weightApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

interface WeightEntry { date: string; weightKg: number; }

interface WeightCardProps {
  logs: WeightEntry[];
  targetWeightKg?: number | null;
  onLogged?: () => void;
}

export function WeightCard({ logs, targetWeightKg, onLogged }: WeightCardProps) {
  const [input, setInput] = useState('');
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);

  const latest   = logs[logs.length - 1];
  const previous = logs[logs.length - 2];
  const change   = latest && previous ? latest.weightKg - previous.weightKg : null;
  const last7    = logs.slice(-7);
  const trend7   = last7.length >= 2 ? last7[last7.length - 1].weightKg - last7[0].weightKg : null;
  const toGoal   = latest && targetWeightKg ? latest.weightKg - targetWeightKg : null;

  // Progress toward goal
  const startWeight = logs[0]?.weightKg;
  const goalPct = startWeight && targetWeightKg && latest
    ? Math.min(100, Math.max(0, ((startWeight - latest.weightKg) / (startWeight - targetWeightKg)) * 100))
    : 0;

  const handleLog = async () => {
    const kg = parseFloat(input);
    if (isNaN(kg) || kg < 20 || kg > 500) { setError('Enter a valid weight (20–500 kg)'); return; }
    setLogging(true); setError(null);
    try {
      await weightApi.logWeight({ weightKg: kg });
      setInput(''); setShowInput(false); onLogged?.();
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setLogging(false); }
  };

  return (
    <div className="clip-card-sm slide-up"
         style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
            ⚖️ Weight Tracker
          </span>
          <div className="flex items-center gap-3">
            <Link href="/progress" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors hover:text-[var(--cyan)]"
                  style={{ color: 'var(--muted)' }}>
              <BarChart2 size={12} /> Stats
            </Link>
            <button onClick={() => setShowInput(!showInput)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors"
                    style={{ color: 'var(--primary)' }}>
              <Plus size={12} /> Log
            </button>
          </div>
        </div>

        {/* Main number */}
        <div className="flex items-end gap-3">
          <span className="font-game text-5xl leading-none" style={{ color: 'var(--foreground)' }}>
            {latest ? latest.weightKg.toFixed(1) : '—'}
          </span>
          <span className="text-sm mb-1" style={{ color: 'var(--muted)' }}>kg</span>
          {change !== null && (
            <div className={`flex items-center gap-1 text-sm mb-1 font-bold ${change < 0 ? 'text-[var(--success)]' : change > 0 ? 'text-[var(--primary)]' : ''}`}
                 style={change === 0 ? { color: 'var(--muted)' } : {}}>
              {change < 0 ? <TrendingDown size={16} /> : change > 0 ? <TrendingUp size={16} /> : <Minus size={16} />}
              {change > 0 ? '+' : ''}{change.toFixed(1)} kg
            </div>
          )}
        </div>

        {/* Goal progress bar */}
        {targetWeightKg && logs.length > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider"
                 style={{ color: 'var(--muted)' }}>
              <span>Goal Progress</span>
              <span style={{ color: goalPct >= 100 ? 'var(--success)' : 'var(--cyan)' }}>
                {goalPct >= 100 ? '🎉 REACHED!' : `${Math.round(goalPct)}%`}
              </span>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{
                width: `${goalPct}%`,
                background: goalPct >= 100
                  ? 'var(--success)'
                  : 'linear-gradient(90deg, var(--primary), var(--cyan))'
              }} />
            </div>
            <div className="flex justify-between text-[9px]" style={{ color: 'var(--muted)' }}>
              <span>Start: {startWeight?.toFixed(1)} kg</span>
              <span>Target: {targetWeightKg} kg</span>
            </div>
          </div>
        )}

        {/* Stat chips */}
        <div className="flex gap-2 flex-wrap">
          {trend7 !== null && (
            <div className="clip-btn px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                 style={{ background: 'var(--bg-card-2)', color: trend7 < 0 ? 'var(--success)' : trend7 > 0 ? 'var(--primary)' : 'var(--muted)' }}>
              7d: {trend7 > 0 ? '+' : ''}{trend7.toFixed(1)} kg
            </div>
          )}
          {toGoal !== null && targetWeightKg && (
            <div className="clip-btn px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                 style={{ background: 'var(--bg-card-2)', color: toGoal <= 0 ? 'var(--success)' : 'var(--cyan)' }}>
              {toGoal <= 0 ? '✓ Goal hit' : `${toGoal.toFixed(1)} kg to go`}
            </div>
          )}
        </div>

        {/* Sparkline */}
        {logs.length >= 2 && <MiniSparkline logs={logs.slice(-14)} />}

        {/* Log input */}
        {showInput && (
          <div className="space-y-2 pt-1">
            <div className="flex gap-2">
              <input
                type="number" step="0.1" value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. 82.5" autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleLog()}
                className="flex-1 px-4 py-3 text-sm font-bold outline-none transition-colors"
                style={{
                  background: 'var(--bg-card-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                }}
              />
              <button onClick={handleLog} disabled={logging}
                      className="px-5 font-black text-sm uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-50 clip-btn"
                      style={{ background: 'var(--primary)', color: '#fff' }}>
                {logging ? <LoadingSpinner size="sm" /> : 'Save'}
              </button>
            </div>
            {error && <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function MiniSparkline({ logs }: { logs: WeightEntry[] }) {
  if (logs.length < 2) return null;
  const weights = logs.map(l => l.weightKg);
  const min = Math.min(...weights); const max = Math.max(...weights);
  const range = max - min || 1;
  const W = 280; const H = 36; const pad = 4;
  const pts = weights.map((w, i) => {
    const x = pad + (i / (weights.length - 1)) * (W - pad * 2);
    const y = H - pad - ((w - min) / range) * (H - pad * 2);
    return `${x},${y}`;
  });
  const [lx, ly] = pts[pts.length - 1].split(',').map(Number);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-9">
      <defs>
        <linearGradient id="spark-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--cyan)" />
        </linearGradient>
      </defs>
      <polyline points={pts.join(' ')} fill="none" stroke="url(#spark-grad)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={4} fill="var(--cyan)"
              style={{ filter: 'drop-shadow(0 0 4px var(--cyan))' }} />
    </svg>
  );
}
