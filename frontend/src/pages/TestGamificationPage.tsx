import React, { useState } from 'react';
import Navigation from '../components/Navigation/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';
import { gamificationAPI } from '../services/api';

const TestGamificationPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { pendingRewards, addPendingReward, processPendingRewards, clearPendingRewards } = useGamification();
  const [testResults, setTestResults] = useState<string[]>([]);

  const handleLogout = async () => {
    await logout();
  };

  const addTestResult = (message: string) => {
    console.log(message);
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testChatCompletion = () => {
    addTestResult('Adding chat completion reward...');
    addPendingReward('chat_completion', {
      messageCount: 5,
      durationMinutes: 3,
      sessionId: 'test-session',
      completedAt: new Date().toISOString()
    });
    addTestResult('Chat completion reward added to pending list');
  };

  const testMeditationCompletion = () => {
    addTestResult('Adding meditation completion reward...');
    addPendingReward('meditation_completion', {
      sessionId: 'breathing-basic',
      duration: 5,
      category: 'breathing',
      completedAt: new Date().toISOString()
    });
    addTestResult('Meditation completion reward added to pending list');
  };

  const testDirectAPICall = async () => {
    try {
      addTestResult('Testing direct API call for chat completion...');
      const result = await gamificationAPI.awardPoints('chat_completion', {
        messageCount: 5,
        durationMinutes: 3,
        sessionId: 'direct-test',
        completedAt: new Date().toISOString()
      });
      addTestResult(`Direct API call successful: ${JSON.stringify(result)}`);
    } catch (error: any) {
      addTestResult(`Direct API call failed: ${error.message}`);
      console.error('Direct API call error:', error);
    }
  };

  const processRewards = async () => {
    try {
      addTestResult('Processing pending rewards...');
      const result = await processPendingRewards();
      addTestResult(`Process result: ${JSON.stringify(result)}`);
    } catch (error: any) {
      addTestResult(`Error processing rewards: ${error.message}`);
      console.error('Process rewards error:', error);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900">
      <Navigation 
        isAuthenticated={true}
        user={user || undefined}
        onLogout={handleLogout}
      />
      
      <main className="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-8 border border-slate-600/50">
            <h1 className="text-3xl font-bold text-white mb-6">🧪 Gamification System Test</h1>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Current Status</h2>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-gray-300">Pending Rewards: <span className="text-yellow-400">{pendingRewards.length}</span></p>
                {pendingRewards.length > 0 && (
                  <div className="mt-2">
                    {pendingRewards.map((reward: any, index: number) => (
                      <div key={index} className="text-sm text-gray-400">
                        • {reward.activityType} - {new Date(reward.timestamp).toLocaleTimeString()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={testChatCompletion}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🗨️ Test Chat Completion
              </button>
              
              <button
                onClick={testMeditationCompletion}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                🧘 Test Meditation Completion
              </button>
              
              <button
                onClick={testDirectAPICall}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                🔗 Test Direct API Call
              </button>
              
              <button
                onClick={processRewards}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                ⚡ Process Pending Rewards
              </button>
            </div>

            <div className="flex space-x-4 mb-6">
              <button
                onClick={clearPendingRewards}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                🗑️ Clear Pending
              </button>
              
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                🧹 Clear Log
              </button>
            </div>

            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Test Results Log</h3>
              <div className="h-64 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm text-gray-300 mb-1 font-mono">
                    {result}
                  </div>
                ))}
                {testResults.length === 0 && (
                  <div className="text-gray-500 italic">No test results yet...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestGamificationPage;