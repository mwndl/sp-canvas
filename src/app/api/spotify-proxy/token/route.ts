import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sp_dc = request.nextUrl.searchParams.get('sp_dc');

    if (!sp_dc) {
      return NextResponse.json(
        { error: 'sp_dc parameter is required' },
        { status: 400 }
      );
    }

    // Proxy the request to Spotify
    const spotifyResponse = await fetch(
      'https://open.spotify.com/get_access_token?reason=transport&productType=web_player',
      {
        method: 'GET',
        headers: {
          'Cookie': `sp_dc=${sp_dc}`,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Referer': 'https://open.spotify.com/',
          'Origin': 'https://open.spotify.com',
        },
      }
    );

    if (!spotifyResponse.ok) {
      return NextResponse.json(
        { error: `Spotify returned ${spotifyResponse.status}` },
        { status: spotifyResponse.status }
      );
    }

    const data = await spotifyResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 500 }
    );
  }
} 