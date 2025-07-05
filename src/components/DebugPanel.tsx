interface DebugLog {
  timestamp: string;
  type: string;
  message: string;
}

interface DebugPanelProps {
  debugLogs: DebugLog[];
  maxLogs: number;
  onClearLogs: () => void;
}

export const DebugPanel = ({ debugLogs, maxLogs, onClearLogs }: DebugPanelProps) => {
  const getLogTypeStyle = (type: string) => {
    switch (type) {
      case 'ERROR': return 'bg-red-500 text-white';
      case 'FAILURE': return 'bg-red-600 text-white';
      case 'TIMEOUT': return 'bg-yellow-600 text-white';
      case 'SUCCESS': return 'bg-green-600 text-white';
      case 'READY': return 'bg-blue-600 text-white';
      case 'LOAD': return 'bg-blue-500 text-white';
      case 'STALLED': return 'bg-orange-600 text-white';
      case 'SUSPEND': return 'bg-orange-500 text-white';
      case 'ABORT': return 'bg-red-700 text-white';
      case 'EMPTIED': return 'bg-purple-600 text-white';
      case 'FALLBACK': return 'bg-gray-700 text-white';
      case 'CONFIG': return 'bg-indigo-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="absolute top-8 left-8 max-w-md max-h-96 overflow-y-auto bg-black bg-opacity-80 backdrop-blur-sm rounded-lg p-4 text-white text-xs">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-sm">🔧 Debug Logs</h3>
          <span className="text-xs text-gray-400">
            ({debugLogs.length}/{maxLogs})
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
            <span className={`px-1 rounded text-xs ${getLogTypeStyle(log.type)}`}>
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
  );
}; 