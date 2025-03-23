import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const songs = db.getSongs('active');
    const activeSong = db.getCurrentSong();
    return NextResponse.json({ 
      songs,
      activeSongId: activeSong?.id
    });
  } catch (error) {
    console.error('Error getting songs:', error);
    return NextResponse.json(
      { error: 'Error getting songs' },
      { status: 500 }
    );
  }
} 