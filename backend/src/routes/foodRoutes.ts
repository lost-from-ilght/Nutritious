import { Router } from 'express';
import {
  logFood,
  getRecentFood,
  getFoodById,
  updateFood,
  deleteFood,
} from '../controllers/foodController';
import { foodLogValidation, validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All food routes require authentication
router.use(authenticate);

router.post('/', foodLogValidation, validate, asyncHandler(logFood));
router.get('/recent', asyncHandler(getRecentFood));
router.get('/:id', asyncHandler(getFoodById));
router.put('/:id', foodLogValidation, validate, asyncHandler(updateFood));
router.delete('/:id', asyncHandler(deleteFood));

export default router;

