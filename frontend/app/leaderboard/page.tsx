'use client';

import React, { useEffect, useState } from 'react';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Trophy, Medal } from 'lucide-react';
import { scoresApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { AddEntryModal } from '@/components/modals/AddEntryModal';

interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  avatar: string;
}

const RANK_STYLES: Record<number, { bg: string; text: string; badge: string }> = {
  1: { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500 text-black' },
  2: { bg: 'bg-gray-400/10 border-gray-400/20',     text: 'text-gray-300',   badge: 'bg-gray-400 text-black' },
  3: { bg: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-400', badge: 'bg-orange-500 text-black' },
};

function PodiumCard({ user }: { user: LeaderboardUser }) {
  const style = RANK_STYLES[user.rank];
  return (
    <div className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border ${style.bg}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${style.badge}`}>
        {user.rank}
      </div>
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10">
        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
      </div>
      <div className="text-center">
        <div className="text-white text-xs font-semibold truncate max-w-[70px]">{user.name.split(' ')[0]}</div>
        <div className={`text-xs font-bold ${style.text}`}>{user.points.toLocaleString()} pts</div>
      </div>
    </div>
  );
}

function LeaderboardRow({ user, isMe }: { user: LeaderboardUser; isMe: boolean }) {
  const style = RANK_STYLES[user.rank];
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
      isMe ? 'bg-primary/10 border-primary/30' : style ? `${style.bg}` : 'bg-[#1A1A1A] border-white/5'
    }`}>
      <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full text-sm flex-shrink-0 ${
        style ? style.badge : 'bg-white/5 text-gray-400'
      }`}>
        {user.rank}
      </div>
      <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium truncate">
          {user.name} {isMe && <span className="text-primary text-xs">(you)</span>}
        </div>
      </div>
      <div className={`font-bold flex-shrink-0 ${style ? style.text : 'text-primary'}`}>
        {user.points.toLocaleString()} pts
      </div>
    </div>
  );
}

function LeaderboardContent() {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await scoresApi.getLeaderboard(20);
      setData(res.leaderboard);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <MobileContainer>
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Header */}
        <div className="p-6 pt-8 flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500/10 rounded-2xl">
            <Trophy size={22} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
            <p className="text-xs text-gray-500">Earn points by logging food & exercise daily</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : error ? (
          <div className="text-center text-red-400 py-12 px-6">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-center py-20 px-6 space-y-3">
            <Medal size={40} className="text-gray-600 mx-auto" />
            <p className="text-gray-400">No scores yet.</p>
            <p className="text-gray-600 text-sm">Start logging food and exercise to earn points!</p>
          </div>
        ) : (
          <div className="px-6 space-y-6">
            {/* Podium */}
            {top3.length === 3 && (
              <div className="flex gap-3 items-end">
                {/* 2nd */}
                <div className="flex-1 mt-4"><PodiumCard user={top3[1]} /></div>
                {/* 1st — taller */}
                <div className="flex-1"><PodiumCard user={top3[0]} /></div>
                {/* 3rd */}
                <div className="flex-1 mt-8"><PodiumCard user={top3[2]} /></div>
              </div>
            )}

            {/* Rest of list */}
            {rest.length > 0 && (
              <div className="space-y-2">
                {rest.map((u) => (
                  <LeaderboardRow key={u.rank} user={u} isMe={u.name === user?.name} />
                ))}
              </div>
            )}

            {/* How points work */}
            <div className="bg-[#1A1A1A] rounded-2xl p-4 space-y-2">
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">How to earn points</div>
              {[
                ['Log a meal', '+10 pts'],
                ['Log exercise', '+15 pts'],
                ['Stay in calorie goal', '+20 pts/day'],
                ['Maintain a streak', '+5 pts/day'],
              ].map(([action, pts]) => (
                <div key={action} className="flex justify-between text-sm">
                  <span className="text-gray-400">{action}</span>
                  <span className="text-primary font-semibold">{pts}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav onAddClick={() => setIsAddOpen(true)} />
      <AddEntryModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetch} />
    </MobileContainer>
  );
}

export default function LeaderboardPage() {
  return (
    <ProtectedRoute><LeaderboardContent /></ProtectedRoute>
  );
}
