import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../../services/api';

interface Badge {
  id: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  cultural_meaning: string;
  earned_at: string;
  is_displayed: boolean;
  badge_category: string;
}

interface BadgesWidgetProps {
  className?: string;
  maxDisplay?: number;
}

const BadgesWidget: React.FC<BadgesWidgetProps> = ({ className = '', maxDisplay = 6 }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const response = await gamificationAPI.getBadges();
      
      if (response.success) {
        setBadges(response.data.badges);
      }
    } catch (err) {
      console.error('Error fetching badges:', err);
      setError('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (iconName: string) => {
    // Map badge icons to emojis
    const iconMap: Record<string, string> = {
      'lotus-bud': '🌸',
      'om-symbol': '🕉️',
      'hands-namaste': '🙏',
      'sun-mandala': '☀️',
      'wheel-dharma': '☸️',
      'yoga-pose': '🧘‍♀️',
      'ancient-scroll': '📜',
      'lotus-full': '🪷',
      'golden-om': '✨',
      'sacred-tree': '🌳'
    };
    return iconMap[iconName] || '⭐';
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'beginnings': 'from-green-100 to-emerald-100 border-green-200',
      'mindfulness': 'from-purple-100 to-violet-100 border-purple-200',
      'compassion': 'from-pink-100 to-rose-100 border-pink-200',
      'discipline': 'from-orange-100 to-amber-100 border-orange-200',
      'wisdom': 'from-blue-100 to-indigo-100 border-blue-200',
      'resilience': 'from-red-100 to-pink-100 border-red-200',
      'service': 'from-yellow-100 to-orange-100 border-yellow-200',
      'achievement': 'from-purple-100 to-pink-100 border-purple-200'
    };
    return colorMap[category] || 'from-gray-100 to-slate-100 border-gray-200';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
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
            onClick={fetchBadges}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const displayedBadges = badges.slice(0, maxDisplay);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="mr-2">🏅</span>
          Karma Badges
        </h3>
        <div className="text-sm text-gray-500">
          {badges.length} earned
        </div>
      </div>

      {/* Badges Grid */}
      {displayedBadges.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayedBadges.map((badge) => (
            <div 
              key={badge.id}
              className={`bg-gradient-to-br ${getCategoryColor(badge.badge_category)} 
                         border rounded-lg p-4 hover:shadow-md transition-all duration-200
                         hover:scale-105 cursor-pointer group`}
              title={badge.cultural_meaning}
            >
              <div className="text-center">
                {/* Badge Icon */}
                <div className="text-3xl mb-2">
                  {getBadgeIcon(badge.badge_icon)}
                </div>
                
                {/* Badge Name */}
                <h4 className="font-medium text-sm text-gray-800 mb-1 line-clamp-2">
                  {badge.badge_name}
                </h4>
                
                {/* Badge Description */}
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                  {badge.badge_description}
                </p>
                
                {/* Earned Date */}
                <div className="text-xs text-gray-500">
                  {new Date(badge.earned_at).toLocaleDateString()}
                </div>
              </div>

              {/* Hover tooltip for cultural meaning */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                            px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 
                            group-hover:opacity-100 transition-opacity duration-200 
                            pointer-events-none z-10 w-48 text-center">
                {badge.cultural_meaning}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                              border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🌱</div>
          <h4 className="text-lg font-medium text-gray-600 mb-2">Start Your Journey</h4>
          <p className="text-gray-500 text-sm">
            Complete wellness activities to earn your first karma badge!
          </p>
        </div>
      )}

      {/* Cultural Footer Message */}
      <div className="mt-6 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-l-4 border-indigo-400">
        <p className="text-xs text-gray-700 italic">
          "Each badge represents a step on your path to inner peace and wisdom." 🌺
        </p>
      </div>

      {/* View All Button */}
      {badges.length > maxDisplay && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All {badges.length} Badges →
          </button>
        </div>
      )}
    </div>
  );
};

export default BadgesWidget;