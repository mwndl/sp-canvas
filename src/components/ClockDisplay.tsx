'use client';

import { useClock } from '../hooks/useClock';

interface ClockDisplayProps {
  mode: '12h' | '24h';
  timezone: string;
  showDate: boolean;
  showTrackInfo: boolean;
  track?: {
    name: string;
    artists: Array<{ name: string }>;
  } | null;
}

export const ClockDisplay = ({ 
  mode, 
  timezone, 
  showDate, 
  showTrackInfo, 
  track 
}: ClockDisplayProps) => {
  const { formattedTime, formattedDate } = useClock({
    mode,
    timezone,
    showDate
  });

  return (
    <div className="text-center text-white">
      {/* Time */}
      <div className="text-8xl font-light mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
        {formattedTime}
      </div>
      
      {/* Date */}
      {showDate && formattedDate && (
        <div className="text-2xl text-gray-300 mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {formattedDate}
        </div>
      )}
      
      {/* Track Info */}
      {showTrackInfo && track && (
        <div className="text-xl text-gray-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          ♪ {track.name} - {track.artists.map(artist => artist.name).join(', ')}
        </div>
      )}
    </div>
  );
}; 