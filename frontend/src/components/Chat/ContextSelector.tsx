import React from 'react';
import { motion } from 'framer-motion';

interface ContextInfo {
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface ContextSelectorProps {
  currentContext: string;
  contexts: {
    [key: string]: ContextInfo;
  };
  onContextChange: (context: string) => void;
}

const ContextSelector: React.FC<ContextSelectorProps> = ({
  currentContext,
  contexts,
  onContextChange,
}) => {
  return (
    <div className="flex flex-col space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Support Context
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(contexts).map(([key, context]) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onContextChange(key)}
            className={`flex items-center p-3 rounded-lg transition-colors ${
              currentContext === key
                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            style={{
              borderColor: currentContext === key ? context.color : 'transparent',
            }}
          >
            <span className="text-2xl mr-3" role="img" aria-label={context.name}>
              {context.icon}
            </span>
            <div className="flex-1 text-left">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {context.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {context.description}
              </p>
            </div>
            {currentContext === key && (
              <div className="ml-3">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>
          Select the most relevant context for your conversation. You can change this
          anytime.
        </p>
      </div>
    </div>
  );
};

export default ContextSelector;