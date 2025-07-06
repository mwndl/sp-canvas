'use client';

/**
 * SpCanvas - Spotify Visual Experience
 * 
 * Query Parameters:
 * - mode: 'static' | 'fade' | 'dvd' - Screensaver mode
 * - fade: number - Fade interval in ms (default: 3000)
 * - auto: 'true' | 'false' - Auto update (default: true)
 * - poll: number - Polling interval in ms (default: 5000)
 * - info: 'true' | 'false' - Show track info (default: true)
 * - lang: 'en' | 'pt' - Language (default: 'en')
 * - debug: 'true' | 'false' - Debug mode (default: false)
 * - timeout: number - Video timeout in ms before fallback (default: 1000)
 * - trackid: string - Specific track ID to display
 * - log_limit: number - Debug log limit (default: 50, max: 200)
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDebugLogs } from '../../hooks/useDebugLogs';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { useCanvasParams } from '../../hooks/useCanvasParams';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';

import { useCanvasFetch } from '../../hooks/useCanvasFetch';
import { useClock } from '../../hooks/useClock';
import { useLyricsFetch } from '../../hooks/useLyricsFetch';

import { usePlayerProgress } from '../../hooks/usePlayerProgress';
import { DebugPanel } from '../../components/DebugPanel';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';
import { FallbackDisplay } from '../../components/FallbackDisplay';
import { ScreenSaverDisplay } from '../../components/ScreenSaverDisplay';
import CacheDebugPanel from '../../components/CacheDebugPanel';



export default function CanvasPage() {
  const [videoFailed, setVideoFailed] = useState(false);

  const router = useRouter();
  
  // Get all parameters from custom hook
  const {
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
  } = useCanvasParams();

  // Debug logging hook
  const { debugLogs, addDebugLog, clearLogs } = useDebugLogs({
    debugMode,
    maxLogs: maxDebugLogs
  });

  // Video player hook
  const { videoRef, tryPlayVideo, handleVideoFailure } = useVideoPlayer({
    debugMode,
    videoTimeout,
    addDebugLog,
    onVideoFailure: () => setVideoFailed(true)
  });

  // Keyboard controls hook
  useKeyboardControls();

  // Player progress hook - enabled for end-of-track polling
  // Sempre habilitado para detectar mudanças de música e fazer pooling após o fim teórico
  const {
    playerProgress,
    isLoading: isPlayerLoading,
    error: playerError
  } = usePlayerProgress({
    enabled: true, // Sempre habilitado para detectar mudanças de música
    pollingInterval: 5000, // 5 segundos
    debugMode,
    addDebugLog
  });

  // Canvas fetch hook
  const {
    track,
    canvasData,
    isLoading,
    error,
    lastTrackUri,
    setTrack,
    setCanvasData,
    setError,
    setLastTrackUri
  } = useCanvasFetch({
    autoUpdate,
    pollingInterval,
    trackId,
    debugMode,
    addDebugLog,
    playerProgress // Passar o playerProgress para detectar mudanças
  });

  // Clock hook - only used in standard mode
  const currentTime = new Date();

  // Canvas rotation - simplified to always use first canvas
  const currentCanvasIndex = 0;

  // Screensaver animation hook - not used in current implementation
  const fallbackRef = useRef<HTMLDivElement>(null);

  // Lyrics fetch hook
  const {
    lyrics,
    colors: lyricsColors,
    isLoading: isLyricsLoading,
    error: lyricsError
  } = useLyricsFetch({
    trackId: track?.id || null,
    albumImageUrl: track?.album.images[0]?.url || null,
    enabled: showLyrics && !!track,
    debugMode,
    addDebugLog
  });

  // Lyrics sync state
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1); // -1 = aguardando primeira linha
  const [isLyricsTransitioning, setIsLyricsTransitioning] = useState(false); // Controla transição de letras
  const lastLyricsTrackId = useRef<string | null>(null);

  // Sincronizar a linha da letra com o tempo do player do Spotify
  useEffect(() => {
    if (!showLyrics || !lyrics || !playerProgress) return;
    
    const currentTimeMs = playerProgress.progress;
    let idx = -1; // -1 = aguardando primeira linha
    
    // Verificar se chegamos ao fim da música (última linha vazia)
    const lastLine = lyrics.lines[lyrics.lines.length - 1];
    if (lastLine && lastLine.words.trim() === '' && currentTimeMs >= parseInt(lastLine.startTimeMs)) {
      // Música acabou, ocultar letras
      setCurrentLyricIndex(-2); // -2 = música acabou
      if (debugMode) {
        addDebugLog('LYRICS', 'Track ended - hiding lyrics');
      }
      return;
    }
    
    // Encontrar a linha ativa, pulando instrumentais falsos
    for (let i = 0; i < lyrics.lines.length; i++) {
      const line = lyrics.lines[i];
      const start = parseInt(line.startTimeMs);
      
      // Se é um instrumental, verificar se é falso
      if (line.words.trim() === '♪') {
        // Encontrar a linha anterior (não instrumental)
        let previousLine = null;
        for (let j = i - 1; j >= 0; j--) {
          if (lyrics.lines[j].words.trim() !== '♪') {
            previousLine = lyrics.lines[j];
            break;
          }
        }
        
        // Encontrar a próxima linha (não instrumental)
        let nextLine = null;
        for (let j = i + 1; j < lyrics.lines.length; j++) {
          if (lyrics.lines[j].words.trim() !== '♪') {
            nextLine = lyrics.lines[j];
            break;
          }
        }
        
        // Calcular distância entre linhas
        const previousTime = previousLine ? parseInt(previousLine.startTimeMs) : start;
        const nextTime = nextLine ? parseInt(nextLine.startTimeMs) : start + 10000;
        const timeDistance = nextTime - previousTime;
        
        // Se é um instrumental falso, pular
        if (timeDistance < 15000) {
          continue;
        }
      }
      
      // Se chegou até aqui, é uma linha válida
      if (currentTimeMs >= start) {
        idx = i;
      } else {
        break; // Parar na primeira linha que ainda não chegou
      }
    }
    
    // Log para depuração
    if (debugMode) {
      addDebugLog('LYRICS', `Player time: ${(currentTimeMs/1000).toFixed(2)}s, idx: ${idx}, line: ${idx >= 0 ? lyrics.lines[idx]?.words : 'waiting...'}`);
    }
    
    setCurrentLyricIndex(idx);
    
    // Se estamos em transição e encontramos uma linha válida, desativar transição
    if (isLyricsTransitioning && idx >= 0) {
      setIsLyricsTransitioning(false);
      if (debugMode) {
        addDebugLog('TRANSITION', 'New lyrics ready - showing lyrics');
      }
    }
  }, [showLyrics, lyrics, playerProgress, debugMode, addDebugLog]);

  // Resetar índice da letra ao trocar de música
  useEffect(() => {
    if (lyrics && playerProgress?.trackId !== lastLyricsTrackId.current) {
      // Ativar estado de transição
      setIsLyricsTransitioning(true);
      setCurrentLyricIndex(-1); // Reset para aguardar primeira linha
      lastLyricsTrackId.current = playerProgress?.trackId || null;
      
      if (debugMode) {
        addDebugLog('TRANSITION', 'Track changed - hiding lyrics during transition');
      }
    }
  }, [lyrics, playerProgress?.trackId, debugMode, addDebugLog]);

  // Calcular progresso para animação de "..." quando aguardando primeira linha
  const getWaitingProgress = () => {
    if (!lyrics || currentLyricIndex >= 0 || !playerProgress) return 0;
    
    const currentTimeMs = playerProgress.progress;
    const firstLineTime = parseInt(lyrics.lines[0]?.startTimeMs || '0');
    
    if (firstLineTime <= 0) return 0;
    
    // Mostrar "..." gradualmente desde o início (0s) até o início da primeira linha
    const progress = Math.min(currentTimeMs / firstLineTime, 1);
    return progress;
  };



  // Initial debug log if active
  useEffect(() => {
    if (debugMode) {
      addDebugLog('CONFIG', `Debug enabled - Log limit: ${maxDebugLogs}`);
      addDebugLog('CONFIG', `Video timeout: ${videoTimeout}ms`);
    }
  }, [debugMode, maxDebugLogs, videoTimeout, addDebugLog]);

  // Event listeners for video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = () => {
      console.error('❌ Video error:', video.error);
      if (debugMode) {
        addDebugLog('ERROR', `Video error: ${video.error?.message || 'Unknown error'}`);
      }
      handleVideoFailure();
    };

    const handleLoadStart = () => {
      console.log('🔄 Starting video loading...');
      if (debugMode) {
        addDebugLog('LOAD', 'Starting video loading...');
      }
    };

    const handleCanPlay = () => {
      console.log('✅ Video ready for playback');
      if (debugMode) {
        addDebugLog('READY', 'Video ready for playback');
      }
    };

    const handleStalled = () => {
      console.log('⚠️ Video stalled - trying to recover...');
      if (debugMode) {
        addDebugLog('STALLED', 'Video stalled - trying to recover...');
      }
      setTimeout(() => {
        if (video.readyState < 3) { // HAVE_FUTURE_DATA
          if (debugMode) {
            addDebugLog('FAILURE', 'Video didn\'t recover after stall');
          }
          handleVideoFailure();
        }
      }, 5000);
    };

    const handleSuspend = () => {
      console.log('⚠️ Video loading suspended');
      if (debugMode) {
        addDebugLog('SUSPEND', 'Video loading suspended');
      }
      setTimeout(() => {
        if (video.readyState < 2) { // HAVE_CURRENT_DATA
          if (debugMode) {
            addDebugLog('FAILURE', 'Video didn\'t recover after suspend');
          }
          handleVideoFailure();
        }
      }, 3000);
    };

    const handleAbort = () => {
      console.log('❌ Video loading aborted');
      if (debugMode) {
        addDebugLog('ABORT', 'Video loading aborted');
      }
      handleVideoFailure();
    };

    const handleEmptied = () => {
      console.log('⚠️ Video emptied - possible failure');
      if (debugMode) {
        addDebugLog('EMPTIED', 'Video emptied - possible failure');
      }
      setTimeout(() => {
        if (video.readyState === 0) { // HAVE_NOTHING
          if (debugMode) {
            addDebugLog('FAILURE', 'Video didn\'t recover after emptied');
          }
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



  // Reset video failure when track changes
  useEffect(() => {
    if (lastTrackUri) {
      setVideoFailed(false);
    }
  }, [lastTrackUri]);

  // Try to play video when canvas changes
  useEffect(() => {
    if (canvasData && canvasData.canvasesList.length > 0 && !videoFailed) {
      // Reset video failure state when changing canvas
      setVideoFailed(false);
      if (debugMode) {
        addDebugLog('CANVAS', `Switching to canvas ${currentCanvasIndex + 1}/${canvasData.canvasesList.length}`);
      }
      
      // Use a longer delay to ensure DOM is completely updated
      // and avoid conflicts with element removal/addition
      const timeoutId = setTimeout(() => {
        // Check if we're still on the same canvas before trying to play
        if (videoRef.current && document.contains(videoRef.current)) {
          tryPlayVideo();
        }
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [canvasData, currentCanvasIndex, addDebugLog]);

  // Monitor state changes for debug
  useEffect(() => {
    if (debugMode) {
      if (!canvasData) {
        addDebugLog('FALLBACK', 'No canvas available');
      } else if (!canvasData.canvasesList.length) {
        addDebugLog('FALLBACK', 'Canvas list empty');
      } else if (videoFailed) {
        addDebugLog('FALLBACK', 'Video failed - showing album cover');
      } else if (!track) {
        addDebugLog('FALLBACK', 'No track - showing clock');
      }
    }
  }, [debugMode, canvasData, videoFailed, track, addDebugLog]);





  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onBack={() => router.push('/')} />;
  }

  // Screen Saver Mode
  if (mode === 'screensaver') {
    return (
      <ScreenSaverDisplay
        config={{
          displayMode,
          clockMode,
          timezone,
          showDate,
          showTrackInfo: showTrackInfoInClock,
          movement,
          fadeSpeed
        }}
        track={track}
        debugMode={debugMode}
        addDebugLog={addDebugLog}
      />
    );
  }

  // Show album cover if canvas is disabled OR no canvas OR if video failed OR if no track
  if (!showCanvas || !canvasData || !canvasData.canvasesList.length || videoFailed || !track) {
    return (
      <FallbackDisplay
        track={track}
        currentTime={currentTime}
        language={language}
        fallbackRef={fallbackRef}
        debugMode={debugMode}
        debugLogs={debugLogs}
        maxDebugLogs={maxDebugLogs}
        onClearLogs={clearLogs}
        // Lyrics props
        showLyrics={showLyrics}
        lyrics={lyrics}
        lyricsColors={lyricsColors}
        currentLyricIndex={currentLyricIndex}
        playerProgress={playerProgress ? {
          progress: playerProgress.progress,
          trackId: playerProgress.trackId
        } : null}
        // Track info prop
        showTrackInfo={showTrackInfo}
        // Lyrics mode prop
        lyricsMode={lyricsMode}
        // Lyrics transition prop
        isLyricsTransitioning={isLyricsTransitioning}
      />
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
        autoPlay={false}
        loop
        muted
        playsInline
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        onLoadStart={() => {
          console.log('🔄 Loading video...');
          if (debugMode) {
            addDebugLog('LOAD', 'Starting video loading...');
          }
        }}
        onCanPlay={() => {
          console.log('✅ Video ready');
          if (debugMode) {
            addDebugLog('READY', 'Video ready for playback');
          }
        }}
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

      {/* Overlay para letras (entre Canvas e letra) */}
      {showLyrics && lyrics && (
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            mixBlendMode: 'multiply'
          }}
        ></div>
      )}

      {/* Track Info Overlay */}
      {track && showTrackInfo && (
        <div className="absolute bottom-8 left-8 right-8 text-white z-30">
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

      {/* Lyrics Overlay */}
      {showLyrics && lyrics && !isLyricsTransitioning && currentLyricIndex !== -2 && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-40 pointer-events-none select-none"
          style={{ zIndex: 40 }}
        >
          {/* Exibir linha ativa e vizinhas centralizadas */}
          <div 
            className={`mx-auto px-6 ${lyricsMode === 'left' ? 'w-full max-w-6xl' : 'w-full max-w-4xl text-center'}`}
            style={{
              ...(lyricsMode === 'left' && {
                transform: `translateY(-${currentLyricIndex * 0.3}vh)`,
                transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              })
            }}
          >
            {/* Debug info */}
            {debugMode && (
              <div className="text-white text-sm mb-4">
                currentLyricIndex: {currentLyricIndex}, 
                lyrics lines: {lyrics?.lines?.length || 0}, 
                progress: {getWaitingProgress().toFixed(2)}
              </div>
            )}
            
                        {/* Linhas da letra */}
            {lyrics.lines.map((line, idx) => {
              // Determinar quantas linhas mostrar baseado no modo
              const maxLines = lyricsMode === 'left' ? 3 : 2;
              
              // Quando aguardando primeira linha, mostrar apenas a linha 0
              if (currentLyricIndex === -1) {
                if (idx !== 0) return null;
              } else {
                // Estado normal - mostrar linhas baseado no modo
                if (lyricsMode === 'left') {
                  // Modo left: mostrar linhas anteriores e próximas
                  if (idx < currentLyricIndex - 2 || idx > currentLyricIndex + 3) return null;
                } else {
                  // Modo 5 linhas: mostrar linhas próximas à atual
                  if (Math.abs(idx - currentLyricIndex) > maxLines) return null;
                }
              }
              
              const isActive = idx === currentLyricIndex;
              const isNext = idx === currentLyricIndex + 1;
              const isPrevious = idx === currentLyricIndex - 1;
              
              // Estado de aguardando primeira linha - mostrar "..." animado gradualmente
              if (currentLyricIndex === -1 && idx === 0) {
                const progress = getWaitingProgress();
                
                return (
                  <div
                    key={idx}
                    className={`text-4xl font-bold mb-4 ${
                      lyricsMode === 'left' 
                        ? 'text-left' 
                        : 'text-center'
                    }`}
                    style={{
                      color: '#ffffff',
                      opacity: Math.max(0.3, progress * 0.7), // Opacidade gradual baseada no progresso
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                      position: 'relative',
                      zIndex: 60,
                      ...(lyricsMode === 'left' && {
                        fontSize: '2rem',
                        lineHeight: '2.5rem',
                        marginBottom: '0.5rem'
                      })
                    }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full transition-all duration-700 ease-out transform
                            ${progress >= (i + 1) * 0.25 
                              ? 'bg-white scale-100 opacity-100' 
                              : 'bg-white/30 scale-75 opacity-50'
                            }
                          `}
                          style={{
                            animationDelay: `${i * 200}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              }
              
              // Linha normal ou instrumental animado
              return (
                <div
                  key={idx}
                  className={`text-4xl font-bold mb-4 ${
                    lyricsMode === 'left' 
                      ? 'text-left' 
                      : 'text-center'
                  }`}
                  style={{
                    color: '#ffffff',
                    opacity: isActive ? 1 : (isNext || isPrevious ? 0.7 : 0.4),
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                    position: 'relative',
                    zIndex: 60,
                    fontSize: isActive ? '2.5rem' : (isNext || isPrevious ? '1.8rem' : '1.5rem'),
                    fontWeight: isActive ? 'bold' : 'normal',
                    ...(lyricsMode === 'left' && {
                      fontSize: isActive ? '2rem' : (isNext || isPrevious ? '1.5rem' : '1.2rem'),
                      lineHeight: '2.5rem',
                      marginBottom: '0.5rem'
                    })
                  }}
                >
                  {line.words.trim() === '♪' ? (
                    isActive ? (
                      // Animação para instrumental ativo
                      (() => {
                        const currentTimeMs = playerProgress?.progress || 0;
                        const startTime = parseInt(line.startTimeMs);
                        const nextLine = lyrics.lines[idx + 1];
                        const endTime = nextLine ? parseInt(nextLine.startTimeMs) : startTime + 10000; // 10s se não houver próxima linha
                        const duration = endTime - startTime;
                        const elapsed = currentTimeMs - startTime;
                        const progress = Math.min(Math.max(elapsed / duration, 0), 1);
                        
                        if (debugMode) {
                          addDebugLog('INSTRUMENTAL', `Progress: ${progress.toFixed(2)}`);
                        }
                        
                        return (
                          <div className="flex items-center justify-center space-x-2">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className={`w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full transition-all duration-700 ease-out transform
                                  ${progress >= (i + 1) * 0.25 
                                    ? 'bg-white scale-100 opacity-100' 
                                    : 'bg-white/30 scale-75 opacity-50'
                                  }
                                `}
                                style={{
                                  animationDelay: `${i * 200}ms`,
                                }}
                              />
                            ))}
                          </div>
                        );
                      })()
                                          ) : (
                        // Texto simples para instrumental não ativo
                        '• • •'
                      )
                  ) : (
                    line.words
                  )}
                </div>
              );
            })}
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

      {/* Debug Panel */}
      {debugMode && (
        <DebugPanel 
          debugLogs={debugLogs}
          maxLogs={maxDebugLogs}
          onClearLogs={clearLogs}
        />
      )}

      {/* Cache Debug Panel */}
      {debugMode && <CacheDebugPanel />}

    </div>
  );
} 