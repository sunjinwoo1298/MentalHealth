import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface CrisisAlertProps {
  crisisInfo: CrisisInfo;
  onClose: () => void;
}

const CrisisAlert: React.FC<CrisisAlertProps> = ({ crisisInfo, onClose }) => {
  const getSeverityColor = (level: number) => {
    switch (level) {
      case 5: return 'bg-red-100 border-red-500 text-red-700';
      case 4: return 'bg-orange-100 border-orange-500 text-orange-700';
      case 3: return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      default: return 'bg-blue-100 border-blue-500 text-blue-700';
    }
  };

  const containerClass = `fixed inset-x-0 bottom-0 p-4 border-t-4 shadow-lg z-50 ${getSeverityColor(crisisInfo.severity_level)}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className={containerClass}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start">
            {/* Alert Icon */}
            <div className="flex-shrink-0">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 8a1 1 0 112 0v4a1 1 0 11-2 0V8zm1-3a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
            </div>

            {/* Content */}
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium">
                Support Resources Available
              </h3>
              
              {crisisInfo.immediate_action_required && (
                <p className="mt-2 font-bold">
                  Please consider reaching out to one of these support services:
                </p>
              )}

              {/* Immediate Help */}
              {crisisInfo.resources.immediate_help && (
                <div className="mt-3">
                  <h4 className="font-semibold">24/7 Support Lines:</h4>
                  <ul className="mt-2 space-y-2">
                    {crisisInfo.resources.immediate_help.map((resource, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="text-lg">📞</span>
                        <div>
                          <p className="font-medium">{resource.name}</p>
                          <p className="text-sm">
                            {resource.phone} ({resource.language || 'Multiple languages'})
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Online Resources */}
              {crisisInfo.resources.online_resources && (
                <div className="mt-3">
                  <h4 className="font-semibold">Online Support:</h4>
                  <ul className="mt-2 space-y-2">
                    {crisisInfo.resources.online_resources.map((resource, index) => (
                      <li key={index}>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:underline flex items-center space-x-2"
                        >
                          <span>🌐</span>
                          <span>{resource.name} - {resource.type}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-4"
              aria-label="Close"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CrisisAlert;