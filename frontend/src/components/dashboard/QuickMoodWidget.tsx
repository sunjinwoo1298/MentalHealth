/**
 * Quick Mood Widget Component
 * 
 * A streamlined mood tracking widget for the dashboard that allows users to:
 * - Rate 5 core emotions on a 0-5 scale
 * - Select multiple triggers
 * - Add optional quick notes
 * - Saves to localStorage and backend API
 * - Awards gamification points
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { wellnessAPI } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Brain, CheckCircle2, Sparkles } from 'lucide-react';

interface EmotionRating {
  [key: string]: number; // emotion name -> rating (0-5)
}

interface QuickMoodData {
  emotions: EmotionRating;
  triggers: string[];
  notes: string;
  timestamp: string;
}

const QuickMoodWidget: React.FC = () => {
  // single-selection slider state: index 0..4 mapping to emotionOptions
  const emotionOptions = [
    { name: 'Happy', emoji: '😊', color: 'from-yellow-400 to-orange-400' },
    { name: 'Sad', emoji: '😢', color: 'from-blue-400 to-indigo-400' },
    { name: 'Anxious', emoji: '😰', color: 'from-red-400 to-pink-400' },
    { name: 'Calm', emoji: '😌', color: 'from-green-400 to-teal-400' },
    { name: 'Energized', emoji: '⚡', color: 'from-purple-400 to-pink-400' }
  ];

  const [selectedEmotionIdx, setSelectedEmotionIdx] = useState<number>(0);
  
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [quickLogsState, setQuickLogsState] = useState<QuickMoodData[]>([]);
  const { isAuthenticated } = useAuth();

  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const triggerOptions = [
    'Work', 'Relationships', 'Family', 'Health', 'Finance',
    'Social', 'Sleep', 'Academic', 'Exercise', 'Weather'
  ];

  // Initialize today's state from server when authenticated, otherwise from localStorage
  useEffect(() => {
    const init = async () => {
      try {
        if (isAuthenticated) {
          // fetch server mood entries
          const res = await wellnessAPI.getMoodEntries({ limit: 20 })
          if (res && res.success && Array.isArray(res.data)) {
            const parsed: QuickMoodData[] = res.data
            setQuickLogsState(parsed)
            const today = new Date().toISOString().split('T')[0]
            const todayEntry = parsed.find(l => l.timestamp && l.timestamp.startsWith(today))
            if (todayEntry) {
              setHasLoggedToday(true)
              const keys = todayEntry.emotions ? Object.keys(todayEntry.emotions) : []
              const first = keys.length > 0 ? keys[0] : undefined
              const idx = first ? emotionOptions.findIndex(e => e.name === first) : -1
              if (idx >= 0) setSelectedEmotionIdx(idx)
              setSelectedTriggers(todayEntry.triggers || [])
              setNotes(todayEntry.notes || '')
            }
            return
          }
        }

        // Fallback to localStorage
        const logs = localStorage.getItem('quickMoodLogs')
        if (!logs) return
        const parsed: QuickMoodData[] = JSON.parse(logs)
        setQuickLogsState(parsed)
        const today = new Date().toISOString().split('T')[0]
        const todayEntry = parsed.find(l => l.timestamp && l.timestamp.startsWith(today))
        if (todayEntry) {
          setHasLoggedToday(true)
          const keys = todayEntry.emotions ? Object.keys(todayEntry.emotions) : []
          const first = keys.length > 0 ? keys[0] : undefined
          const idx = first ? emotionOptions.findIndex(e => e.name === first) : -1
          if (idx >= 0) setSelectedEmotionIdx(idx)
          setSelectedTriggers(todayEntry.triggers || [])
          setNotes(todayEntry.notes || '')
        }
      } catch (err) {
        // ignore parse errors
      }
    }

    init()
  }, [isAuthenticated]);

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleSave = async () => {
    // enforce once-per-day
    const today = new Date().toISOString().split('T')[0];
    try {
      const logsSource: QuickMoodData[] = quickLogsState && quickLogsState.length > 0
        ? quickLogsState
        : (localStorage.getItem('quickMoodLogs') ? JSON.parse(localStorage.getItem('quickMoodLogs') as string) : []);
      const todayExists = logsSource.some(l => l.timestamp && l.timestamp.startsWith(today));
      if (todayExists) {
        setShowSuccess(false);
        setHasLoggedToday(true);
        return;
      }
    } catch (err) {
      // ignore
    }

    setIsSaving(true);

    const pickedEmotion = emotionOptions[selectedEmotionIdx];
    const moodData: QuickMoodData = {
      emotions: { [pickedEmotion.name]: 1 }, // simple marker for which emotion
      triggers: selectedTriggers,
      notes,
      timestamp: new Date().toISOString()
    };


    try {
      // Save to localStorage for immediate feedback
      const existingLogs = localStorage.getItem('quickMoodLogs')
      const logs: QuickMoodData[] = existingLogs ? JSON.parse(existingLogs) : []
      logs.unshift(moodData) // Add to beginning
      localStorage.setItem('quickMoodLogs', JSON.stringify(logs))
      setQuickLogsState(logs)

      // Save to backend API (if authenticated) using centralized api helper
      if (isAuthenticated) {
        try {
          const result = await wellnessAPI.postQuickMood({
            emotions: moodData.emotions,
            triggers: selectedTriggers,
            notes: notes || undefined
          })
          if (result && result.success) {
            // prefer server copy by re-fetching a small set
            const refetch = await wellnessAPI.getMoodEntries({ limit: 20 })
            if (refetch && refetch.success && Array.isArray(refetch.data)) {
              setQuickLogsState(refetch.data)
            }
          } else {
            console.warn('Backend save failed:', result?.message)
          }
        } catch (backendError) {
          console.error('Backend API error (continuing with localStorage):', backendError)
        }
      }

  // Show success and lock for the day
      setShowSuccess(true);
      setHasLoggedToday(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      console.error('Error saving mood:', error);
    } finally {
      setIsSaving(false);
    }
  };

  

  return (
    <Card className="rounded-2xl bg-white/80 border-purple-200/50 hover:shadow-bubbly transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Brain className="text-purple-500" /> Quick Mood Check
        </CardTitle>
        <CardDescription>How are you feeling right now?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-100 border border-green-300 rounded-xl p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="text-green-600 w-5 h-5" />
            <span className="text-green-800 font-medium text-sm">Mood logged! +5 points earned</span>
          </div>
        )}

        {/* Single emotion slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{emotionOptions[selectedEmotionIdx].emoji}</span>
              <div>
                <div className="text-sm font-medium text-gray-700">{emotionOptions[selectedEmotionIdx].name}</div>
                <div className="text-xs text-gray-500">Select how you primarily feel right now</div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <input
              aria-label="Primary emotion selector"
              type="range"
              min={0}
              max={emotionOptions.length - 1}
              step={1}
              value={selectedEmotionIdx}
              onChange={(e) => setSelectedEmotionIdx(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />

            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              {emotionOptions.map((e, i) => (
                <div key={e.name} className={`text-center w-1/5 ${i === selectedEmotionIdx ? 'text-gray-800 font-semibold' : ''}`}>
                  <div className="text-sm">{e.emoji}</div>
                  <div className="truncate">{e.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Triggers */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Any triggers?</label>
          <div className="flex flex-wrap gap-2">
            {triggerOptions.map((trigger) => (
              <button
                key={trigger}
                onClick={() => toggleTrigger(trigger)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  selectedTriggers.includes(trigger)
                    ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {trigger}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Quick note (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any thoughts or context..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || hasLoggedToday}
          className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Saving...
            </>
          ) : hasLoggedToday ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-200" />
              Logged today
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Log Mood
            </>
          )}
        </Button>

        {/* Quick Stats */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Tracked today: {quickLogsState.filter(log => {
                  const today = new Date().toISOString().split('T')[0]
                  return !!(log.timestamp && log.timestamp.startsWith(today))
                }).length}
                </span>
            <a href="/mood" className="text-purple-600 hover:text-purple-700 font-medium">
              View history →
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickMoodWidget;
