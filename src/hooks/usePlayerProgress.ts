import { useState, useEffect, useRef } from 'react';

interface PlayerProgress {
  isPlaying: boolean;
  progress: number; // em ms
  trackId: string | null;
  duration: number; // em ms
}

interface UsePlayerProgressOptions {
  enabled: boolean;
  pollingInterval: number; // em ms
  debugMode: boolean;
  addDebugLog: (type: string, message: string) => void;
}

export const usePlayerProgress = ({
  enabled,
  pollingInterval,
  debugMode,
  addDebugLog
}: UsePlayerProgressOptions) => {
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPlayerProgress = async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/spotify/player-progress');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch player progress');
      }

      const data = await response.json();
      
      setPlayerProgress(data);
      
      if (debugMode) {
        addDebugLog('PLAYER', `Progress: ${data.progress}ms, Playing: ${data.isPlaying}, Track: ${data.trackId}`);
      }
    } catch (err) {
      console.error('Error fetching player progress:', err);
      if (debugMode) {
        addDebugLog('ERROR', `Error fetching player progress: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Polling para manter sincronização
  useEffect(() => {
    if (enabled) {
      // Fetch inicial
      fetchPlayerProgress();
      
      // Polling
      pollingIntervalRef.current = setInterval(() => {
        fetchPlayerProgress();
      }, pollingInterval);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [enabled, pollingInterval]);

  return {
    playerProgress,
    isLoading,
    error,
    refetch: fetchPlayerProgress,
  };
}; 