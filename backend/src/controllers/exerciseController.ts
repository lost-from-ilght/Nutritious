import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { updateDailySummary } from '../services/nutritionService';
import { awardRR } from '../services/rrService';
import { updateStreak } from '../services/streakService';

/**
 * POST /exercise
 * Log an exercise entry
 */
export const logExercise = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { exerciseName, caloriesBurned, duration, details } = req.body;
  
  // Create exercise log
  const exerciseLog = await prisma.exerciseLog.create({
    data: {
      userId,
      exerciseName,
      caloriesBurned,
      duration,
      details,
    },
  });
  
  // Update daily summary
  await updateDailySummary(userId);
  
  // Award RR based on duration (15 RR per 30 minutes => 0.5 RR per min)
  const rrToAward = Math.max(1, Math.ceil(duration / 2));
  const rrResult = await awardRR(userId, rrToAward);
  
  // Update streak
  await updateStreak(userId);
  
  res.status(201).json({
    message: 'Exercise logged successfully',
    exerciseLog,
    rrResult
  });
};

/**
 * GET /exercise/recent
 * Get recent exercise logs
 */
export const getRecentExercise = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const limit = parseInt(req.query.limit as string) || 20;
  
  const exerciseLogs = await prisma.exerciseLog.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: limit,
    select: {
      id: true,
      exerciseName: true,
      caloriesBurned: true,
      duration: true,
      timestamp: true,
      details: true,
    },
  });
  
  res.json({ exerciseLogs });
};

/**
 * GET /exercise/:id
 * Get a single exercise entry
 */
export const getExerciseById = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;
  
  const exerciseLog = await prisma.exerciseLog.findFirst({
    where: {
      id,
      userId,
    },
  });
  
  if (!exerciseLog) {
    throw new AppError('Exercise log not found', 404);
  }
  
  res.json({ exerciseLog });
};

/**
 * PUT /exercise/:id
 * Update an exercise entry
 */
export const updateExercise = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;
  const { exerciseName, caloriesBurned, duration, details } = req.body;
  
  // Check if exercise log exists and belongs to user
  const existingLog = await prisma.exerciseLog.findFirst({
    where: {
      id,
      userId,
    },
  });
  
  if (!existingLog) {
    throw new AppError('Exercise log not found', 404);
  }
  
  // Update exercise log
  const exerciseLog = await prisma.exerciseLog.update({
    where: { id },
    data: {
      exerciseName,
      caloriesBurned,
      duration,
      details,
    },
  });
  
  // Update daily summary
  await updateDailySummary(userId, existingLog.timestamp);
  
  res.json({
    message: 'Exercise log updated successfully',
    exerciseLog,
  });
};

/**
 * DELETE /exercise/:id
 * Delete an exercise entry
 */
export const deleteExercise = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { id } = req.params;
  
  // Check if exercise log exists and belongs to user
  const existingLog = await prisma.exerciseLog.findFirst({
    where: {
      id,
      userId,
    },
  });
  
  if (!existingLog) {
    throw new AppError('Exercise log not found', 404);
  }
  
  const logDate = existingLog.timestamp;
  
  // Delete exercise log
  await prisma.exerciseLog.delete({
    where: { id },
  });
  
  // Update daily summary
  await updateDailySummary(userId, logDate);
  
  res.json({ message: 'Exercise log deleted successfully' });
};

