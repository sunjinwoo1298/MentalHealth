import React from 'react';
import { motion } from 'framer-motion';

interface RiskTrend {
  timestamp: number;
  level: number;
  factors: string[];
}

interface AgentAnalysis {
  patterns: {
    emotional: {
      dominant: string[];
      frequency: Record<string, number>;
    };
    behavioral: string[];
    risk_factors: string[];
    protective_factors: string[];
  };
  recommendations: string[];
}

interface AgentInfo {
  agent_analysis: AgentAnalysis | null;
  agent_intervention: {
    type: string;
    message: string;
    urgency: 'low' | 'medium' | 'high';
  } | null;
  risk_trends: RiskTrend[];
  has_agent_intervention: boolean;
}

interface AgentInfoPanelProps {
  agentInfo: AgentInfo;
  isVisible: boolean;
}

const AgentInfoPanel: React.FC<AgentInfoPanelProps> = ({ agentInfo, isVisible }) => {
  if (!isVisible || !agentInfo.agent_analysis) return null;

  const { agent_analysis, agent_intervention, risk_trends } = agentInfo;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed right-0 top-24 w-96 bg-white dark:bg-gray-800 shadow-lg rounded-l-lg p-4 overflow-y-auto max-h-[calc(100vh-120px)]"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Care Agent Insights
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time analysis and support recommendations
          </p>
        </div>

        {/* Emotional Patterns */}
        {agent_analysis.patterns.emotional && (
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Emotional Patterns
            </h4>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Dominant emotions:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {agent_analysis.patterns.emotional.dominant.map((emotion, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                  >
                    {emotion}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Risk & Protective Factors */}
        <div className="grid grid-cols-2 gap-4">
          {/* Risk Factors */}
          {agent_analysis.patterns.risk_factors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Risk Factors
              </h4>
              <ul className="space-y-1">
                {agent_analysis.patterns.risk_factors.map((factor, index) => (
                  <li
                    key={index}
                    className="text-xs text-red-600 dark:text-red-400"
                  >
                    • {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Protective Factors */}
          {agent_analysis.patterns.protective_factors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Protective Factors
              </h4>
              <ul className="space-y-1">
                {agent_analysis.patterns.protective_factors.map((factor, index) => (
                  <li
                    key={index}
                    className="text-xs text-green-600 dark:text-green-400"
                  >
                    • {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Agent Intervention */}
        {agent_intervention && (
          <div className={`p-4 rounded-lg ${
            agent_intervention.urgency === 'high'
              ? 'bg-red-50 dark:bg-red-900/20'
              : agent_intervention.urgency === 'medium'
              ? 'bg-yellow-50 dark:bg-yellow-900/20'
              : 'bg-green-50 dark:bg-green-900/20'
          }`}>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Care Agent Message
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {agent_intervention.message}
            </p>
          </div>
        )}

        {/* Recommendations */}
        {agent_analysis.recommendations?.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Recommendations
            </h4>
            <ul className="space-y-2">
              {agent_analysis.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-300"
                >
                  <span className="text-green-500">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Trends */}
        {risk_trends?.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
              Risk Level Trends
            </h4>
            <div className="h-24 flex items-end space-x-2">
              {risk_trends.map((trend, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center"
                  style={{ height: '100%' }}
                >
                  <div
                    className={`w-4 ${
                      trend.level >= 4
                        ? 'bg-red-500'
                        : trend.level >= 3
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    } rounded-t`}
                    style={{ height: `${trend.level * 20}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(trend.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AgentInfoPanel;