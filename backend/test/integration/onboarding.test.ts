import request from 'supertest';
import { app } from '../../src/server';
import { createTestUser, generateAuthToken, clearTestUser } from '../helpers/auth';
import { clearTestData } from '../helpers/db';
import { pool } from '../../src/services/database';

describe('Onboarding Integration Tests', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    await clearTestData();
  });

  beforeEach(async () => {
    // Create fresh test user before each test
    testUser = await createTestUser();
    authToken = generateAuthToken(testUser);
  });

  afterEach(async () => {
    await clearTestData();
  });

  describe('Complete Onboarding Flow', () => {
    it('should successfully complete the full onboarding process', async () => {
      const onboardingData = {
        // Basic info
        hasConsent: true,
        initialMoodScore: 6,
        primaryConcerns: ['anxiety', 'academic_stress'],
        therapyExperience: 'considering',
        stressLevel: 7,

        // Mental health details
        currentSymptoms: ['worry', 'sleep_issues'],
        symptomDuration: '1_month',
        symptomSeverity: 6,
        suicidalIdeationFlag: false,
        selfHarmRiskFlag: false,
        substanceUseFlag: false,
        therapyGoals: ['manage_stress', 'improve_focus'],

        // Communication preferences
        communicationStyle: 'empathetic',
        preferredTopics: ['stress_management', 'academic_support'],
        avatarSelection: 'avatar1',
        completedTour: true,
        
        // Notification settings
        notificationPreferences: {
          dailyCheckins: true,
          moodReminders: true,
          progressUpdates: false
        },

        // Therapist preferences
        preferredTherapistGender: 'any',
        preferredTherapistLanguage: 'en',
        sessionPreference: 'online',
        affordabilityRange: { min: 500, max: 1500, currency: 'INR' },
        availabilityNotes: 'Evenings and weekends'
      }

      const response = await request(app)
        .post('/api/users/onboarding')
        .set('Authorization', `Bearer ${authToken}`)
        .send(onboardingData)
        .expect(200)

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toBe('Onboarding data saved successfully');
      
      // Verify preferences were saved 
      const result = await pool.query(
        'SELECT up.onboarding_completed, up.wellness_preferences FROM users u JOIN user_profiles up ON u.id = up.user_id WHERE u.id = $1',
        [testUser.id]
      );
      const updatedUser = result.rows[0];
      expect(updatedUser.onboarding_completed).toBe(true);
      expect(updatedUser.wellness_preferences).toMatchObject({
        communicationStyle: 'empathetic',
        preferredTopics: ['stress_management', 'academic_support']
      });
    })

    it('should handle missing required fields', async () => {
      const incompleteData = {
        hasConsent: true,
        // Missing other required fields
      }

      const response = await request(app)
        .post('/api/users/onboarding')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData)
        .expect(400)

      expect(response.body).toHaveProperty('errors')
      expect(response.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({
          msg: expect.stringMatching(/primary concerns must be an array/i)
        })
      ]))
    })
  })

  describe('Preference Updates', () => {
    it('should update user preferences after onboarding', async () => {
      // First complete onboarding
      await request(app)
        .post('/api/users/onboarding')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hasConsent: true,
          initialMoodScore: 6,
          primaryConcerns: ['anxiety', 'academic_stress'],
          therapyExperience: 'considering',
          stressLevel: 7,
          communicationStyle: 'casual',
          preferredTopics: ['stress_management'],
          avatarSelection: 'avatar1',
          completedTour: true,
          notificationPreferences: {
            dailyCheckins: true,
            moodReminders: true,
            progressUpdates: false
          },
          currentSymptoms: ['worry'],
          symptomSeverity: 5,
          symptomDuration: '1_month',
          suicidalIdeationFlag: false,
          selfHarmRiskFlag: false,
          substanceUseFlag: false,
          therapyGoals: ['manage_stress'],
          preferredTherapistGender: 'any',
          preferredTherapistLanguage: 'en',
          sessionPreference: 'online',
          affordabilityRange: { min: 500, max: 1500, currency: 'INR' },
          availabilityNotes: 'Evenings and weekends'
        })

      // Then update preferences
      const newPreferences = {
        communicationStyle: 'professional',
        preferredTopics: ['anxiety_management', 'family_relationships'],
        notificationPreferences: {
          dailyCheckins: false,
          moodReminders: true,
          progressUpdates: true
        },
        avatarSelection: 'avatar2',
        preferredTherapistGender: 'any',
        preferredTherapistLanguage: 'hi',
        sessionPreference: 'hybrid',
        affordabilityRange: {
          min: 1000,
          max: 2500,
          currency: 'INR'
        },
        availabilityNotes: 'Morning sessions',
        preferredTherapyStyle: ['cbt', 'mindfulness'],
        culturalBackgroundNotes: 'South Indian'
      }

      const response = await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPreferences)
        .expect(200)

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toMatchObject(newPreferences);

      // Verify preferences were updated in database
      const prefsResult = await pool.query(
        'SELECT wellness_preferences FROM user_profiles WHERE user_id = $1',
        [testUser.id]
      );
      const updatedPrefs = prefsResult.rows[0];
      expect(updatedPrefs.wellness_preferences.communicationStyle).toBe('professional');
      expect(updatedPrefs.wellness_preferences.notificationPreferences).toMatchObject({
        dailyCheckins: false,
        moodReminders: true,
        progressUpdates: true
      });
    })
  })

  describe('AI Context Generation', () => {
    it('should generate personalized AI context from onboarding data', async () => {
      const onboardingData = {
        currentSymptoms: ['anxiety', 'stress'],
        symptomSeverity: 6,
        preferredSupportContext: 'academic',
        communicationStyle: 'supportive',
        culturalBackgroundNotes: 'Indian student',
        therapyGoals: ['manage academic stress', 'improve focus'],
        preferredTopics: ['study techniques', 'exam anxiety']
      }

      const response = await request(app)
        .post('/api/ai/generate-context')
        .set('Authorization', `Bearer ${authToken}`)
        .send(onboardingData)
        .expect(200)

      expect(response.body).toHaveProperty('context')
      expect(response.body.context).toContain('academic')
      expect(response.body.context).toContain('Indian')
      expect(response.body).toHaveProperty('riskAnalysis')
    })
  })

  describe('Chat with Preference Context', () => {
    it('should use preference context in chat responses', async () => {
      // Set up user preferences first
      await pool.query(`
        UPDATE user_profiles 
        SET wellness_preferences = $1
        WHERE user_id = $2`,
        [{
          communicationStyle: 'empathetic',
          preferredTopics: ['academic', 'stress_management'],
          preferredTherapistLanguage: 'en'
        }, testUser.id]
      );

      const chatResponse = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: "I'm feeling stressed about exams",
          userId: testUser._id,
          context: 'academic'
        })
        .expect(200)

      expect(chatResponse.body).toHaveProperty('response')
      expect(chatResponse.body.context).toBe('academic')
      expect(chatResponse.body).toHaveProperty('emotional_context')
      expect(chatResponse.body).toHaveProperty('avatar_emotion')
    })

    it('should respect communication style preferences', async () => {
      // Set preference for professional style
      await pool.query(`
        UPDATE user_profiles 
        SET wellness_preferences = $1
        WHERE user_id = $2`,
        [{
          communicationStyle: 'professional',
          preferredSupportContext: 'general'
        }, testUser.id]
      );

      const chatResponse = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: "How can I manage stress?",
          userId: testUser._id
        })
        .expect(200)

      expect(chatResponse.body.response).toMatch(/professional|structured|organized/i)
    })
  })
})