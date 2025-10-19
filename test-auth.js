// Simple script to set test authentication data
// Open browser console (F12) and paste this code to mock login

// Set authentication tokens
localStorage.setItem('token', 'mock-jwt-token');
localStorage.setItem('refreshToken', 'mock-refresh-token');
localStorage.setItem('user', JSON.stringify({
  id: 'test-user',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  isVerified: true,
  createdAt: new Date().toISOString()
}));

console.log('✅ Test user authentication data set.');
console.log('🔄 Refreshing page to load gamification page...');

// Refresh the page to trigger auth state check
window.location.href = '/gamification';