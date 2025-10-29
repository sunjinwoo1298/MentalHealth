import request from 'supertest'
import { app } from '../../src/server';
import { DatabaseService } from '../../src/services/database';
import { createTestUser, generateAuthToken } from '../helpers/auth';
import { clearTestData } from '../helpers/db';

function getMockPreferencesData() {
  return {
    communicationStyle: 'casual',
    notificationPreferences: {
      dailyCheckins: true,
      moodReminders: true,
      progressUpdates: false
    },
    theme: 'light',
    colorScheme: 'default',
    fontSize: 'medium',
    reduceMotion: false,
    highContrast: false,
    preferredSupportContext: 'general'
  };
}

describe('Chat Integration Tests', () => {
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

  it('should get AI response with context preferences', async () => {
    // Set user preferences first
    await request(app)
      .put('/api/users/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send(getMockPreferencesData())

    const chatRequest = {
      message: "I'm feeling stressed about exams",
      context: 'academic'
    }

    const response = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send(chatRequest)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('response')
    expect(response.body).toHaveProperty('emotional_context')
    expect(response.body).toHaveProperty('avatar_emotion')
    expect(response.body.context).toBe('academic')
  })

  it('should store and retrieve chat history', async () => {
    const message = "How can I manage my study anxiety?"

    // Send chat message
    await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ message, context: 'academic' })

    // Get chat history
    const historyResponse = await request(app)
      .get('/api/chat/history')
      .set('Authorization', `Bearer ${authToken}`)

    expect(historyResponse.status).toBe(200)
    expect(historyResponse.body.messages).toBeInstanceOf(Array)
    expect(historyResponse.body.messages[0]).toHaveProperty('content', message)
  })

  it('should generate AI context from preferences', async () => {
    const preferences = getMockPreferencesData()
    
    // Update preferences
    await request(app)
      .put('/api/users/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send(preferences)

    // Request context generation
    const response = await request(app)
      .post('/api/chat/generate-context')
      .set('Authorization', `Bearer ${authToken}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('context')
    expect(response.body.context).toContain(preferences.communicationStyle)
  })

  it('should handle voice output requests', async () => {
    const chatRequest = {
      message: "Can you help me relax?",
      context: 'general',
      voice: true
    }

    const response = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send(chatRequest)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('response')
    expect(response.body).toHaveProperty('voiceOutput')
  })

  it('should switch support contexts correctly', async () => {
    // Test academic context
    let response = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        message: "I'm worried about my grades",
        context: 'academic'
      })

    expect(response.status).toBe(200)
    expect(response.body.context).toBe('academic')

    // Test family context
    response = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        message: "Having issues with parents",
        context: 'family'
      })

    expect(response.status).toBe(200)
    expect(response.body.context).toBe('family')
  })

  it('should persist emotional context between messages', async () => {
    // First message indicating anxiety
    let response = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        message: "I'm feeling very anxious about everything",
        context: 'general'
      })

    expect(response.status).toBe(200)
    expect(response.body.emotional_context).toContain('anxiety')

    // Follow-up message
    response = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        message: "It's getting worse",
        context: 'general'
      })

    expect(response.status).toBe(200)
    expect(response.body.emotional_context).toBeDefined()
    expect(response.body.avatar_emotion).toBeDefined()
  })

  it('should handle crisis detection', async () => {
    const response = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        message: "I'm having thoughts of hurting myself",
        context: 'general'
      })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('crisis_detected', true)
    expect(response.body).toHaveProperty('crisis_resources')
  })
})