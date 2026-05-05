import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const app = createApp();

describe('Food Routes', () => {
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
      },
    });

    userId = user.id;
    token = jwt.sign({ userId: user.id, email: user.email }, env.JWT_SECRET);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/food', () => {
    it('should log a food entry', async () => {
      const response = await request(app)
        .post('/api/food')
        .set('Authorization', `Bearer ${token}`)
        .send({
          foodName: 'Grilled Chicken',
          calories: 300,
          protein: 30,
          carbs: 0,
          fats: 15,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('foodLog');
      expect(response.body.foodLog.foodName).toBe('Grilled Chicken');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/food')
        .send({
          foodName: 'Grilled Chicken',
          calories: 300,
          protein: 30,
          carbs: 0,
          fats: 15,
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/food')
        .set('Authorization', `Bearer ${token}`)
        .send({
          foodName: 'Grilled Chicken',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/food/recent', () => {
    beforeEach(async () => {
      // Create some food logs
      await prisma.foodLog.createMany({
        data: [
          {
            userId,
            foodName: 'Food 1',
            calories: 100,
            protein: 10,
            carbs: 10,
            fats: 5,
          },
          {
            userId,
            foodName: 'Food 2',
            calories: 200,
            protein: 20,
            carbs: 20,
            fats: 10,
          },
        ],
      });
    });

    it('should get recent food logs', async () => {
      const response = await request(app)
        .get('/api/food/recent')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('foodLogs');
      expect(response.body.foodLogs.length).toBeGreaterThan(0);
    });
  });
});

