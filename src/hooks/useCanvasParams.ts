import { useSearchParams } from 'next/navigation';
import { getTranslation, type Language } from '../lib/i18n';

type ScreensaverMode = 'static' | 'fade' | 'dvd';

type LyricsBgMode = 'theme' | 'fixed' | 'cover';

interface CanvasParams {
  mode: ScreensaverMode;
  fadeInterval: number;
  autoUpdate: boolean;
  pollingInterval: number;
  showTrackInfo: boolean;
  language: Language;
  debugMode: boolean;
  videoTimeout: number;
  trackId: string | null;
  logLimit: number;
  maxDebugLogs: number;
  t: ReturnType<typeof getTranslation>;
  showLyrics: boolean;
  lyricsBgMode: LyricsBgMode;
  lyricsBgColor: string | null;
}

export const useCanvasParams = (): CanvasParams => {
  const searchParams = useSearchParams();
  
  // Debug settings
  const defaultLogLimit = 50;
  const logLimit = parseInt(searchParams.get('log_limit') || defaultLogLimit.toString());
  const MAX_DEBUG_LOGS = Math.max(10, Math.min(200, logLimit)); // Limit between 10 and 200 logs
  
  // Get screensaver mode from URL
  const mode = (searchParams.get('mode') as ScreensaverMode) || 'static';
  const fadeInterval = parseInt(searchParams.get('fade') || '3000');
  const autoUpdate = searchParams.get('auto') !== 'false';
  const pollingInterval = parseInt(searchParams.get('poll') || '5000');
  const showTrackInfo = searchParams.get('info') !== 'false';
  const language = (searchParams.get('lang') as Language) || 'en';
  const debugMode = searchParams.get('debug') === 'true';
  const videoTimeout = parseInt(searchParams.get('timeout') || '1000');
  const trackId = searchParams.get('trackid');

  // Lyrics params
  const showLyrics = searchParams.get('lyrics') === 'true';
  const lyricsBgMode = (searchParams.get('bgMode') as LyricsBgMode) || 'theme';
  const lyricsBgColor = searchParams.get('bgColor') || null;

  const t = getTranslation(language);

  return {
    mode,
    fadeInterval,
    autoUpdate,
    pollingInterval,
    showTrackInfo,
    language,
    debugMode,
    videoTimeout,
    trackId,
    logLimit,
    maxDebugLogs: MAX_DEBUG_LOGS,
    t,
    showLyrics,
    lyricsBgMode,
    lyricsBgColor
  };
}; 