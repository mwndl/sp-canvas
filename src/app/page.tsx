'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ScreensaverMode = 'static' | 'fade' | 'dvd';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ScreensaverMode>('static');
  const [fadeInterval, setFadeInterval] = useState(3000);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [searchMode, setSearchMode] = useState<'auto' | 'specific'>('auto');
  const [trackId, setTrackId] = useState('');
  const router = useRouter();

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
      
      // Adicionar parâmetros de configuração
      if (mode !== 'static') {
        canvasUrl.searchParams.set('mode', mode);
        if (mode === 'fade') {
          canvasUrl.searchParams.set('fadeInterval', fadeInterval.toString());
        }
      }
      if (!autoUpdate) {
        canvasUrl.searchParams.set('autoUpdate', 'false');
      }
      
      // Adicionar Track ID se for modo específico
      if (searchMode === 'specific' && trackId.trim()) {
        canvasUrl.searchParams.set('trackUri', `spotify:track:${trackId.trim()}`);
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
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SpCanvas</h1>
          <p className="text-gray-300 text-lg">Spotify Canvas Screensaver</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-700 border border-gray-600 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-2">Configurações</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Buscar Música
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
                    <span className="text-sm text-gray-300">Detectar automaticamente</span>
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
                    <span className="text-sm text-gray-300">Buscar faixa específica</span>
                  </label>
                </div>
              </div>

              {searchMode === 'specific' && (
                <div>
                  <label htmlFor="trackId" className="block text-sm font-medium text-gray-300 mb-2">
                    Track ID
                  </label>
                  <input
                    type="text"
                    id="trackId"
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                    placeholder="Ex: 4iV5W9uYEdYUVa79Axb7Rh"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Encontre o Track ID na URL do Spotify: spotify.com/track/[ID]
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modo de Screensaver
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
                    <span className="text-sm text-gray-300">Estático</span>
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
                    <span className="text-sm text-gray-300">Fade In/Out</span>
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
                    <span className="text-sm text-gray-300">Movimento DVD</span>
                  </label>
                </div>
              </div>

              {mode === 'fade' && (
                <div>
                  <label htmlFor="fadeInterval" className="block text-sm font-medium text-gray-300 mb-2">
                    Intervalo do Fade (ms)
                  </label>
                  <input
                    type="number"
                    id="fadeInterval"
                    value={fadeInterval}
                    onChange={(e) => setFadeInterval(parseInt(e.target.value) || 3000)}
                    min="1000"
                    max="10000"
                    step="500"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoUpdate}
                    onChange={(e) => setAutoUpdate(e.target.checked)}
                    disabled={searchMode === 'specific'}
                    className="mr-2 accent-blue-400 disabled:opacity-50"
                  />
                  <span className={`text-sm font-medium ${searchMode === 'specific' ? 'text-gray-500' : 'text-gray-300'}`}>
                    Atualizar automaticamente (a cada 5s)
                  </span>
                </label>
                {searchMode === 'specific' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-update desabilitado para faixas específicas
                  </p>
                )}
              </div>
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
                Iniciando...
              </div>
            ) : (
              searchMode === 'auto' ? 'Iniciar Screensaver' : 'Buscar e Iniciar'
            )}
          </button>

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-xl p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-400">
              Pressione ESC para sair do screensaver
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
