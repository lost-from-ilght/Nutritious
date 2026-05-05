import { Router } from 'express';
import {
  logExercise,
  getRecentExercise,
  getExerciseById,
  updateExercise,
  deleteExercise,
} from '../controllers/exerciseController';
import { exerciseLogValidation, validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All exercise routes require authentication
router.use(authenticate);

router.post('/', exerciseLogValidation, validate, asyncHandler(logExercise));
router.get('/recent', asyncHandler(getRecentExercise));
router.get('/:id', asyncHandler(getExerciseById));
router.put('/:id', exerciseLogValidation, validate, asyncHandler(updateExercise));
router.delete('/:id', asyncHandler(deleteExercise));

export default router;

