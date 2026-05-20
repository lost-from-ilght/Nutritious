'use client';

import React, { useEffect, useState } from 'react';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ArrowLeft, LogOut, ChevronRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { userApi, dashboardApi } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

function ProfileContent() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([userApi.getProfile(), dashboardApi.getDashboard().catch(() => null)])
        .then(([p]) => setProfileData(p.user))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return (
    <MobileContainer>
      <div className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" /></div>
    </MobileContainer>
  );

  const displayUser = profileData || user;
  const avatarUrl = profileData?.agentAvatar || displayUser?.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayUser?.name || 'User')}`;
  const streak = profileData?.streak?.current ?? 0;
  
  const rank = profileData?.rank || 'UNRANKED';
  const tier = profileData?.tier || 1;
  const currentRR = profileData?.currentRR || 0;
  const totalRR = profileData?.totalRR || 0;

  const getRankImage = (r: string, t: number) => {
    if (!r || r === 'UNRANKED') return '/ranks/Iron_1_Rank.png';
    if (r === 'RADIANT') return '/ranks/Radiant_Rank.png';
    const formattedRank = r.charAt(0) + r.slice(1).toLowerCase();
    return `/ranks/${formattedRank}_${t}_Rank.png`;
  };
  
  const rankImageUrl = getRankImage(rank, tier);

  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">

        {/* Header */}
        <div className="flex items-center justify-between p-5 pt-8">
          <Link href="/" className="w-9 h-9 flex items-center justify-center clip-card-sm transition-colors"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <ArrowLeft size={18} style={{ color: 'var(--foreground)' }} />
          </Link>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--muted)' }}>
            Agent Profile
          </span>
          <button onClick={toggleTheme}
                  className="w-9 h-9 flex items-center justify-center clip-card-sm transition-colors"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {theme === 'dark'
              ? <Sun size={16} style={{ color: 'var(--gold)' }} />
              : <Moon size={16} style={{ color: 'var(--cyan)' }} />}
          </button>
        </div>

        {/* Agent card */}
        <div className="mx-5 clip-card p-5 relative overflow-hidden"
             style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 stripe-accent opacity-30 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[2px]"
               style={{ background: 'linear-gradient(90deg, var(--primary), var(--cyan))' }} />

          <div className="flex items-center gap-4 relative z-10">
            {/* Avatar with rank border */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 overflow-hidden"
                   style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))', border: `2px solid var(--primary)` }}>
                <img src={avatarUrl} alt="Agent" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 drop-shadow-md">
                <img src={rankImageUrl} alt={rank} className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-game text-xl leading-tight truncate" style={{ color: 'var(--foreground)' }}>
                {displayUser?.name || 'Agent'}
              </h2>
              <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{displayUser?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 clip-btn"
                      style={{ background: 'rgba(255,70,85,0.1)', color: 'var(--primary)' }}>
                  {rank === 'RADIANT' ? `${currentRR} RR` : `${currentRR} / 100 RR`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mx-5 mt-4">
          {[
            { label: 'Day Streak', value: `${streak}🔥`, color: 'var(--gold)' },
            { label: 'Total RR',   value: totalRR.toLocaleString(), color: 'var(--primary)' },
            { label: 'Rank',       value: rank === 'RADIANT' ? rank : `${rank} ${tier}`, color: 'var(--primary)' },
            { label: 'Goal',       value: profileData?.goalType?.toUpperCase() || '—', color: 'var(--cyan)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="clip-card-sm p-4 text-center"
                 style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="font-game text-2xl leading-none" style={{ color }}>{value}</div>
              <div className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: 'var(--muted)' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Menu items */}
        <div className="mx-5 mt-4 space-y-2">
          <Link href="/profile/agent">
            <div className="flex items-center justify-between p-4 clip-card-sm transition-colors cursor-pointer group"
                 style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>
                👤 Select Agent
              </span>
              <ChevronRight size={16} style={{ color: 'var(--muted)' }} />
            </div>
          </Link>
          
          <Link href="/profile/details">
            <div className="flex items-center justify-between p-4 clip-card-sm transition-colors cursor-pointer group"
                 style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>
                ⚙️ Personal Details
              </span>
              <ChevronRight size={16} style={{ color: 'var(--muted)' }} />
            </div>
          </Link>

          <Link href="/progress">
            <div className="flex items-center justify-between p-4 clip-card-sm transition-colors cursor-pointer"
                 style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>
                📊 Progress Stats
              </span>
              <ChevronRight size={16} style={{ color: 'var(--muted)' }} />
            </div>
          </Link>

          <button onClick={logout}
                  className="w-full flex items-center justify-center gap-2 p-4 clip-card-sm font-black text-sm uppercase tracking-widest transition-colors mt-6"
                  style={{ background: 'rgba(255,70,85,0.08)', border: '1px solid rgba(255,70,85,0.25)', color: 'var(--primary)' }}>
            <LogOut size={16} />
            Disconnect
          </button>
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}

export default function ProfilePage() {
  return <ProtectedRoute><ProfileContent /></ProtectedRoute>;
}
