'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTranslation, type Language } from '../../lib/i18n';

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

interface CanvasData {
  canvasesList: Array<{
    id: string;
    canvasUrl: string;
    trackUri: string;
    artist?: {
      artistUri: string;
      artistName: string;
      artistImgUrl: string;
    };
    otherId: string;
    canvasUri: string;
  }>;
}

type ScreensaverMode = 'static' | 'fade' | 'dvd';

export default function CanvasPage() {
  const [track, setTrack] = useState<Track | null>(null);
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [currentCanvasIndex, setCurrentCanvasIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeOpacity, setFadeOpacity] = useState(1);
  const [fadePosition, setFadePosition] = useState({ x: 50, y: 50 });
  const [dvdPosition, setDvdPosition] = useState({ x: 50, y: 50 });
  const [dvdVelocity, setDvdVelocity] = useState({ x: 0.25, y: 0.2 });
  const [lastTrackUri, setLastTrackUri] = useState<string | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Pegar modo do screensaver da URL (usando siglas)
  const mode = (searchParams.get('mode') as ScreensaverMode) || 'static';
  const fadeInterval = parseInt(searchParams.get('fade') || '3000');
  const autoUpdate = searchParams.get('auto') !== 'false';
  const pollingInterval = parseInt(searchParams.get('poll') || '5000');
  const showTrackInfo = searchParams.get('info') !== 'false';
  const language = (searchParams.get('lang') as Language) || 'pt';

  const t = getTranslation(language);

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  const fetchCanvas = async (specificTrackId?: string) => {
    try {
      let url = '/api/spotify/canvas';
      if (specificTrackId) {
        url += `?trackUri=spotify:track:${specificTrackId}`;
        console.log('🎯 Buscando Track ID específico:', specificTrackId);
        console.log('🔗 URL da requisição:', url);
      } else {
        console.log('🎵 Buscando música atual');
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Se não há música tocando E não é um Track ID específico, não é um erro
        if (errorData.error === 'No track currently playing' && !specificTrackId) {
          setTrack(null);
          setCanvasData(null);
          setLastTrackUri(null);
          setError(null);
          console.log('⏰ Nenhuma música tocando - mostrando relógio');
          return;
        }
        
        // Se é um Track ID específico e deu erro, mostrar o erro
        if (specificTrackId) {
          console.error('❌ Erro ao buscar Track ID específico:', errorData.error);
          setError(`Erro ao buscar música: ${errorData.error}`);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to fetch canvas');
      }

      const data = await response.json();
      
      // Verificar se a música mudou
      const currentTrackUri = data.track?.uri || data.trackUri;
      if (currentTrackUri !== lastTrackUri) {
        setTrack(data.track);
        setCanvasData(data.canvas);
        setLastTrackUri(currentTrackUri);
        setCurrentCanvasIndex(0); // Reset canvas index
        setVideoFailed(false); // Reset video failure state
        setRetryCount(0); // Reset retry count
        setError(null); // Limpar qualquer erro anterior
        console.log('🎵 Nova música detectada:', data.track?.name || 'Track ID');
      }
    } catch (err) {
      console.error('Error fetching canvas:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para tentar reproduzir o vídeo
  const tryPlayVideo = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      // Reset video state
      video.currentTime = 0;
      video.load();
      
      // Tentar reproduzir
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✅ Vídeo reproduzindo com sucesso');
            setVideoFailed(false);
            setRetryCount(0);
          })
          .catch((error) => {
            console.error('❌ Falha ao reproduzir vídeo:', error);
            handleVideoFailure();
          });
      }
    }
  };

  // Função para lidar com falha do vídeo
  const handleVideoFailure = () => {
    if (retryCount < 2) { // Tentar até 2 vezes
      console.log(`🔄 Tentativa ${retryCount + 1} de 2 - Tentando novamente em 2 segundos...`);
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        tryPlayVideo();
      }, 2000);
    } else {
      console.log('❌ Vídeo falhou após 2 tentativas - Mostrando capa do álbum');
      setVideoFailed(true);
    }
  };

  // Event listeners para o vídeo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = () => {
      console.error('❌ Erro no vídeo:', video.error);
      handleVideoFailure();
    };

    const handleLoadStart = () => {
      console.log('🔄 Iniciando carregamento do vídeo...');
    };

    const handleCanPlay = () => {
      console.log('✅ Vídeo pronto para reprodução');
    };

    const handleStalled = () => {
      console.log('⚠️ Vídeo travou - tentando recuperar...');
      setTimeout(() => {
        if (video.readyState < 3) { // HAVE_FUTURE_DATA
          handleVideoFailure();
        }
      }, 5000);
    };

    const handleSuspend = () => {
      console.log('⚠️ Carregamento do vídeo suspenso');
      setTimeout(() => {
        if (video.readyState < 2) { // HAVE_CURRENT_DATA
          handleVideoFailure();
        }
      }, 3000);
    };

    const handleAbort = () => {
      console.log('❌ Carregamento do vídeo abortado');
      handleVideoFailure();
    };

    const handleEmptied = () => {
      console.log('⚠️ Vídeo esvaziado - possivel falha');
      setTimeout(() => {
        if (video.readyState === 0) { // HAVE_NOTHING
          handleVideoFailure();
        }
      }, 2000);
    };

    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('suspend', handleSuspend);
    video.addEventListener('abort', handleAbort);
    video.addEventListener('emptied', handleEmptied);

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('suspend', handleSuspend);
      video.removeEventListener('abort', handleAbort);
      video.removeEventListener('emptied', handleEmptied);
    };
  }, []);

  // Polling para verificar mudanças na música
  useEffect(() => {
    const trackUri = searchParams.get('track');
    
    // Só fazer polling se autoUpdate estiver ativado E não for uma faixa específica
    if (autoUpdate && !trackUri) {
      console.log(`🔄 Iniciando polling automático para música atual (a cada ${pollingInterval/1000}s)`);
      // Verificar no intervalo configurado se a música mudou
      pollingIntervalRef.current = setInterval(() => {
        fetchCanvas();
      }, pollingInterval);

      return () => {
        if (pollingIntervalRef.current) {
          console.log('⏹️ Parando polling automático');
          clearInterval(pollingIntervalRef.current);
        }
      };
    } else if (trackUri) {
      console.log('🎯 Faixa específica detectada - polling desabilitado');
    }
  }, [autoUpdate, searchParams, lastTrackUri]);

  useEffect(() => {
    const fetchInitialCanvas = async () => {
      const trackUri = searchParams.get('track');
      if (trackUri) {
        // Extrair o ID da música do URI completo
        const trackId = trackUri.replace('spotify:track:', '');
        await fetchCanvas(trackId);
      } else {
        await fetchCanvas();
      }
    };

    fetchInitialCanvas();
  }, []);

  useEffect(() => {
    if (canvasData && canvasData.canvasesList.length > 1) {
      const interval = setInterval(() => {
        setCurrentCanvasIndex((prev) => 
          (prev + 1) % canvasData.canvasesList.length
        );
      }, 3000); // Change canvas every 3 seconds

      return () => clearInterval(interval);
    }
  }, [canvasData]);

  // Efeito para modo fade in/out com movimento
  useEffect(() => {
    if (mode === 'fade' && (!canvasData?.canvasesList.length || !track)) {
      const interval = setInterval(() => {
        setFadeOpacity(prev => {
          if (prev === 1) {
            // Fade out na posição atual
            setTimeout(() => {
              // Gerar nova posição aleatória
              const newX = Math.random() * 70 + 15; // 15% a 85% da tela
              const newY = Math.random() * 70 + 15; // 15% a 85% da tela
              setFadePosition({ x: newX, y: newY });
              setFadeOpacity(1); // Fade in na nova posição
            }, 500);
            return 0;
          } else {
            return 1;
          }
        });
      }, fadeInterval);

      return () => clearInterval(interval);
    }
  }, [mode, canvasData, fadeInterval, track]);

  // Efeito para modo DVD
  useEffect(() => {
    if (mode === 'dvd' && (!canvasData?.canvasesList.length || !track)) {
      const interval = setInterval(() => {
        setDvdPosition(prev => {
          let newX = prev.x + dvdVelocity.x;
          let newY = prev.y + dvdVelocity.y;
          let newVelX = dvdVelocity.x;
          let newVelY = dvdVelocity.y;
          
          // Bater nas bordas (usando viewport completa)
          // Borda esquerda ou direita - inverte apenas velocidade X
          if (newX <= 12.5 || newX >= 87.5) {
            newVelX = -dvdVelocity.x;
            newX = newX <= 12.5 ? 12.5 : 87.5;
          }
          // Borda superior ou inferior - inverte apenas velocidade Y
          if (newY <= 12.5 || newY >= 87.5) {
            newVelY = -dvdVelocity.y;
            newY = newY <= 12.5 ? 12.5 : 87.5;
          }
          
          // Atualizar velocidade
          setDvdVelocity({ x: newVelX, y: newVelY });
          
          return {
            x: newX,
            y: newY
          };
        });
      }, 50); // Atualizar a cada 50ms para movimento suave

      return () => clearInterval(interval);
    }
  }, [mode, canvasData, dvdVelocity, track]);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      router.push('/');
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">
          {language === 'pt' ? 'Carregando Canvas...' : 'Loading Canvas...'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-xl mb-4">
            {language === 'pt' ? 'Erro ao carregar Canvas' : 'Error loading Canvas'}
          </div>
          <div className="text-gray-400 mb-4">{error}</div>
          <button
            onClick={() => router.push('/')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            {language === 'pt' ? 'Voltar' : 'Back'}
          </button>
        </div>
      </div>
    );
  }

  // Mostrar capa do álbum se não há canvas OU se o vídeo falhou OU se não há música
  if (!canvasData || !canvasData.canvasesList.length || videoFailed || !track) {
    return (
      <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
        {track && track.album.images[0] ? (
          <div 
            className={`text-white text-center transition-opacity duration-1000 transition-all duration-500 ${
              (mode === 'fade' || mode === 'dvd') ? 'absolute' : 'relative flex items-center justify-center'
            }`}
            style={{
              opacity: mode === 'fade' ? fadeOpacity : 1,
              left: mode === 'fade' ? `${fadePosition.x}%` : (mode === 'dvd' ? `${dvdPosition.x}%` : 'auto'),
              top: mode === 'fade' ? `${fadePosition.y}%` : (mode === 'dvd' ? `${dvdPosition.y}%` : 'auto'),
              transform: (mode === 'fade' || mode === 'dvd') ? 'translate(-50%, -50%)' : 'none'
            }}
          >
            <div className="space-y-4">
              <img
                src={track.album.images[0].url}
                alt={track.album.name}
                className="w-64 h-64 rounded-lg shadow-2xl mx-auto"
              />
              <div>
                <h2 className="text-2xl font-bold mb-2">{track.name}</h2>
                <p className="text-gray-300 text-lg">
                  {track.artists.map(artist => artist.name).join(', ')}
                </p>
                <p className="text-gray-400 text-sm">{track.album.name}</p>
                {videoFailed && (
                  <p className="text-yellow-400 text-xs mt-2">
                    {language === 'pt' 
                      ? 'Canvas não disponível - mostrando capa do álbum'
                      : 'Canvas not available - showing album cover'
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Relógio quando não há música
          <div 
            className={`text-white text-center transition-opacity duration-1000 transition-all duration-500 ${
              (mode === 'fade' || mode === 'dvd') ? 'absolute' : 'relative flex items-center justify-center'
            }`}
            style={{
              opacity: mode === 'fade' ? fadeOpacity : 1,
              left: mode === 'fade' ? `${fadePosition.x}%` : (mode === 'dvd' ? `${dvdPosition.x}%` : 'auto'),
              top: mode === 'fade' ? `${fadePosition.y}%` : (mode === 'dvd' ? `${dvdPosition.y}%` : 'auto'),
              transform: (mode === 'fade' || mode === 'dvd') ? 'translate(-50%, -50%)' : 'none'
            }}
          >
            <div className="space-y-4">
              {/* Relógio simples */}
              <div className="text-center">
                <div className="text-8xl font-bold font-mono">
                  {currentTime.toLocaleTimeString(language === 'pt' ? 'pt-BR' : 'en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </div>
              </div>
              {/* Data */}
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {currentTime.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h2>
                <p className="text-gray-400 text-sm">
                  {language === 'pt' ? 'Nenhuma música tocando' : 'No track currently playing'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentCanvas = canvasData.canvasesList[currentCanvasIndex];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Canvas Video */}
      <video
        ref={videoRef}
        key={currentCanvas.id}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        onLoadStart={() => console.log('🔄 Carregando vídeo...')}
        onCanPlay={() => console.log('✅ Vídeo pronto')}
        onError={() => handleVideoFailure()}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        <source src={currentCanvas.canvasUrl} type="video/mp4" />
      </video>

      {/* Track Info Overlay */}
      {track && showTrackInfo && (
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              {track.album.images[0] && (
                <img
                  src={track.album.images[0].url}
                  alt={track.album.name}
                  className="w-16 h-16 rounded-lg shadow-2xl"
                />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {track.name}
                </h2>
                <p className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {track.artists.map(artist => artist.name).join(', ')}
                </p>
                <p className="text-white text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {track.album.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Counter */}
      {canvasData.canvasesList.length > 1 && (
        <div className="absolute top-8 right-8 text-white">
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-3 py-1">
            {currentCanvasIndex + 1} / {canvasData.canvasesList.length}
          </div>
        </div>
      )}

    </div>
  );
} 