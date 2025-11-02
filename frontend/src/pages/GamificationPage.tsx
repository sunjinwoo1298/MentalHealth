import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PointsWidget from '../components/Gamification/PointsWidget';
import LevelsWidget from '../components/Gamification/LevelsWidget';
import StreaksWidget from '../components/Gamification/StreaksWidget';
import BadgesWidget from '../components/Gamification/BadgesWidget';
import ChallengesWidget from '../components/Gamification/ChallengesWidget';
import TestPoints from '../components/Gamification/TestPoints';
import GamificationDebug from '../components/Debug/GamificationDebug';
import Navigation from '../components/Navigation/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';

interface QuickMoodData {
  emotions: { [key: string]: number };
  triggers: string[];
  notes: string;
  timestamp: string;
}

const GamificationPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { pendingRewards, processPendingRewards, isProcessing } = useGamification();
  const [rewardNotification, setRewardNotification] = useState<string | null>(null);
  const [quickMoodLogs, setQuickMoodLogs] = useState<QuickMoodData[]>([]);

  const handleLogout = async () => {
    await logout();
  };

  // Load mood logs
  useEffect(() => {
    const quickLogs = localStorage.getItem('quickMoodLogs');
    if (quickLogs) {
      setQuickMoodLogs(JSON.parse(quickLogs));
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50/30 relative">
      {/* Subtle background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-64 h-64 bg-joy-gradient rounded-full mix-blend-soft-light filter blur-3xl"></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-gradient-to-r from-red-200 to-pink-200 rounded-full mix-blend-soft-light filter blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mix-blend-soft-light filter blur-3xl"></div>
      </div>
      
      <Navigation 
        isAuthenticated={true}
        user={user || undefined}
        onLogout={handleLogout}
      />
      
      <main className="relative z-10 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Reward Notification */}
          {rewardNotification && (
            <div className="fixed top-20 right-4 bg-white/90 backdrop-blur-md rounded-2xl px-6 py-4 border border-emerald-200 shadow-bubbly z-50 max-w-sm animate-pulse">
              <p className="text-emerald-700 text-sm font-medium">{rewardNotification}</p>
            </div>
          )}
          
          {/* Clean Header */}
          <div className="text-left mb-8">
            <div className="bg-white/70 backdrop-blur rounded-3xl px-8 py-6 border border-red-200/50 mb-4 shadow-bubbly max-w-fit">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xl shadow-md">
                  🎮
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-red-600 mb-1">
                    Wellness Journey
                  </p>
                  <h2 className="text-xl font-bold text-gray-800">
                    Your Progress Dashboard
                  </h2>
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-2 text-gray-800">
              Track Progress & Earn Rewards
            </h1>
            
            <div className="flex gap-3 mb-6">
              <div className="bg-white/80 backdrop-blur rounded-full px-4 py-2 border border-blue-200 text-xs shadow-sm">
                <span className="text-blue-700 font-medium">
                  🕉️ Karma Points & Levels
                </span>
              </div>
              <div className="bg-white/80 backdrop-blur rounded-full px-4 py-2 border border-orange-200 text-xs shadow-sm">
                <span className="text-orange-700 font-medium">
                  🏆 Achievements & Challenges
                </span>
              </div>
            </div>
          </div>

          {/* Debug Panel - Remove this in production */}
          <GamificationDebug />
          
          {/* Development Notice */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-6 border border-yellow-200 shadow-sm">
              <h3 className="text-yellow-700 font-semibold mb-2">🔧 Development Mode Notice</h3>
              <p className="text-yellow-600 text-sm">
                You may see duplicate API calls in the browser console. This is normal in development due to React's StrictMode 
                and multiple gamification widgets loading their data. In production, this will be optimized.
              </p>
            </div>
          )}
          
          {/* Testing Instructions */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-6 border border-blue-200 shadow-sm">
            <h3 className="text-blue-700 font-semibold mb-2">🧪 Testing Chat Rewards</h3>
            <p className="text-blue-600 text-sm">
              To test chat completion rewards: Go to <strong>💬 AI Chat</strong> (VRM Avatar page), 
              send 3+ messages, then return here to see your rewards processed!
            </p>
          </div>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Karma Points Section */}
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-orange-200/50 hover:shadow-bubbly transition-all duration-300 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-orange-700 mb-1">🏆 Karma Points</h3>
                  <p className="text-orange-600 text-sm">Track your spiritual earnings</p>
                </div>
                <div className="text-4xl">🕉️</div>
              </div>
              <PointsWidget className="bg-transparent border-0 shadow-none p-0" />
            </div>

            {/* Wellness Levels Section */}
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-blue-200/50 hover:shadow-bubbly transition-all duration-300 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-blue-700 mb-1">📈 Wellness Levels</h3>
                  <p className="text-blue-600 text-sm">Your spiritual progression</p>
                </div>
                <div className="text-4xl">🌟</div>
              </div>
              <LevelsWidget className="bg-transparent border-0 shadow-none p-0" />
            </div>
          </div>

          {/* Secondary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Daily Streaks Section */}
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-purple-200/50 hover:shadow-bubbly transition-all duration-300 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-purple-700 mb-1">🔥 Daily Streaks</h3>
                  <p className="text-purple-600 text-sm">Consistency in practice</p>
                </div>
                <div className="text-4xl">🏅</div>
              </div>
              <StreaksWidget className="bg-transparent border-0 shadow-none p-0" />
            </div>

            {/* Badges & Achievements Section */}
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-emerald-200/50 hover:shadow-bubbly transition-all duration-300 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-emerald-700 mb-1">🏆 Badges</h3>
                  <p className="text-emerald-600 text-sm">Earned achievements</p>
                </div>
                <div className="text-4xl">🎖️</div>
              </div>
              <BadgesWidget className="bg-transparent border-0 shadow-none p-0" />
            </div>
          </div>

          {/* Challenges Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-teal-200/50 hover:shadow-bubbly transition-all duration-300 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-teal-700 mb-1">🎯 Daily Challenges</h3>
                    <p className="text-teal-600 text-sm">Yoga, meditation & wellness activities</p>
                  </div>
                  <div className="text-4xl">🧘‍♀️</div>
                </div>
                <ChallengesWidget className="bg-transparent border-0 shadow-none p-0" />
              </div>
            </div>
            
            <div>
              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-pink-200/50 hover:shadow-bubbly transition-all duration-300 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-pink-700 mb-1">🧪 Quick Actions</h3>
                    <p className="text-pink-600 text-sm">Test & debug features</p>
                  </div>
                  <div className="text-4xl">⚡</div>
                </div>
                <TestPoints className="bg-transparent border-0 shadow-none p-0" />
              </div>
            </div>
          </div>

          {/* Wellness Journey Insights */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">��🇳 Your Spiritual Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-pink-200/50 hover:shadow-bubbly transition-all duration-300 shadow-sm">
                <div className="text-center">
                  <div className="text-4xl mb-3">🔥</div>
                  <h4 className="text-pink-700 font-bold text-lg mb-2">Daily Consistency</h4>
                  <p className="text-pink-600 text-sm mb-4">Build healthy habits through daily mindfulness practices rooted in ancient wisdom</p>
                  <div className="bg-pink-50 rounded-lg p-2">
                    <span className="text-pink-700 text-xs font-medium">नित्यं चैतन्यम् - Daily Awareness</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-teal-200/50 hover:shadow-bubbly transition-all duration-300 shadow-sm">
                <div className="text-center">
                  <div className="text-4xl mb-3">🏆</div>
                  <h4 className="text-teal-700 font-bold text-lg mb-2">Achievement Unlocks</h4>
                  <p className="text-teal-600 text-sm mb-4">Earn karma badges and unlock spiritual milestones on your path to wellness</p>
                  <div className="bg-teal-50 rounded-lg p-2">
                    <span className="text-teal-700 text-xs font-medium">कर्म योग - Path of Action</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-orange-200/50 hover:shadow-bubbly transition-all duration-300 shadow-sm">
                <div className="text-center">
                  <div className="text-4xl mb-3">🌸</div>
                  <h4 className="text-orange-700 font-bold text-lg mb-2">Seva & Growth</h4>
                  <p className="text-orange-600 text-sm mb-4">Inspire others and contribute to a supportive community through service</p>
                  <div className="bg-orange-50 rounded-lg p-2">
                    <span className="text-orange-700 text-xs font-medium">सेवा धर्म - Service as Duty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mood Logs Section */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-purple-200/50 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-purple-700 mb-1">⚡ Quick Mood Check-ins</h3>
                <p className="text-purple-600 text-sm">Your recent emotional wellness tracking</p>
              </div>
              <Link 
                to="/mood" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                View All
              </Link>
            </div>
            
            {quickMoodLogs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎯</div>
                <h4 className="text-gray-800 font-bold mb-2">Start Tracking Your Mood</h4>
                <p className="text-purple-600 mb-4">Use the Quick Mood Tracker on your dashboard to earn points and insights!</p>
                <Link 
                  to="/dashboard" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 inline-block shadow-md"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {quickMoodLogs.slice(0, 3).map((log, index) => (
                    <div key={index} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-purple-700 font-medium text-sm">Quick Check</div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {Object.entries(log.emotions).slice(0, 3).map(([emotion, value]) => value > 0 && (
                          <div key={emotion} className="flex items-center justify-between">
                            <span className="text-xs text-purple-600">{emotion}</span>
                            <div className="flex space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    i < value ? 'bg-purple-400' : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {log.triggers.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {log.triggers.slice(0, 2).map((trigger, idx) => (
                              <span key={idx} className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                                {trigger}
                              </span>
                            ))}
                            {log.triggers.length > 2 && (
                              <span className="text-xs text-gray-500">+{log.triggers.length - 2}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <p className="text-purple-600 text-sm">
                    Total check-ins: {quickMoodLogs.length} • Keep tracking for better insights!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-6">🚀 Start Your Practice</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to="/meditation" className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-pink-200/50 hover:shadow-bubbly font-medium transition-all duration-300 hover:scale-105 group block shadow-sm">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🧘‍♀️</div>
                <div className="text-pink-700">Meditation</div>
                <div className="text-pink-600/70 text-xs mt-1">ध्यान साधना</div>
              </Link>
              
              <Link to="/exercises" className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-amber-200/50 hover:shadow-bubbly font-medium transition-all duration-300 hover:scale-105 group block shadow-sm">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏃‍♀️</div>
                <div className="text-amber-700">Exercises</div>
                <div className="text-amber-600/70 text-xs mt-1">व्यायाम</div>
              </Link>
              
              <Link to="/journal" className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-teal-200/50 hover:shadow-bubbly font-medium transition-all duration-300 hover:scale-105 group block shadow-sm">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📝</div>
                <div className="text-teal-700">Journal Entry</div>
                <div className="text-teal-600/70 text-xs mt-1">स्वाध्याय</div>
              </Link>
              
              <Link to="/checkin" className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-purple-200/50 hover:shadow-bubbly font-medium transition-all duration-300 hover:scale-105 group block shadow-sm">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">✅</div>
                <div className="text-purple-700">Wellness Check-in</div>
                <div className="text-purple-600/70 text-xs mt-1">दिनचर्या</div>
              </Link>
            </div>
          </div>
        </div>
        </main>
    </div>
  );
};

export default GamificationPage;