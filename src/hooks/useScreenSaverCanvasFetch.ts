import { useState, useEffect, useRef, useCallback } from 'react';

interface Track {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  uri: string;
}

interface CanvasData {
  canvasesList: Array<{
    id: string;
    canvasUrl: string;
    trackUri: string;
    artist?: {
      artistUri: string;
      artistName: string;
      artistImgUrl: string;
    };
    otherId: string;
    canvasUri: string;
  }>;
}

interface UseScreenSaverCanvasFetchOptions {
  trackId: string | null;
  debugMode: boolean;
  addDebugLog: (type: string, message: string) => void;
}

export const useScreenSaverCanvasFetch = ({
  trackId,
  debugMode,
  addDebugLog
}: UseScreenSaverCanvasFetchOptions) => {
  const [track, setTrack] = useState<Track | null>(null);
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTrackUri, setLastTrackUri] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const fetchCanvas = useCallback(async (specificTrackId?: string) => {
    if (!specificTrackId) return; // Só buscar se tiver um trackId específico

    setIsLoading(true);
    setError(null);

    try {
      const url = `/api/spotify/canvas?trackUri=spotify:track:${specificTrackId}`;
      
      if (debugMode) {
        addDebugLog('SCREEN_SAVER_CANVAS', `Fetching canvas for track: ${specificTrackId}`);
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Tratamento específico para rate limit (429)
        if (response.status === 429) {
          console.warn('⚠️ Rate limit exceeded (screen saver canvas), backing off...');
          if (debugMode) {
            addDebugLog('WARNING', 'Rate limit exceeded (screen saver canvas), backing off...');
          }
          
          // Backoff exponencial: 2^retryCount * 1000ms
          const backoffDelay = Math.min(Math.pow(2, retryCountRef.current) * 1000, 30000);
          retryCountRef.current = Math.min(retryCountRef.current + 1, maxRetries);
          
          if (retryCountRef.current <= maxRetries) {
            setTimeout(() => {
              fetchCanvas(specificTrackId);
            }, backoffDelay);
            return;
          } else {
            setError('Rate limit exceeded. Please try again later.');
            return;
          }
        }
        
        throw new Error(errorData.error || 'Failed to fetch canvas');
      }

      const data = await response.json();
      
      // Reset retry count on successful request
      retryCountRef.current = 0;
      
      // Verificar se a música mudou
      const currentTrackUri = data.track?.uri || data.trackUri;
      if (currentTrackUri !== lastTrackUri) {
        setTrack(data.track);
        setCanvasData(data.canvas);
        setLastTrackUri(currentTrackUri);
        setError(null);
        
        if (debugMode) {
          addDebugLog('SCREEN_SAVER_CANVAS', `New track detected: ${data.track?.name || 'Track ID'}`);
          addDebugLog('SCREEN_SAVER_CANVAS', `Canvas found: ${data.canvas?.canvasesList?.length || 0}`);
        }
      }
    } catch (err) {
      console.error('Error fetching canvas (screen saver):', err);
      if (debugMode) {
        addDebugLog('ERROR', `Error fetching canvas (screen saver): ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [debugMode, addDebugLog, lastTrackUri]);

  // Buscar Canvas quando trackId mudar
  useEffect(() => {
    if (trackId) {
      fetchCanvas(trackId);
    } else {
      // Limpar dados se não há trackId
      setTrack(null);
      setCanvasData(null);
      setLastTrackUri(null);
      setError(null);
    }
  }, [trackId, fetchCanvas]);

  return {
    track,
    canvasData,
    isLoading,
    error,
    lastTrackUri,
    setTrack,
    setCanvasData,
    setError,
    setLastTrackUri
  };
}; 