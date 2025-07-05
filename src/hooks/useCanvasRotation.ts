import { useState, useEffect } from 'react';

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

interface UseCanvasRotationOptions {
  canvasData: CanvasData | null;
  lastTrackUri: string | null;
}

export const useCanvasRotation = ({ canvasData, lastTrackUri }: UseCanvasRotationOptions) => {
  const [currentCanvasIndex, setCurrentCanvasIndex] = useState(0);

  // Reset canvas index when track changes
  useEffect(() => {
    if (lastTrackUri) {
      setCurrentCanvasIndex(0);
    }
  }, [lastTrackUri]);

  // Auto-rotate between multiple canvases
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

  return {
    currentCanvasIndex,
    setCurrentCanvasIndex
  };
}; 