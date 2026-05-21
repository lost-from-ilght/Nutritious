'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Trophy } from 'lucide-react';
import { leaderboardApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function LeaderboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const data = await leaderboardApi.getLeaderboard();
      setUsers(data.leaderboard);
    } catch (err) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Header */}
        <div className="p-6 pt-8 flex items-center gap-3">
          <div className="p-2.5 bg-[var(--primary)]/10 clip-card-sm text-[var(--primary)]">
            <Trophy size={22} />
          </div>
          <h1 className="text-3xl font-game tracking-widest uppercase text-white">Leaderboard</h1>
        </div>

        {/* Content */}
        <div className="px-5 space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center text-[var(--primary)] py-10 text-sm font-bold uppercase tracking-wider">
              {error}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center text-gray-500 py-10 text-sm uppercase tracking-wider font-bold">
              No ranked agents yet
            </div>
          ) : (
            users.map((u, index) => {
              const isTop3 = index < 3;
              const positionColors = ['text-[#FFD700]', 'text-[#C0C0C0]', 'text-[#CD7F32]'];
              const posColor = isTop3 ? positionColors[index] : 'text-gray-500';
              
              const formatRankBadge = (rank: string, tier: number) => {
                if (rank === 'PLASTIC') return `/ranks/PLASTIC_${tier}.png`;
                if (rank === 'RADIANT') return `/ranks/Radiant_Rank.png`;
                const titleCaseRank = rank.charAt(0).toUpperCase() + rank.slice(1).toLowerCase();
                return `/ranks/${titleCaseRank}_${tier}_Rank.png`;
              };
              
              const rankBadge = formatRankBadge(u.rank, u.tier);
              
              const avatar = u.agentAvatar || u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`;

              return (
                <div 
                  key={u.id}
                  onClick={() => router.push(`/profile/${u.id}`)}
                  className={`flex items-center gap-4 p-4 clip-card border cursor-pointer hover:bg-white/5 transition-colors ${isTop3 ? 'border-[var(--primary)]/30 bg-[var(--primary)]/5' : 'border-white/5 bg-[var(--bg-card)]'}`}
                >
                  <div className={`w-8 font-game text-3xl font-bold ${posColor} text-center`}>
                    #{index + 1}
                  </div>
                  
                  <div className="w-12 h-12 relative flex-shrink-0 clip-card-sm overflow-hidden border border-white/10">
                    <img src={avatar} alt={u.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-game tracking-wider text-white truncate uppercase">
                      {u.name}
                    </div>
                    <div className="text-[10px] text-[var(--cyan)] uppercase font-black tracking-widest">
                      Total RR: {u.totalRR.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <img src={rankBadge} alt={u.rank} className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                    <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                      {u.rank} {u.tier}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
