import { NextRequest, NextResponse } from 'next/server';
import { spotifyCache } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();
    
    if (key) {
      // Limpar cache específico
      spotifyCache.clear(key);
      console.log('🧹 Cache limpo para chave:', key);
    } else {
      // Limpar todo o cache
      spotifyCache.clear();
      console.log('🧹 Cache completamente limpo');
    }

    const stats = spotifyCache.getStats();
    
    return NextResponse.json({
      success: true,
      message: key ? `Cache cleared for key: ${key}` : 'All cache cleared',
      stats
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = spotifyCache.getStats();
    
    return NextResponse.json({
      stats
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to get cache stats' },
      { status: 500 }
    );
  }
} 