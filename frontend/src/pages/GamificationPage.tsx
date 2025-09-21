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
import { GamificationDashboardProvider } from '../contexts/GamificationDashboardContext';

const GamificationPage: React.FC = () => {
  return (
    <GamificationDashboardProvider>
      <GamificationPageContent />
    </GamificationDashboardProvider>
  );
};

const GamificationPageContent: React.FC = () => {
  const { user, logout } = useAuth();
  const { pendingRewards, processPendingRewards, isProcessing } = useGamification();
  const [rewardNotification, setRewardNotification] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 relative">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mix-blend-soft-light filter blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full mix-blend-soft-light filter blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mix-blend-soft-light filter blur-3xl"></div>
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
            <div className="fixed top-20 right-4 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 backdrop-blur-md rounded-lg px-6 py-4 border border-emerald-400/50 shadow-xl z-50 max-w-sm animate-pulse">
              <p className="text-white text-sm font-medium">{rewardNotification}</p>
            </div>
          )}
          
          {/* Clean Header */}
          <div className="text-left mb-8">
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-pink-400/30 mb-4 shadow-lg max-w-fit">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-xl shadow-md">
                  🎮
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-purple-300 mb-1">
                    Wellness Journey
                  </p>
                  <h2 className="text-xl font-bold text-white">
                    Your Progress Dashboard
                  </h2>
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-2 text-white">
              Track Progress & Earn Rewards
            </h1>
            
            <div className="flex gap-3 mb-6">
              <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 text-xs">
                <span className="text-teal-300 font-medium">
                  🕉️ Karma Points & Levels
                </span>
              </div>
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-full px-4 py-2 border border-orange-400/30 text-xs">
                <span className="text-orange-300 font-medium">
                  🏆 Achievements & Challenges
                </span>
              </div>
            </div>
          </div>

          {/* Debug Panel - Remove this in production */}
          <GamificationDebug />
          
          {/* Testing Instructions */}
          <div className="bg-blue-900/30 backdrop-blur-md rounded-xl p-4 mb-6 border border-blue-400/30">
            <h3 className="text-blue-300 font-semibold mb-2">🧪 Testing Chat Rewards</h3>
            <p className="text-blue-200 text-sm">
              To test chat completion rewards: Go to <strong>💬 AI Chat</strong> (VRM Avatar page), 
              send 3+ messages, then return here to see your rewards processed!
            </p>
          </div>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Karma Points Section */}
            <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-md rounded-2xl p-6 border border-orange-400/30 hover:border-orange-400/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">🏆 Karma Points</h3>
                  <p className="text-orange-200 text-sm">Track your spiritual earnings</p>
                </div>
                <div className="text-4xl">🕉️</div>
              </div>
              <PointsWidget className="bg-transparent border-0 shadow-none p-0" />
            </div>

            {/* Wellness Levels Section */}
            <div className="bg-gradient-to-br from-indigo-500/20 to-blue-600/20 backdrop-blur-md rounded-2xl p-6 border border-indigo-400/30 hover:border-indigo-400/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">📈 Wellness Levels</h3>
                  <p className="text-indigo-200 text-sm">Your spiritual progression</p>
                </div>
                <div className="text-4xl">🌟</div>
              </div>
              <LevelsWidget className="bg-transparent border-0 shadow-none p-0" />
            </div>
          </div>

          {/* Secondary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Daily Streaks Section */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-md rounded-2xl p-6 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">🔥 Daily Streaks</h3>
                  <p className="text-purple-200 text-sm">Consistency in practice</p>
                </div>
                <div className="text-4xl">🏅</div>
              </div>
              <StreaksWidget className="bg-transparent border-0 shadow-none p-0" />
            </div>

            {/* Badges & Achievements Section */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 backdrop-blur-md rounded-2xl p-6 border border-emerald-400/30 hover:border-emerald-400/60 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">🏆 Badges</h3>
                  <p className="text-emerald-200 text-sm">Earned achievements</p>
                </div>
                <div className="text-4xl">🎖️</div>
              </div>
              <BadgesWidget className="bg-transparent border-0 shadow-none p-0" />
            </div>
          </div>

          {/* Challenges Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-teal-500/20 to-cyan-600/20 backdrop-blur-md rounded-2xl p-6 border border-teal-400/30 hover:border-teal-400/60 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">🎯 Daily Challenges</h3>
                    <p className="text-teal-200 text-sm">Yoga, meditation & wellness activities</p>
                  </div>
                  <div className="text-4xl">🧘‍♀️</div>
                </div>
                <ChallengesWidget className="bg-transparent border-0 shadow-none p-0" />
              </div>
            </div>
            
            <div>
              <div className="bg-gradient-to-br from-pink-500/20 to-rose-600/20 backdrop-blur-md rounded-2xl p-6 border border-pink-400/30 hover:border-pink-400/60 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">🧪 Quick Actions</h3>
                    <p className="text-pink-200 text-sm">Test & debug features</p>
                  </div>
                  <div className="text-4xl">⚡</div>
                </div>
                <TestPoints className="bg-transparent border-0 shadow-none p-0" />
              </div>
            </div>
          </div>

          {/* Wellness Journey Insights */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-white mb-4 text-center">�🇳 Your Spiritual Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-md rounded-xl p-6 border border-pink-400/30 hover:border-pink-400/60 transition-all duration-300">
                <div className="text-center">
                  <div className="text-4xl mb-3">🔥</div>
                  <h4 className="text-white font-bold text-lg mb-2">Daily Consistency</h4>
                  <p className="text-pink-200 text-sm mb-4">Build healthy habits through daily mindfulness practices rooted in ancient wisdom</p>
                  <div className="bg-pink-500/10 rounded-lg p-2">
                    <span className="text-pink-300 text-xs font-medium">नित्यं चैतन्यम् - Daily Awareness</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 backdrop-blur-md rounded-xl p-6 border border-teal-400/30 hover:border-teal-400/60 transition-all duration-300">
                <div className="text-center">
                  <div className="text-4xl mb-3">🏆</div>
                  <h4 className="text-white font-bold text-lg mb-2">Achievement Unlocks</h4>
                  <p className="text-teal-200 text-sm mb-4">Earn karma badges and unlock spiritual milestones on your path to wellness</p>
                  <div className="bg-teal-500/10 rounded-lg p-2">
                    <span className="text-teal-300 text-xs font-medium">कर्म योग - Path of Action</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-xl p-6 border border-orange-400/30 hover:border-orange-400/60 transition-all duration-300">
                <div className="text-center">
                  <div className="text-4xl mb-3">🌸</div>
                  <h4 className="text-white font-bold text-lg mb-2">Seva & Growth</h4>
                  <p className="text-orange-200 text-sm mb-4">Inspire others and contribute to a supportive community through service</p>
                  <div className="bg-orange-500/10 rounded-lg p-2">
                    <span className="text-orange-300 text-xs font-medium">सेवा धर्म - Service as Duty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-6">🚀 Start Your Practice</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/meditation" className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 backdrop-blur-md rounded-xl p-4 border border-pink-400/30 hover:border-pink-400/60 text-white font-medium transition-all duration-300 hover:scale-105 group block">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🧘‍♀️</div>
                <div className="text-pink-200">Meditation</div>
                <div className="text-pink-300/70 text-xs mt-1">ध्यान साधना</div>
              </Link>
              
              <Link to="/journal" className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 backdrop-blur-md rounded-xl p-4 border border-teal-400/30 hover:border-teal-400/60 text-white font-medium transition-all duration-300 hover:scale-105 group block">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📝</div>
                <div className="text-teal-200">Journal Entry</div>
                <div className="text-teal-300/70 text-xs mt-1">स्वाध्याय</div>
              </Link>
              
              <Link to="/mood" className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-xl p-4 border border-orange-400/30 hover:border-orange-400/60 text-white font-medium transition-all duration-300 hover:scale-105 group block">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📊</div>
                <div className="text-orange-200">Mood Tracker</div>
                <div className="text-orange-300/70 text-xs mt-1">अंतर्दर्शन</div>
              </Link>
              
              <Link to="/checkin" className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-md rounded-xl p-4 border border-purple-400/30 hover:border-purple-400/60 text-white font-medium transition-all duration-300 hover:scale-105 group block">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">✅</div>
                <div className="text-purple-200">Daily Check-in</div>
                <div className="text-purple-300/70 text-xs mt-1">दिनचर्या</div>
              </Link>
            </div>
          </div>
        </div>
        </main>
    </div>
  );
};

export default GamificationPage;