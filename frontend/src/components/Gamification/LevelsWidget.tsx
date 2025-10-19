import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../../services/api';

interface WellnessLevel {
  id: string;
  level_number: number;
  level_name: string;
  sanskrit_name: string;
  level_description: string;
  points_required: number;
  level_color: string;
  level_icon: string;
  cultural_significance: string;
  unlocked_features: string[];
  special_privileges: string[];
}

interface UserLevelData {
  current_level: number;
  current_points: number;
  points_to_next_level: number;
  next_level_points: number;
  level_progress_percentage: number;
  level_info: WellnessLevel;
  next_level_info?: WellnessLevel;
}

interface LevelAchievement {
  id: string;
  level_number: number;
  achieved_at: string;
  points_at_achievement: number;
  celebration_viewed: boolean;
}

interface LevelsWidgetProps {
  className?: string;
}

const LevelsWidget: React.FC<LevelsWidgetProps> = ({ className = '' }) => {
  const [levelData, setLevelData] = useState<UserLevelData | null>(null);
  const [achievements, setAchievements] = useState<LevelAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    fetchLevelData();
  }, []);

  const fetchLevelData = async () => {
    try {
      setLoading(true);
      const [levelResponse, achievementsResponse] = await Promise.all([
        gamificationAPI.getUserLevel(),
        gamificationAPI.getLevelAchievements()
      ]);
      
      if (levelResponse.success) {
        setLevelData(levelResponse.data);
      }
      
      if (achievementsResponse.success) {
        setAchievements(achievementsResponse.data);
        // Check for unviewed achievements
        const unviewed = achievementsResponse.data.find((a: LevelAchievement) => !a.celebration_viewed);
        if (unviewed) {
          setShowCelebration(true);
        }
      }
    } catch (err) {
      console.error('Error fetching level data:', err);
      setError('Failed to load level data');
    } finally {
      setLoading(false);
    }
  };

  const getLevelIcon = (icon: string) => {
    const iconMap: Record<string, string> = {
      'seedling': '🌱',
      'student': '📚',
      'lotus': '🪷',
      'balance': '⚖️',
      'wise-tree': '🌳',
      'crown': '👑',
      'divine': '✨',
      'universe': '🌌',
      'infinity': '♾️',
      'sun': '☀️'
    };
    return iconMap[icon] || '⭐';
  };

  const getLevelColor = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; text: string; progress: string }> = {
      'green': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', progress: 'bg-green-500' },
      'blue': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', progress: 'bg-blue-500' },
      'purple': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', progress: 'bg-purple-500' },
      'indigo': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', progress: 'bg-indigo-500' },
      'orange': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', progress: 'bg-orange-500' },
      'gold': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', progress: 'bg-yellow-500' },
      'rainbow': { bg: 'bg-gradient-to-r from-red-50 to-purple-50', border: 'border-purple-200', text: 'text-purple-700', progress: 'bg-gradient-to-r from-red-500 to-purple-500' },
      'cosmic': { bg: 'bg-gradient-to-r from-purple-50 to-blue-50', border: 'border-purple-200', text: 'text-purple-700', progress: 'bg-gradient-to-r from-purple-500 to-blue-500' },
      'eternal': { bg: 'bg-gradient-to-r from-blue-50 to-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', progress: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
      'light': { bg: 'bg-gradient-to-r from-yellow-50 to-white', border: 'border-yellow-200', text: 'text-yellow-700', progress: 'bg-gradient-to-r from-yellow-400 to-white' }
    };
    return colorMap[color] || colorMap['blue'];
  };

  const closeCelebration = async () => {
    setShowCelebration(false);
    // Mark celebration as viewed (you can implement this API call)
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
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
            onClick={fetchLevelData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!levelData) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <p>No level data available</p>
        </div>
      </div>
    );
  }

  if (!levelData.level_info) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <p>Level information not found</p>
          <button 
            onClick={fetchLevelData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const colors = getLevelColor(levelData.level_info.level_color);

  return (
    <>
      <div className={`rounded-lg shadow-md p-6 border ${colors.bg} ${colors.border} ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <span className="mr-2">📈</span>
            Wellness Level
          </h3>
          <div className="text-sm text-gray-500">
            Level {levelData.current_level}
          </div>
        </div>

        {/* Current Level Display */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">
              {getLevelIcon(levelData.level_info.level_icon)}
            </div>
            <div className="flex-1">
              <h4 className={`text-xl font-bold ${colors.text}`}>
                {levelData.level_info.level_name}
              </h4>
              <p className={`text-sm ${colors.text} opacity-80 italic`}>
                {levelData.level_info.sanskrit_name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {levelData.level_info.level_description}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Progress to Next Level
            </span>
            <span className="text-sm font-medium text-gray-700">
              {levelData.current_points} / {levelData.next_level_points} points
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${colors.progress} transition-all duration-500`}
              style={{ width: `${Math.min(levelData.level_progress_percentage, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {levelData.points_to_next_level} points to next level
          </div>
        </div>

        {/* Next Level Preview */}
        {levelData.next_level_info && (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-100">
            <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <span className="mr-2">🎯</span>
              Next Level: {levelData.next_level_info.level_name}
            </h5>
            <p className="text-xs text-gray-600 mb-2">
              {levelData.next_level_info.sanskrit_name} - {levelData.next_level_info.level_description}
            </p>
            {levelData.next_level_info.unlocked_features.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Unlocks:</p>
                <div className="flex flex-wrap gap-1">
                  {levelData.next_level_info.unlocked_features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {feature.replace('_', ' ')}
                    </span>
                  ))}
                  {levelData.next_level_info.unlocked_features.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{levelData.next_level_info.unlocked_features.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cultural Significance */}
        <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-l-4 border-orange-400">
          <p className="text-xs text-gray-700 italic">
            {levelData.level_info.cultural_significance}
          </p>
        </div>

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span className="mr-1">🏆</span>
              Recent Level Achievements
            </h5>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {achievements.slice(0, 2).map((achievement) => (
                <div 
                  key={achievement.id} 
                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-100 text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">🎉</span>
                    <span className="font-medium text-gray-700">
                      Reached Level {achievement.level_number}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    {new Date(achievement.achieved_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Level Up Celebration Modal */}
      {showCelebration && achievements.find(a => !a.celebration_viewed) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Level Up!</h3>
            <p className="text-gray-600 mb-4">
              Congratulations! You've reached Level {achievements.find(a => !a.celebration_viewed)?.level_number}
            </p>
            <p className="text-sm text-gray-500 mb-6 italic">
              "Every step forward is a step towards achieving something bigger and better than your current situation." 🌟
            </p>
            <button
              onClick={closeCelebration}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Continue Journey
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LevelsWidget;