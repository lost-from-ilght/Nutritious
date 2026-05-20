import React from 'react';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Trophy } from 'lucide-react';

export default function LeaderboardPage() {
  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col items-center justify-center p-5 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Trophy size={40} className="text-primary" />
        </div>
        <h1 className="font-game text-2xl mb-2 text-foreground">LEADERBOARD</h1>
        <p className="text-muted text-sm uppercase tracking-wider font-bold">
          Coming Soon: Valorant Rank Leaderboard
        </p>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
