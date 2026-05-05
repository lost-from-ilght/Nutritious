import { prisma } from '../config/database';
import { getToday, getDateString, isSameDay, getDaysAgo } from '../utils/date';
import { getStreakMilestoneScore } from '../utils/scoring';
import { awardScore } from './nutritionService';

/**
 * Service for streak tracking and management
 */

/**
 * Update user streak based on activity
 */
export const updateStreak = async (userId: string) => {
  const today = getToday();
  const yesterday = getDaysAgo(1);
  
  // Get or create streak record
  let streak = await prisma.streak.findUnique({
    where: { userId },
  });
  
  if (!streak) {
    streak = await prisma.streak.create({
      data: {
        userId,
        startDate: today,
        currentStreak: 1,
        longestStreak: 1,
      },
    });
    return streak;
  }
  
  // Check if user logged activity today
  const startOfDay = new Date(today);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setUTCHours(23, 59, 59, 999);
  
  const hasActivityToday = await prisma.dailySummary.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });
  
  if (!hasActivityToday) {
    // No activity today, streak might be broken
    return streak;
  }
  
  // Check if last activity was yesterday (streak continues)
  const lastActivityDate = streak.endDate || streak.startDate;
  const isConsecutive = isSameDay(lastActivityDate, yesterday) || isSameDay(lastActivityDate, today);
  
  if (isConsecutive) {
    // Streak continues
    const newStreakCount = isSameDay(lastActivityDate, yesterday)
      ? streak.currentStreak + 1
      : streak.currentStreak;
    
    const longestStreak = Math.max(newStreakCount, streak.longestStreak);
    
    streak = await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: newStreakCount,
        longestStreak,
        endDate: today,
      },
    });
    
    // Check for milestone scores
    const milestone = getStreakMilestoneScore(newStreakCount);
    if (milestone.reason) {
      await awardScore(userId, milestone.reason);
    }
  } else if (!isSameDay(lastActivityDate, today)) {
    // Streak broken, start new streak
    streak = await prisma.streak.update({
      where: { userId },
      data: {
        startDate: today,
        endDate: today,
        currentStreak: 1,
      },
    });
  }
  
  // Update user's streak count
  await prisma.user.update({
    where: { id: userId },
    data: {
      streakCount: streak.currentStreak,
    },
  });
  
  return streak;
};

/**
 * Get streak information for a user
 */
export const getUserStreak = async (userId: string) => {
  let streak = await prisma.streak.findUnique({
    where: { userId },
  });
  
  if (!streak) {
    // Create initial streak record
    streak = await prisma.streak.create({
      data: {
        userId,
        startDate: getToday(),
        currentStreak: 0,
        longestStreak: 0,
      },
    });
  }
  
  return streak;
};

