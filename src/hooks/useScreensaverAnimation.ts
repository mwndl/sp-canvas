import { useState, useEffect, useRef } from 'react';

type ScreensaverMode = 'static' | 'fade' | 'dvd';

interface UseScreensaverAnimationOptions {
  mode: ScreensaverMode;
  fadeInterval: number;
  hasCanvas: boolean;
  hasTrack: boolean;
}

export const useScreensaverAnimation = ({ 
  mode, 
  fadeInterval, 
  hasCanvas, 
  hasTrack 
}: UseScreensaverAnimationOptions) => {
  const [fadeOpacity, setFadeOpacity] = useState(1);
  const [fadePosition, setFadePosition] = useState({ x: 50, y: 50 });
  const [dvdPosition, setDvdPosition] = useState({ x: 50, y: 50 });
  const [dvdVelocity, setDvdVelocity] = useState({ x: 0.25, y: 0.2 });
  const fallbackRef = useRef<HTMLDivElement>(null);

  // Effect for fade in/out with movement
  useEffect(() => {
    if (mode === 'fade' && (!hasCanvas || !hasTrack)) {
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
  }, [mode, hasCanvas, hasTrack, fadeInterval]);

  // Effect for DVD mode
  useEffect(() => {
    if (mode === 'dvd' && (!hasCanvas || !hasTrack)) {
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
          const isAlbumCover = hasTrack; // Simplified check
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
  }, [mode, hasCanvas, hasTrack, dvdVelocity]);

  return {
    fadeOpacity,
    fadePosition,
    dvdPosition,
    fallbackRef
  };
}; 