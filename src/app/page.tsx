'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTranslation, formatTranslation, type Language } from '../lib/i18n';
import HowToUseModal from '../components/HowToUseModal';
import { ScreenSaverSettings, type ScreenSaverConfig } from '../components/ScreenSaverSettings';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mode selection
  const [mode, setMode] = useState<'standard' | 'screensaver'>('standard');
  
  // Screen Saver settings
  const [screenSaverConfig, setScreenSaverConfig] = useState<ScreenSaverConfig>({
    displayMode: 'album1',
    clockMode: '24h',
    timezone: 'UTC-3',
    showDate: true,
    showTrackInfo: true,
    movement: 'fade',
    fadeSpeed: 15
  });
  
  // Music search settings
  const [searchMode, setSearchMode] = useState<'auto' | 'specific'>('auto');
  const [trackId, setTrackId] = useState('');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [pollingInterval, setPollingInterval] = useState(5);
  
  // Display settings
  const [showCanvas, setShowCanvas] = useState(true);
  const [showTrackInfo, setShowTrackInfo] = useState(true);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyricsMode, setLyricsMode] = useState<'5lines' | 'left'>('5lines');
  
  // UI settings
  const [language, setLanguage] = useState<Language>('en');
  const [showHowToUse, setShowHowToUse] = useState(false);
  
  const router = useRouter();
  const t = getTranslation(language);

  // Função para extrair Track ID de URLs do Spotify
  const extractTrackId = (input: string): string => {
    const cleanInput = input.trim();
    
    const patterns = [
      /spotify\.com\/track\/([a-zA-Z0-9]+)/,
      /open\.spotify\.com\/track\/([a-zA-Z0-9]+)/,
      /spotify\.com\/[a-z-]+\/track\/([a-zA-Z0-9]+)/,
      /open\.spotify\.com\/[a-z-]+\/track\/([a-zA-Z0-9]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = cleanInput.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return cleanInput;
  };

  const startScreensaver = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (searchMode === 'specific' && !trackId.trim()) {
        setError('Por favor, insira um Track ID válido');
        setIsLoading(false);
        return;
      }

      const canvasUrl = new URL('/canvas', window.location.origin);
      
      // Mode
      canvasUrl.searchParams.set('mode', mode);
      
      // Screen Saver settings
      if (mode === 'screensaver') {
        canvasUrl.searchParams.set('displayMode', screenSaverConfig.displayMode);
        canvasUrl.searchParams.set('clockMode', screenSaverConfig.clockMode);
        canvasUrl.searchParams.set('timezone', screenSaverConfig.timezone);
        canvasUrl.searchParams.set('showDate', screenSaverConfig.showDate.toString());
        canvasUrl.searchParams.set('showTrackInfo', screenSaverConfig.showTrackInfo.toString());
        canvasUrl.searchParams.set('movement', screenSaverConfig.movement);
        canvasUrl.searchParams.set('fadeSpeed', screenSaverConfig.fadeSpeed.toString());
      }
      
      // Canvas settings
      canvasUrl.searchParams.set('showCanvas', showCanvas.toString());
      canvasUrl.searchParams.set('info', showTrackInfo.toString());
      
      // Music search settings
      if (searchMode === 'auto') {
        canvasUrl.searchParams.set('autoUpdate', autoUpdate.toString());
        if (autoUpdate) {
          canvasUrl.searchParams.set('pollingInterval', (pollingInterval * 1000).toString());
        }
      }
      
      // Lyrics settings
      canvasUrl.searchParams.set('lyrics', showLyrics.toString());
      if (showLyrics) {
        canvasUrl.searchParams.set('lyricsMode', lyricsMode);
      }
      
      // Language
      canvasUrl.searchParams.set('lang', language);
      
      // Track ID for specific mode
      if (searchMode === 'specific' && trackId.trim()) {
        const extractedTrackId = extractTrackId(trackId);
        canvasUrl.searchParams.set('trackId', extractedTrackId);
      }

      console.log('Starting screensaver with URL:', canvasUrl.toString());
      router.push(canvasUrl.toString());
    } catch (err) {
      console.error('Error starting screensaver:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">{t.title}</h1>
            
            <div className="flex items-center space-x-3">
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="pt">🇧🇷</option>
                <option value="en">🇺🇸</option>
              </select>

              {/* How to use button */}
              <button
                onClick={() => setShowHowToUse(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              >
                {t.howToUse}
              </button>
            </div>
          </div>
          <p className="text-gray-400 text-sm">{t.subtitle}</p>
        </div>

        {/* Mode Selection */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-medium mb-3">Modo de Operação</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode('standard')}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                mode === 'standard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Padrão
            </button>
            <button
              onClick={() => setMode('screensaver')}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                mode === 'screensaver'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Screen Saver
            </button>
          </div>
        </div>

        {/* Settings List */}
        {mode === 'standard' ? (
          <div className="divide-y divide-gray-700">
            {/* Show Canvas */}
          <div className="flex items-center justify-between p-4 hover:bg-gray-750 transition-colors">
            <div className="flex-1">
              <h3 className="text-white font-medium">Show Canvas</h3>
              <p className="text-gray-400 text-sm">Exibir Canvas do Spotify quando disponível</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showCanvas}
                onChange={(e) => setShowCanvas(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Show Track Info */}
          {showCanvas && (
            <div className="flex items-center justify-between p-4 hover:bg-gray-750 transition-colors bg-gray-750/30">
              <div className="flex-1">
                <h3 className="text-white font-medium">Show track info on Canvas</h3>
                <p className="text-gray-400 text-sm">Exibir informações da música sobre o Canvas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTrackInfo}
                  onChange={(e) => setShowTrackInfo(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          )}

          {/* Show Lyrics */}
          <div className="flex items-center justify-between p-4 hover:bg-gray-750 transition-colors">
            <div className="flex-1">
              <h3 className="text-white font-medium">Show Lyrics</h3>
              <p className="text-gray-400 text-sm">Exibir letras da música sincronizadas</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showLyrics}
                onChange={(e) => setShowLyrics(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Lyrics Mode */}
          {showLyrics && (
            <div className="p-4 bg-gray-750/30">
              <h3 className="text-white font-medium mb-3">Lyrics Mode</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="lyricsMode"
                    value="5lines"
                    checked={lyricsMode === '5lines'}
                    onChange={(e) => setLyricsMode(e.target.value as '5lines' | 'left')}
                    className="mr-3 accent-blue-400"
                  />
                  <span className="text-gray-300">5 lines (centered)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="lyricsMode"
                    value="left"
                    checked={lyricsMode === 'left'}
                    onChange={(e) => setLyricsMode(e.target.value as '5lines' | 'left')}
                    className="mr-3 accent-blue-400"
                  />
                  <span className="text-gray-300">Left aligned</span>
                </label>
              </div>
            </div>
          )}

          {/* Music Detection */}
          <div className="p-4 hover:bg-gray-750 transition-colors">
            <h3 className="text-white font-medium mb-3">Music Detection</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchMode"
                  value="auto"
                  checked={searchMode === 'auto'}
                  onChange={(e) => setSearchMode(e.target.value as 'auto' | 'specific')}
                  className="mr-3 accent-blue-400"
                />
                <span className="text-gray-300">Auto detect current track</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchMode"
                  value="specific"
                  checked={searchMode === 'specific'}
                  onChange={(e) => setSearchMode(e.target.value as 'auto' | 'specific')}
                  className="mr-3 accent-blue-400"
                />
                <span className="text-gray-300">Search specific track</span>
              </label>
              
              {/* Track ID Input */}
              {searchMode === 'specific' && (
                <div className="ml-6 mt-3">
                  <input
                    type="text"
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                    placeholder="Spotify Track ID or URL"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Update Interval */}
          {searchMode === 'auto' && (
            <div className="flex items-center justify-between p-4 hover:bg-gray-750 transition-colors">
              <div className="flex-1">
                <h3 className="text-white font-medium">Update Interval</h3>
                <p className="text-gray-400 text-sm">Check for new tracks every X seconds</p>
              </div>
              <input
                type="number"
                value={pollingInterval}
                onChange={(e) => setPollingInterval(parseInt(e.target.value) || 5)}
                min="1"
                max="60"
                step="1"
                className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          )}
        </div>
        ) : (
          <ScreenSaverSettings 
            config={screenSaverConfig}
            onConfigChange={setScreenSaverConfig}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-900/20 border-t border-red-700">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Start Button */}
        <div className="p-6 border-t border-gray-700">
          <button
            onClick={startScreensaver}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg text-lg font-semibold transition-colors disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Carregando...</span>
              </>
            ) : (
              <span>{t.startScreensaver}</span>
            )}
          </button>
        </div>

        {/* How to use modal */}
        {showHowToUse && (
          <HowToUseModal
            isOpen={showHowToUse}
            onClose={() => setShowHowToUse(false)}
            language={language}
          />
        )}
      </div>
    </div>
  );
}
