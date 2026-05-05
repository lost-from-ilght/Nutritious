import { Router } from 'express';
import { getStreaks } from '../controllers/streakController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Streak routes require authentication
router.use(authenticate);

router.get('/', asyncHandler(getStreaks));

export default router;

