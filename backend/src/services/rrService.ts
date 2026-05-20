import { prisma } from '../config/database';
import { getToday, getStartOfDay, getEndOfDay } from '../utils/date';

const RANKS = [
  'IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'ASCENDANT', 'IMMORTAL', 'RADIANT'
];

export const awardRR = async (userId: string, amount: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentRR: true, totalRR: true, rank: true, tier: true, dailyRRGained: true, lastRRGainedAt: true }
  });

  if (!user) return { rrGained: 0, rankUp: false, newRank: null, newTier: null };

  const today = getStartOfDay(getToday());
  
  // Reset daily limit if it's a new day
  let currentDailyRR = user.dailyRRGained;
  if (!user.lastRRGainedAt || user.lastRRGainedAt < today) {
    currentDailyRR = 0;
  }

  // Calculate actual RR to give, up to daily cap of 33
  let rrToGive = amount;
  if (currentDailyRR + rrToGive > 33) {
    rrToGive = 33 - currentDailyRR;
  }

  if (rrToGive <= 0) {
    return { rrGained: 0, rankUp: false, newRank: user.rank, newTier: user.tier };
  }

  let newRR = user.currentRR + rrToGive;
  let newTier = user.tier;
  let newRank = user.rank;
  if (newRank === 'UNRANKED') {
    newRank = 'IRON';
    newTier = 1;
  }

  let rankUp = false;
  
  // Handle rank ups
  while (newRR >= 100 && newRank !== 'RADIANT') {
    newRR -= 100;
    
    // In Valorant, you typically get a baseline of 10 RR upon promotion
    newRR = Math.max(10, newRR);
    
    if (newTier < 3) {
      newTier += 1;
    } else {
      const rankIndex = RANKS.indexOf(newRank);
      if (rankIndex < RANKS.length - 1) {
        newRank = RANKS[rankIndex + 1];
        newTier = 1;
        rankUp = true; // Major rank up!
      } else {
        // Capped at radiant
        newRR = 100; 
        break;
      }
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentRR: newRR,
      totalRR: user.totalRR + rrToGive,
      rank: newRank,
      tier: newTier,
      dailyRRGained: currentDailyRR + rrToGive,
      lastRRGainedAt: new Date()
    }
  });

  return {
    rrGained: rrToGive,
    rankUp,
    newRank,
    newTier,
    currentRR: newRR
  };
};
