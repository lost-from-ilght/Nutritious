import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { getDaysAgo, getDateString, getToday } from '../utils/date';

/**
 * GET /progress/weekly
 * Returns stats for the current week (Mon–today) and previous week for comparison.
 */
export const getWeeklyProgress = async (req: Request, res: Response) => {
  const userId = req.userId!;

  // Current week: last 7 days
  const weekStart = getDaysAgo(6);
  const prevWeekStart = getDaysAgo(13);
  const prevWeekEnd = getDaysAgo(7);

  const [thisWeekSummaries, prevWeekSummaries, weightLogs, user] = await Promise.all([
    prisma.dailySummary.findMany({
      where: { userId, date: { gte: weekStart } },
      orderBy: { date: 'asc' },
    }),
    prisma.dailySummary.findMany({
      where: { userId, date: { gte: prevWeekStart, lte: prevWeekEnd } },
      orderBy: { date: 'asc' },
    }),
    prisma.weightLog.findMany({
      where: { userId, date: { gte: getDaysAgo(30) } },
      orderBy: { date: 'asc' },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { calorieGoal: true, targetWeightKg: true, goalType: true },
    }),
  ]);

  const calorieGoal = user?.calorieGoal ?? 2000;

  const summarise = (summaries: typeof thisWeekSummaries) => {
    const daysWithData = summaries.filter(
      (s) => s.caloriesConsumed > 0 || s.caloriesBurned > 0
    );
    const daysInDeficit = summaries.filter(
      (s) => s.netCalories > 0 && s.netCalories <= calorieGoal
    ).length;
    const avgCalories =
      daysWithData.length > 0
        ? Math.round(
            daysWithData.reduce((sum, s) => sum + s.netCalories, 0) /
              daysWithData.length
          )
        : 0;
    const avgProtein =
      daysWithData.length > 0
        ? Math.round(
            daysWithData.reduce((sum, s) => sum + s.protein, 0) /
              daysWithData.length
          )
        : 0;
    const totalCaloriesBurned = summaries.reduce(
      (sum, s) => sum + s.caloriesBurned,
      0
    );
    return { daysWithData: daysWithData.length, daysInDeficit, avgCalories, avgProtein, totalCaloriesBurned };
  };

  const thisWeek = summarise(thisWeekSummaries);
  const prevWeek = summarise(prevWeekSummaries);

  // Weight change this week
  const weekWeights = weightLogs.filter(
    (w) => w.date >= weekStart
  );
  const weightChangeThisWeek =
    weekWeights.length >= 2
      ? weekWeights[weekWeights.length - 1].weightKg - weekWeights[0].weightKg
      : null;

  // Daily breakdown for chart (last 7 days)
  const dailyBreakdown = thisWeekSummaries.map((s) => ({
    date: getDateString(s.date),
    calories: s.netCalories,
    goal: calorieGoal,
    protein: Math.round(s.protein),
    inDeficit: s.netCalories > 0 && s.netCalories <= calorieGoal,
  }));

  res.json({
    thisWeek: { ...thisWeek, weightChange: weightChangeThisWeek },
    prevWeek,
    dailyBreakdown,
    calorieGoal,
  });
};

/**
 * GET /progress/monthly
 * Returns per-week aggregates for the last 4 weeks.
 */
export const getMonthlyProgress = async (req: Request, res: Response) => {
  const userId = req.userId!;

  const summaries = await prisma.dailySummary.findMany({
    where: { userId, date: { gte: getDaysAgo(27) } },
    orderBy: { date: 'asc' },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { calorieGoal: true },
  });
  const calorieGoal = user?.calorieGoal ?? 2000;

  // Group into 4 weeks
  const weeks: { label: string; avgCalories: number; daysInDeficit: number; avgProtein: number }[] = [];
  for (let w = 3; w >= 0; w--) {
    const start = getDaysAgo(w * 7 + 6);
    const end = getDaysAgo(w * 7);
    const slice = summaries.filter((s) => s.date >= start && s.date <= end);
    const withData = slice.filter((s) => s.caloriesConsumed > 0);
    weeks.push({
      label: `Week ${4 - w}`,
      avgCalories:
        withData.length > 0
          ? Math.round(withData.reduce((s, d) => s + d.netCalories, 0) / withData.length)
          : 0,
      daysInDeficit: slice.filter(
        (s) => s.netCalories > 0 && s.netCalories <= calorieGoal
      ).length,
      avgProtein:
        withData.length > 0
          ? Math.round(withData.reduce((s, d) => s + d.protein, 0) / withData.length)
          : 0,
    });
  }

  // Weight logs for the month
  const weightLogs = await prisma.weightLog.findMany({
    where: { userId, date: { gte: getDaysAgo(27) } },
    orderBy: { date: 'asc' },
    select: { date: true, weightKg: true },
  });

  res.json({ weeks, weightLogs: weightLogs.map((w) => ({ date: getDateString(w.date), weightKg: w.weightKg })), calorieGoal });
};
