import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  next();
};

export const registerValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .trim()
    .escape(),
  
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .trim()
    .escape(),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13 and 120 years');
      }
      return true;
    }),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('languagePreference')
    .optional()
    .isIn(['en', 'hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml', 'pa'])
    .withMessage('Invalid language preference'),
  
  body('timezone')
    .optional()
    .isString()
    .withMessage('Invalid timezone')
];

export const loginValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const profileValidation: ValidationChain[] = [
  body('mentalHealthGoals')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Mental health goals must be an array with maximum 10 items'),
  
  body('stressTriggers')
    .optional()
    .isArray({ max: 15 })
    .withMessage('Stress triggers must be an array with maximum 15 items'),
  
  body('preferredCopingMethods')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Preferred coping methods must be an array with maximum 10 items'),
  
  body('therapyHistory')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Therapy history cannot exceed 1000 characters'),
  
  body('medicationInfo')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Medication info cannot exceed 500 characters'),
  
  body('crisisPlan')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Crisis plan cannot exceed 1000 characters')
];
