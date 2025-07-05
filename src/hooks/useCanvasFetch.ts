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

interface UseCanvasFetchOptions {
  autoUpdate: boolean;
  pollingInterval: number;
  trackId: string | null;
  debugMode: boolean;
  addDebugLog: (type: string, message: string) => void;
}

export const useCanvasFetch = ({
  autoUpdate,
  pollingInterval,
  trackId,
  debugMode,
  addDebugLog
}: UseCanvasFetchOptions) => {
  const [track, setTrack] = useState<Track | null>(null);
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastTrackUri, setLastTrackUri] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCanvas = useCallback(async (specificTrackId?: string) => {
    try {
      let url = '/api/spotify/canvas';
      if (specificTrackId) {
        url += `?trackUri=spotify:track:${specificTrackId}`;
        console.log('🎯 Searching for specific Track ID:', specificTrackId);
        console.log('🔗 Request URL:', url);
        if (debugMode) {
          addDebugLog('API', `Searching for specific Track ID: ${specificTrackId}`);
        }
      } else {
        console.log('🎵 Searching for current track');
        if (debugMode) {
          addDebugLog('API', 'Searching for current track');
        }
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // If no track is playing AND it's not a specific Track ID, it's not an error
        if (errorData.error === 'No track currently playing' && !specificTrackId) {
          setTrack(null);
          setCanvasData(null);
          setLastTrackUri(null);
          setError(null);
          console.log('⏰ No track playing - showing clock');
          if (debugMode) {
            addDebugLog('INFO', 'No track playing - showing clock');
          }
          return;
        }
        
        // If it's a specific Track ID and there's an error, show the error
        if (specificTrackId) {
          console.error('❌ Error searching for specific Track ID:', errorData.error);
          if (debugMode) {
            addDebugLog('ERROR', `Error searching for specific Track ID: ${errorData.error}`);
          }
          setError(`Error searching for track: ${errorData.error}`);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to fetch canvas');
      }

      const data = await response.json();
      
      // Verificar se a música mudou
      const currentTrackUri = data.track?.uri || data.trackUri;
      if (currentTrackUri !== lastTrackUri) {
        setTrack(data.track);
        setCanvasData(data.canvas);
        setLastTrackUri(currentTrackUri);
        setError(null); // Clear any previous error
        console.log('🎵 New track detected:', data.track?.name || 'Track ID');
        if (debugMode) {
          addDebugLog('INFO', `New track detected: ${data.track?.name || 'Track ID'}`);
          addDebugLog('INFO', `Canvas found: ${data.canvas?.canvasesList?.length || 0}`);
        }
      }
    } catch (err) {
      console.error('Error fetching canvas:', err);
      if (debugMode) {
        addDebugLog('ERROR', `Error fetching canvas: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [debugMode, addDebugLog, lastTrackUri]);

  // Polling to check for track changes
  useEffect(() => {
    // Only do polling if autoUpdate is enabled AND it's not a specific track
    if (autoUpdate && !trackId) {
      console.log(`🔄 Starting automatic polling for current track (every ${pollingInterval/1000}s)`);
      // Check at configured interval if track changed
      pollingIntervalRef.current = setInterval(() => {
        fetchCanvas();
      }, pollingInterval);

      return () => {
        if (pollingIntervalRef.current) {
          console.log('⏹️ Stopping automatic polling');
          clearInterval(pollingIntervalRef.current);
        }
      };
    } else if (trackId) {
      console.log('🎯 Specific track detected - polling disabled');
    }
  }, [autoUpdate, trackId, pollingInterval, fetchCanvas]);

  // Initial fetch
  useEffect(() => {
    const fetchInitialCanvas = async () => {
      if (trackId) {
        await fetchCanvas(trackId);
      } else {
        await fetchCanvas();
      }
    };

    fetchInitialCanvas();
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