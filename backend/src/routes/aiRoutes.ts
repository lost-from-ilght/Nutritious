import { Router } from 'express';
import { processEntry } from '../controllers/aiController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

// POST /api/ai/process
router.post('/process', asyncHandler(processEntry));

export default router;
