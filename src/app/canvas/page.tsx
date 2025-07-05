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
    mode,
    fadeInterval,
    autoUpdate,
    pollingInterval,
    showTrackInfo,
    language,
    debugMode,
    videoTimeout,
    trackId,
    maxDebugLogs,
    showLyrics,
    lyricsBgMode,
    lyricsBgColor
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
    lastTrackUri
  } = useCanvasFetch({
    autoUpdate,
    pollingInterval,
    trackId,
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

  // Player progress hook
  const {
    playerProgress,
    isLoading: isPlayerLoading,
    error: playerError
  } = usePlayerProgress({
    enabled: showLyrics && !!track,
    pollingInterval: 1000, // 1 segundo
    debugMode,
    addDebugLog
  });

  // Lyrics sync state
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const lastLyricsTrackId = useRef<string | null>(null);

  // Sincronizar a linha da letra com o tempo do player do Spotify
  useEffect(() => {
    if (!showLyrics || !lyrics || !playerProgress) return;
    
    const currentTimeMs = playerProgress.progress;
    let idx = 0;
    
    for (let i = 0; i < lyrics.lines.length; i++) {
      const start = parseInt(lyrics.lines[i].startTimeMs);
      const nextStart = i + 1 < lyrics.lines.length ? parseInt(lyrics.lines[i + 1].startTimeMs) : Infinity;
      if (currentTimeMs >= start && currentTimeMs < nextStart) {
        idx = i;
        break;
      }
    }
    
    // Log para depuração
    if (debugMode) {
      addDebugLog('LYRICS', `Player time: ${(currentTimeMs/1000).toFixed(2)}s, idx: ${idx}, line: ${lyrics.lines[idx]?.words}`);
    }
    
    setCurrentLyricIndex(idx);
  }, [showLyrics, lyrics, playerProgress, debugMode, addDebugLog]);

  // Resetar índice da letra ao trocar de música
  useEffect(() => {
    if (lyrics && playerProgress?.trackId !== lastLyricsTrackId.current) {
      setCurrentLyricIndex(0);
      lastLyricsTrackId.current = playerProgress?.trackId || null;
    }
  }, [lyrics, playerProgress?.trackId]);

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

      {/* Lyrics Overlay */}
      {showLyrics && lyrics && (
        <div
          className="absolute inset-0 flex flex-col items-start justify-start z-20 pointer-events-none select-none"
          style={{
            background:
              lyricsBgMode === 'theme' && lyricsColors?.background
                ? `#${(lyricsColors.background >>> 0).toString(16).padStart(6, '0')}`
                : lyricsBgMode === 'fixed' && lyricsBgColor
                ? lyricsBgColor
                : lyricsBgMode === 'cover' && canvasData?.canvasesList?.length > 0
                ? 'transparent' // Se tem Canvas, não usar capa como fundo
                : lyricsBgMode === 'cover' && track?.album.images[0]?.url
                ? `url(${track.album.images[0].url}) center/cover no-repeat`
                : 'transparent',
            transition: 'background 0.5s',
          }}
        >
          {/* Exibir linha ativa e vizinhas no topo */}
          <div className="w-full max-w-3xl mt-12 mx-auto text-center px-4">
            {lyrics.lines.map((line, idx) => {
              if (Math.abs(idx - currentLyricIndex) > 2) return null;
              return (
                <div
                  key={idx}
                  className={`mb-2 break-words transition-all duration-300
                    ${idx === currentLyricIndex
                      ? 'text-white font-bold text-3xl md:text-5xl scale-110'
                      : 'text-white font-normal text-2xl md:text-3xl scale-100'}
                  `}
                  style={{
                    color: '#fff',
                  }}
                >
                  {line.words}
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