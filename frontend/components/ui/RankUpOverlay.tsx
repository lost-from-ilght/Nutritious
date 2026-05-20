import React, { useEffect } from 'react';
import { Trophy, ChevronUp } from 'lucide-react';

interface RankUpOverlayProps {
  rank: string;
  tier: number;
  onClose: () => void;
}

export function RankUpOverlay({ rank, tier, onClose }: RankUpOverlayProps) {
  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const badgeUrl = `/ranks/${rank}_${tier}.png`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center animate-in zoom-in-50 slide-in-from-bottom-10 duration-700 ease-out">
        {/* Glow behind badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--primary)]/30 rounded-full blur-[60px]" />

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="text-[var(--primary)] font-game text-xl tracking-[0.4em] uppercase flex items-center gap-2">
            <ChevronUp size={24} className="animate-bounce" />
            Promoted
            <ChevronUp size={24} className="animate-bounce" />
          </div>

          <div className="relative">
            <img 
              src={badgeUrl} 
              alt={`${rank} ${tier}`} 
              className="w-48 h-48 object-contain drop-shadow-[0_0_30px_rgba(255,70,85,0.4)]"
            />
          </div>

          <div className="text-center space-y-2">
            <h1 className="font-game text-5xl tracking-widest text-white uppercase text-glow-red">
              {rank} <span className="text-[var(--primary)]">{tier}</span>
            </h1>
            <p className="text-gray-400 uppercase tracking-widest text-sm font-bold">
              Rank Rating: 10 RR
            </p>
          </div>

          <button 
            onClick={onClose}
            className="mt-8 px-8 py-3 bg-white/5 border border-white/10 text-gray-300 uppercase font-game tracking-widest clip-btn hover:bg-white/10 hover:text-white transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
