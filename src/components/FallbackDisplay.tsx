import { RefObject, useEffect, useState } from 'react';
import { DebugPanel } from './DebugPanel';

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

interface FallbackDisplayProps {
  track: Track | null;
  currentTime: Date;
  language: string;
  fallbackRef: RefObject<HTMLDivElement | null>;
  debugMode: boolean;
  debugLogs: Array<{timestamp: string, type: string, message: string}>;
  maxDebugLogs: number;
  onClearLogs: () => void;
  // Lyrics props
  showLyrics?: boolean;
  lyrics?: Lyrics | null;
  lyricsColors?: LyricsColors | null;
  currentLyricIndex?: number;
  playerProgress?: { progress: number; trackId: string | null } | null;
  // Track info prop
  showTrackInfo?: boolean;
  // Lyrics mode prop
  lyricsMode?: '5lines' | 'left';
}

export const FallbackDisplay = ({
  track,
  currentTime,
  language,
  fallbackRef,
  debugMode,
  debugLogs,
  maxDebugLogs,
  onClearLogs,
  // Lyrics props
  showLyrics = false,
  lyrics = null,
  lyricsColors = null,
  currentLyricIndex = -1,
  playerProgress = null,
  // Track info prop
  showTrackInfo = true,
  // Lyrics mode prop
  lyricsMode = '5lines'
}: FallbackDisplayProps) => {
  
  const [currentLyricIndexState, setCurrentLyricIndex] = useState(currentLyricIndex);

  // Atualizar estado local quando prop mudar
  useEffect(() => {
    setCurrentLyricIndex(currentLyricIndex);
  }, [currentLyricIndex]);

  // Sincronizar a linha da letra com o tempo do player do Spotify
  useEffect(() => {
    if (!showLyrics || !lyrics || !playerProgress) return;
    
    const currentTimeMs = playerProgress.progress;
    let idx = -1; // -1 = aguardando primeira linha
    
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
      console.log('LYRICS', `Player time: ${(currentTimeMs/1000).toFixed(2)}s, idx: ${idx}, line: ${idx >= 0 ? lyrics.lines[idx]?.words : 'waiting...'}`);
    }
    
    setCurrentLyricIndex(idx);
  }, [showLyrics, lyrics, playerProgress, debugMode]);

  // Calcular progresso para animação de "..." quando aguardando primeira linha
  const getWaitingProgress = () => {
    if (!lyrics || currentLyricIndexState >= 0 || !playerProgress) return 0;
    
    const currentTimeMs = playerProgress.progress;
    const firstLineTime = parseInt(lyrics.lines[0]?.startTimeMs || '0');
    
    if (firstLineTime <= 0) return 0;
    
    const progress = Math.min(currentTimeMs / firstLineTime, 1);
    return progress;
  };

  // Determinar background - sempre usar capa do álbum
  const getBackgroundStyle = () => {
    if (track?.album.images[0]?.url) {
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
      {track?.album.images[0]?.url && (
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            mixBlendMode: 'multiply'
          }}
        ></div>
      )}

      {/* Conteúdo principal */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
        {/* Clock quando não há música */}
        {!track && (
          <div className="text-white text-center">
            <div className="text-8xl font-light mb-4">
              {currentTime.toLocaleTimeString(language === 'pt' ? 'pt-BR' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })}
            </div>
            <div className="text-2xl text-gray-300">
              {currentTime.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        )}

        {/* Track Info quando há música */}
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

        
      </div>

      {/* Lyrics quando habilitadas - fora do container principal */}
      {showLyrics && lyrics && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-50">
          <div 
            className={`mx-auto px-6 ${lyricsMode === 'left' ? 'w-full max-w-6xl' : 'w-full max-w-4xl text-center'}`}
            style={{
              ...(lyricsMode === 'left' && {
                transform: `translateY(-${currentLyricIndexState * 0.3}vh)`,
                transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              })
            }}
          >
              {/* Debug info */}
              {debugMode && (
                <div className="text-white text-sm mb-4">
                  currentLyricIndex: {currentLyricIndexState}, 
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
                const maxLines = lyricsMode === 'left' ? 3 : 2;
                
                // Quando aguardando primeira linha, mostrar apenas a linha 0
                if (currentLyricIndexState === -1) {
                  if (idx !== 0) return null;
                } else {
                  // Estado normal - mostrar linhas baseado no modo
                  if (lyricsMode === 'left') {
                    // Modo left: mostrar linhas anteriores e próximas
                    if (idx < currentLyricIndexState - 2 || idx > currentLyricIndexState + 3) return null;
                  } else {
                    // Modo 5 linhas: mostrar linhas próximas à atual
                    if (Math.abs(idx - currentLyricIndexState) > maxLines) return null;
                  }
                }
                
                const isActive = idx === currentLyricIndexState;
                const isNext = idx === currentLyricIndexState + 1;
                const isPrevious = idx === currentLyricIndexState - 1;
                
                // Estado de aguardando primeira linha - mostrar "..." no lugar da linha atual
                if (currentLyricIndexState === -1 && idx === 0) {
                  const progress = getWaitingProgress();
                  const dots = Math.floor(progress * 3) + 1;
                  
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
                        opacity: 0.7,
                        ...(lyricsMode === 'left' && {
                          fontSize: '2rem',
                          lineHeight: '2.5rem',
                          marginBottom: '0.5rem'
                        })
                      }}
                    >
                      {'.'.repeat(dots)}
                    </div>
                  );
                }
                
                // Linha normal
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
                      ...(lyricsMode === 'left' && {
                        fontSize: '2rem',
                        lineHeight: '2.5rem',
                        marginBottom: '0.5rem'
                      })
                    }}
                  >
                    {line.words}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* Debug Panel */}
      {debugMode && (
        <DebugPanel
          debugLogs={debugLogs}
          maxLogs={maxDebugLogs}
          onClearLogs={onClearLogs}
        />
      )}
    </div>
  );
}; 