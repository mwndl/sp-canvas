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

import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [debugLogs, setDebugLogs] = useState<Array<{timestamp: string, type: string, message: string}>>([]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debug settings
  const defaultLogLimit = 50;
  const logLimit = parseInt(searchParams.get('log_limit') || defaultLogLimit.toString());
  const MAX_DEBUG_LOGS = Math.max(10, Math.min(200, logLimit)); // Limit between 10 and 200 logs
  
  // Get screensaver mode from URL
  const mode = (searchParams.get('mode') as ScreensaverMode) || 'static';
  const fadeInterval = parseInt(searchParams.get('fade') || '3000');
  const autoUpdate = searchParams.get('auto') !== 'false';
  const pollingInterval = parseInt(searchParams.get('poll') || '5000');
  const showTrackInfo = searchParams.get('info') !== 'false';
  const language = (searchParams.get('lang') as Language) || 'en';
  const debugMode = searchParams.get('debug') === 'true';
  const videoTimeout = parseInt(searchParams.get('timeout') || '1000');

  const t = getTranslation(language);

  // Initial debug log if active
  useEffect(() => {
    if (debugMode) {
      addDebugLog('CONFIG', `Debug enabled - Log limit: ${MAX_DEBUG_LOGS}`);
      addDebugLog('CONFIG', `Video timeout: ${videoTimeout}ms`);
    }
  }, [debugMode, MAX_DEBUG_LOGS, videoTimeout]);

  // Função para adicionar logs de debug
  const addDebugLog = useCallback((type: string, message: string) => {
    if (debugMode) {
      const timestamp = new Date().toLocaleTimeString();
      
      setDebugLogs(prev => {
        const newLog = { timestamp, type, message };
        const updatedLogs = [...prev, newLog];
        
        // Manter apenas os últimos MAX_DEBUG_LOGS
        if (updatedLogs.length > MAX_DEBUG_LOGS) {
          return updatedLogs.slice(-MAX_DEBUG_LOGS);
        }
        
        return updatedLogs;
      });
    }
  }, [debugMode]);

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
        console.log('🎯 Searching for specific Track ID:', specificTrackId);
        console.log('🔗 Request URL:', url);
        if (debugMode) {
          addDebugLog('API', `Searching for specific Track ID: ${specificTrackId}`);
        }
      } else {
        console.log('🎵 Searching for current track');
        if (debugMode) {
          addDebugLog('API', 'Searching for current track');
        }
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // If no track is playing AND it's not a specific Track ID, it's not an error
        if (errorData.error === 'No track currently playing' && !specificTrackId) {
          setTrack(null);
          setCanvasData(null);
          setLastTrackUri(null);
          setError(null);
          console.log('⏰ No track playing - showing clock');
          if (debugMode) {
            addDebugLog('INFO', 'No track playing - showing clock');
          }
          return;
        }
        
        // If it's a specific Track ID and there's an error, show the error
        if (specificTrackId) {
          console.error('❌ Error searching for specific Track ID:', errorData.error);
          if (debugMode) {
            addDebugLog('ERROR', `Error searching for specific Track ID: ${errorData.error}`);
          }
          setError(`Error searching for track: ${errorData.error}`);
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
        setError(null); // Clear any previous error
        console.log('🎵 New track detected:', data.track?.name || 'Track ID');
        if (debugMode) {
          addDebugLog('INFO', `New track detected: ${data.track?.name || 'Track ID'}`);
          addDebugLog('INFO', `Canvas found: ${data.canvas?.canvasesList?.length || 0}`);
        }
      }
    } catch (err) {
      console.error('Error fetching canvas:', err);
      if (debugMode) {
        addDebugLog('ERROR', `Error fetching canvas: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to try to play the video
  const tryPlayVideo = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      // Check if video is still in DOM
      if (!document.contains(video)) {
        console.log('⚠️ Video removed from DOM - aborting playback');
        if (debugMode) {
          addDebugLog('WARNING', 'Video removed from DOM - aborting playback');
        }
        return;
      }
      
      // Reset video state
      video.currentTime = 0;
      video.load();
      
      // Timer to check if the video started (customizable via timeout query param)
      const timeoutId = setTimeout(() => {
        // Check again if video is still in DOM
        if (!document.contains(video)) {
          console.log('⚠️ Video removed from DOM during timeout');
          if (debugMode) {
            addDebugLog('WARNING', 'Video removed from DOM during timeout');
          }
          return;
        }
        
        if (video.readyState < 2 || video.paused) { // HAVE_CURRENT_DATA or video paused
          console.log(`⏰ Video didn't start after ${videoTimeout}ms - readyState: ${video.readyState}, paused: ${video.paused}`);
          if (debugMode) {
            addDebugLog('TIMEOUT', `Video didn't start after ${videoTimeout}ms - readyState: ${video.readyState}, paused: ${video.paused}`);
          }
          setVideoFailed(true);
        }
      }, videoTimeout);
      
      // Clear timeout if the video starts playing
      const handleCanPlay = () => {
        clearTimeout(timeoutId);
        video.removeEventListener('canplay', handleCanPlay);
      };
      
      video.addEventListener('canplay', handleCanPlay);
      
      // Try to play
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Check if video is still in DOM
            if (!document.contains(video)) {
              console.log('⚠️ Video removed from DOM after starting playback');
              if (debugMode) {
                addDebugLog('WARNING', 'Video removed from DOM after starting playback');
              }
              return;
            }
            console.log('✅ Video playing successfully');
            if (debugMode) {
              addDebugLog('SUCCESS', 'Video playing successfully');
            }
            setVideoFailed(false);
          })
          .catch((error) => {
            // Check if error is due to DOM removal
            if (error.message && error.message.includes('removed from the document')) {
              console.log('⚠️ Video removed from DOM during playback - ignoring error');
              if (debugMode) {
                addDebugLog('WARNING', 'Video removed from DOM during playback - ignoring error');
              }
              return;
            }
            console.error('❌ Failed to play video:', error);
            if (debugMode) {
              addDebugLog('ERROR', `Failed to play video: ${error.message || error}`);
            }
            handleVideoFailure();
          });
      }
    }
  };

  // Function to handle video failure
  const handleVideoFailure = () => {
    console.log('❌ Video failure detected - going to fallback');
    if (debugMode) {
      addDebugLog('FAILURE', 'Video failure detected - going to fallback');
    }
      setVideoFailed(true);
  };

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

  // Polling to check for track changes
  useEffect(() => {
    const trackId = searchParams.get('trackid');
    
    // Only do polling if autoUpdate is enabled AND it's not a specific track
    if (autoUpdate && !trackId) {
      console.log(`🔄 Starting automatic polling for current track (every ${pollingInterval/1000}s)`);
      // Check at configured interval if track changed
      pollingIntervalRef.current = setInterval(() => {
        fetchCanvas();
      }, pollingInterval);

      return () => {
        if (pollingIntervalRef.current) {
          console.log('⏹️ Stopping automatic polling');
          clearInterval(pollingIntervalRef.current);
        }
      };
    } else if (trackId) {
      console.log('🎯 Specific track detected - polling disabled');
    }
  }, [autoUpdate, searchParams, lastTrackUri]);

  useEffect(() => {
    const fetchInitialCanvas = async () => {
      const trackId = searchParams.get('trackid');
      if (trackId) {
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

  // Effect for fade in/out with movement
  useEffect(() => {
    if (mode === 'fade' && (!canvasData?.canvasesList.length || !track)) {
      const interval = setInterval(() => {
        setFadeOpacity(prev => {
          if (prev === 1) {
            // Fade out at current position 
            setTimeout(() => {
                        // Generate new random position
          const newX = Math.random() * 70 + 15; // 15% to 85% of screen
          const newY = Math.random() * 70 + 15; // 15% to 85% of screen
          setFadePosition({ x: newX, y: newY });
          setFadeOpacity(1); // Fade in at new position
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

  // Effect for DVD mode
  useEffect(() => {
    if (mode === 'dvd' && (!canvasData?.canvasesList.length || !track)) {
      const interval = setInterval(() => {
        setDvdPosition(prev => {
          let newX = prev.x + dvdVelocity.x;
          let newY = prev.y + dvdVelocity.y;
          let newVelX = dvdVelocity.x;
          let newVelY = dvdVelocity.y;
          
          // Calculate limits based on actual screen and div size
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          // Get actual div size if available
          const fallbackElement = fallbackRef.current;
          const divWidth = fallbackElement ? fallbackElement.offsetWidth : 256;
          const divHeight = fallbackElement ? fallbackElement.offsetHeight : 170;
          
          // Convert to viewport percentage
          const divWidthPercent = (divWidth / viewportWidth) * 100;
          const divHeightPercent = (divHeight / viewportHeight) * 100;
          
          // Adjust limits based on content type
          // For album cover (taller), use more conservative limits
          // For clock (shorter), use wider limits
          const isAlbumCover = track && track.album.images[0];
          const widthMultiplier = isAlbumCover ? 1.2 : 1.0; // Increase margin for album cover
          const heightMultiplier = isAlbumCover ? 1.1 : 1.0; // Increase margin for album cover
          
          // Calculate limits where div border touches screen border
          const leftLimit = (divWidthPercent * widthMultiplier) / 2;   // Center of div when left border touches screen
          const rightLimit = 100 - ((divWidthPercent * widthMultiplier) / 2); // Center of div when right border touches screen
          const topLimit = (divHeightPercent * heightMultiplier) / 2;    // Center of div when top border touches screen
          const bottomLimit = 100 - ((divHeightPercent * heightMultiplier) / 2); // Center of div when bottom border touches screen
          
          // Bounce off edges - reverse velocity when touching limit
          if (newX <= leftLimit || newX >= rightLimit) {
            newVelX = -dvdVelocity.x;
            // Correct position to not exceed limit
            newX = newX <= leftLimit ? leftLimit : rightLimit;
          }
          
          if (newY <= topLimit || newY >= bottomLimit) {
            newVelY = -dvdVelocity.y;
            // Correct position to not exceed limit
            newY = newY <= topLimit ? topLimit : bottomLimit;
          }
          
          // Update velocity
          setDvdVelocity({ x: newVelX, y: newVelY });
          
          return {
            x: newX,
            y: newY
          };
        });
      }, 50); // Update every 50ms for smooth movement

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
          Loading Canvas...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-xl mb-4">
            Error loading Canvas
          </div>
          <div className="text-gray-400 mb-4">{error}</div>
          <button
            onClick={() => router.push('/')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Show album cover if no canvas OR if video failed OR if no track
  if (!canvasData || !canvasData.canvasesList.length || videoFailed || !track) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        {track && track.album.images[0] ? (
          <div 
            ref={fallbackRef}
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
            <div className="space-y-4" style={{ width: '256px', flexShrink: 0 }}>
              <img
                src={track.album.images[0].url}
                alt={track.album.name}
                className="w-64 h-64 rounded-lg shadow-2xl mx-auto object-cover"
                style={{ minWidth: '256px', minHeight: '256px' }}
              />
              <div>
                <h2 className="text-2xl font-bold mb-2">{track.name}</h2>
                <p className="text-gray-300 text-lg">
                  {track.artists.map(artist => artist.name).join(', ')}
                </p>
                <p className="text-gray-400 text-sm">{track.album.name}</p>
              </div>
            </div>
          </div>
        ) : (
          // Clock when no track is playing
          <div 
            ref={fallbackRef}
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
              {/* Simple clock */}
              <div className="text-center">
                <div className="text-8xl font-bold font-mono">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </div>
              </div>
              {/* Date */}
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {currentTime.toLocaleDateString('en-US', { 
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

        {/* Debug Panel para fallback */}
        {debugMode && (
          <div className="absolute top-8 left-8 max-w-md max-h-96 overflow-y-auto bg-black bg-opacity-80 backdrop-blur-sm rounded-lg p-4 text-white text-xs">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm">🔧 Debug Logs</h3>
                <span className="text-xs text-gray-400">
                  ({debugLogs.length}/{MAX_DEBUG_LOGS})
                </span>
              </div>
              <button 
                onClick={() => setDebugLogs([])}
                className="text-gray-400 hover:text-white text-xs"
              >
                Clear
              </button>
            </div>
            <div className="space-y-1">
              {debugLogs.map((log, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-gray-400 min-w-[50px]">{log.timestamp}</span>
                                  <span className={`px-1 rounded text-xs ${
                  log.type === 'ERROR' ? 'bg-red-500 text-white' :
                  log.type === 'FAILURE' ? 'bg-red-600 text-white' :
                  log.type === 'TIMEOUT' ? 'bg-yellow-600 text-white' :
                  log.type === 'SUCCESS' ? 'bg-green-600 text-white' :
                  log.type === 'READY' ? 'bg-blue-600 text-white' :
                  log.type === 'LOAD' ? 'bg-blue-500 text-white' :
                  log.type === 'STALLED' ? 'bg-orange-600 text-white' :
                  log.type === 'SUSPEND' ? 'bg-orange-500 text-white' :
                  log.type === 'ABORT' ? 'bg-red-700 text-white' :
                  log.type === 'EMPTIED' ? 'bg-purple-600 text-white' :
                  log.type === 'FALLBACK' ? 'bg-gray-700 text-white' :
                  log.type === 'CONFIG' ? 'bg-indigo-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                    {log.type}
                  </span>
                  <span className="flex-1 break-words">{log.message}</span>
                </div>
              ))}
              {debugLogs.length === 0 && (
                <div className="text-gray-400 italic">No logs available</div>
              )}
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
        <div className="absolute top-8 left-8 max-w-md max-h-96 overflow-y-auto bg-black bg-opacity-80 backdrop-blur-sm rounded-lg p-4 text-white text-xs">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm">🔧 Debug Logs</h3>
              <span className="text-xs text-gray-400">
                ({debugLogs.length}/{MAX_DEBUG_LOGS})
              </span>
            </div>
            <button 
              onClick={() => setDebugLogs([])}
              className="text-gray-400 hover:text-white text-xs"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1">
            {debugLogs.map((log, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-gray-400 min-w-[50px]">{log.timestamp}</span>
                <span className={`px-1 rounded text-xs ${
                  log.type === 'ERROR' ? 'bg-red-500 text-white' :
                  log.type === 'FAILURE' ? 'bg-red-600 text-white' :
                  log.type === 'TIMEOUT' ? 'bg-yellow-600 text-white' :
                  log.type === 'SUCCESS' ? 'bg-green-600 text-white' :
                  log.type === 'READY' ? 'bg-blue-600 text-white' :
                  log.type === 'LOAD' ? 'bg-blue-500 text-white' :
                  log.type === 'STALLED' ? 'bg-orange-600 text-white' :
                  log.type === 'SUSPEND' ? 'bg-orange-500 text-white' :
                  log.type === 'ABORT' ? 'bg-red-700 text-white' :
                  log.type === 'EMPTIED' ? 'bg-purple-600 text-white' :
                  log.type === 'CONFIG' ? 'bg-indigo-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {log.type}
                </span>
                <span className="flex-1 break-words">{log.message}</span>
              </div>
            ))}
            {debugLogs.length === 0 && (
              <div className="text-gray-400 italic">No logs available</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
} 