import express, { Express } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import foodRoutes from './routes/foodRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import scoreRoutes from './routes/scoreRoutes';
import streakRoutes from './routes/streakRoutes';
import aiRoutes from './routes/aiRoutes';
import progressRoutes from './routes/progressRoutes';

/**
 * Create and configure Express app
 */
export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-token'],
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/food', foodRoutes);
  app.use('/api/exercise', exerciseRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/scores', scoreRoutes);
  app.use('/api/streaks', streakRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/progress', progressRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};

