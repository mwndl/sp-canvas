import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, trackId, albumImageUrl } = await request.json();

    if (!accessToken || !trackId) {
      return NextResponse.json(
        { error: 'Access token and track ID are required' },
        { status: 400 }
      );
    }

    // Get client token first
    const clientTokenResponse = await fetch('/api/spotify/client-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken }),
    });

    if (!clientTokenResponse.ok) {
      throw new Error('Failed to get client token');
    }

    const { clientToken } = await clientTokenResponse.json();

    // Get lyrics using Spotify's internal API
    const lyricsUrl = `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}/image/${encodeURIComponent(albumImageUrl || '')}?format=json&vocalRemoval=false&market=from_token`;
    
    const lyricsResponse = await fetch(lyricsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'client-token': clientToken,
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

    if (!lyricsResponse.ok) {
      if (lyricsResponse.status === 404) {
        return NextResponse.json({ lyrics: null, colors: null });
      }
      throw new Error(`Failed to get lyrics: ${lyricsResponse.status}`);
    }

    const lyricsData = await lyricsResponse.json();

    return NextResponse.json({
      lyrics: lyricsData.lyrics,
      colors: lyricsData.colors,
    });
  } catch (error) {
    console.error('Error getting lyrics:', error);
    return NextResponse.json(
      { error: 'Failed to get lyrics' },
      { status: 500 }
    );
  }
} 