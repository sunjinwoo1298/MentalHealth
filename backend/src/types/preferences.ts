export interface UserPreferences {
  communicationStyle?: 'empathetic' | 'professional' | 'casual' | 'supportive';
  preferredTopics?: string[];
  notificationPreferences?: {
    dailyCheckins?: boolean;
    moodReminders?: boolean;
    progressUpdates?: boolean;
  };
  avatarSelection?: string;
  preferredTherapistGender?: 'any' | 'female' | 'male' | 'nonbinary';
  preferredTherapistLanguage?: string;
  sessionPreference?: 'online' | 'in_person' | 'hybrid';
  affordabilityRange?: {
    min: number;
    max: number;
    currency: string;
  };
  availabilityNotes?: string;
  preferredTherapyStyle?: string[];  // ['CBT', 'mindfulness', 'psychodynamic']
  culturalBackgroundNotes?: string;  // For better cultural matching
  preferredSupportContext?: 'general' | 'academic' | 'family';  // Context for AI chat support
  conditionDescription?: string;  // User's personal description of their mental health condition
}