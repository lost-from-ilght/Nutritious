'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Flame, Zap, Shield } from 'lucide-react';

interface CalorieGoalCardProps {
  consumed: number;
  goal: number;
  burned?: number;
  deficit?: number;
}

export function CalorieGoalCard({ consumed, goal, burned = 0, deficit }: CalorieGoalCardProps) {
  const net = consumed - burned;
  const pct = Math.min(100, goal > 0 ? (net / goal) * 100 : 0);
  const remaining = goal - net;
  const isOver = remaining < 0;

  const barColor = isOver
    ? 'var(--primary)'
    : pct >= 80
    ? 'var(--success)'
    : 'var(--gold)';

  const statusLabel = isOver ? 'OVER BUDGET' : pct >= 80 ? 'ON TRACK' : 'UNDER';
  const statusColor = isOver ? 'text-[var(--primary)]' : pct >= 80 ? 'text-[var(--success)]' : 'text-[var(--gold)]';

  return (
    <div className="relative clip-card overflow-hidden slide-up"
         style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>

      {/* Stripe accent top-right */}
      <div className="absolute top-0 right-0 w-24 h-24 stripe-accent opacity-60 pointer-events-none" />

      {/* Glow blob */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full blur-3xl pointer-events-none opacity-20"
           style={{ background: barColor }} />

      <div className="relative z-10 p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={14} style={{ color: 'var(--primary)' }} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{ color: 'var(--muted)' }}>Daily Mission</span>
          </div>
          <span className={cn('text-[10px] font-black uppercase tracking-widest', statusColor)}>
            {statusLabel}
          </span>
        </div>

        <div className="flex items-end justify-between gap-4">
          {/* Left: numbers */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="font-game text-5xl leading-none" style={{ color: 'var(--foreground)' }}>
                {net.toLocaleString()}
              </span>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>kcal</span>
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              of <span className="font-bold" style={{ color: 'var(--foreground)' }}>{goal.toLocaleString()}</span> target
            </div>

            {/* Breakdown */}
            <div className="flex gap-3 pt-1">
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
                <Flame size={11} className="text-orange-400" />
                {consumed.toLocaleString()}
              </div>
              {burned > 0 && (
                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
                  <Zap size={11} style={{ color: 'var(--cyan)' }} />
                  -{burned.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Right: circular gauge */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              {/* Track */}
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              {/* Progress */}
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke={barColor}
                strokeWidth="8"
                strokeLinecap="square"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - pct / 100)}
                style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 6px ${barColor})` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-game text-xl leading-none" style={{ color: 'var(--foreground)' }}>
                {Math.round(pct)}%
              </span>
            </div>
          </div>
        </div>

        {/* XP-style progress bar */}
        <div className="mt-4">
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, var(--cyan))` }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] font-bold uppercase tracking-wider"
               style={{ color: 'var(--muted)' }}>
            <span>0</span>
            <span className={cn(isOver ? 'text-[var(--primary)]' : 'text-[var(--success)]')}>
              {isOver ? `+${Math.abs(remaining).toLocaleString()} over` : `${remaining.toLocaleString()} left`}
            </span>
            <span>{goal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
