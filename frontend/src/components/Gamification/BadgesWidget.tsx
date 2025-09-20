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

interface Achievement {
  id: string;
  achievement_name: string;
  sanskrit_name: string;
  achievement_description: string;
  achievement_icon: string;
  rarity: string;
  cultural_meaning: string;
  spiritual_significance: string;
  earned_at: string;
  points_earned: number;
  tier_earned: string;
  is_featured: boolean;
  category: {
    category_name: string;
    color_theme: string;
  };
  tier: {
    tier_name: string;
    tier_color: string;
    tier_icon: string;
  };
}

interface AchievementProgress {
  id: string;
  achievement_id: string;
  current_progress: number;
  max_progress: number;
  is_completed: boolean;
  achievement: Achievement;
}

interface AchievementStats {
  total_achievements: number;
  achievements_by_tier: any;
  achievements_by_category: any;
  achievement_points: number;
  completion_streak: number;
}

interface BadgesWidgetProps {
  className?: string;
  maxDisplay?: number;
}

const BadgesWidget: React.FC<BadgesWidgetProps> = ({ className = '', maxDisplay = 6 }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<AchievementProgress[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'badges' | 'achievements' | 'progress'>('achievements');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [badgesResponse, achievementsResponse, progressResponse, statsResponse] = await Promise.all([
        gamificationAPI.getBadges(),
        gamificationAPI.getEarnedAchievements(),
        gamificationAPI.getAchievementProgress(),
        gamificationAPI.getAchievementStats()
      ]);
      
      if (badgesResponse.success) {
        setBadges(badgesResponse.data.badges);
      }
      if (achievementsResponse.success) {
        setAchievements(achievementsResponse.data);
      }
      if (progressResponse.success) {
        setProgress(progressResponse.data);
      }
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (err) {
      console.error('Error fetching achievements data:', err);
      setError('Failed to load achievements');
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
            onClick={fetchAllData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getRarityColor = (rarity: string) => {
    const rarityMap: Record<string, string> = {
      'common': 'from-gray-100 to-gray-200 border-gray-300',
      'uncommon': 'from-green-100 to-emerald-200 border-green-300',
      'rare': 'from-blue-100 to-indigo-200 border-blue-300',
      'epic': 'from-purple-100 to-violet-200 border-purple-300',
      'legendary': 'from-yellow-100 to-amber-200 border-yellow-400'
    };
    return rarityMap[rarity] || rarityMap.common;
  };

  const getTierIcon = (tierName: string) => {
    const tierIcons: Record<string, string> = {
      'Bronze Lotus': '🪷',
      'Silver Moon': '🌙',
      'Golden Sun': '☀️',
      'Platinum Vajra': '⚡',
      'Diamond Atman': '💎'
    };
    return tierIcons[tierName] || '⭐';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header with Navigation Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <span className="mr-2">�</span>
            Achievements & Badges
          </h3>
          
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === 'achievements'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === 'badges'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Badges
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeTab === 'progress'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Progress
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          {stats ? (
            <div className="text-right">
              <div className="font-medium text-indigo-600">{stats.total_achievements} earned</div>
              <div className="text-xs">{stats.achievement_points} points</div>
            </div>
          ) : (
            <div>{badges.length} badges</div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div>
            {achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.slice(0, maxDisplay).map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`bg-gradient-to-br ${getRarityColor(achievement.rarity)} 
                               border rounded-lg p-4 hover:shadow-lg transition-all duration-200
                               hover:scale-[1.02] cursor-pointer group relative`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Achievement Icon & Tier */}
                      <div className="flex-shrink-0">
                        <div className="text-2xl mb-1">{achievement.achievement_icon || '🏆'}</div>
                        <div className="text-lg">{getTierIcon(achievement.tier?.tier_name || '')}</div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Achievement Name */}
                        <h4 className="font-semibold text-sm text-gray-800 mb-1">
                          {achievement.achievement_name}
                        </h4>
                        
                        {/* Sanskrit Name */}
                        {achievement.sanskrit_name && (
                          <p className="text-xs text-indigo-600 font-medium mb-1 italic">
                            {achievement.sanskrit_name}
                          </p>
                        )}
                        
                        {/* Description */}
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {achievement.achievement_description}
                        </p>
                        
                        {/* Points & Date */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                            +{achievement.points_earned} points
                          </span>
                          <span className="text-gray-500">
                            {new Date(achievement.earned_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Featured Badge */}
                    {achievement.is_featured && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
                          ⭐ Featured
                        </span>
                      </div>
                    )}

                    {/* Hover tooltip for cultural meaning */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                                  px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 
                                  group-hover:opacity-100 transition-opacity duration-200 
                                  pointer-events-none z-10 w-56 text-center">
                      <p className="font-medium mb-1">{achievement.cultural_meaning}</p>
                      {achievement.spiritual_significance && (
                        <p className="text-gray-300">{achievement.spiritual_significance}</p>
                      )}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                                    border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h4 className="text-lg font-medium text-gray-600 mb-2">Begin Your Achievement Journey</h4>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Start your wellness journey to unlock achievements and grow spiritually. Every step counts!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Traditional Badges Tab */}
        {activeTab === 'badges' && (
          <div>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {badges.slice(0, maxDisplay).map((badge) => (
                  <div 
                    key={badge.id}
                    className={`bg-gradient-to-br ${getCategoryColor(badge.badge_category)} 
                               border rounded-lg p-4 hover:shadow-md transition-all duration-200
                               hover:scale-105 cursor-pointer group relative`}
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
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌱</div>
                <h4 className="text-lg font-medium text-gray-600 mb-2">Start Your Journey</h4>
                <p className="text-gray-500 text-sm">
                  Complete wellness activities to earn your first karma badge!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div>
            {progress.length > 0 ? (
              <div className="space-y-4">
                {progress.slice(0, maxDisplay).map((progressItem) => (
                  <div 
                    key={progressItem.id}
                    className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 
                             rounded-lg p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Achievement Icon */}
                      <div className="flex-shrink-0 text-2xl">
                        {progressItem.achievement.achievement_icon || '⏳'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Achievement Name */}
                        <h4 className="font-medium text-sm text-gray-800 mb-1">
                          {progressItem.achievement.achievement_name}
                        </h4>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(progressItem.current_progress / progressItem.max_progress) * 100}%` 
                            }}
                          ></div>
                        </div>
                        
                        {/* Progress Text */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">
                            {progressItem.current_progress} / {progressItem.max_progress}
                          </span>
                          <span className="text-indigo-600 font-medium">
                            {Math.round((progressItem.current_progress / progressItem.max_progress) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📈</div>
                <h4 className="text-lg font-medium text-gray-600 mb-2">No Active Progress</h4>
                <p className="text-gray-500 text-sm">
                  Start engaging with wellness activities to track your achievement progress!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cultural Footer Message & Statistics */}
      <div className="mt-6 space-y-4">
        {/* Inspirational Quote */}
        <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-l-4 border-indigo-400">
          <p className="text-xs text-gray-700 italic">
            {activeTab === 'achievements' 
              ? "Achievement is not the destination but the journey of self-discovery. 🌟" 
              : activeTab === 'progress'
              ? "Progress, not perfection. Every step forward is a victory. 🚀"
              : "Each badge represents a step on your path to inner peace and wisdom. 🌺"
            }
          </p>
        </div>

        {/* Achievement Statistics */}
        {stats && activeTab === 'achievements' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-600">{stats.total_achievements}</div>
              <div className="text-xs text-gray-600">Total Earned</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{stats.achievement_points}</div>
              <div className="text-xs text-gray-600">Achievement Points</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{stats.completion_streak}</div>
              <div className="text-xs text-gray-600">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-600">
                {stats.achievements_by_tier?.legendary || 0}
              </div>
              <div className="text-xs text-gray-600">Legendary</div>
            </div>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center">
          {(activeTab === 'achievements' && achievements.length > maxDisplay) ||
           (activeTab === 'badges' && badges.length > maxDisplay) ||
           (activeTab === 'progress' && progress.length > maxDisplay) ? (
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors">
              View All {
                activeTab === 'achievements' ? `${achievements.length} Achievements` :
                activeTab === 'badges' ? `${badges.length} Badges` :
                `${progress.length} In Progress`
              } →
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BadgesWidget;