'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTranslation, formatTranslation, type Language } from '../lib/i18n';
import HowToUseModal from '../components/HowToUseModal';

type ScreensaverMode = 'static' | 'fade' | 'dvd';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ScreensaverMode>('static');
  const [fadeInterval, setFadeInterval] = useState(3); // em segundos
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [pollingInterval, setPollingInterval] = useState(5); // em segundos
  const [searchMode, setSearchMode] = useState<'auto' | 'specific'>('auto');
  const [trackId, setTrackId] = useState('');
  const [showTrackInfo, setShowTrackInfo] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  const [showHowToUse, setShowHowToUse] = useState(false);
  const router = useRouter();

  const t = getTranslation(language);

  // Função para extrair Track ID de URLs do Spotify
  const extractTrackId = (input: string): string => {
    // Remover espaços em branco
    const cleanInput = input.trim();
    
    // Padrões para URLs do Spotify
    const patterns = [
      /spotify\.com\/track\/([a-zA-Z0-9]+)/, // spotify.com/track/ID
      /open\.spotify\.com\/track\/([a-zA-Z0-9]+)/, // open.spotify.com/track/ID
      /spotify\.com\/[a-z-]+\/track\/([a-zA-Z0-9]+)/, // spotify.com/xx-xx/track/ID
      /open\.spotify\.com\/[a-z-]+\/track\/([a-zA-Z0-9]+)/, // open.spotify.com/xx-xx/track/ID
    ];
    
    // Tentar extrair usando os padrões
    for (const pattern of patterns) {
      const match = cleanInput.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Se não encontrou padrão de URL, retornar o input como está (assumindo que é um Track ID direto)
    return cleanInput;
  };

  const startScreensaver = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Se for modo específico, validar se tem Track ID
      if (searchMode === 'specific' && !trackId.trim()) {
        setError('Por favor, insira um Track ID válido');
        setIsLoading(false);
        return;
      }

      // Construir URL com todos os parâmetros
      const canvasUrl = new URL('/canvas', window.location.origin);
      
      // Adicionar parâmetros de configuração com siglas
      if (mode !== 'static') {
        canvasUrl.searchParams.set('mode', mode);
        if (mode === 'fade') {
          canvasUrl.searchParams.set('fade', (fadeInterval * 1000).toString());
        }
      }
      if (searchMode === 'auto') {
        if (!autoUpdate) {
          canvasUrl.searchParams.set('auto', 'false');
        }
        if (autoUpdate) {
          canvasUrl.searchParams.set('poll', (pollingInterval * 1000).toString());
        }
      }
      
      // Adicionar configuração de exibir informações da faixa
      if (!showTrackInfo) {
        canvasUrl.searchParams.set('info', 'false');
      }
      
      // Adicionar idioma
      canvasUrl.searchParams.set('lang', language);
      
      // Adicionar Track ID se for modo específico
      if (searchMode === 'specific' && trackId.trim()) {
        const extractedTrackId = extractTrackId(trackId);
        canvasUrl.searchParams.set('trackid', extractedTrackId);
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
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full border border-gray-700 relative">
        {/* Language Selector */}
        <div className="absolute top-4 right-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="pt">🇧🇷 Português</option>
            <option value="en">🇺🇸 English</option>
          </select>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-gray-300 text-lg">{t.subtitle}</p>
        </div>

        <div className="space-y-6">
          {/* Seção: Busca de Música */}
          <div className="bg-gray-700 border border-gray-600 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              {t.musicSearch}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.searchMode}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="searchMode"
                      value="auto"
                      checked={searchMode === 'auto'}
                      onChange={(e) => setSearchMode(e.target.value as 'auto' | 'specific')}
                      className="mr-2 accent-blue-400"
                    />
                    <span className="text-sm text-gray-300">{t.autoDetect}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="searchMode"
                      value="specific"
                      checked={searchMode === 'specific'}
                      onChange={(e) => setSearchMode(e.target.value as 'auto' | 'specific')}
                      className="mr-2 accent-blue-400"
                    />
                    <span className="text-sm text-gray-300">{t.specificTrack}</span>
                  </label>
                </div>
              </div>

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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {t.trackIdHelp}
                  </p>
                </div>
              )}

              {searchMode === 'auto' && (
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={autoUpdate}
                      onChange={(e) => setAutoUpdate(e.target.checked)}
                      className="mr-2 accent-blue-400"
                    />
                    <span className="text-sm font-medium text-gray-300">
                      {t.autoUpdate}
                    </span>
                  </label>
                  
                  {autoUpdate && (
                    <div className="mt-3">
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
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
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

          {/* Seção: Canvas */}
          <div className="bg-gray-700 border border-gray-600 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              {t.canvas}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showTrackInfo}
                    onChange={(e) => setShowTrackInfo(e.target.checked)}
                    className="mr-2 accent-blue-400"
                  />
                  <span className="text-sm font-medium text-gray-300">
                    {t.showTrackInfo}
                  </span>
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  {t.showTrackInfoHelp}
                </p>
              </div>
            </div>
          </div>

          {/* Seção: Fallbacks (Capa do Álbum e Relógio) */}
          <div className="bg-gray-700 border border-gray-600 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-4 flex items-center">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
              {t.fallbacks}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {t.fallbacksDescription}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.displayMode}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="static"
                      checked={mode === 'static'}
                      onChange={(e) => setMode(e.target.value as ScreensaverMode)}
                      className="mr-2 accent-blue-400"
                    />
                    <span className="text-sm text-gray-300">{t.static}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="fade"
                      checked={mode === 'fade'}
                      onChange={(e) => setMode(e.target.value as ScreensaverMode)}
                      className="mr-2 accent-blue-400"
                    />
                    <span className="text-sm text-gray-300">{t.fadeInOut}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="dvd"
                      checked={mode === 'dvd'}
                      onChange={(e) => setMode(e.target.value as ScreensaverMode)}
                      className="mr-2 accent-blue-400"
                    />
                    <span className="text-sm text-gray-300">{t.dvdMovement}</span>
                  </label>
                </div>
              </div>

              {mode === 'fade' && (
                <div>
                  <label htmlFor="fadeInterval" className="block text-sm font-medium text-gray-300 mb-2">
                    {t.fadeInterval}
                  </label>
                  <input
                    type="number"
                    id="fadeInterval"
                    value={fadeInterval}
                    onChange={(e) => setFadeInterval(parseInt(e.target.value) || 3)}
                    min="1"
                    max="30"
                    step="1"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTranslation(t.fadeIntervalHelp, {
                      interval: fadeInterval,
                      plural: fadeInterval !== 1 ? t.seconds : t.second
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={startScreensaver}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t.starting}
              </div>
            ) : (
              searchMode === 'auto' ? t.startScreensaver : t.searchAndStart
            )}
          </button>

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-400">
              {t.pressEscToExit}
            </p>
          </div>

          {/* Links de ajuda e créditos */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-600">
            <button
              onClick={() => setShowHowToUse(true)}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              {language === 'pt' ? 'Como usar' : 'How to use'}
            </button>
            <a
              href="https://marcoswiendl.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
            >
              {language === 'pt' ? 'Desenvolvido por Marcos Wiendl' : 'Developed by Marcos Wiendl'}
            </a>
          </div>
        </div>
      </div>

      {/* Modal de Como Usar */}
      <HowToUseModal
        isOpen={showHowToUse}
        onClose={() => setShowHowToUse(false)}
        language={language}
      />
    </div>
  );
}
