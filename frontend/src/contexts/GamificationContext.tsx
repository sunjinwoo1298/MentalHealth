import React, { createContext, useContext, useState, useCallback } from 'react';
import { gamificationAPI } from '../services/api';

interface PendingReward {
  activityType: string;
  metadata: any;
  points?: number;
  timestamp: string;
}

interface GamificationContextType {
  pendingRewards: PendingReward[];
  addPendingReward: (activityType: string, metadata?: any) => void;
  processPendingRewards: () => Promise<any>;
  clearPendingRewards: () => void;
  isProcessing: boolean;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingRewards, setPendingRewards] = useState<PendingReward[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addPendingReward = useCallback((activityType: string, metadata: any = {}) => {
    const reward: PendingReward = {
      activityType,
      metadata: {
        ...metadata,
        source: 'activity_completion',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    setPendingRewards(prev => [...prev, reward]);
    
    // Store in localStorage as backup
    const existing = JSON.parse(localStorage.getItem('pendingGamificationRewards') || '[]');
    existing.push(reward);
    localStorage.setItem('pendingGamificationRewards', JSON.stringify(existing));
    
    console.log(`Added pending reward for ${activityType}:`, reward);
  }, []);

  const processPendingRewards = useCallback(async () => {
    if (pendingRewards.length === 0) {
      return { processed: 0, results: [] };
    }

    setIsProcessing(true);
    const results = [];

    try {
      // Process each pending reward
      for (const reward of pendingRewards) {
        try {
          console.log(`Processing reward for ${reward.activityType}:`, reward);
          
          const response = await gamificationAPI.awardPoints(reward.activityType, reward.metadata);
          
          if (response.success) {
            results.push({
              activityType: reward.activityType,
              success: true,
              data: response.data
            });
            console.log(`Successfully processed ${reward.activityType}:`, response.data);
          } else {
            results.push({
              activityType: reward.activityType,
              success: false,
              error: response.error
            });
            console.error(`Failed to process ${reward.activityType}:`, response.error);
          }
        } catch (error) {
          console.error(`Error processing ${reward.activityType}:`, error);
          results.push({
            activityType: reward.activityType,
            success: false,
            error: error
          });
        }
      }

      // Clear processed rewards
      setPendingRewards([]);
      localStorage.removeItem('pendingGamificationRewards');

      return {
        processed: pendingRewards.length,
        results
      };

    } catch (error) {
      console.error('Error processing pending rewards:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [pendingRewards]);

  const clearPendingRewards = useCallback(() => {
    setPendingRewards([]);
    localStorage.removeItem('pendingGamificationRewards');
  }, []);

  // Load pending rewards from localStorage on init
  React.useEffect(() => {
    const stored = localStorage.getItem('pendingGamificationRewards');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPendingRewards(parsed);
          console.log('Loaded pending rewards from localStorage:', parsed);
        }
      } catch (error) {
        console.error('Error loading pending rewards:', error);
        localStorage.removeItem('pendingGamificationRewards');
      }
    }
  }, []);

  const value: GamificationContextType = {
    pendingRewards,
    addPendingReward,
    processPendingRewards,
    clearPendingRewards,
    isProcessing
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};
