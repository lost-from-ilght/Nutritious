import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { updateDailySummary, awardDailyLogScore } from '../services/nutritionService';
import { updateStreak } from '../services/streakService';

/**
 * POST /food
 * Log a food entry
 */
export const logFood = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { foodName, calories, protein, carbs, fats, details } = req.body;
  
  // Create food log
  const foodLog = await prisma.foodLog.create({
    data: {
      userId,
      foodName,
      calories,
      protein,
      carbs,
      fats,
      details,
    },
  });
  
  // Update daily summary
  await updateDailySummary(userId);
  
  // Award daily log score
  await awardDailyLogScore(userId);
  
  // Update streak
  await updateStreak(userId);
  
  res.status(201).json({
    message: 'Food logged successfully',
    foodLog,
  });
};

/**
 * GET /food/recent
 * Get recent food logs
 */
export const getRecentFood = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const limit = parseInt(req.query.limit as string) || 20;
  
  const foodLogs = await prisma.foodLog.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: limit,
    select: {
      id: true,
      foodName: true,
      calories: true,
      protein: true,
      carbs: true,
      fats: true,
      timestamp: true,
      details: true,
    },
  });
  
  res.json({ foodLogs });
};

/**
 * GET /food/:id
 * Get a single food entry
 */
export const getFoodById = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;
  
  const foodLog = await prisma.foodLog.findFirst({
    where: {
      id,
      userId,
    },
  });
  
  if (!foodLog) {
    throw new AppError('Food log not found', 404);
  }
  
  res.json({ foodLog });
};

/**
 * PUT /food/:id
 * Update a food entry
 */
export const updateFood = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;
  const { foodName, calories, protein, carbs, fats, details } = req.body;
  
  // Check if food log exists and belongs to user
  const existingLog = await prisma.foodLog.findFirst({
    where: {
      id,
      userId,
    },
  });
  
  if (!existingLog) {
    throw new AppError('Food log not found', 404);
  }
  
  // Update food log
  const foodLog = await prisma.foodLog.update({
    where: { id },
    data: {
      foodName,
      calories,
      protein,
      carbs,
      fats,
      details,
    },
  });
  
  // Update daily summary
  await updateDailySummary(userId, existingLog.timestamp);
  
  res.json({
    message: 'Food log updated successfully',
    foodLog,
  });
};

/**
 * DELETE /food/:id
 * Delete a food entry
 */
export const deleteFood = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;
  
  // Check if food log exists and belongs to user
  const existingLog = await prisma.foodLog.findFirst({
    where: {
      id,
      userId,
    },
  });
  
  if (!existingLog) {
    throw new AppError('Food log not found', 404);
  }
  
  const logDate = existingLog.timestamp;
  
  // Delete food log
  await prisma.foodLog.delete({
    where: { id },
  });
  
  // Update daily summary
  await updateDailySummary(userId, logDate);
  
  res.json({ message: 'Food log deleted successfully' });
};

