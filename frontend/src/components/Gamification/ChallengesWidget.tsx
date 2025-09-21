import React, { useState, useEffect } from 'react';
import { gamificationAPI } from '../../services/api';

interface ChallengeTemplate {
  id: string;
  challenge_name: string;
  sanskrit_name: string;
  challenge_description: string;
  challenge_type: 'daily' | 'weekly' | 'custom';
  category: string;
  difficulty_level: number;
  estimated_minutes: number;
  points_reward: number;
  cultural_significance: string;
  ayurveda_dosha: string;
  yoga_type: string;
  instructions: any;
  prerequisites: string[];
  benefits: string[];
  completion_criteria: any;
  seasonal_relevance: string;
  is_active: boolean;
}

interface UserChallenge {
  id: string;
  user_id: string;
  template_id: string;
  challenge_status: 'active' | 'completed' | 'skipped' | 'expired';
  assigned_at: string;
  started_at?: string;
  completed_at?: string;
  expires_at: string;
  progress_data: any;
  completion_notes?: string;
  points_earned: number;
  template?: ChallengeTemplate;
}

interface ChallengesWidgetProps {
  className?: string;
}

const ChallengesWidget: React.FC<ChallengesWidgetProps> = ({ className = '' }) => {
  const [dailyChallenges, setDailyChallenges] = useState<UserChallenge[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingChallenge, setCompletingChallenge] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState<UserChallenge | null>(null);
  
  const isDarkTheme = className?.includes('bg-transparent');

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const [dailyResponse, weeklyResponse] = await Promise.all([
        gamificationAPI.getDailyChallenges(),
        gamificationAPI.getWeeklyChallenges()
      ]);
      
      if (dailyResponse.success) {
        setDailyChallenges(dailyResponse.data);
      }
      
      if (weeklyResponse.success) {
        setWeeklyChallenges(weeklyResponse.data);
      }
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'yoga': '🧘‍♀️',
      'meditation': '🧘',
      'breathing': '🌬️',
      'ayurveda': '🌿',
      'mindfulness': '🎯',
      'philosophy': '📚',
      'lifestyle': '🌱',
      'gratitude': '🙏'
    };
    return iconMap[category] || '⭐';
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 1) return 'text-green-600 bg-green-100';
    if (level <= 2) return 'text-blue-600 bg-blue-100';
    if (level <= 3) return 'text-orange-600 bg-orange-100';
    if (level <= 4) return 'text-red-600 bg-red-100';
    return 'text-purple-600 bg-purple-100';
  };

  const getDifficultyText = (level: number) => {
    const labels = ['', 'Beginner', 'Easy', 'Medium', 'Advanced', 'Expert'];
    return labels[level] || 'Unknown';
  };

  const getDoshaColor = (dosha: string) => {
    const colorMap: Record<string, string> = {
      'vata': 'text-purple-700 bg-purple-50 border-purple-200',
      'pitta': 'text-red-700 bg-red-50 border-red-200',
      'kapha': 'text-blue-700 bg-blue-50 border-blue-200',
      'tridoshic': 'text-green-700 bg-green-50 border-green-200'
    };
    return colorMap[dosha] || 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d remaining`;
    }
    
    return `${hours}h ${minutes}m remaining`;
  };

  const completeChallenge = async (challenge: UserChallenge, quality: 'excellent' | 'good' | 'satisfactory' = 'good') => {
    try {
      setCompletingChallenge(challenge.id);
      
      const response = await gamificationAPI.completeChallenge(challenge.id, {
        quality,
        notes: `Completed via dashboard`
      });

      if (response.success) {
        // Refresh challenges
        await fetchChallenges();
        
        // Show success message
        setError(null);
        
        // You could show a success modal here
        console.log('Challenge completed successfully!', response.data);
      }
    } catch (err) {
      console.error('Error completing challenge:', err);
      setError('Failed to complete challenge');
    } finally {
      setCompletingChallenge(null);
      setShowCompleteModal(null);
    }
  };

  const openCompleteModal = (challenge: UserChallenge) => {
    setShowCompleteModal(challenge);
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(null);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
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
            onClick={fetchChallenges}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={isDarkTheme ? className : `bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg shadow-md p-6 border border-orange-100 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold flex items-center ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
            <span className="mr-2">🎯</span>
            Daily Challenges
          </h3>
          <div className="text-sm text-gray-500">
            {dailyChallenges.filter(c => c.challenge_status === 'active').length} active
          </div>
        </div>

        {/* Daily Challenges */}
        {dailyChallenges.length > 0 ? (
          <div className="space-y-4 mb-6">
            {dailyChallenges.slice(0, 3).map((challenge) => {
              const template = challenge.template;
              if (!template) return null;

              return (
                <div 
                  key={challenge.id}
                  className="p-4 bg-white rounded-lg border border-orange-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-800">{template.challenge_name}</h4>
                          <p className="text-sm text-orange-600 italic">{template.sanskrit_name}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {template.challenge_description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty_level)}`}>
                          {getDifficultyText(template.difficulty_level)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs border ${getDoshaColor(template.ayurveda_dosha)}`}>
                          {template.ayurveda_dosha}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {template.estimated_minutes} min
                        </span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                          +{template.points_reward} pts
                        </span>
                      </div>

                      <div className="text-xs text-gray-500">
                        ⏰ {formatTimeRemaining(challenge.expires_at)}
                      </div>
                    </div>

                    <div className="ml-4">
                      {challenge.challenge_status === 'active' ? (
                        <button
                          onClick={() => openCompleteModal(challenge)}
                          disabled={completingChallenge === challenge.id}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 
                                   disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                          {completingChallenge === challenge.id ? 'Completing...' : 'Complete'}
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🌅</div>
            <h4 className="text-lg font-medium text-gray-600 mb-2">No Daily Challenges</h4>
            <p className="text-gray-500 text-sm">
              New challenges will be assigned automatically each day!
            </p>
          </div>
        )}

        {/* Weekly Challenges Preview */}
        {weeklyChallenges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <span className="mr-1">📅</span>
              Weekly Challenges ({weeklyChallenges.length})
            </h4>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {weeklyChallenges.slice(0, 2).map((challenge) => (
                <div 
                  key={challenge.id} 
                  className="flex items-center justify-between p-2 bg-white rounded border border-orange-100 text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <span>{getCategoryIcon(challenge.template?.category || '')}</span>
                    <span className="font-medium text-gray-700">
                      {challenge.template?.challenge_name}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs">
                    +{challenge.template?.points_reward} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cultural Message */}
        <div className="mt-6 p-3 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg border-l-4 border-orange-400">
          <p className="text-xs text-gray-700 italic">
            "योगः कर्मसु कौशलम्" - Yoga is skill in action. Every challenge is an opportunity to grow. 🕉️
          </p>
        </div>
      </div>

      {/* Challenge Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Complete Challenge</h3>
            <div className="mb-4">
              <h4 className="font-semibold text-gray-700">{showCompleteModal.template?.challenge_name}</h4>
              <p className="text-sm text-gray-600 italic">{showCompleteModal.template?.sanskrit_name}</p>
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              How was your experience with this challenge?
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => completeChallenge(showCompleteModal, 'excellent')}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                🌟 Excellent
              </button>
              <button
                onClick={() => completeChallenge(showCompleteModal, 'good')}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                👍 Good
              </button>
              <button
                onClick={() => completeChallenge(showCompleteModal, 'satisfactory')}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                👌 OK
              </button>
            </div>

            <button
              onClick={closeCompleteModal}
              className="w-full mt-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChallengesWidget;