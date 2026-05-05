import { Request, Response } from 'express';
import { prisma } from '../config/database';

/**
 * GET /scores
 * Get user scores history
 */
export const getScores = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  
  const scores = await prisma.score.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: limit,
    skip: offset,
    select: {
      id: true,
      points: true,
      reason: true,
      timestamp: true,
    },
  });
  
  const total = await prisma.score.count({
    where: { userId },
  });
  
  res.json({
    scores,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
};

/**
 * GET /scores/leaderboard
 * Get leaderboard of top users by total score
 */
export const getLeaderboard = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  
  const users = await prisma.user.findMany({
    orderBy: { totalScore: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      totalScore: true,
      avatarUrl: true,
    },
  });
  
  const leaderboard = users.map((user, index) => ({
    rank: index + 1,
    name: user.name,
    points: user.totalScore,
    avatar: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
  }));
  
  res.json({ leaderboard });
};

