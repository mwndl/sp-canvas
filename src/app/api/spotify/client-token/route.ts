import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sp_dc } = await request.json();

    if (!sp_dc) {
      return NextResponse.json(
        { error: 'sp_dc token is required' },
        { status: 400 }
      );
    }

    // Return instructions for client-side token fetching
    return NextResponse.json({
      success: true,
      message: 'Use client-side approach',
      instructions: {
        url: 'https://open.spotify.com/get_access_token?reason=transport&productType=web_player',
        method: 'GET',
        headers: {
          'Cookie': `sp_dc=${sp_dc}`,
        }
      }
    });

  } catch (error) {
    console.error('Error in client token route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 