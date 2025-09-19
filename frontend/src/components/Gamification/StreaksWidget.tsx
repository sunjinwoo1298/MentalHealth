import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../../services/api';

interface UserStreak {
  id: string;
  activity_type: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  streak_status: 'active' | 'at_risk' | 'broken';
  cultural_milestone?: string;
}

interface StreakAchievement {
  id: string;
  milestone_name: string;
  cultural_significance: string;
  celebration_message: string;
  festival_theme: string;
  activity_type: string;
  achieved_at: string;
}

interface StreaksWidgetProps {
  className?: string;
}

const StreaksWidget: React.FC<StreaksWidgetProps> = ({ className = '' }) => {
  const [streaks, setStreaks] = useState<UserStreak[]>([]);
  const [achievements, setAchievements] = useState<StreakAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStreaksData();
  }, []);

  const fetchStreaksData = async () => {
    try {
      setLoading(true);
      const [streaksResponse, achievementsResponse] = await Promise.all([
        gamificationAPI.getStreaks(),
        gamificationAPI.getStreakAchievements()
      ]);
      
      if (streaksResponse.success) {
        setStreaks(streaksResponse.data);
      }
      
      if (achievementsResponse.success) {
        setAchievements(achievementsResponse.data);
      }
    } catch (err) {
      console.error('Error fetching streaks data:', err);
      setError('Failed to load streaks data');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType: string) => {
    const iconMap: Record<string, string> = {
      'mood_checkin': '😊',
      'meditation': '🧘‍♀️',
      'chat_session': '💬',
      'gratitude_practice': '🙏',
      'breathing_exercise': '🌬️',
      'journal_entry': '📔'
    };
    return iconMap[activityType] || '⭐';
  };

  const getActivityName = (activityType: string) => {
    const nameMap: Record<string, string> = {
      'mood_checkin': 'Daily Mood',
      'meditation': 'Meditation',
      'chat_session': 'AI Chat',
      'gratitude_practice': 'Gratitude',
      'breathing_exercise': 'Breathing',
      'journal_entry': 'Journaling'
    };
    return nameMap[activityType] || activityType;
  };

  const getStreakStatusData = (status: string, currentStreak: number) => {
    switch (status) {
      case 'active':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          message: `🔥 ${currentStreak} day${currentStreak > 1 ? 's' : ''} strong!`,
          motivation: 'Keep the fire burning!'
        };
      case 'at_risk':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          borderColor: 'border-orange-200',
          message: `⚠️ ${currentStreak} day streak at risk`,
          motivation: 'Don\'t let it fade away!'
        };
      case 'broken':
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          message: `💔 Streak ended at ${currentStreak}`,
          motivation: 'Ready for a fresh start?'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          message: 'Start your journey',
          motivation: 'Every expert was once a beginner'
        };
    }
  };

  const getFestivalEmoji = (theme: string) => {
    const emojiMap: Record<string, string> = {
      'diwali': '🪔',
      'holi': '🎨',
      'general': '✨',
      'dussehra': '🏹'
    };
    return emojiMap[theme] || '🌟';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={fetchStreaksData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow-md p-6 border border-purple-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="mr-2">🔥</span>
          Consistency Streaks
        </h3>
        <div className="text-sm text-gray-500">
          {streaks.filter(s => s.streak_status === 'active').length} active
        </div>
      </div>

      {/* Active Streaks */}
      {streaks.length > 0 ? (
        <div className="space-y-4 mb-6">
          {streaks.slice(0, 4).map((streak) => {
            const statusData = getStreakStatusData(streak.streak_status, streak.current_streak);
            return (
              <div 
                key={streak.id}
                className={`p-4 rounded-lg border ${statusData.borderColor} ${statusData.bgColor} 
                           hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getActivityIcon(streak.activity_type)}</span>
                    <div>
                      <div className="font-medium text-gray-800">
                        {getActivityName(streak.activity_type)}
                      </div>
                      <div className={`text-sm ${statusData.color} font-medium`}>
                        {statusData.message}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">
                      {streak.current_streak}
                    </div>
                    <div className="text-xs text-gray-500">
                      Best: {streak.longest_streak}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600 italic">
                  {statusData.motivation}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🌱</div>
          <h4 className="text-lg font-medium text-gray-600 mb-2">Build Your First Streak</h4>
          <p className="text-gray-500 text-sm">
            Start with small daily activities to build lasting habits!
          </p>
        </div>
      )}

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <span className="mr-1">🏆</span>
            Recent Milestones
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {achievements.slice(0, 3).map((achievement) => (
              <div 
                key={achievement.id} 
                className="flex items-center justify-between p-3 bg-white rounded border border-gray-100 text-xs hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getFestivalEmoji(achievement.festival_theme)}</span>
                  <div>
                    <div className="font-medium text-gray-700">
                      {achievement.milestone_name}
                    </div>
                    <div className="text-gray-500">
                      {getActivityName(achievement.activity_type)}
                    </div>
                  </div>
                </div>
                <div className="text-gray-400">
                  {new Date(achievement.achieved_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cultural Message */}
      <div className="mt-6 p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border-l-4 border-purple-400">
        <p className="text-xs text-gray-700 italic">
          "As the river cuts through rock by persistence, not force, your daily practice shapes your destiny." 🌊
        </p>
      </div>
    </div>
  );
};

export default StreaksWidget;
