import React, { useEffect, useRef, useState } from 'react';
import type { JournalEntry } from '../types/journal';

interface JournalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  formData: Omit<JournalEntry, 'id' | 'createdAt' | 'wordCount' | 'isExpanded'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<JournalEntry, 'id' | 'createdAt' | 'wordCount' | 'isExpanded'>>>;
  moodOptions: Record<string, { emoji: string; label: string; color: string }>;
  predefinedTags: Record<string, string>;
  editingEntry: JournalEntry | null;
  isLoading: boolean;
}

const journalPrompts = [
  "What made me smile today?",
  "What am I grateful for right now?",
  "How am I feeling and why?",
  "What challenged me today and how did I handle it?",
  "What's one thing I learned about myself today?",
  "What are my hopes for tomorrow?",
  "Describe a moment when I felt proud of myself",
  "What's weighing on my mind lately?",
  "How can I be kinder to myself?",
  "What would I tell my younger self?"
];

const JournalFormModal: React.FC<JournalFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  formData,
  setFormData,
  moodOptions,
  predefinedTags,
  editingEntry,
  isLoading
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [selectedTag, setSelectedTag] = useState('');

  // Focus title input when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setSelectedTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const usePrompt = (prompt: string) => {
    if (!formData.title) {
      setFormData(prev => ({ ...prev, title: prompt }));
    }
    if (!formData.content) {
      setFormData(prev => ({ ...prev, content: `Today I want to reflect on: ${prompt}\n\n` }));
    }
  };

  const handleSave = () => {
    if (formData.title.trim() && formData.content.trim()) {
      onSave();
    }
  };

  const isFormValid = formData.title.trim() && formData.content.trim();
  const wordCount = formData.content.split(' ').filter(word => word.length > 0).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          ref={modalRef}
          className="relative w-full max-w-4xl bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-purple-200/50 animate-slide-in-up"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-200/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white">
                ✍️
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            
            {/* Writing Prompts (only for new entries) */}
            {!editingEntry && (!formData.title && !formData.content) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3">✨ Need inspiration? Try a prompt:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {journalPrompts.slice(0, 6).map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => usePrompt(prompt)}
                      className="text-left p-3 bg-white/70 hover:bg-white border border-blue-200/50 rounded-xl text-sm text-blue-700 hover:text-blue-800 transition-all duration-200 hover:shadow-md"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Title Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Entry Title *</label>
              <input
                ref={titleInputRef}
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Give your entry a meaningful title..."
                className="w-full px-4 py-3 bg-white/80 border-2 border-purple-200 rounded-2xl focus:outline-none focus:border-purple-400 focus:bg-white transition-all text-gray-800 placeholder-gray-500"
                maxLength={100}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.title.length}/100 characters
              </div>
            </div>

            {/* Content Textarea */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Your Thoughts *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write freely about your thoughts, feelings, experiences, or anything on your mind..."
                rows={12}
                className="w-full px-4 py-3 bg-white/80 border-2 border-purple-200 rounded-2xl focus:outline-none focus:border-purple-400 focus:bg-white transition-all text-gray-800 placeholder-gray-500 resize-none"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{wordCount} words</span>
                <span>✨ Express yourself freely - this is your safe space</span>
              </div>
            </div>

            {/* Mood Selector */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3">How are you feeling? 💭</label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {Object.entries(moodOptions).map(([mood, { emoji, label, color }]) => (
                  <button
                    key={mood}
                    onClick={() => setFormData(prev => ({ ...prev, mood: mood as JournalEntry['mood'] }))}
                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                      formData.mood === mood
                        ? 'border-purple-400 shadow-lg transform scale-105'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    style={{
                      background: formData.mood === mood 
                        ? `linear-gradient(135deg, ${color}20, ${color}40)`
                        : 'white'
                    }}
                  >
                    <span className="text-2xl mb-1">{emoji}</span>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Section */}
            <div>
              <label className="block text-gray-700 font-semibold mb-3">Tags (Optional) 🏷️</label>
              
              {/* Current Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-purple-500 hover:text-purple-700 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add New Tag */}
              <div className="flex gap-2 mb-4">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/80 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-400 text-gray-700"
                >
                  <option value="">Choose a tag...</option>
                  {Object.keys(predefinedTags).filter(tag => !formData.tags.includes(tag)).map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
                <button
                  onClick={() => addTag(selectedTag)}
                  disabled={!selectedTag}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                >
                  Add
                </button>
              </div>

              {/* Predefined Tags */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.keys(predefinedTags).filter(tag => !formData.tags.includes(tag)).slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    className={`px-3 py-2 text-sm rounded-xl transition-all duration-200 hover:scale-105 ${predefinedTags[tag]}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-purple-200/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
            <div className="text-sm text-gray-600">
              <span className="font-medium">💡 Tip:</span> Regular journaling helps process emotions and track personal growth
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isFormValid || isLoading}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    💾 {editingEntry ? 'Update Entry' : 'Save Entry'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalFormModal;