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

type ScreensaverMode = 'static' | 'fade' | 'dvd';

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
  onClearLogs
}: FallbackDisplayProps) => {
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