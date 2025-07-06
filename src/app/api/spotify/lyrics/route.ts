import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/spotifyAuthService.js';
import { spotifyCache, CACHE_KEYS, CACHE_TTLS } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const { trackId, albumImageUrl } = await request.json();

    console.log('🎵 Lyrics API - Request received:', { trackId, albumImageUrl });

    if (!trackId) {
      return NextResponse.json(
        { error: 'Track ID is required' },
        { status: 400 }
      );
    }

    // Cache para letras
    const cacheKey = CACHE_KEYS.LYRICS(trackId);
    
    const result = await spotifyCache.executeWithCache(
      cacheKey,
      async () => {
        console.log('🔄 API Lyrics - Fazendo requisição ao Spotify');
        
        // Get access token using the same method as other APIs
        console.log('🔑 Lyrics API - Getting access token...');
        const accessToken = await getToken();

        if (!accessToken) {
          console.error('❌ Lyrics API - Failed to get access token');
          throw new Error('Failed to get access token');
        }

        console.log('✅ Lyrics API - Access token obtained');

        // Get lyrics using Spotify's internal API
        const lyricsUrl = `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}/image/${encodeURIComponent(albumImageUrl || '')}?format=json&vocalRemoval=false&market=from_token`;
        
        console.log('🎵 Lyrics API - Fetching lyrics from:', lyricsUrl);
        
        const lyricsResponse = await fetch(lyricsUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'spotify-app-version': '1.2.68.318.g41192627',
            'app-platform': 'WebPlayer',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'accept': 'application/json',
            'accept-language': 'pt-BR',
            'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Microsoft Edge";v="138"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'DNT': '1',
            'Referer': 'https://open.spotify.com/',
          },
        });

        console.log('📊 Lyrics API - Response status:', lyricsResponse.status);

        if (!lyricsResponse.ok) {
          if (lyricsResponse.status === 404) {
            console.log('❌ Lyrics API - No lyrics available (404)');
            return { lyrics: null, colors: null };
          }
          
          const errorText = await lyricsResponse.text();
          console.error('❌ Lyrics API - Error response:', lyricsResponse.status, errorText);
          throw new Error(`Failed to get lyrics: ${lyricsResponse.status} - ${errorText}`);
        }

        const lyricsData = await lyricsResponse.json();
        console.log('✅ Lyrics API - Lyrics obtained successfully');

        return {
          lyrics: lyricsData.lyrics,
          colors: lyricsData.colors,
        };
      },
      CACHE_TTLS.LYRICS
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Lyrics API - Error:', error);
    
    // Se for erro de "no lyrics available", retornar null
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json({ lyrics: null, colors: null });
    }
    
    return NextResponse.json(
      { error: 'Failed to get lyrics' },
      { status: 500 }
    );
  }
} 