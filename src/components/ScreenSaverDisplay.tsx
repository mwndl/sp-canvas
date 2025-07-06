'use client';

import { useEffect, useRef } from 'react';
import { useScreenSaverAnimation } from '../hooks/useScreenSaverAnimation';
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
  movement: 'fade' | 'dvd';
  fadeSpeed: number;
}

interface ScreenSaverDisplayProps {
  config: ScreenSaverConfig;
  track: Track | null;
}

export const ScreenSaverDisplay = ({ config, track }: ScreenSaverDisplayProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { style, setContainerSize, setElementSize } = useScreenSaverAnimation({
    movement: config.movement,
    fadeSpeed: config.fadeSpeed
  });

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
  }, [setContainerSize, setElementSize, config.displayMode, track]);

  // Determinar o que exibir
  const shouldShowClock = config.displayMode === 'clock' || !track;

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
          position: 'absolute'
        }}
      >
        {shouldShowClock ? (
          <ClockDisplay
            mode={config.clockMode}
            timezone={config.timezone}
            showDate={config.showDate}
            showTrackInfo={config.showTrackInfo}
            track={track}
          />
        ) : (
          <AlbumDisplay
            mode={config.displayMode as 'album1' | 'album2'}
            track={track}
          />
        )}
      </div>
    </div>
  );
}; 