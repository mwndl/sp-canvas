import { useSearchParams } from 'next/navigation';
import { getTranslation, type Language } from '../lib/i18n';

type ScreensaverMode = 'static' | 'fade' | 'dvd';

type LyricsBgMode = 'theme' | 'fixed' | 'cover';

interface CanvasParams {
  trackUri: string;
  language: string;
  mode: ScreensaverMode;
  fadeInterval: number;
  showTrackInfo: boolean;
  showLyrics: boolean;
  lyricsMode: '5lines' | 'left';
  backgroundMode: 'theme' | 'fixed' | 'cover';
  fixedColor: string;
  debugMode: boolean;
  videoTimeout: number;
  maxDebugLogs: number;
  autoUpdate: boolean;
  pollingInterval: number;
  trackId: string | null;
  t: ReturnType<typeof getTranslation>;
}

export const useCanvasParams = (): CanvasParams => {
  const searchParams = useSearchParams();
  
  // Get track URI from URL
  const trackUri = searchParams.get('track') || '';
  
  // Get screensaver mode from URL
  const mode = (searchParams.get('mode') as ScreensaverMode) || 'static';
  const fadeInterval = parseInt(searchParams.get('fade') || '3000');
  const showTrackInfo = searchParams.get('info') !== 'false';
  const language = (searchParams.get('lang') as Language) || 'en';
  
  // Debug settings
  const debugMode = searchParams.get('debug') === 'true';
  const videoTimeout = parseInt(searchParams.get('videoTimeout') || '10000');
  const maxDebugLogs = parseInt(searchParams.get('logLimit') || '50');
  const autoUpdate = searchParams.get('autoUpdate') !== 'false';
  const pollingInterval = parseInt(searchParams.get('pollingInterval') || '5000'); // Aumentado para 5s
  const trackId = searchParams.get('trackId');

  // Lyrics params
  const showLyrics = searchParams.get('lyrics') !== 'false';
  const lyricsMode = (searchParams.get('lyricsMode') as '5lines' | 'left') || '5lines';
  const backgroundMode = (searchParams.get('bgMode') as 'theme' | 'fixed' | 'cover') || 'theme';
  const fixedColor = searchParams.get('bgColor') || '#000000';

  const t = getTranslation(language);

  return {
    trackUri,
    language,
    mode,
    fadeInterval,
    showTrackInfo,
    showLyrics,
    lyricsMode,
    backgroundMode,
    fixedColor,
    debugMode,
    videoTimeout,
    maxDebugLogs,
    autoUpdate,
    pollingInterval,
    trackId,
    t
  };
}; 