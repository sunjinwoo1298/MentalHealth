import React from 'react';
import { motion } from 'framer-motion';

interface CrisisResource {
  name: string;
  phone: string;
  available: string;
  language?: string;
}

interface CrisisInfo {
  severity_level: number;
  immediate_action_required: boolean;
  crisis_indicators: Array<{
    type: string;
    severity: number;
    evidence: string;
  }>;
  resources: {
    immediate_help: CrisisResource[];
    general_support: CrisisResource[];
    online_resources: Array<{
      name: string;
      url: string;
      type: string;
    }>;
  };
}

interface InlineCrisisCardProps {
  crisisInfo: CrisisInfo;
}

const InlineCrisisCard: React.FC<InlineCrisisCardProps> = ({ crisisInfo }) => {
  const getSeverityLevel = (level: number) => {
    if (level >= 5) return { label: 'Critical', emoji: '🚨', color: 'red' };
    if (level >= 4) return { label: 'Severe', emoji: '⚠️', color: 'orange' };
    if (level >= 3) return { label: 'Moderate', emoji: '⚡', color: 'yellow' };
    return { label: 'Low', emoji: 'ℹ️', color: 'blue' };
  };

  const severity = getSeverityLevel(crisisInfo.severity_level);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`my-4 rounded-xl border-4 overflow-hidden shadow-2xl ${
        severity.color === 'red' ? 'border-red-600 bg-gradient-to-br from-red-50 via-red-100 to-red-50' :
        severity.color === 'orange' ? 'border-orange-500 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50' :
        severity.color === 'yellow' ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-50' :
        'border-blue-500 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50'
      }`}
    >
      {/* Header with Pulsing Animation */}
      <div className={`px-6 py-4 flex items-center gap-3 ${
        severity.color === 'red' ? 'bg-red-600 text-white' :
        severity.color === 'orange' ? 'bg-orange-500 text-white' :
        severity.color === 'yellow' ? 'bg-yellow-500 text-white' :
        'bg-blue-600 text-white'
      }`}>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-3xl"
        >
          {severity.emoji}
        </motion.div>
        <div className="flex-1">
          <h3 className="text-xl font-bold">
            Professional Support Recommended
          </h3>
          <p className="text-sm opacity-90">
            Severity Level: {severity.label} ({crisisInfo.severity_level}/5)
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {crisisInfo.immediate_action_required && (
          <div className={`mb-4 p-4 rounded-lg ${
            severity.color === 'red' ? 'bg-red-200/50 border-l-4 border-red-700' :
            'bg-orange-200/50 border-l-4 border-orange-700'
          }`}>
            <p className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🆘</span>
              Immediate Action Required
            </p>
            <p className="mt-2 text-gray-800">
              Your safety and well-being are the top priority. Please consider reaching out to a professional immediately.
            </p>
          </div>
        )}

        {/* Crisis Indicators */}
        {crisisInfo.crisis_indicators && crisisInfo.crisis_indicators.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>📋</span> Concerns Detected:
            </h4>
            <ul className="space-y-2">
              {crisisInfo.crisis_indicators.slice(0, 3).map((indicator, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>{indicator.type.replace(/_/g, ' ').charAt(0).toUpperCase() + indicator.type.replace(/_/g, ' ').slice(1)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 24/7 Helplines */}
        {crisisInfo.resources?.immediate_help && crisisInfo.resources.immediate_help.length > 0 && (
          <div className="mb-4 p-4 bg-white/80 rounded-lg border-2 border-red-300">
            <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2 text-lg">
              <span className="text-2xl">📞</span> 
              24/7 Emergency Helplines
            </h4>
            <div className="space-y-3">
              {crisisInfo.resources.immediate_help.map((resource, index) => (
                <div key={index} className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="font-bold text-gray-900">{resource.name}</p>
                  <a 
                    href={`tel:${resource.phone}`}
                    className="text-2xl font-bold text-red-700 hover:text-red-900 underline block mt-1"
                  >
                    {resource.phone}
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    {resource.available} • {resource.language || 'Multiple languages'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Online Resources */}
        {crisisInfo.resources?.online_resources && crisisInfo.resources.online_resources.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>🌐</span> Online Support Resources:
            </h4>
            <div className="space-y-2">
              {crisisInfo.resources.online_resources.slice(0, 3).map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  <p className="font-semibold text-blue-700">{resource.name}</p>
                  <p className="text-sm text-gray-600">{resource.type}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* General Support */}
        {crisisInfo.resources?.general_support && crisisInfo.resources.general_support.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span>🏥</span> Professional Support Services:
            </h4>
            <div className="space-y-2">
              {crisisInfo.resources.general_support.map((resource, index) => (
                <div key={index} className="bg-white/60 p-3 rounded-lg border border-gray-300">
                  <p className="font-medium text-gray-900">{resource.name}</p>
                  <p className="text-blue-700 font-semibold">{resource.phone}</p>
                  <p className="text-sm text-gray-600">{resource.available}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="mt-4 p-4 bg-white/90 rounded-lg border-2 border-gray-300">
          <p className="text-sm text-gray-800 leading-relaxed">
            <span className="font-bold">💙 You are not alone.</span> Professional therapists and counselors are trained to help with what you're going through. 
            Reaching out is a sign of strength, not weakness. Your mental health matters, and support is available 24/7.
          </p>
        </div>

        {/* Find Nearby Therapists Button */}
        <div className="mt-4">
          <button
            onClick={() => window.location.href = '/therapist-finder'}
            className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg shadow-lg transform hover:scale-105 transition-all duration-200 ${
              severity.color === 'red' ? 'bg-red-600 hover:bg-red-700' :
              severity.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-2xl">🗺️</span>
              Find Nearby Therapists & Counselors
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default InlineCrisisCard;
