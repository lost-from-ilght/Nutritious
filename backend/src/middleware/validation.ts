import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

/**
 * Middleware to check validation results
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules
export const signupValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const foodLogValidation = [
  body('foodName').trim().isLength({ min: 1, max: 200 }).withMessage('Food name is required'),
  body('calories').isInt({ min: 0 }).withMessage('Calories must be a non-negative integer'),
  body('protein').isFloat({ min: 0 }).withMessage('Protein must be a non-negative number'),
  body('carbs').isFloat({ min: 0 }).withMessage('Carbs must be a non-negative number'),
  body('fats').isFloat({ min: 0 }).withMessage('Fats must be a non-negative number'),
  body('details').optional().isString().isLength({ max: 500 }).withMessage('Details must be less than 500 characters'),
];

export const exerciseLogValidation = [
  body('exerciseName').trim().isLength({ min: 1, max: 200 }).withMessage('Exercise name is required'),
  body('caloriesBurned').isInt({ min: 0 }).withMessage('Calories burned must be a non-negative integer'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer (minutes)'),
  body('details').optional().isString().isLength({ max: 500 }).withMessage('Details must be less than 500 characters'),
];

export const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('avatarUrl').optional().isURL().withMessage('Avatar URL must be a valid URL'),
  body('calorieGoal').optional().isInt({ min: 1000, max: 5000 }).withMessage('Calorie goal must be between 1000 and 5000'),
];

