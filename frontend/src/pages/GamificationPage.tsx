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
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  // Load mood logs
  useEffect(() => {
    const quickLogs = localStorage.getItem('quickMoodLogs');
    if (quickLogs) {
      setQuickMoodLogs(JSON.parse(quickLogs));
    }
    // Trigger animations after mount
    setTimeout(() => setIsLoaded(true), 100);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-violet-200/40 to-purple-300/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-blue-200/40 to-cyan-300/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-200/40 to-rose-300/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute top-2/3 left-1/3 w-72 h-72 bg-gradient-to-br from-amber-200/40 to-orange-300/30 rounded-full blur-3xl animate-blob animation-delay-6000"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-6 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Reward Notification - Floating Toast */}
          {rewardNotification && (
            <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl px-6 py-4 shadow-2xl backdrop-blur-lg border border-white/20 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-3">
                  <span className="text-2xl animate-bounce">🎉</span>
                  <p className="font-medium text-sm">{rewardNotification}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Hero Header with Smooth Fade In */}
          <div className={`mb-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            {/* Floating Badge */}
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border border-violet-200/50 mb-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-md animate-pulse">
                <span className="text-xl">🎮</span>
              </div>
              <div>
                <p className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Wellness Journey
                </p>
                <p className="text-xs text-gray-600">Your Progress Dashboard</p>
              </div>
            </div>
            
            {/* Main Title */}
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              Track Your Wellness Journey
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl">
              Earn karma points, unlock achievements, and celebrate your progress with culturally-inspired wellness activities
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="group bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-full px-5 py-2 border border-blue-300/30 hover:border-blue-400/60 transition-all duration-300 hover:shadow-md cursor-default">
                <span className="text-sm font-medium text-blue-700 group-hover:text-blue-800">🕉️ Karma Points & Levels</span>
              </div>
              <div className="group bg-gradient-to-r from-orange-500/10 to-amber-500/10 backdrop-blur-sm rounded-full px-5 py-2 border border-orange-300/30 hover:border-orange-400/60 transition-all duration-300 hover:shadow-md cursor-default">
                <span className="text-sm font-medium text-orange-700 group-hover:text-orange-800">🏆 Daily Challenges</span>
              </div>
              <div className="group bg-gradient-to-r from-pink-500/10 to-rose-500/10 backdrop-blur-sm rounded-full px-5 py-2 border border-pink-300/30 hover:border-pink-400/60 transition-all duration-300 hover:shadow-md cursor-default">
                <span className="text-sm font-medium text-pink-700 group-hover:text-pink-800">🔥 Streak Rewards</span>
              </div>
            </div>
          </div>
          
    


          {/* Main Stats Cards */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            
            {/* Karma Points Section */}
            <div className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-orange-200/40 hover:border-orange-300/60 hover:shadow-2xl transition-all duration-500 shadow-lg hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Active</span>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-1">
                    Karma Points
                  </h3>
                  <p className="text-orange-600/70 text-sm">Track your spiritual earnings</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                  🕉️
                </div>
              </div>
              <PointsWidget className="bg-transparent border-0 shadow-none p-0" />
            </div>

            {/* Wellness Levels Section */}
            <div className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-blue-200/40 hover:border-blue-300/60 hover:shadow-2xl transition-all duration-500 shadow-lg hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Progressing</span>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                    Wellness Levels
                  </h3>
                  <p className="text-blue-600/70 text-sm">Your spiritual progression</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                  🌟
                </div>
              </div>
              <LevelsWidget className="bg-transparent border-0 shadow-none p-0" />
            </div>
          </div>

          {/* Secondary Cards */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

            {/* Daily Streaks Section */}
            <div className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-purple-200/40 hover:border-purple-300/60 hover:shadow-2xl transition-all duration-500 shadow-lg hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">On Fire</span>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                    Daily Streaks
                  </h3>
                  <p className="text-purple-600/70 text-sm">Consistency in practice</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                  🔥
                </div>
              </div>
              <StreaksWidget className="bg-transparent border-0 shadow-none p-0" />
            </div>

            {/* Badges & Achievements Section */}
            <div className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-emerald-200/40 hover:border-emerald-300/60 hover:shadow-2xl transition-all duration-500 shadow-lg hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Unlocked</span>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
                    Badges
                  </h3>
                  <p className="text-emerald-600/70 text-sm">Earned achievements</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                  �
                </div>
              </div>
              <BadgesWidget className="bg-transparent border-0 shadow-none p-0" />
            </div>
          </div>

          {/* Challenges Section */}
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="lg:col-span-2">
              <div className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-teal-200/40 hover:border-teal-300/60 hover:shadow-2xl transition-all duration-500 shadow-lg hover:-translate-y-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Daily Tasks</span>
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                      Daily Challenges
                    </h3>
                    <p className="text-teal-600/70 text-sm">Yoga, meditation & wellness activities</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                    🧘‍♀️
                  </div>
                </div>
                <ChallengesWidget className="bg-transparent border-0 shadow-none p-0" />
              </div>
            </div>
            
            <div>
              <div className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-pink-200/40 hover:border-pink-300/60 hover:shadow-2xl transition-all duration-500 shadow-lg hover:-translate-y-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-pink-600 uppercase tracking-wider">Testing</span>
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-1">
                      Quick Actions
                    </h3>
                    <p className="text-pink-600/70 text-sm">Test & debug features</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                    ⚡
                  </div>
                </div>
                <TestPoints className="bg-transparent border-0 shadow-none p-0" />
              </div>
            </div>
          </div>

          {/* Wellness Journey Insights */}
          <div className={`mb-12 transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                🇮🇳 Your Spiritual Progress
              </h3>
              <p className="text-gray-600">Discover the wisdom of ancient practices in your wellness journey</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group bg-gradient-to-br from-pink-50 to-rose-50 backdrop-blur-xl rounded-3xl p-8 border border-pink-200/50 hover:border-pink-300/60 hover:shadow-2xl transition-all duration-500 shadow-lg hover:-translate-y-2">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    🔥
                  </div>
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
                    Daily Consistency
                  </h4>
                  <p className="text-pink-700/80 text-sm mb-6 leading-relaxed">
                    Build healthy habits through daily mindfulness practices rooted in ancient wisdom
                  </p>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-pink-300/30">
                    <span className="text-pink-700 text-xs font-semibold">नित्यं चैतन्यम्</span>
                    <p className="text-pink-600/70 text-xs mt-1">Daily Awareness</p>
                  </div>
                </div>
              </div>
              
              <div className="group bg-gradient-to-br from-teal-50 to-cyan-50 backdrop-blur-xl rounded-3xl p-8 border border-teal-200/50 hover:border-teal-300/60 hover:shadow-2xl transition-all duration-500 shadow-lg hover:-translate-y-2">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    🏆
                  </div>
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                    Achievement Unlocks
                  </h4>
                  <p className="text-teal-700/80 text-sm mb-6 leading-relaxed">
                    Earn karma badges and unlock spiritual milestones on your path to wellness
                  </p>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-teal-300/30">
                    <span className="text-teal-700 text-xs font-semibold">कर्म योग</span>
                    <p className="text-teal-600/70 text-xs mt-1">Path of Action</p>
                  </div>
                </div>
              </div>
              
              <div className="group bg-gradient-to-br from-orange-50 to-amber-50 backdrop-blur-xl rounded-3xl p-8 border border-orange-200/50 hover:border-orange-300/60 hover:shadow-2xl transition-all duration-500 shadow-lg hover:-translate-y-2">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    🌸
                  </div>
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-3">
                    Seva & Growth
                  </h4>
                  <p className="text-orange-700/80 text-sm mb-6 leading-relaxed">
                    Inspire others and contribute to a supportive community through service
                  </p>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-orange-300/30">
                    <span className="text-orange-700 text-xs font-semibold">सेवा धर्म</span>
                    <p className="text-orange-600/70 text-xs mt-1">Service as Duty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mood Logs Section */}
          <div className={`bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-purple-200/40 hover:border-purple-300/60 hover:shadow-2xl transition-all duration-700 delay-800 shadow-lg mb-10 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Recent Activity</span>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                  Quick Mood Check-ins
                </h3>
                <p className="text-purple-600/70 text-sm">Your recent emotional wellness tracking</p>
              </div>
              <Link 
                to="/mood" 
                className="group bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-md"
              >
                <span className="flex items-center gap-2">
                  View All
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </Link>
            </div>
            
            {quickMoodLogs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl flex items-center justify-center text-6xl mx-auto mb-6 shadow-lg animate-bounce">
                  🎯
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-3">Start Tracking Your Mood</h4>
                <p className="text-purple-600/80 mb-6 max-w-md mx-auto">Use the Quick Mood Tracker on your dashboard to earn points and insights!</p>
                <Link 
                  to="/dashboard" 
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  Go to Dashboard
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {quickMoodLogs.slice(0, 3).map((log, index) => (
                    <div key={index} className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50 hover:border-purple-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
          <div className={`text-center transition-all duration-700 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="mb-8">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                🚀 Start Your Practice
              </h3>
              <p className="text-gray-600">Choose an activity to begin your wellness journey today</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link to="/meditation" className="group bg-gradient-to-br from-pink-50 to-rose-50 backdrop-blur-xl rounded-3xl p-8 border border-pink-200/50 hover:border-pink-300/60 font-medium transition-all duration-500 hover:scale-105 hover:shadow-2xl block shadow-lg hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                  🧘‍♀️
                </div>
                <div className="text-xl font-bold text-pink-700 mb-2">Meditation</div>
                <div className="text-pink-600/70 text-sm">ध्यान साधना</div>
              </Link>
              
              <Link to="/journal" className="group bg-gradient-to-br from-teal-50 to-cyan-50 backdrop-blur-xl rounded-3xl p-8 border border-teal-200/50 hover:border-teal-300/60 font-medium transition-all duration-500 hover:scale-105 hover:shadow-2xl block shadow-lg hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                  📝
                </div>
                <div className="text-xl font-bold text-teal-700 mb-2">Journal Entry</div>
                <div className="text-teal-600/70 text-sm">स्वाध्याय</div>
              </Link>
              
              <Link to="/checkin" className="group bg-gradient-to-br from-purple-50 to-indigo-50 backdrop-blur-xl rounded-3xl p-8 border border-purple-200/50 hover:border-purple-300/60 font-medium transition-all duration-500 hover:scale-105 hover:shadow-2xl block shadow-lg hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                  ✅
                </div>
                <div className="text-xl font-bold text-purple-700 mb-2">Wellness Check-in</div>
                <div className="text-purple-600/70 text-sm">दिनचर्या</div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GamificationPage;