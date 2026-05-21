import { Router } from 'express';
import { getProfile, updateProfile, getWeightHistory, logWeight, deleteWeightLog, getLeaderboard } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.get('/profile',        asyncHandler(getProfile));
router.put('/profile',        asyncHandler(updateProfile));
router.get('/weight',         asyncHandler(getWeightHistory));
router.post('/weight',        asyncHandler(logWeight));
router.delete('/weight/:date', asyncHandler(deleteWeightLog));
router.get('/leaderboard',    asyncHandler(getLeaderboard));

export default router;
