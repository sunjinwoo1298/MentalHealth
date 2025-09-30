import React, { useState, useEffect } from 'react';
// import Navigation from '../components/Navigation/Navigation';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-20 animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .gradient-slider {
          background: linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #10b981);
          height: 8px;
          border-radius: 999px;
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>

      {/* <Navigation 
        isAuthenticated={true}
        user={user || undefined}
        onLogout={handleLogout}
      /> */}

      <main className="relative z-10 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Success Notification */}
          {showSuccess && (
            <div className="fixed top-24 right-6 bg-white/95 backdrop-blur-lg rounded-2xl px-6 py-4 border border-emerald-200 shadow-2xl z-50 max-w-sm scale-in">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">✨</span>
                </div>
                <div>
                  <p className="text-gray-800 font-semibold">Check-in Complete!</p>
                  <p className="text-gray-600 text-sm">You earned 10 points 🎉</p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8 slide-up">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl px-8 py-6 border border-white/50 shadow-xl max-w-fit mx-auto mb-6 hover-lift">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                  ✅
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Daily Check-In</h1>
                  <p className="text-xl font-semibold text-gray-700">Your Wellness Journey</p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-lg">Track your daily wellness • Earn 10 points per check-in</p>
          </div>

          {!isCheckingIn ? (
            <div className="space-y-8 fade-in">
              
              {/* Today's Status & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Today's Check-in Status */}
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 border border-white/50 shadow-xl hover-lift">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-xl">📅</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Today's Status</h3>
                  </div>
                  {todaysCheckIn ? (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-3xl">✅</span>
                      </div>
                      <p className="text-emerald-600 font-semibold mb-2">Check-in Complete!</p>
                      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                        Mental Health: {scaleEmojis.mentalHealth[todaysCheckIn.mentalHealth - 1]} {todaysCheckIn.mentalHealth}/5
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-3xl">❓</span>
                      </div>
                      <p className="text-gray-600 mb-4">Haven't checked in yet today</p>
                      <button
                        onClick={() => setIsCheckingIn(true)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Start Check-in
                      </button>
                    </div>
                  )}
                </div>

                {/* Streak Counter */}
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 border border-white/50 shadow-xl hover-lift">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-xl">🔥</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Daily Streak</h3>
                  </div>
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">🔥</span>
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">{streakCount}</div>
                    <p className="text-gray-600 text-sm">
                      {streakCount === 1 ? 'day' : 'days'} in a row
                    </p>
                  </div>
                </div>

                {/* Weekly Summary */}
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 border border-white/50 shadow-xl hover-lift">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-xl">📊</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Weekly Average</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                      <span className="text-gray-700 font-medium">Mental</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{scaleEmojis.mentalHealth[weeklyAvg.mentalHealth - 1] || '❓'}</span>
                        <span className="font-bold text-gray-800">{weeklyAvg.mentalHealth}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                      <span className="text-gray-700 font-medium">Physical</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{scaleEmojis.physicalHealth[weeklyAvg.physicalHealth - 1] || '❓'}</span>
                        <span className="font-bold text-gray-800">{weeklyAvg.physicalHealth}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                      <span className="text-gray-700 font-medium">Sleep</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{scaleEmojis.sleepQuality[weeklyAvg.sleepQuality - 1] || '❓'}</span>
                        <span className="font-bold text-gray-800">{weeklyAvg.sleepQuality}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Check-in Button */}
              {!todaysCheckIn && (
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 border border-white/50 shadow-xl text-center hover-lift">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🌅</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready for Today's Check-in?</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">Take a moment to reflect on your wellness across different areas of your life</p>
                  <button
                    onClick={() => setIsCheckingIn(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    ✅ Start Daily Check-in
                  </button>
                </div>
              )}

              {/* Recent Check-ins */}
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 border border-white/50 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">📋</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Recent Check-ins ({checkIns.length} total)</h3>
                </div>
                
                {checkIns.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📈</span>
                    </div>
                    <p className="text-gray-600">Start your daily check-in routine to track your wellness journey!</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {checkIns.slice(0, 5).map((checkIn, index) => (
                      <div key={checkIn.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300 slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-semibold text-gray-800">{formatDate(checkIn.date)}</div>
                          <div className="flex space-x-2 bg-white rounded-xl px-3 py-1">
                            <span title="Mental Health" className="text-lg">{scaleEmojis.mentalHealth[checkIn.mentalHealth - 1]}</span>
                            <span title="Physical Health" className="text-lg">{scaleEmojis.physicalHealth[checkIn.physicalHealth - 1]}</span>
                            <span title="Sleep Quality" className="text-lg">{scaleEmojis.sleepQuality[checkIn.sleepQuality - 1]}</span>
                          </div>
                        </div>
                        
                        {checkIn.gratitude.length > 0 && (
                          <div className="text-sm text-gray-700 bg-yellow-50 rounded-lg p-2 mb-2">
                            <span className="text-yellow-600 font-semibold">🙏 Grateful:</span> {checkIn.gratitude.slice(0, 2).join(', ')}
                            {checkIn.gratitude.length > 2 && '...'}
                          </div>
                        )}
                        
                        {checkIn.goals.length > 0 && (
                          <div className="text-sm text-gray-700 bg-green-50 rounded-lg p-2">
                            <span className="text-green-600 font-semibold">🎯 Goals:</span> {checkIn.goals.slice(0, 2).join(', ')}
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
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 border border-white/50 shadow-2xl scale-in">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-2xl">✅</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Daily Wellness Check-in</h3>
                    <p className="text-gray-600">How are you feeling today?</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCheckingIn(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>

              <div className="space-y-8">
                
                {/* Health Scales */}
                {(['mentalHealth', 'physicalHealth', 'sleepQuality', 'stressLevel', 'socialConnection'] as const).map((category, index) => (
                  <div key={category} className="slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                    <label className="block text-gray-800 font-semibold mb-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">
                          {category === 'mentalHealth' && '🧠'}
                          {category === 'physicalHealth' && '💪'}
                          {category === 'sleepQuality' && '😴'}
                          {category === 'stressLevel' && '😰'}
                          {category === 'socialConnection' && '🤝'}
                        </span>
                        <span className="text-lg">
                          {category === 'mentalHealth' && 'Mental Health'}
                          {category === 'physicalHealth' && 'Physical Health'}
                          {category === 'sleepQuality' && 'Sleep Quality'}
                          {category === 'stressLevel' && 'Stress Level'}
                          {category === 'socialConnection' && 'Social Connection'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {currentCheckIn[category]}/5 - {scaleLabels[category][currentCheckIn[category] - 1]}
                      </div>
                    </label>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl">{scaleEmojis[category][currentCheckIn[category] - 1]}</span>
                        <div className="flex-1 relative">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={currentCheckIn[category]}
                            onChange={(e) => setCurrentCheckIn(prev => ({ 
                              ...prev, 
                              [category]: parseInt(e.target.value) 
                            }))}
                            className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                            style={{
                              background: `linear-gradient(to right, 
                                #ef4444 0%, 
                                #f97316 25%, 
                                #eab308 50%, 
                                #22c55e 75%, 
                                #10b981 100%)`
                            }}
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                            <span>5</span>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-bold text-gray-800 border-2 border-gray-200">
                          {currentCheckIn[category]}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Gratitude Section */}
                <div className="slide-up" style={{animationDelay: '0.5s'}}>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">🙏</span>
                    <label className="text-lg font-semibold text-gray-800">Three Things I'm Grateful For</label>
                  </div>
                  <div className="space-y-3">
                    {currentCheckIn.gratitude.map((item, index) => (
                      <div key={index} className="relative">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateGratitudeItem(index, e.target.value)}
                          placeholder={`Gratitude ${index + 1}... (e.g., family support, good health, sunny weather)`}
                          className="w-full px-4 py-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-500">
                          ✨
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Challenges Section */}
                <div className="slide-up" style={{animationDelay: '0.6s'}}>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">⚠️</span>
                    <label className="text-lg font-semibold text-gray-800">Today's Challenges</label>
                  </div>
                  <div className="space-y-3">
                    {currentCheckIn.challenges.map((item, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateChallengeItem(index, e.target.value)}
                            placeholder={`Challenge ${index + 1}... (e.g., work stress, anxiety, relationship issue)`}
                            className="w-full px-4 py-4 bg-red-50 border-2 border-red-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-300"
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500">
                            💪
                          </div>
                        </div>
                        {currentCheckIn.challenges.length > 1 && (
                          <button
                            onClick={() => removeChallengeItem(index)}
                            className="px-4 py-4 bg-red-100 text-red-600 rounded-2xl hover:bg-red-200 transition-colors font-semibold"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {currentCheckIn.challenges.length < 3 && (
                      <button
                        onClick={addChallengeItem}
                        className="text-red-600 hover:text-red-700 transition-colors text-sm font-semibold bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100"
                      >
                        + Add another challenge
                      </button>
                    )}
                  </div>
                </div>

                {/* Goals Section */}
                <div className="slide-up" style={{animationDelay: '0.7s'}}>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">🎯</span>
                    <label className="text-lg font-semibold text-gray-800">Today's Goals</label>
                  </div>
                  <div className="space-y-3">
                    {currentCheckIn.goals.map((item, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateGoalItem(index, e.target.value)}
                            placeholder={`Goal ${index + 1}... (e.g., exercise, call family, finish project)`}
                            className="w-full px-4 py-4 bg-green-50 border-2 border-green-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300"
                          />
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500">
                            🌟
                          </div>
                        </div>
                        {currentCheckIn.goals.length > 1 && (
                          <button
                            onClick={() => removeGoalItem(index)}
                            className="px-4 py-4 bg-green-100 text-green-600 rounded-2xl hover:bg-green-200 transition-colors font-semibold"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    {currentCheckIn.goals.length < 3 && (
                      <button
                        onClick={addGoalItem}
                        className="text-green-600 hover:text-green-700 transition-colors text-sm font-semibold bg-green-50 px-4 py-2 rounded-xl hover:bg-green-100"
                      >
                        + Add another goal
                      </button>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="slide-up" style={{animationDelay: '0.8s'}}>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">📝</span>
                    <label className="text-lg font-semibold text-gray-800">Additional Notes (Optional)</label>
                  </div>
                  <div className="relative">
                    <textarea
                      value={currentCheckIn.notes}
                      onChange={(e) => setCurrentCheckIn(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional thoughts, reflections, or details about your day..."
                      rows={4}
                      className="w-full px-4 py-4 bg-purple-50 border-2 border-purple-200 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none transition-all duration-300"
                    />
                    <div className="absolute right-4 bottom-4 text-purple-500">
                      💭
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200 slide-up" style={{animationDelay: '0.9s'}}>
                  <button
                    onClick={() => setIsCheckingIn(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCheckIn}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl font-semibold hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <span>✅ Complete Check-in</span>
                    <div className="bg-white/20 rounded-full px-2 py-1 text-xs">
                      +10 points
                    </div>
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