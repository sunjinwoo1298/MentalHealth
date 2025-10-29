export interface UserOnboardingData {
  // Basic onboarding fields (existing)
  hasConsent: boolean;
  initialMoodScore: number;
  primaryConcerns: string[];
  therapyExperience: string;
  stressLevel: number;
  communicationStyle: string;
  preferredTopics: string[];
  notificationPreferences: {
    dailyCheckins: boolean;
    moodReminders: boolean;
    progressUpdates: boolean;
  };
  avatarSelection: string;
  completedTour: boolean;

  // New symptom and assessment fields
  currentSymptoms: string[];
  symptomSeverity: number;
  symptomDuration: string;  // '1_week' | '1_month' | '6_months' | '1_year' | 'over_1_year'
  suicidalIdeationFlag: boolean;
  selfHarmRiskFlag: boolean;
  substanceUseFlag: boolean;
  therapyGoals: string[];

  // New therapist preference fields
  preferredTherapistGender: string;  // 'any' | 'female' | 'male' | 'nonbinary'
  preferredTherapistLanguage: string;
  sessionPreference: 'online' | 'in_person' | 'hybrid';
  affordabilityRange: {
    min: number;
    max: number;
    currency: string;
  };
  availabilityNotes: string;
  preferredTherapyStyle?: string[];  // Optional: ['CBT', 'mindfulness', 'psychodynamic']
  culturalBackgroundNotes?: string;  // Optional: For better cultural matching
  previousTherapyExperienceNotes?: string;  // Optional: What worked/didn't work
}

// Input validation schema
export const onboardingDataSchema = {
  hasConsent: { type: 'boolean', required: true },
  initialMoodScore: { type: 'number', min: 1, max: 10, required: true },
  primaryConcerns: { type: 'array', items: { type: 'string' }, required: true },
  therapyExperience: { type: 'string', required: true },
  stressLevel: { type: 'number', min: 1, max: 10, required: true },
  communicationStyle: { type: 'string', required: true },
  preferredTopics: { type: 'array', items: { type: 'string' }, required: true },
  notificationPreferences: {
    type: 'object',
    properties: {
      dailyCheckins: { type: 'boolean' },
      moodReminders: { type: 'boolean' },
      progressUpdates: { type: 'boolean' }
    },
    required: true
  },
  avatarSelection: { type: 'string', required: true },
  completedTour: { type: 'boolean', required: true },

  // New fields schema
  currentSymptoms: { type: 'array', items: { type: 'string' }, required: true },
  symptomSeverity: { type: 'number', min: 1, max: 10, required: true },
  symptomDuration: {
    type: 'string',
    enum: ['1_week', '1_month', '6_months', '1_year', 'over_1_year'],
    required: true
  },
  suicidalIdeationFlag: { type: 'boolean', required: true },
  selfHarmRiskFlag: { type: 'boolean', required: true },
  substanceUseFlag: { type: 'boolean', required: true },
  therapyGoals: { type: 'array', items: { type: 'string' }, required: true },

  preferredTherapistGender: {
    type: 'string',
    enum: ['any', 'female', 'male', 'nonbinary'],
    required: true
  },
  preferredTherapistLanguage: { type: 'string', required: true },
  sessionPreference: {
    type: 'string',
    enum: ['online', 'in_person', 'hybrid'],
    required: true
  },
  affordabilityRange: {
    type: 'object',
    properties: {
      min: { type: 'number', min: 0 },
      max: { type: 'number', min: 0 },
      currency: { type: 'string', enum: ['INR'] }
    },
    required: true
  },
  availabilityNotes: { type: 'string', required: true },
  preferredTherapyStyle: { type: 'array', items: { type: 'string' }, required: false },
  culturalBackgroundNotes: { type: 'string', required: false },
  previousTherapyExperienceNotes: { type: 'string', required: false }
};