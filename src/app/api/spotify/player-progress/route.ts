import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/spotifyAuthService.js';
import { spotifyCache, CACHE_KEYS, CACHE_TTLS } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    // Cache para player progress
    const cacheKey = CACHE_KEYS.PLAYER_PROGRESS();
    
    const result = await spotifyCache.executeWithCache(
      cacheKey,
      async () => {
        console.log('🔄 API Player Progress - Fazendo requisição ao Spotify');
        
        // Get access token using the same method as other APIs
        const accessToken = await getToken();

        if (!accessToken) {
          throw new Error('Failed to get access token');
        }

        // Get current player state from Spotify
        const playerResponse = await fetch(
          'https://api.spotify.com/v1/me/player',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!playerResponse.ok) {
          if (playerResponse.status === 204) {
            // No active device
            return { 
              isPlaying: false, 
              progress: 0, 
              trackId: null 
            };
          }
          throw new Error(`Failed to get player state: ${playerResponse.status}`);
        }

        // Check if response has content
        const responseText = await playerResponse.text();
        if (!responseText) {
          return { 
            isPlaying: false, 
            progress: 0, 
            trackId: null 
          };
        }

        const playerData = JSON.parse(responseText);

        if (!playerData.item) {
          return { 
            isPlaying: false, 
            progress: 0, 
            trackId: null 
          };
        }

        return {
          isPlaying: playerData.is_playing || false,
          progress: playerData.progress_ms || 0,
          trackId: playerData.item.id,
          duration: playerData.item.duration_ms || 0,
          timestamp: Date.now() // Adicionar timestamp para compensação
        };
      },
      CACHE_TTLS.PLAYER_PROGRESS
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting player progress:', error);
    return NextResponse.json(
      { error: 'Failed to get player progress' },
      { status: 500 }
    );
  }
} 