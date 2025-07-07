import { useSearchParams } from 'next/navigation';
import { getTranslation, type Language } from '../lib/i18n';

interface CanvasParams {
  // Mode
  mode: 'standard' | 'screensaver';
  
  // Music search settings
  trackId: string | null;
  autoUpdate: boolean;
  pollingInterval: number;
  
  // Display settings
  showCanvas: boolean;
  showTrackInfo: boolean;
  showLyrics: boolean;
  lyricsMode: '5lines' | 'left';
  
  // Screen Saver settings
  displayMode: 'album1' | 'album2' | 'clock';
  clockMode: '12h' | '24h';
  timezone: string;
  showDate: boolean;
  showTrackInfoInClock: boolean;
  movement: 'fade' | 'dvd' | 'static';
  fadeSpeed: number;
  
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
  
  // Mode
  const mode = (searchParams.get('mode') as 'standard' | 'screensaver') || 'standard';
  
  // Music search settings
  const trackId = searchParams.get('trackId');
  // Desabilitar autoUpdate por padrão quando não há trackId específico (usamos player progress)
  const autoUpdate = searchParams.get('autoUpdate') === 'true';
  const pollingInterval = parseInt(searchParams.get('pollingInterval') || '5000');
  
  // Display settings
  const showCanvas = searchParams.get('showCanvas') !== 'false';
  const showTrackInfo = searchParams.get('info') !== 'false';
  const showLyrics = searchParams.get('lyrics') === 'true';
  const lyricsMode = (searchParams.get('lyricsMode') as '5lines' | 'left') || '5lines';
  
  // Screen Saver settings
  const displayMode = (searchParams.get('displayMode') as 'album1' | 'album2' | 'clock') || 'album1';
  const clockMode = (searchParams.get('clockMode') as '12h' | '24h') || '24h';
  const timezone = searchParams.get('timezone') || 'UTC-3';
  const showDate = searchParams.get('showDate') !== 'false';
  const showTrackInfoInClock = searchParams.get('showTrackInfo') !== 'false';
  const movement = (searchParams.get('movement') as 'fade' | 'dvd' | 'static') || 'fade';
  const fadeSpeed = parseFloat(searchParams.get('fadeSpeed') || '2');
  
  // UI settings
  const language = (searchParams.get('lang') as Language) || 'en';
  
  // Debug settings
  const debugMode = searchParams.get('debug') === 'true';
  const videoTimeout = parseInt(searchParams.get('videoTimeout') || '10000');
  const maxDebugLogs = parseInt(searchParams.get('logLimit') || '50');

  const t = getTranslation(language);

  return {
    mode,
    trackId,
    autoUpdate,
    pollingInterval,
    showCanvas,
    showTrackInfo,
    showLyrics,
    lyricsMode,
    displayMode,
    clockMode,
    timezone,
    showDate,
    showTrackInfoInClock,
    movement,
    fadeSpeed,
    language,
    debugMode,
    videoTimeout,
    maxDebugLogs,
    t
  };
}; 