'use client';

import { useEffect, useRef } from 'react';
import { useScreenSaverAnimation } from '../hooks/useScreenSaverAnimation';
import { useScreenSaverPlayerProgress } from '../hooks/useScreenSaverPlayerProgress';
import { useScreenSaverCanvasFetch } from '../hooks/useScreenSaverCanvasFetch';
import { ClockDisplay } from './ClockDisplay';
import { AlbumDisplay } from './AlbumDisplay';

interface Track {
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
}

interface ScreenSaverConfig {
  displayMode: 'album1' | 'album2' | 'clock';
  clockMode: '12h' | '24h';
  timezone: string;
  showDate: boolean;
  showTrackInfo: boolean;
  movement: 'fade' | 'dvd' | 'static';
  fadeSpeed: number;
}

interface ScreenSaverDisplayProps {
  config: ScreenSaverConfig;
  track: Track | null;
  debugMode?: boolean;
  addDebugLog?: (type: string, message: string) => void;
}

export const ScreenSaverDisplay = ({ config, track, debugMode = false, addDebugLog = () => {} }: ScreenSaverDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Determinar se devemos fazer polling baseado na configuração
  const shouldPollForMusic = !(config.displayMode === 'clock' && !config.showTrackInfo);
  
  // Log quando polling está desabilitado
  useEffect(() => {
    if (!shouldPollForMusic && debugMode) {
      addDebugLog('SCREEN_SAVER', 'Polling disabled: clock mode with showTrackInfo=false');
    }
  }, [shouldPollForMusic, debugMode, addDebugLog]);
  
  // Player progress hook para detectar mudanças de música
  const {
    playerProgress,
    isLoading: isPlayerLoading,
    error: playerError
  } = useScreenSaverPlayerProgress({
    enabled: shouldPollForMusic, // Só habilitado se não for clock sem track info
    debugMode,
    addDebugLog
  });

  // Canvas fetch hook para buscar Canvas quando música mudar
  const {
    track: canvasTrack,
    canvasData,
    isLoading: isCanvasLoading,
    error: canvasError
  } = useScreenSaverCanvasFetch({
    trackId: shouldPollForMusic ? (playerProgress?.trackId || null) : null,
    debugMode,
    addDebugLog
  });

  const { style, setContainerSize, setElementSize } = useScreenSaverAnimation({
    movement: config.movement,
    fadeSpeed: config.fadeSpeed
  });

  // Usar track do Canvas se disponível, senão usar o track passado como prop
  const currentTrack = canvasTrack || track;

  // Detectar mudanças de música e fazer requisições quando necessário
  useEffect(() => {
    if (playerProgress?.trackId && debugMode) {
      addDebugLog('SCREEN_SAVER', `Current track: ${playerProgress.trackId}, Progress: ${(playerProgress.progress/1000).toFixed(2)}s`);
    }
  }, [playerProgress, debugMode, addDebugLog]);

  // Configurar dimensões do container para animações
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && contentRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        

        
        setContainerSize(containerRect.width, containerRect.height);
        setElementSize(contentRect.width, contentRect.height);
      }
    };

    // Atualizar dimensões imediatamente
    updateDimensions();

    // Atualizar dimensões quando a janela for redimensionada
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [setContainerSize, setElementSize, config.displayMode, currentTrack]);
  
  // Determinar o que exibir
  const shouldShowClock = config.displayMode === 'clock' || !currentTrack;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
    >
      <div 
        ref={contentRef}
        className="absolute"
        style={{
          ...style,
          position: 'absolute',
          ...(config.movement === 'static' && {
            top: '50%',
            left: '50%'
          })
        }}
      >
        {shouldShowClock ? (
          <ClockDisplay
            mode={config.clockMode}
            timezone={config.timezone}
            showDate={config.showDate}
            showTrackInfo={config.showTrackInfo}
            track={currentTrack}
          />
        ) : (
          <AlbumDisplay
            mode={config.displayMode as 'album1' | 'album2'}
            track={currentTrack}
          />
        )}
      </div>
    </div>
  );
}; 