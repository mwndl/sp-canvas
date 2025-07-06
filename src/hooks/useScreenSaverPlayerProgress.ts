import { useState, useEffect, useRef } from 'react';

interface PlayerProgress {
  isPlaying: boolean;
  progress: number; // em ms
  trackId: string | null;
  duration: number; // em ms
}

interface UseScreenSaverPlayerProgressOptions {
  enabled: boolean;
  debugMode: boolean;
  addDebugLog: (type: string, message: string) => void;
}

export const useScreenSaverPlayerProgress = ({
  enabled,
  debugMode,
  addDebugLog
}: UseScreenSaverPlayerProgressOptions) => {
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const lastTrackIdRef = useRef<string | null>(null);

  const fetchPlayerProgress = async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/spotify/player-progress');
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Tratamento específico para rate limit (429)
        if (response.status === 429) {
          console.warn('⚠️ Rate limit exceeded (screen saver player progress), backing off...');
          if (debugMode) {
            addDebugLog('WARNING', 'Rate limit exceeded (screen saver player progress), backing off...');
          }
          
          // Backoff exponencial: 2^retryCount * 1000ms
          const backoffDelay = Math.min(Math.pow(2, retryCountRef.current) * 1000, 30000);
          retryCountRef.current = Math.min(retryCountRef.current + 1, maxRetries);
          
          if (retryCountRef.current <= maxRetries) {
            setTimeout(() => {
              fetchPlayerProgress();
            }, backoffDelay);
            return;
          } else {
            setError('Rate limit exceeded. Please try again later.');
            return;
          }
        }
        
        throw new Error(errorData.error || 'Failed to fetch player progress');
      }

      const data = await response.json();
      
      // Reset retry count on successful request
      retryCountRef.current = 0;
      
      // Verificar se a música mudou
      const currentTrackId = data.trackId;
      const lastTrackId = lastTrackIdRef.current;
      
      if (currentTrackId !== lastTrackId) {
        if (debugMode) {
          addDebugLog('TRACK_CHANGE', `Track changed: ${lastTrackId} -> ${currentTrackId}`);
        }
        lastTrackIdRef.current = currentTrackId;
      }
      
      setPlayerProgress(data);
      
      if (debugMode) {
        addDebugLog('PLAYER', `Screen Saver - Progress: ${data.progress}ms, Playing: ${data.isPlaying}, Track: ${data.trackId}`);
      }
    } catch (err) {
      console.error('Error fetching player progress (screen saver):', err);
      if (debugMode) {
        addDebugLog('ERROR', `Error fetching player progress (screen saver): ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Polling a cada 10 segundos
  useEffect(() => {
    if (enabled) {
      // Fetch inicial
      fetchPlayerProgress();
      
      // Polling a cada 10 segundos
      pollingIntervalRef.current = setInterval(() => {
        fetchPlayerProgress();
      }, 10000); // 10 segundos

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [enabled]);

  return {
    playerProgress,
    isLoading,
    error,
    refetch: fetchPlayerProgress,
    hasTrackChanged: () => {
      const currentTrackId = playerProgress?.trackId;
      const lastTrackId = lastTrackIdRef.current;
      return currentTrackId !== lastTrackId;
    }
  };
}; 