import React from 'react';
import { useGamification } from '../../contexts/GamificationContext';

const GamificationDebug: React.FC = () => {
  const { pendingRewards, addPendingReward, processPendingRewards, clearPendingRewards } = useGamification();

  const testChatCompletion = () => {
    console.log('Adding test chat completion reward');
    addPendingReward('chat_completion', {
      messageCount: 5,
      durationMinutes: 3,
      sessionId: 'test-session',
      completedAt: new Date().toISOString()
    });
  };

  const testMeditationCompletion = () => {
    console.log('Adding test meditation completion reward');
    addPendingReward('meditation_completion', {
      sessionId: 'breathing-basic',
      duration: 5,
      category: 'breathing',
      completedAt: new Date().toISOString()
    });
  };

  const processRewards = async () => {
    try {
      console.log('Processing pending rewards...');
      const result = await processPendingRewards();
      console.log('Process result:', result);
    } catch (error) {
      console.error('Error processing rewards:', error);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg mb-6 border border-slate-600">
      <h3 className="text-white text-lg font-bold mb-4">🔧 Gamification Debug Panel</h3>
      
      <div className="mb-4">
        <p className="text-gray-300 mb-2">Pending Rewards: {pendingRewards.length}</p>
        {pendingRewards.length > 0 && (
          <div className="bg-slate-700 p-2 rounded text-xs text-gray-300">
            {pendingRewards.map((reward, index) => (
              <div key={index}>
                {reward.activityType} - {reward.timestamp}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="space-x-2">
        <button
          onClick={testChatCompletion}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Chat Completion
        </button>
        
        <button
          onClick={testMeditationCompletion}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Meditation Completion
        </button>
        
        <button
          onClick={processRewards}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Process Rewards
        </button>
        
        <button
          onClick={clearPendingRewards}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Rewards
        </button>
      </div>
    </div>
  );
};

export default GamificationDebug;