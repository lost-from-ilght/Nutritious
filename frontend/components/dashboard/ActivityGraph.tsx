'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type ActivityStatus = 'no-data' | 'noData' | 'under' | 'on-track' | 'onTrack' | 'over';

interface DayActivity { date: string; status: ActivityStatus; }
interface ActivityGraphProps { data: DayActivity[]; }

const STATUS_CONFIG: Record<string, { bg: string; glow: string; label: string }> = {
  under:    { bg: 'var(--gold)',    glow: 'var(--gold-glow)',  label: 'Under' },
  onTrack:  { bg: 'var(--success)', glow: 'var(--green-glow)', label: 'On Track' },
  'on-track': { bg: 'var(--success)', glow: 'var(--green-glow)', label: 'On Track' },
  over:     { bg: 'var(--primary)', glow: 'var(--primary-glow)', label: 'Over' },
};

function DayCell({ status }: { status: ActivityStatus }) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) {
    return <div className="aspect-square rounded-sm" style={{ background: 'var(--muted-2)', opacity: 0.4 }} />;
  }
  return (
    <div
      className="aspect-square rounded-sm transition-transform hover:scale-125 cursor-default"
      style={{ background: cfg.bg, boxShadow: `0 0 4px ${cfg.glow}` }}
      title={cfg.label}
    />
  );
}

export function ActivityGraph({ data }: ActivityGraphProps) {
  const display = [...data];
  while (display.length < 50) display.push({ date: '', status: 'no-data' });
  const cells = display.slice(0, 50);

  const onTrackCount = cells.filter(d => d.status === 'onTrack' || d.status === 'on-track').length;
  const streak = (() => {
    let s = 0;
    for (let i = cells.length - 1; i >= 0; i--) {
      if (cells[i].status === 'onTrack' || cells[i].status === 'on-track') s++;
      else break;
    }
    return s;
  })();

  return (
    <div className="clip-card-sm p-5 slide-up"
         style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
          Combat Log
        </span>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
          {streak > 0 && (
            <span style={{ color: 'var(--gold)' }}>🔥 {streak} streak</span>
          )}
          <span style={{ color: 'var(--muted)' }}>{onTrackCount}/50 days</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-10 gap-1.5 mb-4">
        {cells.map((day, i) => <DayCell key={i} status={day.status} />)}
      </div>

      {/* Legend */}
      <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest"
           style={{ color: 'var(--muted)' }}>
        {[
          { color: 'var(--muted-2)', label: 'Empty' },
          { color: 'var(--gold)',    label: 'Under' },
          { color: 'var(--success)', label: 'On Track' },
          { color: 'var(--primary)', label: 'Over' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
