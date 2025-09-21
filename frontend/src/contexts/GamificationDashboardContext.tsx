import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { gamificationAPI } from '../services/api';

interface GamificationDashboardData {
  points: any;
  level: any;
  streaks: any[];
  badges: any[];
  challenges: {
    daily: any[];
    weekly: any[];
  };
  achievements: {
    level: any[];
    streak: any[];
    progress: any[];
    stats: any;
  };
}

interface GamificationDashboardContextType {
  data: GamificationDashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const GamificationDashboardContext = createContext<GamificationDashboardContextType | undefined>(undefined);

interface GamificationDashboardProviderProps {
  children: ReactNode;
}

export const GamificationDashboardProvider: React.FC<GamificationDashboardProviderProps> = ({ children }) => {
  const [data, setData] = useState<GamificationDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await gamificationAPI.getDashboard();
      
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = async () => {
    await fetchData();
  };

  return (
    <GamificationDashboardContext.Provider value={{ data, loading, error, refetch }}>
      {children}
    </GamificationDashboardContext.Provider>
  );
};

export const useGamificationDashboard = () => {
  const context = useContext(GamificationDashboardContext);
  if (!context) {
    throw new Error('useGamificationDashboard must be used within a GamificationDashboardProvider');
  }
  return context;
};