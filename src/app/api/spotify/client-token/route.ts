import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/spotifyAuthService.js';
import { spotifyCache, CACHE_KEYS, CACHE_TTLS } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    // Cache para client token
    const cacheKey = CACHE_KEYS.CLIENT_TOKEN();
    
    const result = await spotifyCache.executeWithCache(
      cacheKey,
      async () => {
        console.log('🔄 API Client Token - Fazendo requisição ao Spotify');
        
        // Get access token using the same method as other APIs
        const accessToken = await getToken();

        if (!accessToken) {
          throw new Error('Failed to get access token');
        }

        // Get client token from Spotify
        const clientTokenResponse = await fetch('https://clienttoken.spotify.com/v1/clienttoken', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
          },
          body: JSON.stringify({
            client_data: {
              client_version: '1.2.68.318.g41192627',
              js_sdk_data: {
                device_brand: 'unknown',
                device_model: 'unknown',
                os: 'macos',
                os_version: '10.15.7',
              },
            },
          }),
        });

        if (!clientTokenResponse.ok) {
          const errorText = await clientTokenResponse.text();
          console.error('Client token error:', clientTokenResponse.status, errorText);
          throw new Error(`Failed to get client token: ${clientTokenResponse.status} - ${errorText}`);
        }

        const clientTokenData = await clientTokenResponse.json();

        return {
          clientToken: clientTokenData.granted_token.token,
        };
      },
      CACHE_TTLS.CLIENT_TOKEN
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting client token:', error);
    return NextResponse.json(
      { error: 'Failed to get client token' },
      { status: 500 }
    );
  }
}
