import React, { useState, useEffect, useRef } from 'react';
import Navigation from '../components/Navigation/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';

interface MeditationSession {
  id: string;
  duration: number; // in minutes
  title: string;
  description: string;
  category: 'breathing' | 'mindfulness' | 'body-scan' | 'loving-kindness';
  instructions: string[];
}

const meditationSessions: MeditationSession[] = [
  {
    id: 'breathing-exercise',
    duration: 10,
    title: 'Breathing Exercise',
    description: 'Pranayama techniques for stress relief and mental clarity',
    category: 'breathing',
    instructions: [
      '🧘‍♀️ Sit comfortably with spine straight, shoulders relaxed',
      '👃 Breathe in slowly through your nose for 4 counts',
      '⏸️ Hold your breath gently for 4 counts',
      '👄 Exhale slowly through your mouth for 6 counts',
      '🔄 Repeat this cycle, focusing only on your breath',
      '🌟 Notice the calming effect on your mind and body',
      '🕉️ End with gratitude for this moment of peace'
    ]
  },
  {
    id: 'mindfulness-practice',
    duration: 15,
    title: 'Mindfulness Practice',
    description: 'Deep awareness meditation for present moment consciousness',
    category: 'mindfulness',
    instructions: [
      '🪷 Find a quiet space and sit in a comfortable position',
      '👁️ Close your eyes gently and take three deep breaths',
      '🎯 Bring your attention to the present moment',
      '🌊 Notice thoughts as they arise, then let them pass like clouds',
      '👂 Observe sounds around you without labeling them',
      '💭 When mind wanders, gently guide attention back to the present',
      '🔍 Notice sensations in your body without judgment',
      '🌸 Cultivate awareness of this peaceful state',
      '🙏 End with appreciation for this mindful moment'
    ]
  },
  {
    id: 'body-scan-relaxation',
    duration: 20,
    title: 'Body Scan Relaxation',
    description: 'Progressive body awareness for deep relaxation and stress release',
    category: 'body-scan',
    instructions: [
      '🛏️ Lie down comfortably or sit with support',
      '😌 Close your eyes and take several deep, calming breaths',
      '🦶 Begin by focusing on your toes - notice any sensations',
      '⬆️ Slowly move your attention up to your feet and ankles',
      '🦵 Continue scanning your calves, knees, and thighs',
      '🤲 Move to your hands, arms, and shoulders',
      '💓 Notice your chest rising and falling with each breath',
      '🧠 Scan your neck, jaw, and head, releasing any tension',
      '✨ Feel your entire body relaxed and peaceful',
      '🌟 Rest in this state of complete relaxation',
      '🙏 Slowly wiggle fingers and toes before opening eyes'
    ]
  }
];

const MeditationPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { addPendingReward } = useGamification();
  
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleLogout = async () => {
    await logout();
  };

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  // Instruction cycling
  useEffect(() => {
    if (isActive && selectedSession) {
      const instructionDuration = (selectedSession.duration * 60) / selectedSession.instructions.length;
      const instructionTimer = setInterval(() => {
        setCurrentInstruction(prev => {
          const next = prev + 1;
          return next >= selectedSession.instructions.length ? 0 : next;
        });
      }, instructionDuration * 1000);

      return () => clearInterval(instructionTimer);
    }
  }, [isActive, selectedSession]);

  // Award points when meditation is completed
  useEffect(() => {
    if (isCompleted && selectedSession) {
      console.log(`Meditation completed: ${selectedSession.title} (${selectedSession.duration} minutes)`);
      
      // Award specific points based on activity type
      let activityType = '';
      switch (selectedSession.id) {
        case 'breathing-exercise':
          activityType = 'breathing_exercise';
          break;
        case 'mindfulness-practice':
          activityType = 'mindfulness_practice';
          break;
        case 'body-scan-relaxation':
          activityType = 'body_scan_relaxation';
          break;
        default:
          activityType = 'meditation_completion';
      }
      
      addPendingReward(activityType, {
        sessionId: selectedSession.id,
        duration: selectedSession.duration,
        category: selectedSession.category,
        completedAt: new Date().toISOString()
      });

      // Show completion message for a few seconds
      setTimeout(() => {
        setIsCompleted(false);
        setSelectedSession(null);
        setCurrentInstruction(0);
      }, 3000);
    }
  }, [isCompleted, selectedSession, addPendingReward]);

  const startMeditation = (session: MeditationSession) => {
    setSelectedSession(session);
    setTimeLeft(session.duration * 60);
    setCurrentInstruction(0);
    setIsActive(true);
    setIsCompleted(false);
    
    // Create gentle chime sound
    try {
      audioContextRef.current = new AudioContext();
      playChime();
    } catch (error) {
      console.log('Audio context not available');
    }
  };

  const stopMeditation = () => {
    setIsActive(false);
    setSelectedSession(null);
    setTimeLeft(0);
    setCurrentInstruction(0);
    setIsCompleted(false);
  };

  const pauseResumeMeditation = () => {
    setIsActive(!isActive);
  };

  const playChime = () => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(528, audioContextRef.current.currentTime); // Love frequency
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 1);
    
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breathing': return 'from-blue-500 to-cyan-500';
      case 'mindfulness': return 'from-purple-500 to-pink-500';
      case 'body-scan': return 'from-green-500 to-teal-500';
      case 'loving-kindness': return 'from-rose-500 to-orange-500';
      default: return 'from-indigo-500 to-purple-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breathing': return '🫁';
      case 'mindfulness': return '🧘';
      case 'body-scan': return '✨';
      case 'loving-kindness': return '💗';
      default: return '🕉️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 relative">
      {/* Background gradients */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full mix-blend-soft-light filter blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-teal-400 to-green-500 rounded-full mix-blend-soft-light filter blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full mix-blend-soft-light filter blur-3xl"></div>
      </div>
      
      <Navigation 
        isAuthenticated={true}
        user={user || undefined}
        onLogout={handleLogout}
      />
      
      <main className="relative z-10 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-purple-400/30 mb-6 shadow-lg max-w-fit mx-auto">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-xl shadow-md">
                  🧘
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-purple-300 mb-1">
                    Mindful Meditation
                  </p>
                  <h2 className="text-xl font-bold text-white">
                    Find Your Inner Peace
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Active Session View */}
          {selectedSession && !isCompleted && (
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md rounded-3xl p-8 border border-slate-600/50 shadow-2xl mb-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">{selectedSession.title}</h3>
                <p className="text-gray-300 mb-8">{selectedSession.description}</p>
                
                {/* Timer Display */}
                <div className="bg-black/30 rounded-2xl p-6 mb-8 border border-white/10">
                  <div className="text-6xl font-mono font-bold text-white mb-4">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${((selectedSession.duration * 60 - timeLeft) / (selectedSession.duration * 60)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Current Instruction */}
                {isActive && selectedSession.instructions[currentInstruction] && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-xl p-6 mb-8 border border-purple-400/30">
                    <p className="text-lg text-white font-medium">
                      {selectedSession.instructions[currentInstruction]}
                    </p>
                  </div>
                )}

                {/* Controls */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={pauseResumeMeditation}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg"
                  >
                    {isActive ? '⏸️ Pause' : '▶️ Resume'}
                  </button>
                  <button
                    onClick={stopMeditation}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                  >
                    🛑 Stop
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Completion Message */}
          {isCompleted && selectedSession && (
            <div className="bg-gradient-to-r from-emerald-500/80 to-teal-500/80 backdrop-blur-md rounded-3xl p-8 border border-emerald-400/50 shadow-2xl mb-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-white mb-2">Meditation Complete!</h3>
              <p className="text-emerald-100 mb-4">
                You completed {selectedSession.title} ({selectedSession.duration} minutes)
              </p>
              <p className="text-emerald-200 text-sm">
                ✨ Karma points will be awarded for your mindful practice!
              </p>
            </div>
          )}

          {/* Meditation Sessions Grid */}
          {!selectedSession && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {meditationSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md rounded-2xl p-6 border border-slate-600/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(session.category)} rounded-full flex items-center justify-center text-xl shadow-md`}>
                      {getCategoryIcon(session.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{session.title}</h3>
                      <p className="text-gray-300 text-sm mb-2">{session.description}</p>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                          {session.duration} min
                        </span>
                        <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full capitalize">
                          {session.category.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Instructions:</h4>
                    <ul className="text-xs text-gray-400 space-y-1">
                      {session.instructions.slice(0, 3).map((instruction, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-purple-400 mt-0.5">•</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                      {session.instructions.length > 3 && (
                        <li className="text-gray-500 italic">...and more</li>
                      )}
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => startMeditation(session)}
                    className={`w-full py-3 bg-gradient-to-r ${getCategoryColor(session.category)} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                  >
                    🧘 Start Meditation
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MeditationPage;