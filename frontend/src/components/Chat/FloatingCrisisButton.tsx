import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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

interface FloatingCrisisButtonProps {
  crisisInfo: CrisisInfo;
}

const FloatingCrisisButton: React.FC<FloatingCrisisButtonProps> = ({ crisisInfo }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDangerAnimation, setShowDangerAnimation] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();

  const getSeverityLevel = (level: number) => {
    if (level >= 5) return { label: 'Critical', emoji: '🚨', color: 'red', bgGradient: 'from-red-600 to-red-700' };
    if (level >= 4) return { label: 'High', emoji: '⚠️', color: 'orange', bgGradient: 'from-orange-600 to-orange-700' };
    if (level >= 3) return { label: 'Moderate', emoji: '⚡', color: 'yellow', bgGradient: 'from-yellow-600 to-yellow-700' };
    return { label: 'Low', emoji: 'ℹ️', color: 'blue', bgGradient: 'from-blue-600 to-blue-700' };
  };

  // Guard against undefined or null crisisInfo
  if (!crisisInfo || !crisisInfo.severity_level) {
    console.error('FloatingCrisisButton: Invalid crisisInfo provided', crisisInfo);
    return null;
  }

  const severity = getSeverityLevel(crisisInfo.severity_level);

  // Show danger animation first, then modal, then button
  React.useEffect(() => {
    console.log('🚨 Crisis detected - Starting danger animation');
    
    // Show danger animation for 2 seconds
    const animationTimer = setTimeout(() => {
      console.log('⏰ Animation complete - Opening modal');
      setShowDangerAnimation(false);
      setIsModalOpen(true); // Automatically open modal after animation
    }, 2000);

    return () => clearTimeout(animationTimer);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowButton(true); // Show floating button after closing modal
  };

  return (
    <>
      {/* Danger Animation - Shows First */}
      <AnimatePresence>
        {showDangerAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-lg"
          >
            <div className="relative w-64 h-64">
              {/* Pulsing danger rings */}
              <motion.div
                animate={{ 
                  scale: [1, 2.5, 1],
                  opacity: [0.8, 0, 0.8]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${severity.bgGradient} opacity-50 blur-xl`}
              />
              
              <motion.div
                animate={{ 
                  scale: [1, 2, 1],
                  opacity: [0.6, 0, 0.6]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${severity.bgGradient} opacity-40 blur-2xl`}
              />

              {/* Center warning symbol */}
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-10 text-9xl"
              >
                {severity.emoji}
              </motion.div>

              {/* Warning text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
              >
                <h2 className="text-4xl font-bold text-white mb-2">Crisis Detected</h2>
                <p className="text-xl text-red-300">Severity Level: {severity.label}</p>
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-sm text-gray-300 mt-4"
                >
                  Preparing support resources...
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Small Floating Button - Shows After Modal is Closed */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsModalOpen(true)}
            className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r ${severity.bgGradient} text-white shadow-2xl border-2 border-white/30 backdrop-blur-md hover:shadow-red-500/50 transition-all duration-300 flex items-center justify-center`}
            style={{
              boxShadow: '0 8px 30px rgba(239, 68, 68, 0.5), 0 0 15px rgba(239, 68, 68, 0.3)'
            }}
            title="View Crisis Support Resources"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-2xl"
            >
              {severity.emoji}
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Crisis Dialog Box */}
      <AnimatePresence>
        {isModalOpen && !showDangerAnimation && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center"
            />

            {/* Dialog Box */}
            <motion.dialog
              open
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="fixed top-1/5 left-1/6 -translate-x-1/2 -translate-y-1/2 
                                z-[70] w-[90vw] h-[90vh] max-w-5xl max-h-[90vh] 
                                bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 
                                rounded-2xl shadow-2xl border-2 border-red-500/40 overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border-2 border-red-500/40 overflow-hidden flex flex-col">
                {/* Dialog Header */}
                <div className={`bg-gradient-to-r ${severity.bgGradient} px-6 py-4 border-b border-white/10 flex-shrink-0`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.span
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        className="text-4xl"
                      >
                        {severity.emoji}
                      </motion.span>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Crisis Support Available</h2>
                        <p className="text-white/80 text-sm mt-0.5">Severity: {severity.label} ({crisisInfo.severity_level}/5)</p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="text-white/70 hover:text-white text-3xl font-bold transition-colors leading-none px-2"
                      aria-label="Close dialog"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Dialog Content - Scrollable */}
                <div 
                  className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#ef4444 rgba(31, 41, 55, 0.3)'
                  }}
                >
                  {/* Crisis Indicators */}
                  {crisisInfo.crisis_indicators && crisisInfo.crisis_indicators.length > 0 && (
                    <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
                      <h3 className="text-lg font-bold text-red-300 mb-3 flex items-center gap-2">
                        <span>🔍</span> Detected Crisis Indicators
                      </h3>
                      <div className="space-y-2">
                        {crisisInfo.crisis_indicators.map((indicator, index) => (
                          <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-red-400/20">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-red-300 font-semibold text-sm capitalize">{indicator.type.replace(/_/g, ' ')}</span>
                              <span className="text-xs bg-red-500/20 px-2 py-0.5 rounded-full text-red-200">
                                {indicator.severity}/5
                              </span>
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed">{indicator.evidence}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 24/7 Emergency Helplines */}
                  {crisisInfo.resources && crisisInfo.resources.immediate_help && crisisInfo.resources.immediate_help.length > 0 && (
                    <div className="bg-gradient-to-br from-red-500/15 to-orange-500/15 border border-red-400/40 rounded-xl p-4">
                      <h3 className="text-lg font-bold text-red-200 mb-3 flex items-center gap-2">
                        <motion.span
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          📞
                        </motion.span>
                        24/7 Emergency Helplines
                      </h3>
                      <p className="text-red-100 mb-3 text-xs">If you're in crisis, reach out immediately:</p>
                      <div className="space-y-2">
                        {crisisInfo.resources.immediate_help.map((resource, index) => (
                          <a
                            key={index}
                            href={`tel:${resource.phone}`}
                            className="block bg-gray-800/80 hover:bg-gray-700/80 rounded-lg p-3 border border-red-400/30 hover:border-red-400/60 transition-all group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">
                                  {resource.name}
                                </div>
                                <div className="text-lg font-mono text-red-300 mt-0.5">{resource.phone}</div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {resource.available} {resource.language && `• ${resource.language}`}
                                </div>
                              </div>
                              <div className="text-2xl group-hover:scale-110 transition-transform">📞</div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  

                  {/* General Support Services */}
                  {crisisInfo.resources && crisisInfo.resources.general_support && crisisInfo.resources.general_support.length > 0 && (
                    <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
                      <h3 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                        <span>💙</span> General Support Services
                      </h3>
                      <div className="space-y-2">
                        {crisisInfo.resources.general_support.map((resource, index) => (
                          <div
                            key={index}
                            className="bg-gray-800/50 rounded-lg p-3 border border-blue-400/20"
                          >
                            <div className="text-sm font-semibold text-blue-200">{resource.name}</div>
                            <div className="text-base font-mono text-blue-300 mt-0.5">{resource.phone}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{resource.available}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

           

                  {/* Professional Support */}
                  <div className="bg-gradient-to-br from-pink-500/15 to-purple-500/15 border border-pink-400/40 rounded-xl p-4">
                    <h3 className="text-lg font-bold text-pink-200 mb-2 flex items-center gap-2">
                      <span>👨‍⚕️</span> Professional Support
                    </h3>
                    <p className="text-gray-200 text-xs mb-3 leading-relaxed">
                      We recommend connecting with a professional therapist for personalized support.
                    </p>
                    <button
                      onClick={() => {
                        handleCloseModal();
                        navigate('/therapist-finder');
                      }}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg text-sm"
                    >
                      Find a Therapist Near You →
                    </button>
                  </div>

                  {/* Emergency Notice */}
                  {crisisInfo.immediate_action_required && (
                    <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="text-3xl flex-shrink-0"
                        >
                          🚨
                        </motion.div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-red-200 mb-1.5">Immediate Action Required</h4>
                          <p className="text-red-100 text-xs leading-relaxed">
                            If you're having thoughts of self-harm or suicide, call emergency services (112) or go to the nearest emergency room immediately. Your safety is the top priority.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dialog Footer */}
                <div className="bg-gray-800/60 border-t border-gray-700/50 px-6 py-3 flex-shrink-0">
                  <p className="text-center text-gray-400 text-xs">
                    🔒 Your privacy matters. All conversations are confidential and secure.
                  </p>
                </div>
              </div>
            </motion.dialog>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingCrisisButton;
