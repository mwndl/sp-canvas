import { NextResponse } from 'next/server';
import { getToken } from '@/lib/spotifyAuthService.js';

export async function GET() {
  try {
    const accessToken = await getToken();
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Failed to get access token' },
        { status: 500 }
      );
    }

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Token fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 