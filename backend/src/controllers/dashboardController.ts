import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { getToday, getDateString, getDaysAgo } from '../utils/date';
import { calculateRecommendedMacros } from '../utils/calculations';

import { evaluateUserConsistency } from '../services/rrService';

/**
 * GET /dashboard
 * Get dashboard data: calorie goal card, macros, activity graph, recent activity
 */
export const getDashboard = async (req: Request, res: Response) => {
  const userId = req.userId!;
  
  // Lazy evaluation of rank demotion
  await evaluateUserConsistency(userId);

  const today = getToday();

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      calorieGoal: true,
      goalType: true,
      currentWeightKg: true,
      targetWeightKg: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Get today's summary
  const todaySummary = await prisma.dailySummary.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  const caloriesConsumed = todaySummary?.caloriesConsumed || 0;
  const caloriesBurned = todaySummary?.caloriesBurned || 0;
  const netCalories = todaySummary?.netCalories || 0;
  const protein = todaySummary?.protein || 0;
  const carbs = todaySummary?.carbs || 0;
  const fats = todaySummary?.fats || 0;

  // Get recommended macros
  const recommendedMacros = calculateRecommendedMacros(user.calorieGoal, user.goalType ?? 'maintain');

  // Get activity graph data (last 50 days)
  const activityGraph = await prisma.activityGraph.findMany({
    where: {
      userId,
      date: {
        gte: getDaysAgo(50),
      },
    },
    orderBy: { date: 'asc' },
    select: {
      date: true,
      status: true,
    },
  });

  // Get recent activity (food and exercise logs)
  const recentFoodLogs = await prisma.foodLog.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: 50,
  });

  const recentExerciseLogs = await prisma.exerciseLog.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: 50,
  });

  // Combine and sort recent activity
  const recentActivity = [
    ...recentFoodLogs.map(log => ({
      id: log.id,
      title: log.foodName,
      calories: log.calories,
      type: 'food' as const,
      timestamp: log.timestamp,
      time: new Date(log.timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      details: (log as any).details || undefined,

    })),
    ...recentExerciseLogs.map(log => ({
      id: log.id,
      title: log.exerciseName,
      calories: -log.caloriesBurned,
      type: 'exercise' as const,
      timestamp: log.timestamp,
      time: new Date(log.timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      details: (log as any).details || undefined,

    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 50);

  res.json({
    calorieGoal: {
      consumed: caloriesConsumed,
      goal: user.calorieGoal,
      burned: caloriesBurned,
      net: netCalories,
      deficit: user.calorieGoal - netCalories, // positive = still under goal (good for loss)
    },
    macros: {
      protein: {
        current: Math.round(protein),
        total: recommendedMacros.protein,
      },
      carbs: {
        current: Math.round(carbs),
        total: recommendedMacros.carbs,
      },
      fats: {
        current: Math.round(fats),
        total: recommendedMacros.fats,
      },
    },
    activityGraph: activityGraph.map(item => ({
      date: getDateString(item.date),
      status: item.status,
    })),
    recentActivity,
  });
};

