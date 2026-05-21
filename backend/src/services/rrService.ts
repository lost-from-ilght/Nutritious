import { prisma } from '../config/database';
import { getToday, getStartOfDay, getEndOfDay } from '../utils/date';

const RANKS = [
  'PLASTIC', 'IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'ASCENDANT', 'IMMORTAL', 'RADIANT'
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
  let rankUp = false;
  
  if (newRank === 'UNRANKED' || newRank === 'PLASTIC') {
    newRank = 'IRON';
    newTier = 1;
    rankUp = true;
  }
  
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

/**
 * Evaluate user consistency.
 * Users with less than 5 days of exercise in the last 7 days are demoted to PLASTIC.
 */
export const evaluateConsistency = async () => {
  console.log('Evaluating user consistency for rank demotion...');
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const users = await prisma.user.findMany({
    select: { id: true, rank: true }
  });

  let demotedCount = 0;

  for (const user of users) {
    if (user.rank === 'PLASTIC') continue; // Already at the bottom

    const recentLogs = await prisma.exerciseLog.findMany({
      where: {
        userId: user.id,
        timestamp: { gte: sevenDaysAgo }
      },
      select: { timestamp: true }
    });

    // Count distinct days
    const activeDays = new Set(recentLogs.map(l => l.timestamp.toISOString().split('T')[0])).size;

    if (activeDays < 5) {
      // Deduct 50 RR
      let newRR = user.currentRR - 50;
      let newTier = user.tier;
      let newRank = user.rank;
      const newTotalRR = Math.max(0, user.totalRR - 50);

      while (newRR < 0) {
        if (newRank === 'PLASTIC') {
          newRR = 0;
          break;
        }
        
        if (newTier > 1) {
          newTier -= 1;
          newRR += 100;
        } else {
          const rankIndex = RANKS.indexOf(newRank);
          if (rankIndex > 1) { // 0 is PLASTIC, 1 is IRON
            newRank = RANKS[rankIndex - 1];
            newTier = 3;
            newRR += 100;
          } else {
            // Dropping below IRON -> PLASTIC
            newRank = 'PLASTIC';
            newTier = 1;
            newRR = 0;
            break;
          }
        }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          rank: newRank,
          tier: newTier,
          currentRR: newRR,
          totalRR: newTotalRR
        }
      });
      demotedCount++;
    }
  }

  console.log(`Consistency evaluation complete. Demoted ${demotedCount} users to PLASTIC.`);
};
