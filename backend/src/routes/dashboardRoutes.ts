import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Dashboard route requires authentication
router.use(authenticate);

router.get('/', asyncHandler(getDashboard));

export default router;

