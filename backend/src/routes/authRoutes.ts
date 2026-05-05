import { Router } from 'express';
import { signup, login, logout } from '../controllers/authController';
import { signupValidation, loginValidation, validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.post('/signup', signupValidation, validate, asyncHandler(signup));
router.post('/login', loginValidation, validate, asyncHandler(login));
router.post('/logout', asyncHandler(logout));

export default router;

