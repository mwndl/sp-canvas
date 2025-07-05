import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/spotifyAuthService.js';

export async function GET(request: NextRequest) {
  try {
    // Get access token using the same method as other APIs
    const accessToken = await getToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to get access token' },
        { status: 401 }
      );
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
        return NextResponse.json({ 
          isPlaying: false, 
          progress: 0, 
          trackId: null 
        });
      }
      throw new Error(`Failed to get player state: ${playerResponse.status}`);
    }

    const playerData = await playerResponse.json();

    if (!playerData.item) {
      return NextResponse.json({ 
        isPlaying: false, 
        progress: 0, 
        trackId: null 
      });
    }

    return NextResponse.json({
      isPlaying: playerData.is_playing || false,
      progress: playerData.progress_ms || 0,
      trackId: playerData.item.id,
      duration: playerData.item.duration_ms || 0,
    });
  } catch (error) {
    console.error('Error getting player progress:', error);
    return NextResponse.json(
      { error: 'Failed to get player progress' },
      { status: 500 }
    );
  }
} 