import { useSearchParams } from 'next/navigation';
import { getTranslation, type Language } from '../lib/i18n';

interface CanvasParams {
  // Music search settings
  trackId: string | null;
  autoUpdate: boolean;
  pollingInterval: number;
  
  // Display settings
  showCanvas: boolean;
  showTrackInfo: boolean;
  showLyrics: boolean;
  lyricsMode: '5lines' | 'left';
  
  // UI settings
  language: string;
  
  // Debug settings
  debugMode: boolean;
  videoTimeout: number;
  maxDebugLogs: number;
  
  // Translations
  t: ReturnType<typeof getTranslation>;
}

export const useCanvasParams = (): CanvasParams => {
  const searchParams = useSearchParams();
  
  // Music search settings
  const trackId = searchParams.get('trackId');
  const autoUpdate = searchParams.get('autoUpdate') !== 'false';
  const pollingInterval = parseInt(searchParams.get('pollingInterval') || '5000');
  
  // Display settings
  const showCanvas = searchParams.get('showCanvas') !== 'false';
  const showTrackInfo = searchParams.get('info') !== 'false';
  const showLyrics = searchParams.get('lyrics') === 'true';
  const lyricsMode = (searchParams.get('lyricsMode') as '5lines' | 'left') || '5lines';
  
  // UI settings
  const language = (searchParams.get('lang') as Language) || 'en';
  
  // Debug settings
  const debugMode = searchParams.get('debug') === 'true';
  const videoTimeout = parseInt(searchParams.get('videoTimeout') || '10000');
  const maxDebugLogs = parseInt(searchParams.get('logLimit') || '50');

  const t = getTranslation(language);

  return {
    trackId,
    autoUpdate,
    pollingInterval,
    showCanvas,
    showTrackInfo,
    showLyrics,
    lyricsMode,
    language,
    debugMode,
    videoTimeout,
    maxDebugLogs,
    t
  };
}; 