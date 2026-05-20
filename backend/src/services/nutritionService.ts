import { prisma } from '../config/database';
import { getToday, getDateString, getStartOfDay, getEndOfDay } from '../utils/date';
import { calculateNetCalories, getActivityStatus } from '../utils/calculations';

/**
 * Service for nutrition-related calculations and updates
 */

/**
 * Update or create daily summary for a user
 */
export const updateDailySummary = async (userId: string, date: Date = getToday()) => {
  const dateString = getDateString(date);
  const startOfDay = getStartOfDay(date);
  const endOfDay = getEndOfDay(date);
  
  // Get all food logs for the day
  const foodLogs = await prisma.foodLog.findMany({
    where: {
      userId,
      timestamp: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });
  
  // Get all exercise logs for the day
  const exerciseLogs = await prisma.exerciseLog.findMany({
    where: {
      userId,
      timestamp: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });
  
  // Calculate totals
  const caloriesConsumed = foodLogs.reduce((sum, log) => sum + log.calories, 0);
  const caloriesBurned = exerciseLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);
  const protein = foodLogs.reduce((sum, log) => sum + log.protein, 0);
  const carbs = foodLogs.reduce((sum, log) => sum + log.carbs, 0);
  const fats = foodLogs.reduce((sum, log) => sum + log.fats, 0);
  const netCalories = calculateNetCalories(caloriesConsumed, caloriesBurned);
  
  // Get user's calorie goal
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { calorieGoal: true },
  });
  
  const calorieGoal = user?.calorieGoal || 2000;
  
  // Update or create daily summary
  const summary = await prisma.dailySummary.upsert({
    where: {
      userId_date: {
        userId,
        date: new Date(dateString),
      },
    },
    update: {
      caloriesConsumed,
      caloriesBurned,
      netCalories,
      protein,
      carbs,
      fats,
    },
    create: {
      userId,
      date: new Date(dateString),
      caloriesConsumed,
      caloriesBurned,
      netCalories,
      protein,
      carbs,
      fats,
    },
  });
  
  // Update activity graph
  const status = getActivityStatus(caloriesConsumed, caloriesBurned, calorieGoal);
  await prisma.activityGraph.upsert({
    where: {
      userId_date: {
        userId,
        date: new Date(dateString),
      },
    },
    update: {
      status,
    },
    create: {
      userId,
      date: new Date(dateString),
      status,
    },
  });
  
  // Goal hit logic removed (no more scores from food)
  
  return summary;
};

