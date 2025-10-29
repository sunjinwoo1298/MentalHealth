import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

// User preferences validation
export const preferencesValidation: ValidationChain[] = [
  body('communicationStyle')
    .isString()
    .withMessage('Communication style must be a string'),
  
  body('preferredTopics')
    .isArray()
    .withMessage('Preferred topics must be an array'),
  
  body('notificationPreferences')
    .isObject()
    .withMessage('Notification preferences must be an object'),
  
  body('notificationPreferences.dailyCheckins')
    .isBoolean()
    .withMessage('Daily check-ins must be a boolean'),
  
  body('notificationPreferences.moodReminders')
    .isBoolean()
    .withMessage('Mood reminders must be a boolean'),
  
  body('notificationPreferences.progressUpdates')
    .isBoolean()
    .withMessage('Progress updates must be a boolean'),
  
  body('avatarSelection')
    .isString()
    .withMessage('Avatar selection must be a string'),
  
  body('preferredTherapistGender')
    .isString()
    .isIn(['any', 'female', 'male', 'nonbinary'])
    .withMessage('Invalid preferred therapist gender'),
  
  body('preferredTherapistLanguage')
    .isString()
    .isIn(['en', 'hi', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml', 'pa'])
    .withMessage('Invalid preferred therapist language'),
  
  body('sessionPreference')
    .isString()
    .isIn(['online', 'in_person', 'hybrid'])
    .withMessage('Invalid session preference'),
  
  body('affordabilityRange')
    .isObject()
    .withMessage('Affordability range must be an object'),
  
  body('affordabilityRange.min')
    .isInt({ min: 0 })
    .withMessage('Minimum affordability must be non-negative'),
  
  body('affordabilityRange.max')
    .isInt({ min: 0 })
    .withMessage('Maximum affordability must be non-negative')
    .custom((value, { req }) => {
      if (value < req.body.affordabilityRange.min) {
        throw new Error('Maximum affordability must be greater than minimum');
      }
      return true;
    }),
  
  body('affordabilityRange.currency')
    .isIn(['INR'])
    .withMessage('Currency must be INR'),
  
  body('availabilityNotes')
    .isString()
    .withMessage('Availability notes must be a string'),
  
  body('preferredTherapyStyle')
    .isArray()
    .withMessage('Preferred therapy style must be an array'),
  
  body('culturalBackgroundNotes')
    .optional()
    .isString()
    .withMessage('Cultural background notes must be a string')
];

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

export const onboardingValidation: ValidationChain[] = [
  // Basic onboarding fields
  body('hasConsent').isBoolean().withMessage('Consent is required'),
  body('initialMoodScore')
    .isInt({ min: 1, max: 10 })
    .withMessage('Initial mood score must be between 1 and 10'),
  body('primaryConcerns')
    .isArray()
    .withMessage('Primary concerns must be an array'),
  body('therapyExperience')
    .isString()
    .withMessage('Therapy experience is required'),
  body('stressLevel')
    .isInt({ min: 1, max: 10 })
    .withMessage('Stress level must be between 1 and 10'),
  body('communicationStyle')
    .isString()
    .withMessage('Communication style is required'),
  body('preferredTopics')
    .isArray()
    .withMessage('Preferred topics must be an array'),
  body('notificationPreferences')
    .isObject()
    .withMessage('Notification preferences must be an object'),
  body('notificationPreferences.dailyCheckins')
    .isBoolean()
    .withMessage('Daily check-ins preference must be boolean'),
  body('notificationPreferences.moodReminders')
    .isBoolean()
    .withMessage('Mood reminders preference must be boolean'),
  body('notificationPreferences.progressUpdates')
    .isBoolean()
    .withMessage('Progress updates preference must be boolean'),
  body('avatarSelection')
    .isString()
    .withMessage('Avatar selection is required'),
  body('completedTour')
    .isBoolean()
    .withMessage('Tour completion status is required'),

  // New assessment fields
  body('currentSymptoms')
    .isArray()
    .withMessage('Current symptoms must be an array'),
  body('symptomSeverity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Symptom severity must be between 1 and 10'),
  body('symptomDuration')
    .isIn(['1_week', '1_month', '6_months', '1_year', 'over_1_year'])
    .withMessage('Invalid symptom duration'),
  body('suicidalIdeationFlag')
    .isBoolean()
    .withMessage('Suicidal ideation flag must be boolean'),
  body('selfHarmRiskFlag')
    .isBoolean()
    .withMessage('Self-harm risk flag must be boolean'),
  body('substanceUseFlag')
    .isBoolean()
    .withMessage('Substance use flag must be boolean'),
  body('therapyGoals')
    .isArray()
    .withMessage('Therapy goals must be an array'),

  // Therapist preference fields
  body('preferredTherapistGender')
    .isIn(['any', 'female', 'male', 'nonbinary'])
    .withMessage('Invalid preferred therapist gender'),
  body('preferredTherapistLanguage')
    .isString()
    .withMessage('Preferred therapist language is required'),
  body('sessionPreference')
    .isIn(['online', 'in_person', 'hybrid'])
    .withMessage('Invalid session preference'),
  body('affordabilityRange')
    .isObject()
    .withMessage('Affordability range must be an object'),
  body('affordabilityRange.min')
    .isInt({ min: 0 })
    .withMessage('Minimum affordability must be non-negative'),
  body('affordabilityRange.max')
    .isInt({ min: 0 })
    .withMessage('Maximum affordability must be non-negative')
    .custom((value, { req }) => {
      if (value < req.body.affordabilityRange.min) {
        throw new Error('Maximum affordability must be greater than minimum');
      }
      return true;
    }),
  body('affordabilityRange.currency')
    .isIn(['INR'])
    .withMessage('Currency must be INR'),
  body('availabilityNotes')
    .isString()
    .withMessage('Availability notes are required'),
  
  // Optional fields
  body('preferredTherapyStyle')
    .optional()
    .isArray()
    .withMessage('Preferred therapy style must be an array'),
  body('culturalBackgroundNotes')
    .optional()
    .isString()
    .withMessage('Cultural background notes must be a string'),
  body('previousTherapyExperienceNotes')
    .optional()
    .isString()
    .withMessage('Previous therapy experience notes must be a string')
];
