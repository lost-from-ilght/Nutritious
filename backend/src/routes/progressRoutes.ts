import { Router } from 'express';
import { getWeeklyProgress, getMonthlyProgress } from '../controllers/progressController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
router.use(authenticate);

router.get('/weekly',  asyncHandler(getWeeklyProgress));
router.get('/monthly', asyncHandler(getMonthlyProgress));

export default router;
