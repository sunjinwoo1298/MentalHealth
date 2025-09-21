import React from 'react';
import PointsWidget from '../components/Gamification/PointsWidget';
import LevelsWidget from '../components/Gamification/LevelsWidget';
import StreaksWidget from '../components/Gamification/StreaksWidget';
import BadgesWidget from '../components/Gamification/BadgesWidget';
import ChallengesWidget from '../components/Gamification/ChallengesWidget';
import TestPoints from '../components/Gamification/TestPoints';

const GamificationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎮 Gamification Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            Track your progress, earn rewards, and stay motivated on your mental wellness journey
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Points & Levels Section */}
          <div className="space-y-6">
            <PointsWidget />
            <LevelsWidget />
          </div>

          {/* Streaks & Badges Section */}
          <div className="space-y-6">
            <StreaksWidget />
            <BadgesWidget />
          </div>

          {/* Challenges & Testing Section */}
          <div className="space-y-6">
            <ChallengesWidget />
            <TestPoints />
          </div>
        </div>

        {/* Achievement Summary Section */}
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Your Wellness Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Daily Consistency</h3>
              <p className="text-gray-300">Build healthy habits through daily mindfulness practices</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Achievement Unlocks</h3>
              <p className="text-gray-300">Earn badges and rewards for reaching wellness milestones</p>
            </div>
            <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Community Impact</h3>
              <p className="text-gray-300">Inspire others and contribute to a supportive community</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
              Start Meditation Session
            </button>
            <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
              Practice Breathing Exercise
            </button>
            <button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
              Complete Daily Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPage;