import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { getUserStreak } from '../services/streakService';
import {
  calculateTDEE,
  calculateCalorieGoalFromTDEE,
} from '../utils/calculations';
import { getToday } from '../utils/date';

import { evaluateUserConsistency } from '../services/rrService';

/**
 * GET /user/profile
 */
export const getProfile = async (req: Request, res: Response) => {
  const userId = req.userId!;

  // Lazy evaluation of rank demotion
  await evaluateUserConsistency(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      streakCount: true,
      groqApiKey: true,
      totalRR: true,
      currentRR: true,
      rank: true,
      tier: true,
      agentAvatar: true,
      lastLogin: true,
      calorieGoal: true,
      age: true,
      gender: true,
      heightCm: true,
      currentWeightKg: true,
      targetWeightKg: true,
      activityLevel: true,
      goalType: true,
    },
  });

  if (!user) throw new AppError('User not found', 404);

  const streak = await getUserStreak(userId);



  // Latest weight log
  const latestWeight = await prisma.weightLog.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
    select: { weightKg: true, date: true },
  });

  res.json({
    user: {
      ...user,
      groqApiKey: undefined,
      hasGroqKey: !!user.groqApiKey,
      streak: {
        current: streak.currentStreak,
        longest: streak.longestStreak,
        startDate: streak.startDate,
        endDate: streak.endDate,
      },

      latestWeight,
    },
  });
};

/**
 * PUT /user/profile
 * Accepts physical stats; auto-recalculates calorie goal via TDEE if enough data.
 */
export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const {
    name, avatarUrl, agentAvatar, groqApiKey, calorieGoal,
    age, gender, heightCm, currentWeightKg, targetWeightKg,
    activityLevel, goalType,
  } = req.body;

  const updateData: Record<string, any> = {};
  if (name             !== undefined) updateData.name             = name;
  if (avatarUrl        !== undefined) updateData.avatarUrl        = avatarUrl;
  if (agentAvatar      !== undefined) updateData.agentAvatar      = agentAvatar;
  if (groqApiKey       !== undefined) updateData.groqApiKey       = groqApiKey;
  if (age              !== undefined) updateData.age              = Number(age);
  if (gender           !== undefined) updateData.gender           = gender;
  if (heightCm         !== undefined) updateData.heightCm         = Number(heightCm);
  if (currentWeightKg  !== undefined) updateData.currentWeightKg  = Number(currentWeightKg);
  if (targetWeightKg   !== undefined) updateData.targetWeightKg   = Number(targetWeightKg);
  if (activityLevel    !== undefined) updateData.activityLevel    = activityLevel;
  if (goalType         !== undefined) updateData.goalType         = goalType;

  // Fetch current user to fill in any missing fields for TDEE calc
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { age: true, gender: true, heightCm: true, currentWeightKg: true, activityLevel: true, goalType: true },
  });

  const merged = { ...current, ...updateData };

  // Auto-calculate calorie goal from TDEE if we have enough data
  // (only override if caller didn't explicitly send calorieGoal)
  if (calorieGoal !== undefined) {
    updateData.calorieGoal = Number(calorieGoal);
  } else if (merged.age && merged.gender && merged.heightCm && merged.currentWeightKg) {
    const tdee = calculateTDEE({
      age:           merged.age,
      gender:        merged.gender,
      heightCm:      merged.heightCm,
      weightKg:      merged.currentWeightKg,
      activityLevel: merged.activityLevel ?? 'sedentary',
    });
    if (tdee) {
      updateData.calorieGoal = calculateCalorieGoalFromTDEE(tdee, merged.goalType ?? 'lose');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true, name: true, email: true, avatarUrl: true,
      calorieGoal: true, age: true, gender: true,
      heightCm: true, currentWeightKg: true, targetWeightKg: true,
      activityLevel: true, goalType: true,
    },
  });

  // If currentWeightKg was updated, also log it as today's weight entry
  if (currentWeightKg !== undefined) {
    await prisma.weightLog.upsert({
      where: { userId_date: { userId, date: getToday() } },
      update: { weightKg: Number(currentWeightKg) },
      create: { userId, weightKg: Number(currentWeightKg), date: getToday() },
    });
  }

  res.json({ message: 'Profile updated', user });
};

/**
 * GET /user/weight
 * Returns weight log history (last 90 days).
 */
export const getWeightHistory = async (req: Request, res: Response) => {
  const userId = req.userId!;

  const logs = await prisma.weightLog.findMany({
    where: {
      userId,
      date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { date: 'asc' },
    select: { date: true, weightKg: true, note: true },
  });

  res.json({ logs });
};

/**
 * POST /user/weight
 * Log today's weight.
 */
export const logWeight = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { weightKg, note, date } = req.body;

  if (!weightKg || isNaN(Number(weightKg))) {
    throw new AppError('weightKg is required', 400);
  }

  const logDate = date ? new Date(date) : getToday();

  const entry = await prisma.weightLog.upsert({
    where: { userId_date: { userId, date: logDate } },
    update: { weightKg: Number(weightKg), note },
    create: { userId, weightKg: Number(weightKg), date: logDate, note },
  });

  // Keep currentWeightKg on the user in sync with the latest log
  await prisma.user.update({
    where: { id: userId },
    data: { currentWeightKg: Number(weightKg) },
  });

  res.json({ entry });
};

/**
 * DELETE /user/weight/:date  (date = YYYY-MM-DD)
 */
export const deleteWeightLog = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { date } = req.params;
  const logDate = new Date(date);

  await prisma.weightLog.deleteMany({
    where: { userId, date: logDate },
  });

  res.json({ message: 'Weight log deleted' });
};

/**
 * GET /user/leaderboard
 * Get top 50 users by total RR
 */
export const getLeaderboard = async (req: Request, res: Response) => {
  const topUsers = await prisma.user.findMany({
    orderBy: { totalRR: 'desc' },
    take: 50,
    select: {
      id: true,
      name: true,
      rank: true,
      tier: true,
      totalRR: true,
      avatarUrl: true,
      agentAvatar: true,
    },
  });

  res.json({ leaderboard: topUsers });
};

/**
 * GET /user/public/:id
 * Get public profile and heat map for a specific user.
 */
export const getPublicProfile = async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      rank: true,
      tier: true,
      totalRR: true,
      agentAvatar: true,
      avatarUrl: true,
      calorieGoal: true,
    },
  });

  if (!user) throw new AppError('User not found', 404);

  const streak = await getUserStreak(id);

  // Heat map: last 7 days of data
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const thisWeekSummaries = await prisma.dailySummary.findMany({
    where: { userId: id, date: { gte: weekStart } },
    orderBy: { date: 'asc' },
  });

  const calorieGoal = user.calorieGoal ?? 2000;

  // Format into daily breakdown
  const dailyBreakdown = thisWeekSummaries.map((s) => ({
    date: s.date.toISOString(), // We use standard ISO string here
    calories: s.netCalories,
    goal: calorieGoal,
    protein: Math.round(s.protein),
    inDeficit: s.netCalories > 0 && s.netCalories <= calorieGoal,
  }));

  res.json({
    user: {
      ...user,
      streak: streak.currentStreak,
    },
    weeklyProgress: {
      dailyBreakdown,
      calorieGoal,
    },
  });
};
