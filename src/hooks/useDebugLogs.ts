import { useState, useCallback } from 'react';

interface DebugLog {
  timestamp: string;
  type: string;
  message: string;
}

interface UseDebugLogsOptions {
  debugMode: boolean;
  maxLogs?: number;
}

export const useDebugLogs = ({ debugMode, maxLogs = 50 }: UseDebugLogsOptions) => {
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);

  const addDebugLog = useCallback((type: string, message: string) => {
    if (debugMode) {
      const timestamp = new Date().toLocaleTimeString();
      
      setDebugLogs(prev => {
        const newLog = { timestamp, type, message };
        const updatedLogs = [...prev, newLog];
        
        // Manter apenas os últimos maxLogs
        if (updatedLogs.length > maxLogs) {
          return updatedLogs.slice(-maxLogs);
        }
        
        return updatedLogs;
      });
    }
  }, [debugMode, maxLogs]);

  const clearLogs = useCallback(() => {
    setDebugLogs([]);
  }, []);

  return {
    debugLogs,
    addDebugLog,
    clearLogs
  };
}; 