import request from 'supertest'
import { app } from '../../src/server';
import { DatabaseService } from '../../src/services/database';
import jwt from 'jsonwebtoken';
import { createTestUser } from '../helpers/auth';

describe('Onboarding Flow Integration Tests', () => {
  let testUser: any
  let authToken: string

  let db: DatabaseService;

  beforeAll(async () => {
    db = DatabaseService.getInstance();
    testUser = await createTestUser();
    authToken = jwt.sign({ id: testUser.id }, process.env.JWT_SECRET || 'test-secret');
  })

  afterAll(async () => {
    // Cleanup handled by global test cleanup
  })

  it('should validate and save onboarding data', async () => {
    const onboardingData = {
      hasConsent: true,
      initialMoodScore: 7,
      primaryConcerns: ['anxiety', 'academic_stress'],
      therapyExperience: 'never',
      stressLevel: 6,
      communicationStyle: 'casual',
      preferredTopics: ['stress_management', 'academic_help'],
      notificationPreferences: {
        dailyCheckins: true,
        moodReminders: true,
        progressUpdates: false
      },
      avatarSelection: 'default',
      completedTour: true,
      currentSymptoms: ['worry', 'sleep_issues'],
      symptomDuration: '1_month',
      symptomSeverity: 6,
      suicidalIdeationFlag: false,
      selfHarmRiskFlag: false,
      substanceUseFlag: false,
      therapyGoals: ['stress_management', 'sleep_improvement'],
      preferredTherapistGender: 'any',
      preferredTherapistLanguage: 'en',
      sessionPreference: 'online',
      affordabilityRange: { min: 500, max: 2000, currency: 'INR' },
      availabilityNotes: 'Evenings after 6pm',
      preferredTherapyStyle: ['CBT', 'mindfulness'],
      culturalBackgroundNotes: 'Hindu',
      previousTherapyExperienceNotes: 'None'
    }

    const response = await request(app)
      .post('/api/users/onboarding')
      .set('Authorization', `Bearer ${authToken}`)
      .send(onboardingData)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toMatchObject({
      onboardingCompleted: true
    })

    // Verify data was saved correctly
    const userResponse = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`)

    expect(userResponse.status).toBe(200)
    expect(userResponse.body.onboardingData).toMatchObject(onboardingData)
  })

  it('should reject invalid onboarding data', async () => {
    const invalidData = {
      hasConsent: false, // Consent is required
      initialMoodScore: 11, // Out of range
      primaryConcerns: [], // Required
      symptomSeverity: -1 // Out of range
    }

    const response = await request(app)
      .post('/api/users/onboarding')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidData)

    expect(response.status).toBe(400)
    expect(response.body.errors).toBeDefined()
    expect(response.body.errors).toContain('Consent is required')
    expect(response.body.errors).toContain('Mood score must be between 1 and 10')
    expect(response.body.errors).toContain('Primary concerns are required')
  })

  it('should persist progress between sessions', async () => {
    const progressData = {
      currentStep: 2,
      data: {
        hasConsent: true,
        initialMoodScore: 7
      }
    }

    const response = await request(app)
      .post('/api/users/onboarding/progress')
      .set('Authorization', `Bearer ${authToken}`)
      .send(progressData)

    expect(response.status).toBe(200)
    
    // Verify progress was saved
    const progressResponse = await request(app)
      .get('/api/users/onboarding/progress')
      .set('Authorization', `Bearer ${authToken}`)

    expect(progressResponse.status).toBe(200)
    expect(progressResponse.body).toMatchObject(progressData)
  })

  it('should handle encrypted sensitive data', async () => {
    const sensitiveData = {
      therapyHistory: 'Previous therapy for anxiety',
      medicationInfo: 'Currently on anxiety medication',
      diagnosisHistory: 'Generalized anxiety disorder'
    }

    const response = await request(app)
      .post('/api/users/sensitive-data')
      .set('Authorization', `Bearer ${authToken}`)
      .send(sensitiveData)

    expect(response.status).toBe(200)

    // Verify data was encrypted
    const result = await db.query(
      'SELECT therapy_history_encrypted, medication_info_encrypted, diagnosis_history_encrypted FROM user_profiles WHERE user_id = $1',
      [testUser.id]
    )

    expect(result.rows[0].therapy_history_encrypted).toBeDefined()
    expect(result.rows[0].medication_info_encrypted).toBeDefined()
    expect(result.rows[0].diagnosis_history_encrypted).toBeDefined()
    expect(typeof result.rows[0].therapy_history_encrypted).toBe('string')
  })
})