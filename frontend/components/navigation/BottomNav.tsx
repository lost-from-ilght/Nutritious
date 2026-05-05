'use client';

import React from 'react';
import { Home, Trophy, Plus, BarChart2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavProps {
  onAddClick?: () => void;
}

export function BottomNav({ onAddClick }: BottomNavProps) {
  const pathname = usePathname();

  const NavItem = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => {
    const active = pathname === href;
    return (
      <Link href={href} className="flex flex-col items-center gap-1 px-3 py-2 relative group">
        {active && (
          <span className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-6 h-[2px]"
                style={{ background: 'var(--primary)' }} />
        )}
        <span className={cn(
          'transition-all duration-200',
          active ? 'text-[var(--primary)] scale-110' : 'text-[var(--muted)] group-hover:text-white'
        )}>
          {icon}
        </span>
        <span className={cn(
          'text-[9px] font-bold uppercase tracking-widest transition-colors',
          active ? 'text-[var(--primary)]' : 'text-[var(--muted)]'
        )}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <div className="sticky bottom-0 w-full z-40"
         style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] opacity-40"
           style={{ background: 'linear-gradient(90deg, transparent, var(--primary), var(--cyan), transparent)' }} />

      <div className="flex justify-between items-center px-4 pt-1 pb-2">
        <NavItem href="/"            icon={<Home size={20} />}     label="Base" />
        <NavItem href="/progress"    icon={<BarChart2 size={20} />} label="Stats" />

        {/* FAB — Mario star / Valorant spike */}
        <button
          onClick={onAddClick}
          className="relative -mt-6 flex items-center justify-center w-14 h-14 rounded-full font-bold transition-all duration-200 hover:scale-110 active:scale-95 glow-red"
          style={{ background: 'linear-gradient(135deg, var(--primary), #c0392b)' }}
          aria-label="Log entry"
        >
          <Plus size={28} strokeWidth={2.5} className="text-white" />
          {/* Coin sparkle */}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                style={{ background: 'var(--gold)', color: '#000' }}>★</span>
        </button>

        <NavItem href="/leaderboard" icon={<Trophy size={20} />}   label="Ranks" />
        <NavItem href="/profile"     icon={<User size={20} />}     label="Agent" />
      </div>
    </div>
  );
}
