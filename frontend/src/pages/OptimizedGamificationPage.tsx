import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gamificationAPI } from '../services/api';
import { useGamification } from '../contexts/GamificationContext';

interface GamificationData {
  points: any;
  level: any;
  streaks: any[];
  badges: any[];
  challenges: {
    daily: any[];
    weekly: any[];
  };
  achievements: {
    level: any[];
    streak: any[];
    progress: any[];
    stats: any;
  };
}

const OptimizedGamificationPage: React.FC = () => {
  const { pendingRewards, processPendingRewards } = useGamification();
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rewardNotification, setRewardNotification] = useState<string | null>(null);

  // Process pending rewards when page opens
  useEffect(() => {
    const processPendingOnMount = async () => {
      if (pendingRewards.length > 0) {
        console.log(`Processing ${pendingRewards.length} pending rewards...`);
        
        try {
          const result = await processPendingRewards();
          console.log('Pending rewards processed:', result);
          
          if (result.processed > 0) {
            interface RewardResult {
                success: boolean;
                [key: string]: any;
            }

            interface ProcessPendingRewardsResult {
                processed: number;
                results: RewardResult[];
            }

            const successfulRewards: RewardResult[] = (result as ProcessPendingRewardsResult).results.filter((r: RewardResult) => r.success);
            if (successfulRewards.length > 0) {
              setRewardNotification(
                `🎉 Great job! You earned rewards for ${successfulRewards.length} completed activities!`
              );
              
              // Clear notification after 5 seconds
              setTimeout(() => setRewardNotification(null), 5000);
            }
          }
        } catch (error) {
          console.error('Error processing pending rewards:', error);
          setRewardNotification('⚠️ Some rewards could not be processed. Please try refreshing.');
          setTimeout(() => setRewardNotification(null), 5000);
        }
      }
    };

    processPendingOnMount();
  }, [pendingRewards, processPendingRewards]);

  // Single API call to fetch all gamification data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await gamificationAPI.getDashboard();
        
        if (response.success) {
          setData(response.data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl animate-pulse">🎮</div>
          </div>
          <p className="text-purple-700 text-lg font-medium animate-pulse">Loading your wellness journey...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-pink-200">
          <div className="text-red-500 text-6xl mb-6 animate-bounce">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Failed to Load Progress</h2>
          <p className="text-gray-600 mb-8 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
          >
            ✨ Retry
          </button>
        </div>
      </div>
    );
  }

  const { points, level, streaks, badges, challenges } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-300/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-300/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-gradient-to-br from-orange-300/20 to-red-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Add custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6); }
        }
        .float-animation { animation: float 6s ease-in-out infinite; }
        .glow-animation { animation: glow 3s ease-in-out infinite; }
      `}</style>
      
      <main className="relative z-10 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Reward Notification */}
          {rewardNotification && (
            <div className="fixed top-20 right-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl px-6 py-4 shadow-2xl z-50 max-w-sm transform transition-all duration-500 animate-bounce border-2 border-white/50">
              <p className="text-white text-sm font-semibold">{rewardNotification}</p>
            </div>
          )}
          
          {/* Modern Header */}
          <div className="text-center mb-12">
            <div className="inline-block bg-white/90 backdrop-blur-sm rounded-3xl px-8 py-6 shadow-2xl border-2 border-pink-200 mb-6 transform hover:scale-105 transition-all duration-300 glow-animation">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg float-animation">
                  🎮
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Wellness Journey
                  </h1>
                  <p className="text-lg font-semibold text-gray-700">
                    Your Progress Dashboard
                  </p>
                </div>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Track Progress & Earn Rewards
            </h2>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-teal-200 transform hover:scale-105 transition-all duration-300">
                <span className="text-teal-600 font-semibold text-sm">
                  🕉️ Karma Points & Levels
                </span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-orange-200 transform hover:scale-105 transition-all duration-300">
                <span className="text-orange-600 font-semibold text-sm">
                  🏆 Achievements & Challenges
                </span>
              </div>
            </div>
          </div>

          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            
            {/* Karma Points Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-3xl group">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">🏆 Karma Points</h3>
                  <p className="text-orange-600 font-medium">Track your spiritual earnings</p>
                </div>
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300 float-animation">🕉️</div>
              </div>
              <div>
                <p className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-3">
                  {points?.total_points || 0}
                </p>
                <p className="text-gray-700 font-semibold mb-2">Total Karma Points Earned</p>
                {points?.weekly_points && (
                  <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-3 border border-orange-200">
                    <p className="text-orange-600 font-semibold text-sm">
                      ✨ +{points.weekly_points} this week
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Wellness Levels Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-3xl group">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">📈 Wellness Levels</h3>
                  <p className="text-indigo-600 font-medium">Your spiritual progression</p>
                </div>
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300 float-animation" style={{ animationDelay: '1s' }}>🌟</div>
              </div>
              <div>
                <p className="text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-3">
                  Level {level?.current_level || 1}
                </p>
                <p className="text-gray-700 font-semibold mb-4">Current Spiritual Level</p>
                {level?.progress_to_next && (
                  <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-4 border border-indigo-200">
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(level.progress_to_next / level.points_needed) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-indigo-600 font-semibold text-sm">
                      {level.progress_to_next}/{level.points_needed} to next level
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Secondary Stats Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

            {/* Daily Streaks Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-3xl group">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">🔥 Daily Streaks</h3>
                  <p className="text-purple-600 font-medium">Consistency in practice</p>
                </div>
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300 float-animation" style={{ animationDelay: '2s' }}>🏅</div>
              </div>
              <div>
                {streaks && streaks.length > 0 ? (
                  <div>
                    <p className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">
                      {streaks[0]?.current_streak || 0}
                    </p>
                    <p className="text-gray-700 font-semibold mb-2">Days Active Streak</p>
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-3 border border-purple-200">
                      <p className="text-purple-600 font-semibold text-sm">
                        🎯 Best: {streaks[0]?.max_streak || 0} days
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">0</p>
                    <p className="text-gray-700 font-semibold mb-2">Start your first streak!</p>
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-3 border border-purple-200">
                      <p className="text-purple-600 font-semibold text-sm">Begin your wellness journey today</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Badges & Achievements Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-3xl group">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">🏆 Badges</h3>
                  <p className="text-emerald-600 font-medium">Earned achievements</p>
                </div>
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300 float-animation" style={{ animationDelay: '3s' }}>🎖️</div>
              </div>
              <div>
                <p className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-3">
                  {badges?.length || 0}
                </p>
                <p className="text-gray-700 font-semibold mb-4">Badges Earned</p>
                {badges && badges.length > 0 && (
                  <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl p-4 border border-emerald-200">
                    <div className="flex space-x-2 mb-2">
                      {badges.slice(0, 4).map((badge: any, index: number) => (
                        <div key={index} className="text-2xl animate-bounce" style={{ animationDelay: `${index * 0.2}s` }}>
                          {badge.icon || '🏅'}
                        </div>
                      ))}
                      {badges.length > 4 && (
                        <span className="text-emerald-600 text-sm font-semibold">+{badges.length - 4} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Daily Challenges Section */}
          <div className="mb-12">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-teal-200 hover:border-teal-400 transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">🎯 Daily Challenges</h3>
                  <p className="text-teal-600 font-medium text-lg">Yoga, meditation & wellness activities</p>
                </div>
                <div className="text-6xl float-animation" style={{ animationDelay: '1.5s' }}>🧘‍♀️</div>
              </div>
              <div className="space-y-4">
                {challenges?.daily && challenges.daily.length > 0 ? (
                  challenges.daily.slice(0, 3).map((challenge: any, index: number) => (
                    <div key={index} className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 border-2 border-teal-100 hover:border-teal-300 transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-gray-800 font-bold text-lg mb-2">{challenge.name || challenge.title}</h4>
                          <p className="text-teal-600 font-medium">{challenge.description}</p>
                        </div>
                        <div className="text-right ml-6">
                          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-full font-bold text-sm mb-2">
                            +{challenge.points} points
                          </div>
                          {challenge.completed && (
                            <div className="text-4xl animate-bounce">✅</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-8 border-2 border-teal-100 text-center">
                    <div className="text-4xl mb-4">🎯</div>
                    <p className="text-teal-600 font-semibold text-lg">No daily challenges available</p>
                    <p className="text-gray-600 mt-2">Check back later for new wellness activities!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Wellness Journey Insights */}
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
              🇮🇳 Your Spiritual Progress
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-pink-200 hover:border-pink-400 transition-all duration-500 transform hover:-translate-y-2 group">
                <div className="text-center">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 float-animation">🔥</div>
                  <h4 className="text-gray-800 font-bold text-xl mb-4">Daily Consistency</h4>
                  <p className="text-gray-600 font-medium mb-6 leading-relaxed">Build healthy habits through daily mindfulness practices rooted in ancient wisdom</p>
                  <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-4 border border-pink-200">
                    <span className="text-pink-600 font-bold text-sm">नित्यं चैतन्यम् - Daily Awareness</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-teal-200 hover:border-teal-400 transition-all duration-500 transform hover:-translate-y-2 group">
                <div className="text-center">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 float-animation" style={{ animationDelay: '1s' }}>🏆</div>
                  <h4 className="text-gray-800 font-bold text-xl mb-4">Achievement Unlocks</h4>
                  <p className="text-gray-600 font-medium mb-6 leading-relaxed">Earn karma badges and unlock spiritual milestones on your path to wellness</p>
                  <div className="bg-gradient-to-r from-teal-100 to-cyan-100 rounded-2xl p-4 border border-teal-200">
                    <span className="text-teal-600 font-bold text-sm">कर्म योग - Path of Action</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-500 transform hover:-translate-y-2 group">
                <div className="text-center">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 float-animation" style={{ animationDelay: '2s' }}>🌸</div>
                  <h4 className="text-gray-800 font-bold text-xl mb-4">Seva & Growth</h4>
                  <p className="text-gray-600 font-medium mb-6 leading-relaxed">Inspire others and contribute to a supportive community through service</p>
                  <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-4 border border-orange-200">
                    <span className="text-orange-600 font-bold text-sm">सेवा धर्म - Service as Duty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="text-center">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
              🚀 Start Your Practice
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link 
                to="/meditation" 
                className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-pink-200 hover:border-pink-400 text-gray-800 font-semibold transition-all duration-500 transform hover:-translate-y-3 hover:shadow-3xl group block"
              >
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300 float-animation">🧘‍♀️</div>
                <div className="text-pink-600 font-bold text-lg mb-2">Meditation</div>
                <div className="text-pink-400 text-sm font-medium">ध्यान साधना</div>
              </Link>
              
              <Link 
                to="/journal" 
                className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-teal-200 hover:border-teal-400 text-gray-800 font-semibold transition-all duration-500 transform hover:-translate-y-3 hover:shadow-3xl group block"
              >
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300 float-animation" style={{ animationDelay: '0.5s' }}>📝</div>
                <div className="text-teal-600 font-bold text-lg mb-2">Journal Entry</div>
                <div className="text-teal-400 text-sm font-medium">स्वाध्याय</div>
              </Link>
              
              <Link 
                to="/mood" 
                className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-orange-200 hover:border-orange-400 text-gray-800 font-semibold transition-all duration-500 transform hover:-translate-y-3 hover:shadow-3xl group block"
              >
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300 float-animation" style={{ animationDelay: '1s' }}>📊</div>
                <div className="text-orange-600 font-bold text-lg mb-2">Mood Tracker</div>
                <div className="text-orange-400 text-sm font-medium">अंतर्दर्शन</div>
              </Link>
              
              <Link 
                to="/checkin" 
                className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-purple-200 hover:border-purple-400 text-gray-800 font-semibold transition-all duration-500 transform hover:-translate-y-3 hover:shadow-3xl group block"
              >
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300 float-animation" style={{ animationDelay: '1.5s' }}>✅</div>
                <div className="text-purple-600 font-bold text-lg mb-2">Daily Check-in</div>
                <div className="text-purple-400 text-sm font-medium">दिनचर्या</div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OptimizedGamificationPage;