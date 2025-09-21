import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../../services/api';

interface UserPoints {
  total_points: number;
  available_points: number;
  lifetime_points: number;
  current_level: number;
  points_to_next_level: number;
}

interface RecentActivity {
  id: string;
  activity_name: string;
  points_amount: number;
  cultural_theme: string;
  created_at: string;
}

interface PointsWidgetProps {
  className?: string;
}

const PointsWidget: React.FC<PointsWidgetProps> = ({ className = '' }) => {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isDarkTheme = className?.includes('bg-transparent');

  useEffect(() => {
    fetchPointsData();
  }, []);

  const fetchPointsData = async () => {
    try {
      setLoading(true);
      const response = await gamificationAPI.getPoints();
      
      if (response.success) {
        setUserPoints(response.data.points);
        setRecentActivity(response.data.recent_activity || []);
      }
    } catch (err) {
      console.error('Error fetching points data:', err);
      setError('Failed to load points data');
    } finally {
      setLoading(false);
    }
  };

  const calculateLevelProgress = () => {
    if (!userPoints) return 0;
    const currentLevelPoints = (userPoints.current_level - 1) * 100;
    const nextLevelPoints = userPoints.current_level * 100;
    const progress = ((userPoints.total_points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.round(Math.max(0, Math.min(100, progress)));
  };

  const getCulturalThemeEmoji = (theme: string) => {
    const themes: Record<string, string> = {
      karma: '🕉️',
      dharma: '☸️',
      seva: '🙏',
      svadhyaya: '📖',
      dhyana: '🧘',
      pranayama: '🌬️',
      santosha: '💖',
      moksha: '✨'
    };
    return themes[theme] || '⭐';
  };

  if (loading) {
    return (
      <div className={isDarkTheme ? className : `bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className={`h-4 rounded w-1/4 mb-4 ${isDarkTheme ? 'bg-white/20' : 'bg-gray-200'}`}></div>
          <div className={`h-8 rounded w-1/2 mb-4 ${isDarkTheme ? 'bg-white/20' : 'bg-gray-200'}`}></div>
          <div className={`h-2 rounded w-full mb-4 ${isDarkTheme ? 'bg-white/20' : 'bg-gray-200'}`}></div>
          <div className="space-y-2">
            <div className={`h-3 rounded w-3/4 ${isDarkTheme ? 'bg-white/20' : 'bg-gray-200'}`}></div>
            <div className={`h-3 rounded w-1/2 ${isDarkTheme ? 'bg-white/20' : 'bg-gray-200'}`}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={isDarkTheme ? className : `bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className={`text-center ${isDarkTheme ? 'text-red-300' : 'text-red-600'}`}>
          <p>{error}</p>
          <button 
            onClick={fetchPointsData}
            className={`mt-2 px-4 py-2 rounded transition-colors ${isDarkTheme ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userPoints) {
    return null;
  }

  const levelProgress = calculateLevelProgress();

  return (
    <div className={isDarkTheme ? className : `bg-gradient-to-br from-orange-50 to-pink-50 rounded-lg shadow-md p-6 border border-orange-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold flex items-center ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
          <span className="mr-2">🏆</span>
          Karma Points
        </h3>
        <div className={`text-2xl font-bold ${isDarkTheme ? 'text-orange-300' : 'text-orange-600'}`}>
          {userPoints.total_points.toLocaleString()}
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${isDarkTheme ? 'text-orange-200' : 'text-gray-600'}`}>
            Level {userPoints.current_level}
          </span>
          <span className={`text-sm ${isDarkTheme ? 'text-orange-300/70' : 'text-gray-500'}`}>
            {userPoints.points_to_next_level} points to Level {userPoints.current_level + 1}
          </span>
        </div>
        <div className={`w-full rounded-full h-3 ${isDarkTheme ? 'bg-white/10' : 'bg-gray-200'}`}>
          <div 
            className="bg-gradient-to-r from-orange-400 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${levelProgress}%` }}
          ></div>
        </div>
        <div className={`text-center mt-1 text-xs ${isDarkTheme ? 'text-orange-300/60' : 'text-gray-500'}`}>
          {levelProgress}% complete
        </div>
      </div>

      {/* Points Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`text-center p-3 rounded-lg border ${isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}>
          <div className={`text-sm mb-1 ${isDarkTheme ? 'text-orange-200' : 'text-gray-600'}`}>Available</div>
          <div className={`text-lg font-bold ${isDarkTheme ? 'text-green-300' : 'text-green-600'}`}>
            {userPoints.available_points.toLocaleString()}
          </div>
        </div>
        <div className={`text-center p-3 rounded-lg border ${isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}>
          <div className={`text-sm mb-1 ${isDarkTheme ? 'text-orange-200' : 'text-gray-600'}`}>Lifetime</div>
          <div className={`text-lg font-bold ${isDarkTheme ? 'text-purple-300' : 'text-purple-600'}`}>
            {userPoints.lifetime_points.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div>
          <h4 className={`text-sm font-medium mb-2 flex items-center ${isDarkTheme ? 'text-orange-200' : 'text-gray-700'}`}>
            <span className="mr-1">📝</span>
            Recent Activity
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {recentActivity.slice(0, 3).map((activity) => (
              <div 
                key={activity.id} 
                className={`flex items-center justify-between p-2 rounded border text-xs ${isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}
              >
                <div className="flex items-center">
                  <span className="mr-2">{getCulturalThemeEmoji(activity.cultural_theme)}</span>
                  <span className={`truncate max-w-32 ${isDarkTheme ? 'text-orange-100' : 'text-gray-700'}`}>
                    {activity.activity_name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`font-medium ${isDarkTheme ? 'text-green-300' : 'text-green-600'}`}>
                    +{activity.points_amount}
                  </span>
                  <span className={isDarkTheme ? 'text-orange-300/60' : 'text-gray-400'}>
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cultural Message */}
      <div className={`mt-4 p-3 rounded-lg border-l-4 ${isDarkTheme ? 'bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-orange-400/60' : 'bg-gradient-to-r from-orange-100 to-pink-100 border-orange-400'}`}>
        <p className={`text-xs italic ${isDarkTheme ? 'text-orange-200' : 'text-gray-700'}`}>
          "Every good deed creates positive karma. Keep nurturing your inner wellness journey!" 🌸
        </p>
      </div>
    </div>
  );
};

export default PointsWidget;