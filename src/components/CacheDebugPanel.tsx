'use client';

import { useState, useEffect } from 'react';

interface CacheStats {
  cacheSize: number;
  pendingRequests: number;
  totalEntries: number;
}

export default function CacheDebugPanel() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/cache');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    }
  };

  const clearCache = async (key?: string) => {
    try {
      const response = await fetch('/api/cache/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });
      
      if (response.ok) {
        await fetchStats();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchStats();
      const interval = setInterval(fetchStats, 2000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 z-50"
      >
        Cache Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg text-sm z-50 max-w-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Cache Stats</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      {stats ? (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Cache Entries:</span>
            <span className="text-green-400">{stats.cacheSize}</span>
          </div>
          <div className="flex justify-between">
            <span>Pending Requests:</span>
            <span className="text-yellow-400">{stats.pendingRequests}</span>
          </div>
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="text-blue-400">{stats.totalEntries}</span>
          </div>
        </div>
      ) : (
        <div className="text-gray-400">Loading...</div>
      )}
      
      <div className="mt-3 space-y-2">
        <button
          onClick={() => clearCache()}
          className="w-full bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
        >
          Clear All Cache
        </button>
        <button
          onClick={() => clearCache('player:progress')}
          className="w-full bg-orange-600 hover:bg-orange-700 px-2 py-1 rounded text-xs"
        >
          Clear Player Cache
        </button>
        <button
          onClick={fetchStats}
          className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          Refresh Stats
        </button>
      </div>
    </div>
  );
} 