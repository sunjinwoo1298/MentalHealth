import request from 'supertest'
import { app } from '../../src/server';
import { DatabaseService } from '../../src/services/database';
import jwt from 'jsonwebtoken';
import { createTestUser, generateAuthToken } from '../helpers/auth';
import { clearTestData, cleanupTestDb } from '../helpers/db';

function getMockPreferencesData() {
  return {
    communicationStyle: 'casual',
    preferredTopics: ['stress_management', 'general_wellbeing'],
    notificationPreferences: {
      dailyCheckins: true,
      moodReminders: true,
      progressUpdates: false
    },
    avatarSelection: 'avatar1',
    preferredTherapistGender: 'any',
    preferredTherapistLanguage: 'en',
    sessionPreference: 'online',
    affordabilityRange: {
      min: 500,
      max: 1500,
      currency: 'INR'
    },
    availabilityNotes: 'Evening sessions preferred',
    preferredTherapyStyle: ['cbt', 'mindfulness'],
    culturalBackgroundNotes: 'Urban Indian professional'
  };
}

describe('User Preferences Integration Tests', () => {
  let db: DatabaseService;
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    db = DatabaseService.getInstance();
    await clearTestData();
  });

  beforeEach(async () => {
    testUser = await createTestUser();
    authToken = generateAuthToken(testUser);
  });

  afterEach(async () => {
    await clearTestData();
  });

  it('should get user preferences', async () => {
    const response = await request(app)
      .get('/api/users/preferences')
      .set('Authorization', `Bearer ${authToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('data')
    expect(response.body.data).toHaveProperty('communicationStyle')
  })

  it('should update user preferences', async () => {
    const prefData = getMockPreferencesData()
    
    const response = await request(app)
      .put('/api/users/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send(prefData)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)

    // Verify preferences were saved
    const verifyResponse = await request(app)
      .get('/api/users/preferences')
      .set('Authorization', `Bearer ${authToken}`)

    expect(verifyResponse.status).toBe(200)
    expect(verifyResponse.body.data).toEqual(prefData)
  })

  it('should validate notification settings', async () => {
    const invalidPrefs = {
      ...getMockPreferencesData(),
      notificationPreferences: {
        dailyCheckins: 123, // Should be boolean
        moodReminders: "yes", // Should be boolean
        progressUpdates: "invalid" // Should be boolean
      }
    }

    const response = await request(app)
      .put('/api/users/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidPrefs)

    expect(response.status).toBe(400)
    const validationErrors = response.body.errors.map((e: { msg: string }) => e.msg);
    expect(validationErrors).toContain('Daily check-ins must be a boolean')
    expect(validationErrors).toContain('Mood reminders must be a boolean')
    expect(validationErrors).toContain('Progress updates must be a boolean')
  })

  it('should handle theme changes', async () => {
    const themeUpdate = {
      ...getMockPreferencesData(),
      avatarSelection: 'avatar2',
      preferredTopics: ['meditation', 'stress_management'],
      notificationPreferences: {
        dailyCheckins: false,
        moodReminders: true,
        progressUpdates: true
      }
    };

    const response = await request(app)
      .put('/api/users/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send(themeUpdate)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)

    // Verify theme settings
    const verifyResponse = await request(app)
      .get('/api/users/preferences')
      .set('Authorization', `Bearer ${authToken}`)

    const wellnessPrefs = verifyResponse.body.data;
    expect(wellnessPrefs.avatarSelection).toBe(themeUpdate.avatarSelection);
    expect(wellnessPrefs.preferredTopics).toEqual(expect.arrayContaining(themeUpdate.preferredTopics));
    expect(wellnessPrefs.notificationPreferences).toEqual(themeUpdate.notificationPreferences);
  })

  it('should update therapist preferences', async () => {
    const therapistPrefs = {
      ...getMockPreferencesData(),
      preferredTherapistGender: 'female',
      preferredTherapistLanguage: 'hi',
      sessionPreference: 'online',
      affordabilityRange: { min: 1000, max: 3000, currency: 'INR' },
      availabilityNotes: 'Weekends only'
    }

    const response = await request(app)
      .put('/api/users/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send(therapistPrefs)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)

    // Verify therapist preferences
    const verifyResponse = await request(app)
      .get('/api/users/preferences')
      .set('Authorization', `Bearer ${authToken}`)

    const wellnessPrefs = verifyResponse.body.data;
    expect(wellnessPrefs.preferredTherapistGender).toBe(therapistPrefs.preferredTherapistGender)
    expect(wellnessPrefs.preferredTherapistLanguage).toBe(therapistPrefs.preferredTherapistLanguage)
    expect(wellnessPrefs.sessionPreference).toBe(therapistPrefs.sessionPreference)
    expect(wellnessPrefs.affordabilityRange).toEqual(therapistPrefs.affordabilityRange)
  })

  it('should update support context', async () => {
    const contextUpdate = {
      ...getMockPreferencesData(),
      communicationStyle: 'professional',
      preferredTopics: ['academic_support']
    }

    const response = await request(app)
      .put('/api/users/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send(contextUpdate)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)

    // Verify preferences
    const verifyResponse = await request(app)
      .get('/api/users/preferences')
      .set('Authorization', `Bearer ${authToken}`)

    const wellnessPrefs = verifyResponse.body.data;
    expect(wellnessPrefs.preferredTopics).toContain('academic_support')
    expect(wellnessPrefs.communicationStyle).toBe(contextUpdate.communicationStyle)
  })
})