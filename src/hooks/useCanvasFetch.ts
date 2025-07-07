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
  playerProgress?: { trackId: string | null } | null; // Adicionar player progress para detectar mudanças
}

export const useCanvasFetch = ({
  autoUpdate,
  pollingInterval = 5000, // Aumentado para 5 segundos por padrão
  trackId,
  debugMode,
  addDebugLog,
  playerProgress
}: UseCanvasFetchOptions) => {
  const [track, setTrack] = useState<Track | null>(null);
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastTrackUri, setLastTrackUri] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

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
        console.log('🎵 Searching for current track (triggered by:', new Error().stack?.split('\n')[2]?.trim() || 'unknown', ')');
        if (debugMode) {
          addDebugLog('API', 'Searching for current track');
        }
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Tratamento específico para rate limit (429)
        if (response.status === 429) {
          console.warn('⚠️ Rate limit exceeded, backing off...');
          if (debugMode) {
            addDebugLog('WARNING', 'Rate limit exceeded, backing off...');
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
        
        // If no track is playing AND it's not a specific Track ID, it's not an error
        if (errorData.error === 'No track currently playing' && !specificTrackId) {
          setTrack(null);
          setCanvasData(null);
          setLastTrackUri(null);
          setError(null);
          retryCountRef.current = 0; // Reset retry count on success
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
      
      // Reset retry count on successful request
      retryCountRef.current = 0;
      
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

  // Detectar mudança de música via player progress
  useEffect(() => {
    if (playerProgress?.trackId) {
      const currentTrackId = playerProgress.trackId;
      const lastTrackId = track?.id || lastTrackUri?.split(':').pop();
      
      console.log('🔍 Checking track change:', {
        currentTrackId,
        lastTrackId,
        trackId: track?.id,
        lastTrackUri,
        playerProgressTrackId: playerProgress.trackId,
        isPlaying: playerProgress.isPlaying,
        progress: playerProgress.progress,
        duration: playerProgress.duration
      });
      
      // Se o trackId mudou, buscar novo Canvas
      if (currentTrackId !== lastTrackId) {
        console.log('🎵 Track changed detected via player progress:', currentTrackId, '->', lastTrackId);
        if (debugMode) {
          addDebugLog('INFO', `Track changed detected via player progress: ${lastTrackId} -> ${currentTrackId}`);
          addDebugLog('INFO', `New track progress: ${Math.round(playerProgress.progress/1000)}s/${Math.round(playerProgress.duration/1000)}s, playing: ${playerProgress.isPlaying}`);
        }
        fetchCanvas();
      } else {
        // Mesmo track, mas verificar se é uma nova reprodução (progresso baixo)
        if (playerProgress.progress < 5000 && lastTrackId) { // Menos de 5 segundos
          console.log('🔄 Same track but low progress - might be a new play');
          if (debugMode) {
            addDebugLog('INFO', `Same track but low progress (${Math.round(playerProgress.progress/1000)}s) - might be a new play`);
          }
          // Não buscar novo canvas, mas atualizar o estado se necessário
        } else {
          console.log('✅ Same track, no change detected');
        }
      }
    } else if (playerProgress && !playerProgress.trackId && lastTrackUri) {
      // Se não há trackId mas havia uma música antes, pode ter parado
      console.log('⏸️ No track playing detected via player progress');
      if (debugMode) {
        addDebugLog('INFO', 'No track playing detected via player progress');
      }
      setTrack(null);
      setCanvasData(null);
      setLastTrackUri(null);
      setError(null);
    }
  }, [playerProgress?.trackId, playerProgress?.progress, playerProgress?.isPlaying, track?.id, lastTrackUri, debugMode, addDebugLog, fetchCanvas]);

  // Polling to check for track changes
  useEffect(() => {
    // Não fazer polling automático para Canvas quando temos player progress
    // O Canvas só deve ser buscado quando a música mudar via player progress
    if (trackId) {
      console.log('🎯 Specific track detected - no polling needed');
    } else if (playerProgress) {
      console.log('🎵 Canvas will be fetched only when track changes via player progress');
    } else if (autoUpdate) {
      // Só fazer polling se não temos player progress e autoUpdate está ativo
      console.log('🔄 Canvas polling enabled (no player progress available)');
      
      // Fetch inicial
      fetchCanvas();
      
      // Polling
      pollingIntervalRef.current = setInterval(() => {
        fetchCanvas();
      }, pollingInterval);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    } else {
      console.log('🎵 Canvas will be fetched only when track changes');
    }
  }, [trackId, playerProgress, autoUpdate, pollingInterval, fetchCanvas]);

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