import { RefObject } from 'react';

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

interface Lyrics {
  lines: Array<{
    words: string;
    startTimeMs: string;
  }>;
}

interface LyricsColors {
  background: number;
  text: number;
}

type ScreensaverMode = 'static' | 'fade' | 'dvd';
type LyricsBgMode = 'theme' | 'fixed' | 'cover';

interface FallbackDisplayProps {
  track: Track | null;
  currentTime: Date;
  language: string;
  mode: ScreensaverMode;
  fadeOpacity: number;
  fadePosition: { x: number; y: number };
  dvdPosition: { x: number; y: number };
  fallbackRef: RefObject<HTMLDivElement | null>;
  debugMode: boolean;
  debugLogs: Array<{timestamp: string, type: string, message: string}>;
  maxDebugLogs: number;
  onClearLogs: () => void;
  // Lyrics props
  showLyrics?: boolean;
  lyrics?: Lyrics | null;
  lyricsBgMode?: LyricsBgMode;
  lyricsBgColor?: string | null;
  lyricsColors?: LyricsColors | null;
  currentLyricIndex?: number;
  playerProgress?: { progress: number; trackId: string | null } | null;
  // Track info prop
  showTrackInfo?: boolean;
}

export const FallbackDisplay = ({
  track,
  currentTime,
  language,
  mode,
  fadeOpacity,
  fadePosition,
  dvdPosition,
  fallbackRef,
  debugMode,
  debugLogs,
  maxDebugLogs,
  onClearLogs,
  // Lyrics props
  showLyrics = false,
  lyrics = null,
  lyricsBgMode = 'theme',
  lyricsBgColor = '#000000',
  lyricsColors = null,
  currentLyricIndex = -1,
  playerProgress = null,
  // Track info prop
  showTrackInfo = true
}: FallbackDisplayProps) => {
  
  // Calcular progresso para animação de "..." quando aguardando primeira linha
  const getWaitingProgress = () => {
    if (!lyrics || currentLyricIndex >= 0 || !playerProgress) return 0;
    
    const currentTimeMs = playerProgress.progress;
    const firstLineTime = parseInt(lyrics.lines[0]?.startTimeMs || '0');
    
    if (firstLineTime <= 0) return 0;
    
    const progress = Math.min(currentTimeMs / firstLineTime, 1);
    return progress;
  };

  // Determinar background baseado no modo
  const getBackgroundStyle = () => {
    if (lyricsBgMode === 'theme' && lyricsColors?.background) {
      return {
        background: `#${(lyricsColors.background >>> 0).toString(16).padStart(6, '0')}`,
        transition: 'background 0.5s',
      };
    } else if (lyricsBgMode === 'fixed' && lyricsBgColor) {
      return {
        background: lyricsBgColor,
        transition: 'background 0.5s',
      };
    } else if (lyricsBgMode === 'cover' && track?.album.images[0]?.url) {
      return {
        background: `url(${track.album.images[0].url}) center/cover no-repeat`,
        transition: 'background 0.5s',
      };
    }
    return {
      background: '#000000',
      transition: 'background 0.5s',
    };
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={getBackgroundStyle()}
    >
      {/* Overlay escuro quando usando capa como background */}
      {lyricsBgMode === 'cover' && track?.album.images[0]?.url && (
        <div 
          className="absolute inset-0"
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            mixBlendMode: 'multiply'
          }}
        ></div>
      )}

      {/* Lyrics Overlay */}
      {showLyrics && lyrics && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none select-none">
          {/* Debug info */}
          {debugMode && (
            <div className="text-white text-sm mb-4">
              currentLyricIndex: {currentLyricIndex}, 
              lyrics lines: {lyrics?.lines?.length || 0}, 
              progress: {getWaitingProgress().toFixed(2)}
            </div>
          )}
          
          {/* Linhas da letra */}
          <div className="w-full max-w-4xl mx-auto text-center px-6">
            {lyrics.lines.map((line, idx) => {
              // Quando aguardando primeira linha, mostrar apenas a linha 0
              if (currentLyricIndex === -1) {
                if (idx !== 0) return null;
              } else {
                // Estado normal - mostrar linhas próximas à atual
                if (Math.abs(idx - currentLyricIndex) > 2) return null;
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
                  className={`transition-all duration-500 ease-out transform
                    ${isActive 
                      ? 'text-white font-bold text-3xl md:text-5xl lg:text-6xl scale-110 opacity-100 mb-8 md:mb-12 lg:mb-16'
                      : isNext
                      ? 'text-white font-medium text-2xl md:text-3xl lg:text-4xl scale-100 opacity-70 mb-4 md:mb-6 lg:mb-8'
                      : isPrevious
                      ? 'text-white font-normal text-xl md:text-2xl lg:text-3xl scale-95 opacity-40 mb-4 md:mb-6 lg:mb-8'
                      : 'text-white font-normal text-lg md:text-xl lg:text-2xl scale-90 opacity-20 mb-2 md:mb-4 lg:mb-6'
                    }
                  `}
                  style={{
                    color: '#fff',
                    textShadow: isActive 
                      ? '0 4px 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)'
                      : '0 2px 4px rgba(0,0,0,0.6)',
                    marginBottom: isActive 
                      ? '4vh' // 4% da altura da viewport para linha ativa
                      : isNext || isPrevious
                      ? '2vh' // 2% da altura da viewport para linhas próximas
                      : '1vh', // 1% da altura da viewport para linhas distantes
                    ...(isActive && {
                      height: '8vh', // Altura fixa para linha ativa (preparada para 2 linhas)
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    })
                  }}
                >
                  <span className="inline-block">
                    {line.words}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Track Info Overlay (quando não há letras ou como fallback) */}
      {track && showTrackInfo && !showLyrics && (
        <div 
          ref={fallbackRef}
          className={`text-white text-center transition-opacity duration-1000 transition-all duration-500 z-10 ${
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
      )}

      {/* Track Info Overlay (quando há letras, mostrar embaixo) */}
      {track && showTrackInfo && showLyrics && (
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

      {/* Clock when no track is playing */}
      {!track && (
        <div 
          ref={fallbackRef}
          className={`text-white text-center transition-opacity duration-1000 transition-all duration-500 z-10 ${
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
        <div className="absolute top-8 left-8 max-w-md max-h-96 overflow-y-auto bg-black bg-opacity-80 backdrop-blur-sm rounded-lg p-4 text-white text-xs z-30">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm">🔧 Debug Logs</h3>
              <span className="text-xs text-gray-400">
                ({debugLogs.length}/{maxDebugLogs})
              </span>
            </div>
            <button 
              onClick={onClearLogs}
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
}; 