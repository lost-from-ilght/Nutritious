import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { JWTPayload } from '../middleware/auth';
import { getToday } from '../utils/date';

/**
 * Generate JWT token
 */
const generateToken = (userId: string, email: string): string => {
  const payload: JWTPayload = { userId, email };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * POST /auth/signup
 * Create a new user account
 */
export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      lastLogin: getToday(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      streakCount: true,
      totalScore: true,
      calorieGoal: true,
    },
  });
  
  // Generate token
  const token = generateToken(user.id, user.email);
  
  // Create initial streak record
  await prisma.streak.create({
    data: {
      userId: user.id,
      startDate: getToday(),
      currentStreak: 0,
      longestStreak: 0,
    },
  });
  
  res.status(201).json({
    message: 'User created successfully',
    user,
    token,
  });
};

/**
 * POST /auth/login
 * Authenticate user and return token
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }
  
  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  
  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401);
  }
  
  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: getToday() },
  });
  
  // Generate token
  const token = generateToken(user.id, user.email);
  
  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      streakCount: user.streakCount,
      totalScore: user.totalScore,
      calorieGoal: user.calorieGoal,
    },
    token,
  });
};

/**
 * POST /auth/logout
 * Invalidate token (client-side, but we can track it if needed)
 */
export const logout = async (req: Request, res: Response) => {
  // In a stateless JWT system, logout is handled client-side
  // You could implement token blacklisting here if needed
  res.json({ message: 'Logout successful' });
};

