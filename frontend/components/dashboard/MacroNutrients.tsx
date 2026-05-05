'use client';

import React from 'react';

interface MacroItemProps {
  label: string;
  emoji: string;
  current: number;
  total: number;
  color: string;
  glowColor: string;
}

function MacroItem({ label, emoji, current, total, color, glowColor }: MacroItemProps) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const done = pct >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{emoji}</span>
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            {label}
          </span>
          {done && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm"
                         style={{ background: color, color: '#000' }}>MAX</span>}
        </div>
        <div className="text-xs" style={{ color: 'var(--muted)' }}>
          <span className="font-game text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            {Math.round(current)}
          </span>
          /{Math.round(total)}g
        </div>
      </div>

      {/* Segmented XP bar */}
      <div className="relative h-3 rounded-none overflow-hidden"
           style={{ background: 'var(--muted-2)' }}>
        <div
          className="h-full transition-all duration-1000 ease-out relative"
          style={{
            width: `${pct}%`,
            background: color,
            boxShadow: `0 0 8px ${glowColor}`,
          }}
        >
          {/* Shine */}
          <div className="absolute inset-0 opacity-30"
               style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)' }} />
        </div>
        {/* Segment ticks */}
        {[25, 50, 75].map(tick => (
          <div key={tick} className="absolute top-0 bottom-0 w-px opacity-30"
               style={{ left: `${tick}%`, background: 'var(--bg-base)' }} />
        ))}
      </div>
    </div>
  );
}

interface MacroNutrientsProps {
  protein: { current: number; total: number };
  carbs:   { current: number; total: number };
  fats:    { current: number; total: number };
}

export function MacroNutrients({ protein, carbs, fats }: MacroNutrientsProps) {
  return (
    <div className="clip-card-sm p-5 space-y-4 slide-up"
         style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
          Macro Stats
        </span>
      </div>

      <MacroItem label="Protein" emoji="💪" current={protein.current} total={protein.total}
        color="var(--cyan)"    glowColor="var(--cyan-glow)" />
      <MacroItem label="Carbs"   emoji="⚡" current={carbs.current}   total={carbs.total}
        color="var(--gold)"    glowColor="var(--gold-glow)" />
      <MacroItem label="Fats"    emoji="🛡️" current={fats.current}    total={fats.total}
        color="var(--purple)"  glowColor="rgba(191,90,242,0.3)" />
    </div>
  );
}
