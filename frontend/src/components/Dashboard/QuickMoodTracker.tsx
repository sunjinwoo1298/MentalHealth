import React, { useState, useEffect } from 'react';
import { useGamification } from '../../contexts/GamificationContext';
import './QuickMoodTracker.css';

interface QuickMoodData {
  emotions: { [key: string]: number };
  triggers: string[];
  notes: string;
  timestamp: string;
}

const QuickMoodTracker: React.FC = () => {
  const { addPendingReward } = useGamification();
  const [canTrack, setCanTrack] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [step, setStep] = useState<'emotions' | 'triggers'>('emotions');
  const [moodData, setMoodData] = useState<QuickMoodData>({
    emotions: {},
    triggers: [],
    notes: '',
    timestamp: ''
  });

  // 5 main emotions with sliders
  const mainEmotions = [
    { name: 'Happy', emoji: '😊', color: 'from-yellow-400 to-orange-400' },
    { name: 'Sad', emoji: '😢', color: 'from-blue-400 to-indigo-400' },
    { name: 'Anxious', emoji: '😰', color: 'from-red-400 to-pink-400' },
    { name: 'Angry', emoji: '😠', color: 'from-red-500 to-red-600' },
    { name: 'Peaceful', emoji: '😌', color: 'from-green-400 to-teal-400' }
  ];

  // 5 main triggers
  const mainTriggers = [
    'Work/Study Stress',
    'Family Issues',
    'Social Pressure',
    'Health Concerns',
    'Financial Worries'
  ];

  // Check if user can track mood (12 hour cooldown)
  useEffect(() => {
    const lastMoodTrack = localStorage.getItem('lastQuickMoodTrack');
    if (lastMoodTrack) {
      const lastTime = new Date(lastMoodTrack);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);
      setCanTrack(hoursDiff >= 12);
    } else {
      setCanTrack(true);
    }
  }, []);

  const updateEmotion = (emotionName: string, value: number) => {
    setMoodData(prev => ({
      ...prev,
      emotions: { ...prev.emotions, [emotionName]: value }
    }));
  };

  const toggleTrigger = (trigger: string) => {
    setMoodData(prev => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter(t => t !== trigger)
        : [...prev.triggers, trigger]
    }));
  };

  const submitMoodData = async () => {
    const now = new Date();
    const finalData = {
      ...moodData,
      timestamp: now.toISOString()
    };

    // Save to localStorage
    const existingLogs = JSON.parse(localStorage.getItem('quickMoodLogs') || '[]');
    existingLogs.unshift(finalData);
    localStorage.setItem('quickMoodLogs', JSON.stringify(existingLogs.slice(0, 20))); // Keep last 20

    // Set last track time
    localStorage.setItem('lastQuickMoodTrack', now.toISOString());

    // Add pending reward (8 points like regular mood logging)
    addPendingReward('mood_logging', {
      type: 'quick_track',
      emotions: finalData.emotions,
      triggers: finalData.triggers,
      emotionCount: Object.keys(finalData.emotions).length,
      completedAt: finalData.timestamp
    });

    // Reset and close
    setMoodData({ emotions: {}, triggers: [], notes: '', timestamp: '' });
    setStep('emotions');
    setShowTracker(false);
    setCanTrack(false);
  };

  const skipAndClaim = () => {
    const now = new Date();
    localStorage.setItem('lastQuickMoodTrack', now.toISOString());
    
    // Award points for participation even if skipped
    addPendingReward('mood_logging', {
      type: 'quick_skip',
      completedAt: now.toISOString()
    });

    setShowTracker(false);
    setCanTrack(false);
  };

  if (!canTrack) {
    return (
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-md rounded-xl p-4 border border-indigo-400/20">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">😌</div>
          <div>
            <p className="text-white text-sm font-medium">Mood tracked recently</p>
            <p className="text-gray-400 text-xs">Next check available in a few hours</p>
          </div>
        </div>
      </div>
    );
  }

  if (!showTracker) {
    return (
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-4 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🎯</div>
            <div>
              <p className="text-white text-sm font-medium">Quick Mood Check</p>
              <p className="text-purple-200 text-xs">Earn 8 points • 2 min</p>
            </div>
          </div>
          <button
            onClick={() => setShowTracker(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-4 border border-purple-400/30">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium">
            {step === 'emotions' ? '😊 How are you feeling?' : '⚠️ Any triggers?'}
          </h4>
          <button
            onClick={() => setShowTracker(false)}
            className="text-gray-400 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        {step === 'emotions' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-white text-sm">Rate how much you feel each emotion (0-5)</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {mainEmotions.map((emotion) => (
                <div key={emotion.name} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{emotion.emoji}</span>
                      <span className="text-white text-sm font-medium">{emotion.name}</span>
                    </div>
                    <span className="text-white text-sm bg-purple-500/20 px-2 py-1 rounded">
                      {moodData.emotions[emotion.name] || 0}/5
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={moodData.emotions[emotion.name] || 0}
                    onChange={(e) => updateEmotion(emotion.name, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => setStep('triggers')}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Next
              </button>
              <button
                onClick={skipAndClaim}
                className="px-4 bg-gray-500/20 text-gray-300 py-2 rounded-lg text-sm hover:bg-gray-500/30 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {step === 'triggers' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              {mainTriggers.map((trigger) => (
                <button
                  key={trigger}
                  onClick={() => toggleTrigger(trigger)}
                  className={`p-2 rounded-lg text-sm transition-all duration-300 ${
                    moodData.triggers.includes(trigger)
                      ? 'bg-pink-500/20 border border-pink-400/50 text-pink-300'
                      : 'bg-white/10 border border-white/20 text-gray-300 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {trigger}
                </button>
              ))}
            </div>
            
            <textarea
              value={moodData.notes}
              onChange={(e) => setMoodData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes (optional)..."
              rows={2}
              className="w-full px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none text-sm"
            />
            
            <div className="flex space-x-2">
              <button
                onClick={() => setStep('emotions')}
                className="px-4 bg-gray-500/20 text-gray-300 py-2 rounded-lg text-sm hover:bg-gray-500/30 transition-colors"
              >
                Back
              </button>
              <button
                onClick={submitMoodData}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Submit (+8 points)
              </button>
              <button
                onClick={skipAndClaim}
                className="px-4 bg-gray-500/20 text-gray-300 py-2 rounded-lg text-sm hover:bg-gray-500/30 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickMoodTracker;