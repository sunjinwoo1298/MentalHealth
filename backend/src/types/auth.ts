export interface User {
  id: string;
  email: string;
  username?: string;
  password_hash: string;
  first_name_encrypted?: Buffer;
  last_name_encrypted?: Buffer;
  date_of_birth_encrypted?: Buffer;
  phone_encrypted?: Buffer;
  avatar_preference: AvatarPreference;
  language_preference: string;
  timezone: string;
  is_verified: boolean;
  is_active: boolean;
  privacy_settings: PrivacySettings;
  emergency_contact_encrypted?: Buffer;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface UserProfile {
  id: string;
  user_id: string;
  mental_health_goals: string[];
  stress_triggers: string[];
  preferred_coping_methods: string[];
  therapy_history_encrypted?: Buffer;
  medication_info_encrypted?: Buffer;
  crisis_plan_encrypted?: Buffer;
  support_network: any[];
  wellness_preferences: any;
  risk_level: 'low' | 'moderate' | 'high' | 'critical';
  onboarding_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AvatarPreference {
  type: string;
  customization: any;
}

export interface PrivacySettings {
  shareData: boolean;
  analytics: boolean;
  emergencyContact?: boolean;
  dataRetention?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  confirmPassword: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  emergencyContact?: string;
  languagePreference?: string;
  timezone?: string;
  privacySettings?: PrivacySettings;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: Omit<User, 'password_hash'>;
    token: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export interface UserProfileRequest {
  mentalHealthGoals?: string[];
  stressTriggers?: string[];
  preferredCopingMethods?: string[];
  therapyHistory?: string;
  medicationInfo?: string;
  crisisPlan?: string;
  supportNetwork?: any[];
  wellnessPreferences?: any;
}