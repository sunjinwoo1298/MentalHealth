// Debug script to test gamification system
const { gamificationAPI } = require('./src/services/api');

// Test function to check if award points works
async function testAwardPoints() {
  try {
    console.log('Testing award points...');
    
    // Test chat completion
    const chatResult = await gamificationAPI.awardPoints('chat_completion', {
      messageCount: 5,
      durationMinutes: 3,
      sessionId: 'test-session',
      completedAt: new Date().toISOString()
    });
    
    console.log('Chat completion result:', chatResult);
    
    // Test meditation completion
    const meditationResult = await gamificationAPI.awardPoints('meditation_completion', {
      sessionId: 'breathing-basic',
      duration: 5,
      category: 'breathing',
      completedAt: new Date().toISOString()
    });
    
    console.log('Meditation completion result:', meditationResult);
    
  } catch (error) {
    console.error('Error testing award points:', error.response?.data || error.message);
  }
}

testAwardPoints();