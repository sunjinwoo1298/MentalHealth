import React, { useState } from 'react';
import { gamificationAPI } from '../../services/api';

interface TestPointsProps {
  className?: string;
}

const TestPoints: React.FC<TestPointsProps> = ({ className = '' }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const awardTestPoints = async (activityType: string) => {
    try {
      setLoading(true);
      setMessage(null);
      
      const response = await gamificationAPI.awardPoints(activityType, {
        test: true,
        timestamp: new Date().toISOString()
      });

      if (response.success) {
        const result = response.data;
        let msg = `🎉 Earned ${result.points_earned} points!`;
        
        if (result.level_up) {
          msg += ` 🆙 Level up to ${result.new_level}!`;
        }
        
        if (result.streak_info) {
          msg += ` 🔥 Streak: ${result.streak_info.current_streak} days!`;
        }
        
        if (result.milestone_achieved) {
          msg += ` 🏆 Milestone: ${result.milestone_achieved.milestone_name}!`;
        }
        
        if (result.badges_earned && result.badges_earned.length > 0) {
          msg += ` 🏅 New badges: ${result.badges_earned.map((b: any) => b.badge_name).join(', ')}`;
        }
        
        setMessage(msg);
        
        // Refresh the page components after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      console.error('Error awarding points:', err);
      setMessage('❌ Failed to award points');
    } finally {
      setLoading(false);
    }
  };

  const activities = [
    { type: 'mood_checkin', name: 'Daily Mood Check-in', points: 5, icon: '😊' },
    { type: 'chat_session', name: 'Chat Session', points: 10, icon: '💬' },
    { type: 'journal_entry', name: 'Journal Entry', points: 8, icon: '📔' },
    { type: 'meditation', name: 'Meditation', points: 15, icon: '🧘' },
    { type: 'breathing_exercise', name: 'Breathing Exercise', points: 5, icon: '🌬️' },
    { type: 'gratitude_practice', name: 'Gratitude Practice', points: 7, icon: '🙏' },
  ];

  return (
    <div className={`bg-blue-50 rounded-lg shadow-md p-6 border border-blue-200 ${className}`}>
      <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
        <span className="mr-2">🧪</span>
        Test Gamification
      </h3>
      
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('❌') 
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-green-100 text-green-800 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {activities.map((activity) => (
          <button
            key={activity.type}
            onClick={() => awardTestPoints(activity.type)}
            disabled={loading}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 
                     hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <div className="flex items-center">
              <span className="mr-2 text-lg">{activity.icon}</span>
              <div className="text-left">
                <div className="font-medium text-gray-800">{activity.name}</div>
                <div className="text-xs text-gray-500">+{activity.points} pts</div>
              </div>
            </div>
            {loading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
          </button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
        <p className="text-xs text-yellow-800">
          <strong>Test Mode:</strong> Click buttons above to simulate earning points for different activities. 
          This will help you see the gamification system in action!
        </p>
      </div>
    </div>
  );
};

export default TestPoints;