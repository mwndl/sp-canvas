'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Track {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  uri: string;
}

type ScreensaverMode = 'static' | 'fade' | 'dvd';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [trackId, setTrackId] = useState('');
  const [mode, setMode] = useState<ScreensaverMode>('static');
  const [fadeInterval, setFadeInterval] = useState(3000);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const router = useRouter();

  const fetchCanvas = async (specificTrackId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let url = '/api/spotify/canvas';
      if (specificTrackId) {
        url += `?trackUri=spotify:track:${specificTrackId}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch canvas');
      }

      const data = await response.json();
      setTrack(data.track);
      
      // Navigate to canvas display with mode parameters
      const canvasUrl = new URL('/canvas', window.location.origin);
      if (mode !== 'static') {
        canvasUrl.searchParams.set('mode', mode);
        if (mode === 'fade') {
          canvasUrl.searchParams.set('fadeInterval', fadeInterval.toString());
        }
      }
      if (!autoUpdate) {
        canvasUrl.searchParams.set('autoUpdate', 'false');
      }
      router.push(canvasUrl.toString());
    } catch (err) {
      console.error('Error fetching canvas:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackId.trim()) {
      fetchCanvas(trackId.trim());
    }
  };

  const handleCurrentTrack = () => {
    fetchCanvas();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SpCanvas</h1>
          <p className="text-gray-600">Spotify Canvas Screensaver</p>
        </div>

        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Como usar:</h3>
            <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
              <li>Insira o Track ID da música do Spotify</li>
              <li>Ou clique em &quot;Música Atual&quot; para usar a música que está tocando</li>
              <li>O Track ID pode ser encontrado na URL do Spotify</li>
              <li>Exemplo: spotify.com/track/<strong>4iV5W9uYEdYUVa79Axb7Rh</strong></li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="trackId" className="block text-sm font-medium text-gray-700 mb-2">
                Track ID (opcional)
              </label>
              <input
                type="text"
                id="trackId"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="Ex: 4iV5W9uYEdYUVa79Axb7Rh"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modo de Screensaver (quando não há Canvas)
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    value="static"
                    checked={mode === 'static'}
                    onChange={(e) => setMode(e.target.value as ScreensaverMode)}
                    className="mr-2"
                  />
                  <span className="text-sm">Estático (padrão)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    value="fade"
                    checked={mode === 'fade'}
                    onChange={(e) => setMode(e.target.value as ScreensaverMode)}
                    className="mr-2"
                  />
                  <span className="text-sm">Fade In/Out</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    value="dvd"
                    checked={mode === 'dvd'}
                    onChange={(e) => setMode(e.target.value as ScreensaverMode)}
                    className="mr-2"
                  />
                  <span className="text-sm">Movimento DVD</span>
                </label>
              </div>
            </div>

            {mode === 'fade' && (
              <div>
                <label htmlFor="fadeInterval" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Atualizar automaticamente quando a música mudar (a cada 5s)
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Só funciona quando usando &quot;Música Atual&quot;
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading || !trackId.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {isLoading ? 'Carregando...' : 'Buscar Canvas'}
              </button>

              <button
                type="button"
                onClick={handleCurrentTrack}
                disabled={isLoading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {isLoading ? 'Carregando...' : 'Música Atual'}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {track && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Música atual:</h3>
              <div className="flex items-center space-x-3">
                {track.album.images[0] && (
                  <img
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    className="w-12 h-12 rounded"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-800">{track.name}</p>
                  <p className="text-sm text-gray-600">
                    {track.artists.map(artist => artist.name).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
