import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Get current playing track
    const currentTrackResponse = await fetch(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!currentTrackResponse.ok) {
      if (currentTrackResponse.status === 204) {
        // No track currently playing
        return NextResponse.json({ track: null });
      }
      throw new Error(`Failed to get current track: ${currentTrackResponse.status}`);
    }

    const trackData = await currentTrackResponse.json();

    if (!trackData.item) {
      return NextResponse.json({ track: null });
    }

    const track = trackData.item;
    const trackUri = track.uri;

    // Get Canvas using Spotify's internal API
    const canvasResponse = await fetch(
      'https://api-partner.spotify.com/pathfinder/v2/query',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'App-Platform': 'WebPlayer',
        },
        body: JSON.stringify({
          variables: {
            uri: trackUri,
          },
          operationName: 'canvas',
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash: '1b1e1915481c99f4349af88268c6b49a2b601cf0db7bca8749b5dd75088486fc',
            },
          },
        }),
      }
    );

    let canvasUrl = null;
    if (canvasResponse.ok) {
      try {
        const canvasData = await canvasResponse.json();
        canvasUrl = canvasData?.data?.trackUnion?.canvas?.url || null;
      } catch (error) {
        console.warn('Failed to parse canvas response:', error);
      }
    }

    // Get album image
    const albumImage = track.album?.images?.[0]?.url || null;

    // Format track info
    const trackInfo = {
      name: track.name,
      artists: track.artists?.map((artist: any) => artist.name) || [],
      albumImage,
      canvasUrl,
      uri: trackUri,
    };

    return NextResponse.json({ track: trackInfo });
  } catch (error) {
    console.error('Error getting current track:', error);
    return NextResponse.json(
      { error: 'Failed to get current track' },
      { status: 500 }
    );
  }
} 