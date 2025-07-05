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
  accessToken: string | null;
  enabled: boolean;
  debugMode: boolean;
  addDebugLog: (type: string, message: string) => void;
}

export const useLyricsFetch = ({
  trackId,
  albumImageUrl,
  accessToken,
  enabled,
  debugMode,
  addDebugLog
}: UseLyricsFetchOptions) => {
  const [lyrics, setLyrics] = useState<Lyrics | null>(null);
  const [colors, setColors] = useState<Colors | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLyrics = useCallback(async () => {
    if (!enabled || !trackId || !accessToken) {
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
          accessToken,
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
      
      setLyrics(data.lyrics);
      setColors(data.colors);
      
      if (debugMode) {
        addDebugLog('LYRICS', `Lyrics loaded: ${data.lyrics?.lines?.length || 0} lines`);
        addDebugLog('LYRICS', `Provider: ${data.lyrics?.providerDisplayName || 'Unknown'}`);
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
  }, [trackId, albumImageUrl, accessToken, enabled, debugMode, addDebugLog]);

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