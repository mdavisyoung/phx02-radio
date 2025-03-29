import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverArt: string;
  instagram?: string;
  twitter?: string;
  status: 'pending' | 'active';
  createdAt: string;
}

export async function POST(request: Request) {
  try {
    const { songId } = await request.json();
    
    // Update song status
    db.updateSongStatus(songId, 'active');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting active song:', error);
    return NextResponse.json(
      { error: 'Error setting active song' },
      { status: 500 }
    );
  }
} 