import { useState, useEffect, useCallback } from 'react';

interface LyricLine {
  startTimeMs: string;
  words: string;
  syllables: any[];
  endTimeMs: string;
}

interface Lyrics {
  syncType: string;
  lines: LyricLine[];
  provider: string;
  providerLyricsId: string;
  providerDisplayName: string;
  syncLyricsUri: string;
  isDenseTypeface: boolean;
  alternatives: any[];
  language: string;
  isRtlLanguage: boolean;
  capStatus: string;
  previewLines: LyricLine[];
}

interface Colors {
  background: number;
  text: number;
  highlightText: number;
}

interface UseLyricsFetchOptions {
  trackId: string | null;
  albumImageUrl: string | null;
  enabled: boolean;
  debugMode: boolean;
  addDebugLog: (type: string, message: string) => void;
}

export const useLyricsFetch = ({
  trackId,
  albumImageUrl,
  enabled,
  debugMode,
  addDebugLog
}: UseLyricsFetchOptions) => {
  const [lyrics, setLyrics] = useState<Lyrics | null>(null);
  const [colors, setColors] = useState<Colors | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para limpar letras (remover instrumentais falsos e linhas em branco)
  const cleanLyrics = (lyricsData: Lyrics): Lyrics => {
    if (!lyricsData?.lines?.length) return lyricsData;

    const cleanedLines: LyricLine[] = [];
    const originalLines = lyricsData.lines;

    for (let i = 0; i < originalLines.length; i++) {
      const line = originalLines[i];
      
      // Pular linhas em branco (exceto se for a última linha)
      if (line.words.trim() === '' && i < originalLines.length - 1) {
        continue;
      }

      // Verificar se é um instrumental
      if (line.words.trim() === '♪') {
        const startTime = parseInt(line.startTimeMs);
        
        // Encontrar a linha anterior (não instrumental)
        let previousLine = null;
        for (let j = i - 1; j >= 0; j--) {
          if (originalLines[j].words.trim() !== '♪' && originalLines[j].words.trim() !== '') {
            previousLine = originalLines[j];
            break;
          }
        }
        
        // Encontrar a próxima linha (não instrumental)
        let nextLine = null;
        for (let j = i + 1; j < originalLines.length; j++) {
          if (originalLines[j].words.trim() !== '♪' && originalLines[j].words.trim() !== '') {
            nextLine = originalLines[j];
            break;
          }
        }
        
        // Calcular distância entre linhas
        const previousTime = previousLine ? parseInt(previousLine.startTimeMs) : startTime;
        const nextTime = nextLine ? parseInt(nextLine.startTimeMs) : startTime + 10000;
        const timeDistance = nextTime - previousTime;
        
        // Se a distância for menor que 15s, pular este instrumental (é falso)
        if (timeDistance < 15000) {
          continue;
        }
      }
      
      // Adicionar linha válida
      cleanedLines.push(line);
    }

    return {
      ...lyricsData,
      lines: cleanedLines
    };
  };

  const fetchLyrics = useCallback(async () => {
    if (!enabled || !trackId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (debugMode) {
        addDebugLog('LYRICS', `Fetching lyrics for track: ${trackId}`);
      }

      const response = await fetch('/api/spotify/lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackId,
          albumImageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 404) {
          if (debugMode) {
            addDebugLog('LYRICS', 'No lyrics available for this track');
          }
          setLyrics(null);
          setColors(null);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to fetch lyrics');
      }

      const data = await response.json();
      
      // Verificar se as letras estão sincronizadas
      if (data.lyrics && data.lyrics.syncType === 'UNSYNCED') {
        if (debugMode) {
          addDebugLog('LYRICS', 'Lyrics are unsynchronized - not displaying');
        }
        setLyrics(null);
        setColors(null);
        return;
      }
      
      // Limpar letras antes de definir
      const cleanedLyrics = data.lyrics ? cleanLyrics(data.lyrics) : null;
      
      setLyrics(cleanedLyrics);
      setColors(data.colors);
      
      if (debugMode) {
        const originalCount = data.lyrics?.lines?.length || 0;
        const cleanedCount = cleanedLyrics?.lines?.length || 0;
        const removedCount = originalCount - cleanedCount;
        
        addDebugLog('LYRICS', `Lyrics loaded: ${originalCount} lines, cleaned: ${cleanedCount} lines (removed ${removedCount} invalid lines)`);
        addDebugLog('LYRICS', `Provider: ${data.lyrics?.providerDisplayName || 'Unknown'}`);
        addDebugLog('LYRICS', `Sync Type: ${data.lyrics?.syncType || 'Unknown'}`);
      }
    } catch (err) {
      console.error('Error fetching lyrics:', err);
      if (debugMode) {
        addDebugLog('ERROR', `Error fetching lyrics: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [trackId, albumImageUrl, enabled, debugMode, addDebugLog]);

  // Fetch lyrics when dependencies change
  useEffect(() => {
    fetchLyrics();
  }, [fetchLyrics]);

  return {
    lyrics,
    colors,
    isLoading,
    error,
    refetch: fetchLyrics,
  };
}; 