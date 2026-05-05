import { Request, Response } from 'express';
import { getUserStreak } from '../services/streakService';

/**
 * GET /streaks
 * Get current and longest streaks
 */
export const getStreaks = async (req: Request, res: Response) => {
  const userId = req.userId!;
  
  const streak = await getUserStreak(userId);
  
  res.json({
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    startDate: streak.startDate,
    endDate: streak.endDate,
  });
};

