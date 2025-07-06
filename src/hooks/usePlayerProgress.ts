import { useState, useEffect, useRef } from 'react';

interface PlayerProgress {
  isPlaying: boolean;
  progress: number; // em ms
  trackId: string | null;
  duration: number; // em ms
  timestamp?: number; // timestamp do servidor
}

interface UsePlayerProgressOptions {
  enabled: boolean;
  pollingInterval: number; // em ms
  debugMode: boolean;
  addDebugLog: (type: string, message: string) => void;
}

export const usePlayerProgress = ({
  enabled,
  pollingInterval = 5000, // 5 segundos
  debugMode,
  addDebugLog
}: UsePlayerProgressOptions) => {
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const endOfTrackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const lastUpdateRef = useRef<number>(0);
  const estimatedProgressRef = useRef<PlayerProgress | null>(null);

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
          console.warn('⚠️ Rate limit exceeded (player progress), backing off...');
          if (debugMode) {
            addDebugLog('WARNING', 'Rate limit exceeded (player progress), backing off...');
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
      
      // Salvar dados reais e timestamp
      lastUpdateRef.current = Date.now();
      estimatedProgressRef.current = data;
      
      setPlayerProgress(data);
      
      if (debugMode) {
        const progressSeconds = Math.round(data.progress / 1000);
        const cacheAge = data.timestamp ? Math.round((Date.now() - data.timestamp) / 1000) : 0;
        addDebugLog('PLAYER', `Progress: ${progressSeconds}s, Playing: ${data.isPlaying}, Track: ${data.trackId}, Cache Age: ${cacheAge}s`);
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

  // Função para estimar progresso atual
  const getEstimatedProgress = (): PlayerProgress | null => {
    if (!estimatedProgressRef.current || !estimatedProgressRef.current.isPlaying) {
      return estimatedProgressRef.current;
    }

    const now = Date.now();
    
    // Se temos timestamp do servidor, usar ele para cálculo mais preciso
    if (estimatedProgressRef.current.timestamp) {
      const serverTimeDiff = now - estimatedProgressRef.current.timestamp;
      const estimatedProgress = estimatedProgressRef.current.progress + serverTimeDiff;
      
      return {
        ...estimatedProgressRef.current,
        progress: estimatedProgress,
        timestamp: now // Atualizar timestamp
      };
    } else {
      // Fallback para o método anterior
      const timeSinceUpdate = now - lastUpdateRef.current;
      const estimatedProgress = estimatedProgressRef.current.progress + timeSinceUpdate;

      return {
        ...estimatedProgressRef.current,
        progress: estimatedProgress
      };
    }
  };

  /**
   * Função para agendar pooling após o fim teórico da música
   * 
   * Quando uma música está em reprodução, calculamos quando ela deve acabar
   * e agendamos uma verificação do player para detectar se a música mudou
   * ou se parou. Isso permite atualizar as interfaces imediatamente após
   * o fim da música, sem esperar pelo próximo polling regular.
   */
  const scheduleEndOfTrackPolling = (progress: PlayerProgress) => {
    if (!progress.isPlaying || !progress.duration || !progress.progress) {
      return;
    }

    // Limpar timeout anterior se existir
    if (endOfTrackTimeoutRef.current) {
      clearTimeout(endOfTrackTimeoutRef.current);
      endOfTrackTimeoutRef.current = null;
    }

    // Calcular tempo restante até o fim da música
    const remainingTime = progress.duration - progress.progress;
    
    if (remainingTime > 0) {
      // Adicionar um pequeno buffer (2 segundos) para garantir que a música realmente acabou
      const timeoutDelay = remainingTime + 2000;
      
      if (debugMode) {
        const remainingSeconds = Math.round(remainingTime / 1000);
        const timeoutSeconds = Math.round(timeoutDelay / 1000);
        addDebugLog('SCHEDULE', `Scheduling end-of-track polling in ${timeoutSeconds}s (track ends in ${remainingSeconds}s)`);
      }

      endOfTrackTimeoutRef.current = setTimeout(() => {
        if (debugMode) {
          addDebugLog('POLL', 'Track should have ended, fetching new player progress');
        }
        fetchPlayerProgress();
      }, timeoutDelay);
    }
  };

  // Atualizar progresso estimado a cada 100ms para sincronização suave
  useEffect(() => {
    if (enabled && estimatedProgressRef.current?.isPlaying) {
      const interval = setInterval(() => {
        const estimated = getEstimatedProgress();
        if (estimated) {
          setPlayerProgress(estimated);
          
          // Verificar se chegou perto do fim da música para agendar pooling
          if (estimated.progress >= estimated.duration * 0.95) { // 95% da duração
            scheduleEndOfTrackPolling(estimated);
          }
        }
      }, 100); // Atualizar a cada 100ms para sincronização suave

      return () => clearInterval(interval);
    }
  }, [enabled, estimatedProgressRef.current?.isPlaying]);

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
        if (endOfTrackTimeoutRef.current) {
          clearTimeout(endOfTrackTimeoutRef.current);
        }
      };
    }
  }, [enabled, pollingInterval]);

  // Limpar timeouts quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (endOfTrackTimeoutRef.current) {
        clearTimeout(endOfTrackTimeoutRef.current);
      }
    };
  }, []);

  return {
    playerProgress,
    isLoading,
    error,
    refetch: fetchPlayerProgress,
  };
}; 