import { Router } from 'express';
import { getScores, getLeaderboard } from '../controllers/scoreController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Score routes require authentication
router.use(authenticate);

router.get('/', asyncHandler(getScores));
router.get('/leaderboard', asyncHandler(getLeaderboard));

export default router;

