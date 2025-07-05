'use client';

/**
 * SpotSaver - Spotify Screensaver
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
import { useScreensaverAnimation } from '../../hooks/useScreensaverAnimation';
import { useCanvasFetch } from '../../hooks/useCanvasFetch';
import { useClock } from '../../hooks/useClock';
import { useCanvasRotation } from '../../hooks/useCanvasRotation';
import { useLyricsFetch } from '../../hooks/useLyricsFetch';
import { usePlayerProgress } from '../../hooks/usePlayerProgress';
import { DebugPanel } from '../../components/DebugPanel';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ErrorScreen } from '../../components/ErrorScreen';
import { FallbackDisplay } from '../../components/FallbackDisplay';



export default function CanvasPage() {
  const [videoFailed, setVideoFailed] = useState(false);

  const router = useRouter();
  
  // Get all parameters from custom hook
  const {
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
    playerProgress: null // Será atualizado depois
  });

  // Player progress hook
  const {
    playerProgress,
    isLoading: isPlayerLoading,
    error: playerError
  } = usePlayerProgress({
    enabled: showLyrics && !!track,
    pollingInterval: 5000, // 5 segundos
    debugMode,
    addDebugLog
  });

  // Clock hook
  const currentTime = useClock();

  // Canvas rotation hook
  const { currentCanvasIndex } = useCanvasRotation({
    canvasData,
    lastTrackUri
  });

  // Screensaver animation hook
  const { fadeOpacity, fadePosition, dvdPosition, fallbackRef } = useScreensaverAnimation({
    mode,
    fadeInterval,
    hasCanvas: !!(canvasData?.canvasesList.length),
    hasTrack: !!track
  });

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
  const lastLyricsTrackId = useRef<string | null>(null);

  // Sincronizar a linha da letra com o tempo do player do Spotify
  useEffect(() => {
    if (!showLyrics || !lyrics || !playerProgress) return;
    
    const currentTimeMs = playerProgress.progress;
    let idx = -1; // -1 = aguardando primeira linha
    
    // Encontrar a linha ativa
    for (let i = 0; i < lyrics.lines.length; i++) {
      const start = parseInt(lyrics.lines[i].startTimeMs);
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
  }, [showLyrics, lyrics, playerProgress, debugMode, addDebugLog]);

  // Resetar índice da letra ao trocar de música
  useEffect(() => {
    if (lyrics && playerProgress?.trackId !== lastLyricsTrackId.current) {
      setCurrentLyricIndex(-1); // Reset para aguardar primeira linha
      lastLyricsTrackId.current = playerProgress?.trackId || null;
    }
  }, [lyrics, playerProgress?.trackId]);

  // Calcular progresso para animação de "..." quando aguardando primeira linha
  const getWaitingProgress = () => {
    if (!lyrics || currentLyricIndex >= 0 || !playerProgress) return 0;
    
    const currentTimeMs = playerProgress.progress;
    const firstLineTime = parseInt(lyrics.lines[0]?.startTimeMs || '0');
    
    if (firstLineTime <= 0) return 0;
    
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

  // Show album cover if no canvas OR if video failed OR if no track
  if (!canvasData || !canvasData.canvasesList.length || videoFailed || !track) {
    return (
      <FallbackDisplay
        track={track}
        currentTime={currentTime}
        language={language}
        mode={mode}
        fadeOpacity={fadeOpacity}
        fadePosition={fadePosition}
        dvdPosition={dvdPosition}
        fallbackRef={fallbackRef}
        debugMode={debugMode}
        debugLogs={debugLogs}
        maxDebugLogs={maxDebugLogs}
        onClearLogs={clearLogs}
        // Lyrics props
        showLyrics={showLyrics}
        lyrics={lyrics}
        lyricsBgMode={backgroundMode}
        lyricsBgColor={fixedColor}
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
      {showLyrics && lyrics && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none select-none"
        >
          {/* Exibir linha ativa e vizinhas centralizadas */}
          <div 
            className={`mx-auto px-6 ${lyricsMode === 'left' ? 'w-full max-w-6xl' : 'w-full max-w-4xl text-center'}`}
            style={{
              transform: `translateY(-${currentLyricIndex * 0.5}vh)`,
              transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
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
              // Verificar se é um instrumental falso e pular
              if (line.words.trim() === '♪') {
                const startTime = parseInt(line.startTimeMs);
                
                // Encontrar a linha anterior (não instrumental)
                let previousLine = null;
                for (let i = idx - 1; i >= 0; i--) {
                  if (lyrics.lines[i].words.trim() !== '♪') {
                    previousLine = lyrics.lines[i];
                    break;
                  }
                }
                
                // Encontrar a próxima linha (não instrumental)
                let nextLine = null;
                for (let i = idx + 1; i < lyrics.lines.length; i++) {
                  if (lyrics.lines[i].words.trim() !== '♪') {
                    nextLine = lyrics.lines[i];
                    break;
                  }
                }
                
                // Calcular distância entre linhas
                const previousTime = previousLine ? parseInt(previousLine.startTimeMs) : startTime;
                const nextTime = nextLine ? parseInt(nextLine.startTimeMs) : startTime + 10000;
                const timeDistance = nextTime - previousTime;
                
                // Se a distância for menor que 15s, pular este instrumental
                if (timeDistance < 15000) {
                  return null;
                }
              }
              
              // Determinar quantas linhas mostrar baseado no modo
              const maxLines = lyricsMode === 'left' ? 3 : 2; // 3 linhas anteriores para left, 2 para 5lines
              
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
              
              // Estado de aguardando primeira linha - mostrar "..." no lugar da linha atual
              if (currentLyricIndex === -1 && idx === 0) {
                const progress = getWaitingProgress();
                
                if (debugMode) {
                  console.log('🎯 Showing dots, progress:', progress);
                }
                
                return (
                  <div
                    key={idx}
                    className="transition-all duration-500 ease-out transform text-white font-bold text-3xl md:text-5xl lg:text-6xl scale-110 opacity-100 mb-8 md:mb-12 lg:mb-16"
                    style={{
                      color: '#fff',
                      textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)',
                      marginBottom: '4vh', // 4% da altura da viewport para linha ativa
                      height: '8vh', // Altura fixa para linha ativa (preparada para 2 linhas)
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span className="inline-block">
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
                    </span>
                  </div>
                );
              }
              
              return (
                <div
                  key={idx}
                  className={`${lyricsMode === 'left' 
                    ? isActive 
                      ? 'text-white font-bold text-2xl md:text-3xl lg:text-4xl opacity-100'
                      : 'text-white font-normal text-2xl md:text-3xl lg:text-4xl opacity-50'
                    : isActive 
                      ? 'text-white font-bold text-3xl md:text-5xl lg:text-6xl scale-110 opacity-100 mb-8 md:mb-12 lg:mb-16'
                      : isNext
                      ? 'text-white font-medium text-2xl md:text-3xl lg:text-4xl scale-100 opacity-70 mb-4 md:mb-6 lg:mb-8'
                      : isPrevious
                      ? 'text-white font-normal text-xl md:text-2xl lg:text-3xl scale-95 opacity-40 mb-4 md:mb-6 lg:mb-8'
                      : 'text-white font-normal text-lg md:text-xl lg:text-2xl scale-90 opacity-20 mb-2 md:mb-4 lg:mb-6'
                  }`}
                  style={{
                    color: '#fff',
                    textShadow: isActive 
                      ? '0 4px 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)'
                      : '0 2px 4px rgba(0,0,0,0.6)',
                    marginBottom: lyricsMode === 'left' 
                      ? '1vh' // Espaçamento menor para modo left
                      : isActive 
                        ? '4vh' // 4% da altura da viewport para linha ativa
                        : isNext || isPrevious
                        ? '2vh' // 2% da altura da viewport para linhas próximas
                        : '1vh', // 1% da altura da viewport para linhas distantes
                    textAlign: lyricsMode === 'left' ? 'left' : 'center',
                    ...(lyricsMode === 'left' && {
                      height: '6vh', // Altura fixa menor para modo left
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      paddingLeft: '2rem'
                    }),
                    ...(isActive && lyricsMode !== 'left' && {
                      height: '8vh', // Altura fixa para linha ativa (modo 5lines)
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    })
                  }}
                >
                  <span className="inline-block">
                    {line.words.trim() === '♪' ? (
                      // Verificar se a distância entre linhas é superior a 15s antes de mostrar instrumental
                      (() => {
                        const currentTimeMs = playerProgress?.progress || 0;
                        const startTime = parseInt(line.startTimeMs);
                        
                        // Encontrar a linha anterior (não instrumental)
                        let previousLine = null;
                        for (let i = idx - 1; i >= 0; i--) {
                          if (lyrics.lines[i].words.trim() !== '♪') {
                            previousLine = lyrics.lines[i];
                            break;
                          }
                        }
                        
                        // Encontrar a próxima linha (não instrumental)
                        let nextLine = null;
                        for (let i = idx + 1; i < lyrics.lines.length; i++) {
                          if (lyrics.lines[i].words.trim() !== '♪') {
                            nextLine = lyrics.lines[i];
                            break;
                          }
                        }
                        
                        // Calcular distância entre linhas
                        const previousTime = previousLine ? parseInt(previousLine.startTimeMs) : startTime;
                        const nextTime = nextLine ? parseInt(nextLine.startTimeMs) : startTime + 10000;
                        const timeDistance = nextTime - previousTime;
                        
                        // Mostrar instrumental apenas se a distância for superior a 15 segundos
                        if (timeDistance < 15000) {
                          return null; // Não mostrar nada para instrumentais curtos
                        }
                        
                        const endTime = nextTime;
                        const duration = endTime - startTime;
                        const elapsed = currentTimeMs - startTime;
                        const progress = Math.min(Math.max(elapsed / duration, 0), 1);
                        
                        if (debugMode) {
                          console.log('🎵 Instrumental progress:', progress, 'timeDistance:', timeDistance);
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
                      line.words
                    )}
                  </span>
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

    </div>
  );
} 