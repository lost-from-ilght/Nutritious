'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { ArrowLeft, User, Trophy, Flame } from 'lucide-react';
import { userApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function DailyBar({ day }: { day: { date: string; calories: number; goal: number; inDeficit: boolean } }) {
  const pct = Math.min(100, day.goal > 0 ? (day.calories / day.goal) * 100 : 0);
  const label = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className="w-full h-24 bg-white/5 relative overflow-hidden flex items-end clip-card-sm border border-white/5">
        <div
          className={`w-full transition-all duration-700 ${day.inDeficit ? 'bg-[var(--cyan)]' : day.calories === 0 ? 'bg-white/5' : 'bg-[var(--primary)]'}`}
          style={{ height: `${Math.max(4, pct)}%` }}
        />
      </div>
      <span className="text-[10px] uppercase font-bold text-gray-500">{label}</span>
    </div>
  );
}

const formatRankBadge = (rank: string, tier: number) => {
  if (rank === 'PLASTIC') return `/ranks/PLASTIC_${tier}.png`;
  if (rank === 'RADIANT') return `/ranks/Radiant_Rank.png`;
  const titleCaseRank = rank.charAt(0).toUpperCase() + rank.slice(1).toLowerCase();
  return `/ranks/${titleCaseRank}_${tier}_Rank.png`;
};

export default function PublicProfilePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await userApi.getPublicProfile(id);
      setData(response);
    } catch (err) {
      setError('Agent profile not found.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MobileContainer>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </MobileContainer>
    );
  }

  if (error || !data) {
    return (
      <MobileContainer>
        <div className="p-6">
          <button onClick={() => router.back()} className="text-[var(--primary)] mb-4 flex items-center gap-2 text-sm font-game uppercase tracking-widest">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="text-center text-[var(--primary)] py-10 font-bold uppercase tracking-wider">{error}</div>
        </div>
      </MobileContainer>
    );
  }

  const { user, weeklyProgress } = data;
  const rankBadge = formatRankBadge(user.rank, user.tier);
  const avatar = user.agentAvatar || user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;

  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        
        {/* Background Agent Image (Blurred) */}
        {user.agentAvatar && (
          <div className="absolute top-0 left-0 w-full h-[400px] opacity-20 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f1923]" />
            <img src={user.agentAvatar} alt="Background" className="w-full h-full object-cover blur-md scale-110 object-top" />
          </div>
        )}

        {/* Header */}
        <div className="relative p-6 pt-8 z-10">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-black/40 px-3 py-1.5 clip-card-sm backdrop-blur-md inline-flex border border-white/10">
            <ArrowLeft size={14} /> Back
          </button>

          <div className="flex flex-col items-center mt-4">
            <div className="w-32 h-32 relative clip-card overflow-hidden border-2 border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] bg-[var(--bg-card)]">
              <img src={avatar} alt={user.name} className="w-full h-full object-cover object-top" />
            </div>
            
            <h1 className="mt-4 text-3xl font-game tracking-widest text-white uppercase text-center drop-shadow-md">
              {user.name}
            </h1>
            
            <div className="flex items-center gap-6 mt-6 w-full max-w-xs">
              <div className="flex flex-col items-center flex-1 bg-black/40 backdrop-blur-md p-3 clip-card-sm border border-white/5">
                <img src={rankBadge} alt={user.rank} className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                <div className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {user.rank} {user.tier}
                </div>
              </div>

              <div className="flex flex-col items-center flex-1 bg-black/40 backdrop-blur-md p-3 clip-card-sm border border-white/5 h-full justify-center">
                <Trophy size={20} className="text-[#FFD700] mb-2" />
                <div className="text-xl font-game tracking-wider text-white">
                  {user.totalRR.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Total RR
                </div>
              </div>
            </div>
            
            {user.streak > 0 && (
              <div className="mt-4 flex items-center gap-2 text-[var(--primary)] font-game text-sm tracking-wider uppercase bg-[var(--primary)]/10 px-4 py-2 clip-card-sm border border-[var(--primary)]/20">
                <Flame size={16} className="animate-pulse" />
                {user.streak} Day Streak
              </div>
            )}
          </div>
        </div>

        {/* Heat Map Content */}
        <div className="relative z-10 px-6 pb-24 mt-4 space-y-6">
          <div className="clip-card p-5 space-y-4 border border-white/5 bg-black/60 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-game tracking-widest uppercase text-white">Recent Activity</h3>
            </div>
            
            {weeklyProgress?.dailyBreakdown?.length > 0 ? (
              <div className="flex gap-1.5 items-end h-28">
                {weeklyProgress.dailyBreakdown.map((d: any) => (
                  <DailyBar key={d.date} day={d} />
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-6 text-xs uppercase font-bold tracking-wider">
                No recent activity logged
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
