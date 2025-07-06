'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTranslation, formatTranslation, type Language } from '../lib/i18n';
import HowToUseModal from '../components/HowToUseModal';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

      router.push(canvasUrl.toString());
    } catch (err) {
      console.error('Error starting screensaver:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-6xl w-full border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{t.title}</h1>
            <p className="text-gray-300 text-lg">{t.subtitle}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="pt">🇧🇷 Português</option>
              <option value="en">🇺🇸 English</option>
            </select>

            {/* How to use button */}
            <button
              onClick={() => setShowHowToUse(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {t.howToUse}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Basic Settings */}
          <div className="space-y-6">
            {/* Music Search Section */}
            <div className="bg-gray-700 border border-gray-600 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                {t.musicSearch}
              </h3>
              
              <div className="space-y-4">
                {/* Search Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    {t.searchMode}
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-2 rounded-lg hover:bg-gray-600 transition-colors">
                      <input
                        type="radio"
                        name="searchMode"
                        value="auto"
                        checked={searchMode === 'auto'}
                        onChange={(e) => setSearchMode(e.target.value as 'auto' | 'specific')}
                        className="mr-3 accent-blue-400"
                      />
                      <span className="text-sm text-gray-300">{t.autoDetect}</span>
                    </label>
                    <label className="flex items-center p-2 rounded-lg hover:bg-gray-600 transition-colors">
                      <input
                        type="radio"
                        name="searchMode"
                        value="specific"
                        checked={searchMode === 'specific'}
                        onChange={(e) => setSearchMode(e.target.value as 'auto' | 'specific')}
                        className="mr-3 accent-blue-400"
                      />
                      <span className="text-sm text-gray-300">{t.specificTrack}</span>
                    </label>
                  </div>
                </div>

                {/* Track ID Input */}
                {searchMode === 'specific' && (
                  <div>
                    <label htmlFor="trackId" className="block text-sm font-medium text-gray-300 mb-2">
                      {t.trackId}
                    </label>
                    <input
                      type="text"
                      id="trackId"
                      value={trackId}
                      onChange={(e) => setTrackId(e.target.value)}
                      placeholder={language === 'pt' ? 'ID ou URL do Spotify' : 'ID or Spotify URL'}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {t.trackIdHelp}
                    </p>
                  </div>
                )}

                {/* Auto Update Settings */}
                {searchMode === 'auto' && (
                  <div>
                    <label className="flex items-center p-2 rounded-lg hover:bg-gray-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={autoUpdate}
                        onChange={(e) => setAutoUpdate(e.target.checked)}
                        className="mr-3 accent-blue-400"
                      />
                      <span className="text-sm font-medium text-gray-300">
                        {t.autoUpdate}
                      </span>
                    </label>
                    
                    {autoUpdate && (
                      <div className="mt-3 ml-5">
                        <label htmlFor="pollingInterval" className="block text-sm font-medium text-gray-300 mb-2">
                          {t.updateInterval}
                        </label>
                        <input
                          type="number"
                          id="pollingInterval"
                          value={pollingInterval}
                          onChange={(e) => setPollingInterval(parseInt(e.target.value) || 5)}
                          min="1"
                          max="60"
                          step="1"
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTranslation(t.updateIntervalHelp, {
                            interval: pollingInterval,
                            plural: pollingInterval !== 1 ? t.seconds : t.second
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Display Options */}
            <div className="bg-gray-700 border border-gray-600 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                Exibição
              </h3>
              
              <div className="space-y-4">
                {/* Canvas Toggle */}
                <label className="flex items-center p-2 rounded-lg hover:bg-gray-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={showCanvas}
                    onChange={(e) => setShowCanvas(e.target.checked)}
                    className="mr-3 accent-blue-400"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-300 block">
                      Show Canvas
                    </span>
                    <span className="text-xs text-gray-400">
                      Exibir Canvas do Spotify quando disponível
                    </span>
                  </div>
                </label>

                {/* Track Info (visible when Canvas is enabled) */}
                {showCanvas && (
                  <div className="ml-5">
                    <label className="flex items-center p-2 rounded-lg hover:bg-gray-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={showTrackInfo}
                        onChange={(e) => setShowTrackInfo(e.target.checked)}
                        className="mr-3 accent-blue-400"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-300 block">
                          {t.showTrackInfo}
                        </span>
                        <span className="text-xs text-gray-400">
                          {t.showTrackInfoHelp}
                        </span>
                      </div>
                    </label>
                  </div>
                )}

                {/* Lyrics Toggle */}
                <label className="flex items-center p-2 rounded-lg hover:bg-gray-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={showLyrics}
                    onChange={(e) => setShowLyrics(e.target.checked)}
                    className="mr-3 accent-blue-400"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-300 block">
                      {t.lyrics}
                    </span>
                    <span className="text-xs text-gray-400">
                      {t.lyricsHelp}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Advanced Settings */}
          <div className="space-y-6">
            {/* Lyrics Settings */}
            {showLyrics && (
              <div className="bg-gray-700 border border-gray-600 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4 flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  {t.lyrics}
                </h3>
                
                <div className="space-y-4">
                  {/* Lyrics Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      {t.lyricsMode}
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center p-2 rounded-lg hover:bg-gray-600 transition-colors">
                        <input
                          type="radio"
                          name="lyricsMode"
                          value="5lines"
                          checked={lyricsMode === '5lines'}
                          onChange={(e) => setLyricsMode(e.target.value as '5lines' | 'left')}
                          className="mr-3 accent-blue-400"
                        />
                        <span className="text-sm text-gray-300">{t.lyricsMode5Lines}</span>
                      </label>
                      <label className="flex items-center p-2 rounded-lg hover:bg-gray-600 transition-colors">
                        <input
                          type="radio"
                          name="lyricsMode"
                          value="left"
                          checked={lyricsMode === 'left'}
                          onChange={(e) => setLyricsMode(e.target.value as '5lines' | 'left')}
                          className="mr-3 accent-blue-400"
                        />
                        <span className="text-sm text-gray-300">{t.lyricsModeLeft}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state for right column when no advanced options */}
            {!showLyrics && (
              <div className="bg-gray-700 border border-gray-600 rounded-xl p-6 flex items-center justify-center h-full min-h-[200px]">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-2">⚙️</div>
                  <p className="text-sm">Ative as letras para ver opções avançadas</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Start Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={startScreensaver}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
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
