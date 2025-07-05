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
      throw new Error(`Failed to get client token: ${clientTokenResponse.status}`);
    }

    const clientTokenData = await clientTokenResponse.json();

    return NextResponse.json({
      clientToken: clientTokenData.granted_token.token,
    });
  } catch (error) {
    console.error('Error getting client token:', error);
    return NextResponse.json(
      { error: 'Failed to get client token' },
      { status: 500 }
    );
  }
}
