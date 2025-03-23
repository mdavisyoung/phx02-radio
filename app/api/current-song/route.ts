import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currentSong = db.getCurrentSong();
    return NextResponse.json(currentSong);
  } catch (error) {
    console.error('Error fetching current song:', error);
    return NextResponse.json(
      { error: 'Error fetching current song' },
      { status: 500 }
    );
  }
} 