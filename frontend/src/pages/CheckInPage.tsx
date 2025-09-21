import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';

interface DailyCheckIn {
  id: string;
  date: string;
  mentalHealth: number; // 1-5 scale
  physicalHealth: number; // 1-5 scale
  sleepQuality: number; // 1-5 scale
  stressLevel: number; // 1-5 scale
  socialConnection: number; // 1-5 scale
  gratitude: string[];
  challenges: string[];
  goals: string[];
  notes: string;
  completedAt: string;
}

const CheckInPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { addPendingReward } = useGamification();
  
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentCheckIn, setCurrentCheckIn] = useState({
    mentalHealth: 3,
    physicalHealth: 3,
    sleepQuality: 3,
    stressLevel: 3,
    socialConnection: 3,
    gratitude: ['', '', ''],
    challenges: [''],
    goals: [''],
    notes: ''
  });

  const handleLogout = async () => {
    await logout();
  };

  // Load check-ins from localStorage
  useEffect(() => {
    const savedCheckIns = localStorage.getItem(`daily_checkins_${user?.id}`);
    if (savedCheckIns) {
      setCheckIns(JSON.parse(savedCheckIns));
    }
  }, [user?.id]);

  // Save check-ins to localStorage
  const saveCheckIns = (newCheckIns: DailyCheckIn[]) => {
    setCheckIns(newCheckIns);
    localStorage.setItem(`daily_checkins_${user?.id}`, JSON.stringify(newCheckIns));
  };

  const scaleLabels = {
    mentalHealth: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
    physicalHealth: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
    sleepQuality: ['Terrible', 'Poor', 'Fair', 'Good', 'Excellent'],
    stressLevel: ['Very High', 'High', 'Moderate', 'Low', 'Very Low'],
    socialConnection: ['Very Isolated', 'Isolated', 'Neutral', 'Connected', 'Very Connected']
  };

  const scaleEmojis = {
    mentalHealth: ['😔', '😕', '😐', '🙂', '😊'],
    physicalHealth: ['🤒', '😷', '😐', '💪', '🌟'],
    sleepQuality: ['😴', '😪', '😐', '😌', '✨'],
    stressLevel: ['🤯', '😰', '😐', '😌', '🧘'],
    socialConnection: ['😞', '😔', '😐', '🤝', '🥰']
  };

  const getTodaysCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];
    return checkIns.find(checkIn => checkIn.date === today);
  };

  const getStreakCount = () => {
    if (checkIns.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toISOString().split('T')[0];
      
      const hasCheckIn = checkIns.some(checkIn => checkIn.date === dateString);
      if (hasCheckIn) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getWeeklyAverage = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCheckIns = checkIns.filter(checkIn => new Date(checkIn.date) >= weekAgo);
    
    if (weekCheckIns.length === 0) return {
      mentalHealth: 0,
      physicalHealth: 0,
      sleepQuality: 0,
      stressLevel: 0,
      socialConnection: 0
    };
    
    return {
      mentalHealth: Math.round(weekCheckIns.reduce((sum, c) => sum + c.mentalHealth, 0) / weekCheckIns.length),
      physicalHealth: Math.round(weekCheckIns.reduce((sum, c) => sum + c.physicalHealth, 0) / weekCheckIns.length),
      sleepQuality: Math.round(weekCheckIns.reduce((sum, c) => sum + c.sleepQuality, 0) / weekCheckIns.length),
      stressLevel: Math.round(weekCheckIns.reduce((sum, c) => sum + c.stressLevel, 0) / weekCheckIns.length),
      socialConnection: Math.round(weekCheckIns.reduce((sum, c) => sum + c.socialConnection, 0) / weekCheckIns.length)
    };
  };

  const updateGratitudeItem = (index: number, value: string) => {
    const newGratitude = [...currentCheckIn.gratitude];
    newGratitude[index] = value;
    setCurrentCheckIn(prev => ({ ...prev, gratitude: newGratitude }));
  };

  const updateChallengeItem = (index: number, value: string) => {
    const newChallenges = [...currentCheckIn.challenges];
    newChallenges[index] = value;
    setCurrentCheckIn(prev => ({ ...prev, challenges: newChallenges }));
  };

  const addChallengeItem = () => {
    if (currentCheckIn.challenges.length < 3) {
      setCurrentCheckIn(prev => ({ 
        ...prev, 
        challenges: [...prev.challenges, ''] 
      }));
    }
  };

  const removeChallengeItem = (index: number) => {
    if (currentCheckIn.challenges.length > 1) {
      const newChallenges = currentCheckIn.challenges.filter((_, i) => i !== index);
      setCurrentCheckIn(prev => ({ ...prev, challenges: newChallenges }));
    }
  };

  const updateGoalItem = (index: number, value: string) => {
    const newGoals = [...currentCheckIn.goals];
    newGoals[index] = value;
    setCurrentCheckIn(prev => ({ ...prev, goals: newGoals }));
  };

  const addGoalItem = () => {
    if (currentCheckIn.goals.length < 3) {
      setCurrentCheckIn(prev => ({ 
        ...prev, 
        goals: [...prev.goals, ''] 
      }));
    }
  };

  const removeGoalItem = (index: number) => {
    if (currentCheckIn.goals.length > 1) {
      const newGoals = currentCheckIn.goals.filter((_, i) => i !== index);
      setCurrentCheckIn(prev => ({ ...prev, goals: newGoals }));
    }
  };

  const saveCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already checked in today
    if (getTodaysCheckIn()) {
      alert('You have already completed your check-in for today!');
      return;
    }

    const newCheckIn: DailyCheckIn = {
      id: Date.now().toString(),
      date: today,
      ...currentCheckIn,
      gratitude: currentCheckIn.gratitude.filter(item => item.trim() !== ''),
      challenges: currentCheckIn.challenges.filter(item => item.trim() !== ''),
      goals: currentCheckIn.goals.filter(item => item.trim() !== ''),
      completedAt: new Date().toISOString()
    };

    const updatedCheckIns = [newCheckIn, ...checkIns];
    saveCheckIns(updatedCheckIns);

    // Award points for daily check-in
    addPendingReward('daily_checkin', {
      checkInId: newCheckIn.id,
      mentalHealthScore: newCheckIn.mentalHealth,
      physicalHealthScore: newCheckIn.physicalHealth,
      gratitudeCount: newCheckIn.gratitude.length,
      goalsCount: newCheckIn.goals.length,
      completedAt: new Date().toISOString()
    });

    // Reset form
    setCurrentCheckIn({
      mentalHealth: 3,
      physicalHealth: 3,
      sleepQuality: 3,
      stressLevel: 3,
      socialConnection: 3,
      gratitude: ['', '', ''],
      challenges: [''],
      goals: [''],
      notes: ''
    });
    setIsCheckingIn(false);
    setShowSuccess(true);

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const todaysCheckIn = getTodaysCheckIn();
  const streakCount = getStreakCount();
  const weeklyAvg = getWeeklyAverage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 relative">
      {/* Background Effects */}
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

      <main className="relative z-10 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Success Notification */}
          {showSuccess && (
            <div className="fixed top-20 right-4 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 backdrop-blur-md rounded-lg px-6 py-4 border border-emerald-400/50 shadow-xl z-50 max-w-sm animate-pulse">
              <p className="text-white text-sm font-medium">✅ Daily check-in complete! You earned 10 points 🎉</p>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-green-400/30 mb-4 shadow-lg max-w-fit mx-auto">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-xl shadow-md">
                  ✅
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-green-300 mb-1">Daily Check-In</h1>
                  <p className="text-xl font-bold text-white">Your Wellness Status</p>
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-lg">Monitor your daily wellness • Earn 10 points per check-in</p>
          </div>

          {!isCheckingIn ? (
            <div className="space-y-6">
              
              {/* Today's Status & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Today's Check-in Status */}
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-2xl p-6 border border-green-400/30">
                  <h3 className="text-lg font-bold text-white mb-4">📅 Today's Status</h3>
                  {todaysCheckIn ? (
                    <div className="text-center">
                      <div className="text-4xl mb-3">✅</div>
                      <p className="text-green-300 font-medium mb-2">Check-in Complete!</p>
                      <div className="text-sm text-gray-300">
                        Mental Health: {scaleEmojis.mentalHealth[todaysCheckIn.mentalHealth - 1]} {todaysCheckIn.mentalHealth}/5
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-3">❓</div>
                      <p className="text-gray-300 mb-4">Haven't checked in yet today</p>
                      <button
                        onClick={() => setIsCheckingIn(true)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Start Check-in
                      </button>
                    </div>
                  )}
                </div>

                {/* Streak Counter */}
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-2xl p-6 border border-orange-400/30">
                  <h3 className="text-lg font-bold text-white mb-4">🔥 Daily Streak</h3>
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔥</div>
                    <div className="text-2xl font-bold text-orange-300 mb-1">{streakCount}</div>
                    <p className="text-sm text-gray-300">
                      {streakCount === 1 ? 'day' : 'days'} in a row
                    </p>
                  </div>
                </div>

                {/* Weekly Summary */}
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-2xl p-6 border border-purple-400/30">
                  <h3 className="text-lg font-bold text-white mb-4">📊 Weekly Average</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Mental</span>
                      <div className="flex items-center space-x-1">
                        <span>{scaleEmojis.mentalHealth[weeklyAvg.mentalHealth - 1] || '❓'}</span>
                        <span className="text-white">{weeklyAvg.mentalHealth}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Physical</span>
                      <div className="flex items-center space-x-1">
                        <span>{scaleEmojis.physicalHealth[weeklyAvg.physicalHealth - 1] || '❓'}</span>
                        <span className="text-white">{weeklyAvg.physicalHealth}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Sleep</span>
                      <div className="flex items-center space-x-1">
                        <span>{scaleEmojis.sleepQuality[weeklyAvg.sleepQuality - 1] || '❓'}</span>
                        <span className="text-white">{weeklyAvg.sleepQuality}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Check-in Button */}
              {!todaysCheckIn && (
                <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-md rounded-2xl p-8 border border-blue-400/30 text-center">
                  <div className="text-6xl mb-4">🌅</div>
                  <h3 className="text-xl font-bold text-white mb-4">Ready for Today's Check-in?</h3>
                  <p className="text-gray-300 mb-6">Take a moment to reflect on your wellness across different areas of your life</p>
                  <button
                    onClick={() => setIsCheckingIn(true)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-full font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    ✅ Start Daily Check-in
                  </button>
                </div>
              )}

              {/* Recent Check-ins */}
              <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-6 border border-indigo-400/30">
                <h3 className="text-lg font-bold text-white mb-4">📋 Recent Check-ins ({checkIns.length} total)</h3>
                
                {checkIns.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📈</div>
                    <p className="text-gray-300">Start your daily check-in routine to track your wellness journey!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {checkIns.slice(0, 5).map((checkIn) => (
                      <div key={checkIn.id} className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-400/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-white">{formatDate(checkIn.date)}</div>
                          <div className="flex space-x-2">
                            <span title="Mental Health">{scaleEmojis.mentalHealth[checkIn.mentalHealth - 1]}</span>
                            <span title="Physical Health">{scaleEmojis.physicalHealth[checkIn.physicalHealth - 1]}</span>
                            <span title="Sleep Quality">{scaleEmojis.sleepQuality[checkIn.sleepQuality - 1]}</span>
                          </div>
                        </div>
                        
                        {checkIn.gratitude.length > 0 && (
                          <div className="text-sm text-gray-300">
                            <span className="text-yellow-400">🙏</span> Grateful for: {checkIn.gratitude.slice(0, 2).join(', ')}
                            {checkIn.gratitude.length > 2 && '...'}
                          </div>
                        )}
                        
                        {checkIn.goals.length > 0 && (
                          <div className="text-sm text-gray-300 mt-1">
                            <span className="text-green-400">🎯</span> Goals: {checkIn.goals.slice(0, 2).join(', ')}
                            {checkIn.goals.length > 2 && '...'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            
            /* Check-in Interface */
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-2xl p-8 border border-green-400/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">✅ Daily Wellness Check-in</h3>
                <button
                  onClick={() => setIsCheckingIn(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕ Cancel
                </button>
              </div>

              <div className="space-y-8">
                
                {/* Health Scales */}
                {(['mentalHealth', 'physicalHealth', 'sleepQuality', 'stressLevel', 'socialConnection'] as const).map((category) => (
                  <div key={category}>
                    <label className="block text-white font-medium mb-4">
                      {category === 'mentalHealth' && '🧠 Mental Health: '}
                      {category === 'physicalHealth' && '💪 Physical Health: '}
                      {category === 'sleepQuality' && '😴 Sleep Quality: '}
                      {category === 'stressLevel' && '😰 Stress Level: '}
                      {category === 'socialConnection' && '🤝 Social Connection: '}
                      {currentCheckIn[category]}/5 - {scaleLabels[category][currentCheckIn[category] - 1]}
                    </label>
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{scaleEmojis[category][currentCheckIn[category] - 1]}</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={currentCheckIn[category]}
                        onChange={(e) => setCurrentCheckIn(prev => ({ 
                          ...prev, 
                          [category]: parseInt(e.target.value) 
                        }))}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <span className="text-white font-medium w-8">{currentCheckIn[category]}</span>
                    </div>
                  </div>
                ))}

                {/* Gratitude Section */}
                <div>
                  <label className="block text-white font-medium mb-4">🙏 Three Things I'm Grateful For</label>
                  <div className="space-y-3">
                    {currentCheckIn.gratitude.map((item, index) => (
                      <input
                        key={index}
                        type="text"
                        value={item}
                        onChange={(e) => updateGratitudeItem(index, e.target.value)}
                        placeholder={`Gratitude ${index + 1}... (e.g., family support, good health, sunny weather)`}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                      />
                    ))}
                  </div>
                </div>

                {/* Challenges Section */}
                <div>
                  <label className="block text-white font-medium mb-4">⚠️ Today's Challenges</label>
                  <div className="space-y-3">
                    {currentCheckIn.challenges.map((item, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateChallengeItem(index, e.target.value)}
                          placeholder={`Challenge ${index + 1}... (e.g., work stress, anxiety, relationship issue)`}
                          className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                        />
                        {currentCheckIn.challenges.length > 1 && (
                          <button
                            onClick={() => removeChallengeItem(index)}
                            className="px-3 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {currentCheckIn.challenges.length < 3 && (
                      <button
                        onClick={addChallengeItem}
                        className="text-green-400 hover:text-green-300 transition-colors text-sm"
                      >
                        + Add another challenge
                      </button>
                    )}
                  </div>
                </div>

                {/* Goals Section */}
                <div>
                  <label className="block text-white font-medium mb-4">🎯 Today's Goals</label>
                  <div className="space-y-3">
                    {currentCheckIn.goals.map((item, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateGoalItem(index, e.target.value)}
                          placeholder={`Goal ${index + 1}... (e.g., exercise, call family, finish project)`}
                          className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                        />
                        {currentCheckIn.goals.length > 1 && (
                          <button
                            onClick={() => removeGoalItem(index)}
                            className="px-3 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {currentCheckIn.goals.length < 3 && (
                      <button
                        onClick={addGoalItem}
                        className="text-green-400 hover:text-green-300 transition-colors text-sm"
                      >
                        + Add another goal
                      </button>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <label className="block text-white font-medium mb-2">📝 Additional Notes (Optional)</label>
                  <textarea
                    value={currentCheckIn.notes}
                    onChange={(e) => setCurrentCheckIn(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional thoughts, reflections, or details about your day..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsCheckingIn(false)}
                    className="px-6 py-3 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCheckIn}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    ✅ Complete Check-in (+10 points)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CheckInPage;