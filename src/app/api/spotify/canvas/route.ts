import { NextRequest, NextResponse } from 'next/server';
import { getCanvases, getCurrentTrack } from '@/lib/canvasService.js';
import { getToken } from '@/lib/spotifyAuthService.js';
import { spotifyCache, CACHE_KEYS, CACHE_TTLS } from '@/lib/cache';

// Função para limpar cache relacionado a uma música específica
function clearTrackCache(trackId: string) {
  spotifyCache.clear(CACHE_KEYS.CANVAS(trackId));
  spotifyCache.clear(CACHE_KEYS.LYRICS(trackId));
  console.log('🧹 Cache limpo para track:', trackId);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackUri = searchParams.get('trackUri');
    const forceRefresh = searchParams.get('forceRefresh') === 'true';

    if (trackUri) {
      console.log('🎯 API Canvas - Buscando Canvas para Track URI específico:', trackUri);
    } else {
      console.log('🎵 API Canvas - Buscando música atual (modo automático)');
    }

    if (!trackUri) {
      // Cache para música atual
      const cacheKey = CACHE_KEYS.CURRENT_TRACK();
      
      // Se forceRefresh, limpar cache primeiro
      if (forceRefresh) {
        spotifyCache.clear(cacheKey);
        console.log('🔄 Forçando refresh do cache para música atual');
      }
      
      const result = await spotifyCache.executeWithCache(
        cacheKey,
        async () => {
          console.log('🔄 API Canvas - Fazendo requisição ao Spotify (música atual)');
          
          // Se não foi fornecido trackUri, buscar a música atual
          const currentTrack = await getCurrentTrack();
          
          if (!currentTrack || !currentTrack.item) {
            throw new Error('No track currently playing');
          }

          const canvasData = await getCanvases(currentTrack.item.uri);
          
          if (!canvasData) {
            throw new Error('No canvas available for this track');
          }

          return {
            track: currentTrack.item,
            canvas: canvasData
          };
        },
        CACHE_TTLS.CURRENT_TRACK
      );

      return NextResponse.json(result);
    } else {
      // Cache para track específico
      const trackId = trackUri.replace('spotify:track:', '');
      const cacheKey = CACHE_KEYS.CANVAS(trackId);
      
      // Se forceRefresh, limpar cache primeiro
      if (forceRefresh) {
        clearTrackCache(trackId);
        console.log('🔄 Forçando refresh do cache para track:', trackId);
      }
      
      const result = await spotifyCache.executeWithCache(
        cacheKey,
        async () => {
          console.log('🔄 API Canvas - Fazendo requisição ao Spotify (track específico)');
          
          // Se foi fornecido trackUri, buscar Canvas para essa música específica
          const canvasData = await getCanvases(trackUri);
          
          console.log('📊 API Canvas - Resultado do Canvas:', canvasData ? 'Encontrado' : 'Não encontrado');
          
          if (!canvasData) {
            console.log('❌ API Canvas - Nenhum Canvas disponível para:', trackUri);
            throw new Error('No canvas available for this track');
          }

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

          return {
            track: trackInfo,
            canvas: canvasData
          };
        },
        CACHE_TTLS.CANVAS
      );

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Canvas fetch error:', error);
    
    // Se for erro de "no track playing", retornar 404
    if (error instanceof Error && error.message === 'No track currently playing') {
      return NextResponse.json(
        { error: 'No track currently playing' },
        { status: 404 }
      );
    }
    
    // Se for erro de "no canvas available", retornar 404
    if (error instanceof Error && error.message === 'No canvas available for this track') {
      return NextResponse.json(
        { error: 'No canvas available for this track' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 