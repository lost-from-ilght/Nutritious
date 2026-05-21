import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { processAIEntry } from '../services/aiService';
import { updateDailySummary } from '../services/nutritionService';
import { updateStreak } from '../services/streakService';
import { awardRR } from '../services/rrService';
import { AppError } from '../middleware/errorHandler';

/**
 * POST /ai/process
 * Process a natural language entry using AI
 */
export const processEntry = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { text } = req.body;

  if (!text) {
    throw new AppError('Text is required', 400);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { groqApiKey: true },
    });

    // 2. Process with AI (falls back to Gemini if groqApiKey is missing)
    const result = await processAIEntry(text, user?.groqApiKey || null);
    const { type, data } = result;

    let savedEntry;

    if (type === 'food') {
      // 3a. Save food log
      savedEntry = await prisma.foodLog.create({
        data: {
          userId,
          foodName: data.name,
          calories: Math.round(data.calories),
          protein: data.protein || 0,
          carbs: data.carbs || 0,
          fats: data.fats || 0,
          details: data.details,
        },
      });
    } else if (type === 'exercise') {
      // 3b. Save exercise log
      savedEntry = await prisma.exerciseLog.create({
        data: {
          userId,
          exerciseName: data.name,
          caloriesBurned: Math.round(data.caloriesBurned || data.calories || 0),
          duration: Math.round(data.duration || 0),
          details: data.details,
        },
      });
    } else {
      throw new Error('Unsupported entry type from AI');
    }

    let rrResult = null;
    if (type === 'exercise' && 'duration' in savedEntry && savedEntry.duration) {
      const rrToAward = Math.max(1, Math.ceil(savedEntry.duration / 2));
      rrResult = await awardRR(userId, rrToAward);
    }

    // 4. Post-save operations (updates summaries, streaks)
    await updateDailySummary(userId);
    await updateStreak(userId);

    res.status(200).json({
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} logged successfully via AI`,
      type,
      data: savedEntry,
      rrResult,
    });
  } catch (error) {
    console.error('AI Processing Error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(error instanceof Error ? error.message : 'Failed to process AI entry', 500);
  }
};
