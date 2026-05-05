import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { getToday } from '../utils/date';

const app = createApp();

describe('Dashboard Routes', () => {
  let userId: string;
  let token: string;

  beforeEach(async () => {
    // Clean up test data
    await prisma.score.deleteMany();
    await prisma.activityGraph.deleteMany();
    await prisma.dailySummary.deleteMany();
    await prisma.exerciseLog.deleteMany();
    await prisma.foodLog.deleteMany();
    await prisma.streak.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash,
        calorieGoal: 2000,
      },
    });

    userId = user.id;
    token = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/dashboard', () => {
    it('should get dashboard data', async () => {
      // Create some test data
      await prisma.foodLog.create({
        data: {
          userId,
          foodName: 'Test Food',
          calories: 500,
          protein: 30,
          carbs: 50,
          fats: 20,
        },
      });

      await prisma.exerciseLog.create({
        data: {
          userId,
          exerciseName: 'Test Exercise',
          caloriesBurned: 200,
          duration: 30,
        },
      });

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('calorieGoal');
      expect(response.body).toHaveProperty('macros');
      expect(response.body).toHaveProperty('activityGraph');
      expect(response.body).toHaveProperty('recentActivity');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/dashboard');

      expect(response.status).toBe(401);
    });
  });
});

