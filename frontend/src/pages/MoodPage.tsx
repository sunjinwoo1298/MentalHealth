import React, { useState, useEffect } from 'react';
import { Smile, Heart, Zap, TrendingUp, Calendar, Clock, Sparkles, BarChart3, Activity, Brain } from 'lucide-react';

interface QuickMoodData {
  emotions: { [key: string]: number };
  triggers: string[];
  notes: string;
  timestamp: string;
}

const MoodPage: React.FC = () => {
  const [quickMoodLogs, setQuickMoodLogs] = useState<QuickMoodData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load quick mood logs from localStorage
  useEffect(() => {
    const quickLogs = localStorage.getItem('quickMoodLogs');
    if (quickLogs) {
      setQuickMoodLogs(JSON.parse(quickLogs));
    }
    // Trigger animations
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // Get today's quick mood logs
  const today = new Date().toISOString().split('T')[0];
  const todayQuickLogs = quickMoodLogs.filter(log => 
    log.timestamp && log.timestamp.startsWith(today)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-pink-300/40 to-rose-400/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-purple-300/40 to-indigo-400/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-300/40 to-cyan-400/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute top-2/3 left-1/3 w-72 h-72 bg-gradient-to-br from-amber-300/40 to-orange-400/30 rounded-full blur-3xl animate-blob animation-delay-6000"></div>
      </div>

      <main className="relative z-10 pt-6 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className={`text-center mb-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border border-pink-200/50 mb-4 hover:shadow-xl transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center shadow-md">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Mood Tracker
                </p>
                <p className="text-xs text-gray-600">Track your emotional wellbeing</p>
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              Your Mood Journey
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover patterns, celebrate progress, and understand your emotions better
            </p>
          </div>

          {/* Stats Overview */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            
            {/* Total Check-ins */}
            <div className="bg-gradient-to-br from-pink-400 to-rose-500 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-white/60" />
              </div>
              <div className="text-4xl font-bold text-white mb-1">{quickMoodLogs.length}</div>
              <div className="text-white/80 text-sm font-medium">Total Check-ins</div>
            </div>

            {/* Today's Entries */}
            <div className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="w-5 h-5 text-white/60" />
              </div>
              <div className="text-4xl font-bold text-white mb-1">{todayQuickLogs.length}</div>
              <div className="text-white/80 text-sm font-medium">Today's Check-ins</div>
            </div>

            {/* Most Tracked */}
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <Heart className="w-5 h-5 text-white/60" />
              </div>
              <div className="text-2xl font-bold text-white mb-1 truncate">
                {(() => {
                  const emotionCounts: { [key: string]: number } = {};
                  quickMoodLogs.forEach(log => {
                    Object.entries(log.emotions).forEach(([emotion, value]) => {
                      if (value > 0) {
                        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
                      }
                    });
                  });
                  const top = Object.entries(emotionCounts).sort(([,a], [,b]) => b - a)[0];
                  return top ? top[0] : 'N/A';
                })()}
              </div>
              <div className="text-white/80 text-sm font-medium">Most Tracked Emotion</div>
            </div>
          </div>

          <div className="space-y-8">
            
            {/* Today's Summary */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

              {/* Today's Quick Mood Logs */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-pink-200/50 hover:border-pink-300 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    Today's Mood Check-ins
                  </h3>
                  <span className="ml-auto px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 rounded-full text-sm font-semibold">
                    {todayQuickLogs.length}
                  </span>
                </div>
                
                {todayQuickLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
                      <Smile className="w-10 h-10 text-pink-500" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium mb-2">No check-ins today</p>
                    <p className="text-gray-500 text-sm">Use the dashboard widget to track your mood</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {todayQuickLogs.slice(0, 5).map((log, index) => (
                      <div key={index} className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-200 hover:border-pink-300 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-800 text-sm font-semibold">Mood Check #{index + 1}</span>
                          <span className="text-xs px-3 py-1 bg-white rounded-full text-gray-600 font-medium">
                            {new Date(log.timestamp).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(log.emotions).map(([emotion, value]) => value > 0 && (
                            <div key={emotion} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700 font-medium">{emotion}</span>
                              <div className="flex items-center gap-2">
                                <div className="flex space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <div 
                                      key={i} 
                                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                        i < value ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-sm' : 'bg-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500 font-semibold">{value}/5</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {log.triggers.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-pink-200">
                            <div className="flex flex-wrap gap-2">
                              {log.triggers.slice(0, 3).map((trigger, idx) => (
                                <span key={idx} className="text-xs bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 px-3 py-1 rounded-full font-medium">
                                  {trigger}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Insights Summary */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-purple-200/50 hover:border-purple-300 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Emotion Insights
                  </h3>
                </div>
                
                {quickMoodLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <BarChart3 className="w-10 h-10 text-purple-500" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium mb-2">Start tracking to see insights</p>
                    <p className="text-gray-500 text-sm">Your emotion patterns will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl">
                      <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        {quickMoodLogs.length}
                      </div>
                      <div className="text-gray-600 text-sm font-medium">Total Mood Check-ins</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600 font-semibold mb-3">Top Tracked Emotions:</div>
                      {(() => {
                        const emotionCounts: { [key: string]: number } = {};
                        quickMoodLogs.forEach(log => {
                          Object.entries(log.emotions).forEach(([emotion, value]) => {
                            if (value > 0) {
                              emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
                            }
                          });
                        });
                        const total = Object.values(emotionCounts).reduce((a, b) => a + b, 0);
                        return Object.entries(emotionCounts)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 5)
                          .map(([emotion, count], idx) => {
                            const percentage = ((count / total) * 100).toFixed(0);
                            const colors = [
                              'from-pink-500 to-rose-500',
                              'from-purple-500 to-indigo-500',
                              'from-blue-500 to-cyan-500',
                              'from-teal-500 to-emerald-500',
                              'from-amber-500 to-orange-500'
                            ];
                            return (
                              <div key={emotion} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-700 font-medium">{emotion}</span>
                                  <span className="text-gray-900 font-bold">{count}x ({percentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`h-full bg-gradient-to-r ${colors[idx]} rounded-full transition-all duration-1000 shadow-sm`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          });
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* All Quick Mood Check-ins */}
            <div className={`bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-blue-200/50 hover:border-blue-300 hover:shadow-2xl transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    All Mood Check-ins
                  </h3>
                </div>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-sm font-bold shadow-sm">
                  {quickMoodLogs.length} total
                </span>
              </div>
              
              {quickMoodLogs.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Sparkles className="w-12 h-12 text-blue-500" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-3">Start Your Mood Journey</h4>
                  <p className="text-gray-600 mb-6 text-lg">Use the Quick Mood Tracker on your dashboard to start logging!</p>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 max-w-md mx-auto border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-gray-700 font-semibold mb-2">💡 How it works:</p>
                        <p className="text-gray-600 text-sm">
                          Go to your dashboard and use the Quick Mood Check widget to track your emotions and triggers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quickMoodLogs.map((log, index) => {
                    const cardColors = [
                      'from-pink-50 to-rose-50 border-pink-200',
                      'from-purple-50 to-indigo-50 border-purple-200',
                      'from-blue-50 to-cyan-50 border-blue-200',
                      'from-teal-50 to-emerald-50 border-teal-200',
                      'from-amber-50 to-orange-50 border-amber-200'
                    ];
                    const cardColor = cardColors[index % cardColors.length];
                    
                    return (
                      <div 
                        key={index} 
                        className={`bg-gradient-to-br ${cardColor} rounded-2xl p-5 border hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2`}
                        style={{
                          animation: `slideInUp 0.5s ease-out ${index * 0.05}s both`
                        }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white rounded-lg shadow-sm">
                              <Heart className="w-4 h-4 text-pink-500" />
                            </div>
                            <span className="text-gray-800 font-bold text-sm">Check #{quickMoodLogs.length - index}</span>
                          </div>
                          <div className="text-xs px-2 py-1 bg-white rounded-full text-gray-600 font-medium shadow-sm">
                            {formatDate(log.timestamp)}
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleTimeString('en-IN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        
                        {Object.keys(log.emotions).length > 0 && (
                          <div className="mb-4">
                            <div className="text-xs text-gray-600 font-semibold mb-2">Emotions:</div>
                            <div className="space-y-2">
                              {Object.entries(log.emotions).map(([emotion, value]) => value > 0 && (
                                <div key={emotion} className="flex items-center justify-between">
                                  <span className="text-xs text-gray-700 font-medium">{emotion}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="flex space-x-1">
                                      {[...Array(5)].map((_, i) => (
                                        <div 
                                          key={i} 
                                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                            i < value ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-sm' : 'bg-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-600 font-bold">{value}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {log.triggers.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-600 font-semibold mb-2">Triggers:</div>
                            <div className="flex flex-wrap gap-1">
                              {log.triggers.map((trigger, idx) => (
                                <span key={idx} className="text-xs bg-white text-gray-700 px-2 py-1 rounded-full font-medium shadow-sm">
                                  {trigger}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {log.notes && (
                          <div className="pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-600 font-semibold mb-1">Notes:</div>
                            <p className="text-xs text-gray-700 bg-white p-2 rounded-lg italic">"{log.notes}"</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MoodPage;