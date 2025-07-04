import { NextRequest, NextResponse } from 'next/server';
import { getCanvases, getCurrentTrack } from '@/lib/canvasService.js';
import { getToken } from '@/lib/spotifyAuthService.js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackUri = searchParams.get('trackUri');

    if (!trackUri) {
      // Se não foi fornecido trackUri, buscar a música atual
      const currentTrack = await getCurrentTrack();
      
      if (!currentTrack || !currentTrack.item) {
        return NextResponse.json(
          { error: 'No track currently playing' },
          { status: 404 }
        );
      }

      const canvasData = await getCanvases(currentTrack.item.uri);
      
      if (!canvasData) {
        return NextResponse.json(
          { error: 'No canvas available for this track' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        track: currentTrack.item,
        canvas: canvasData
      });
    } else {
      // Se foi fornecido trackUri, buscar Canvas para essa música específica
      const canvasData = await getCanvases(trackUri);
      
      if (!canvasData) {
        return NextResponse.json(
          { error: 'No canvas available for this track' },
          { status: 404 }
        );
      }

      // Extrair track ID do URI para buscar informações da música
      const trackId = trackUri.replace('spotify:track:', '');
      
      // Buscar informações da música usando a API do Spotify
      const accessToken = await getToken();
      const trackResponse = await fetch(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      let trackInfo = null;
      if (trackResponse.ok) {
        trackInfo = await trackResponse.json();
      }

      return NextResponse.json({
        track: trackInfo,
        canvas: canvasData
      });
    }
  } catch (error) {
    console.error('Canvas fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 