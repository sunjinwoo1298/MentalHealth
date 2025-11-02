import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface UserPreferences {
  communicationStyle?: 'empathetic' | 'professional' | 'casual' | 'supportive';
  preferredTopics?: string[];
  notificationPreferences?: {
    dailyCheckins?: boolean;
    moodReminders?: boolean;
    progressUpdates?: boolean;
  };
  avatarSelection?: string;
  preferredTherapistGender?: 'any' | 'female' | 'male' | 'nonbinary';
  preferredTherapistLanguage?: string;
  sessionPreference?: 'online' | 'in_person' | 'hybrid';
  affordabilityRange?: {
    min: number;
    max: number;
    currency: string;
  };
  availabilityNotes?: string;
  preferredTherapyStyle?: string[];
  culturalBackgroundNotes?: string;
  preferredSupportContext?: 'general' | 'academic' | 'family';
  conditionDescription?: string;
}

interface PreferencesButtonProps {
  onPreferencesUpdate?: (preferences: UserPreferences) => void;
}

const PreferencesButton: React.FC<PreferencesButtonProps> = ({ onPreferencesUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    communicationStyle: 'empathetic',
    preferredSupportContext: 'general',
    notificationPreferences: {
      dailyCheckins: true,
      moodReminders: true,
      progressUpdates: true
    },
    conditionDescription: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchPreferences();
    }
  }, [isOpen]);

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      console.log('[PreferencesButton] Token exists:', !!token);
      console.log('[PreferencesButton] Token length:', token?.length || 0);
      
      if (!token) {
        console.error('[PreferencesButton] No token found in localStorage');
        setError('You must be logged in to view preferences');
        setLoading(false);
        return;
      }

      console.log('[PreferencesButton] Fetching preferences from API...');
      const response = await axios.get('http://localhost:3001/api/users/preferences', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('[PreferencesButton] API Response:', response.data);
      
      if (response.data.success) {
        setPreferences(response.data.data);
      }
    } catch (error: any) {
      console.error('[PreferencesButton] Error fetching preferences:', error);
      console.error('[PreferencesButton] Error response:', error.response);
      if (error.response?.status === 401) {
        console.error('[PreferencesButton] 401 Unauthorized - token may be invalid or expired');
        setError('Session expired. Please log in again.');
        // Clear invalid token
        localStorage.removeItem('token');
      } else {
        setError('Failed to load preferences. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to save preferences');
        setSaving(false);
        return;
      }

      const response = await axios.put(
        'http://localhost:3001/api/users/preferences',
        preferences,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        onPreferencesUpdate?.(response.data.data);
        setIsOpen(false);
        // Show success notification
        alert('Preferences updated successfully!');
      }
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to save preferences. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const contextInfo = {
    general: {
      name: 'General Support',
      description: 'Overall mental health and emotional wellness support',
      icon: '💙'
    },
    academic: {
      name: 'Academic Pressure',
      description: 'Study stress, exam anxiety, career guidance',
      icon: '📚'
    },
    family: {
      name: 'Family Relationships',
      description: 'Family dynamics and communication',
      icon: '🏠'
    }
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 
                   border border-purple-400/30 rounded-lg px-4 py-2 
                   backdrop-blur-md transition-all duration-300 
                   flex items-center gap-2 text-white shadow-lg"
        aria-label="Open preferences"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm font-medium">Preferences</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-purple-400/30 
                          rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-purple-400/20">
              <div>
                <h2 className="text-2xl font-bold text-white">Your Preferences</h2>
                <p className="text-gray-400 text-sm mt-1">Customize your mental health support experience</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            {error && (
              <div className="mx-6 mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            
            {loading ? (
              <div className="p-8 text-center text-gray-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                Loading preferences...
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Support Context Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Support Context
                  </label>
                  <p className="text-xs text-gray-400 mb-3">
                    Choose the primary focus area for your mental health support
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {(['general', 'academic', 'family'] as const).map((ctx) => (
                      <button
                        key={ctx}
                        onClick={() => setPreferences({ ...preferences, preferredSupportContext: ctx })}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          preferences.preferredSupportContext === ctx
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{contextInfo[ctx].icon}</span>
                          <div>
                            <h3 className="font-semibold text-white">{contextInfo[ctx].name}</h3>
                            <p className="text-sm text-gray-400 mt-1">{contextInfo[ctx].description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Communication Style Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Communication Style
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['empathetic', 'professional', 'casual', 'supportive'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setPreferences({ ...preferences, communicationStyle: style })}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          preferences.communicationStyle === style
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <span className="text-white capitalize">{style}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Describe Your Condition
                  </label>
                  <p className="text-xs text-gray-400 mb-3">
                    Share more about what you're experiencing. This helps the AI provide more personalized support.
                  </p>
                  <textarea
                    value={preferences.conditionDescription || ''}
                    onChange={(e) => setPreferences({ ...preferences, conditionDescription: e.target.value })}
                    placeholder="E.g., I've been feeling anxious about work deadlines and have trouble sleeping. I also experience occasional panic attacks..."
                    rows={4}
                    className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white 
                               placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 
                               resize-none transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {preferences.conditionDescription?.length || 0}/1000 characters
                  </p>
                </div>

                {/* Notification Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Notifications
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'dailyCheckins' as const, label: 'Daily Check-ins' },
                      { key: 'moodReminders' as const, label: 'Mood Tracking Reminders' },
                      { key: 'progressUpdates' as const, label: 'Progress Updates' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.notificationPreferences?.[key] || false}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            notificationPreferences: {
                              ...preferences.notificationPreferences,
                              [key]: e.target.checked
                            }
                          })}
                          className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-white">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-purple-400/20">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white 
                           hover:from-purple-700 hover:to-blue-700 transition-all duration-200 
                           disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PreferencesButton;
