import { NextResponse } from 'next/server';
import { addSongMetadata } from '@/app/lib/metadata';

export async function POST(request: Request) {
  try {
    const songData = await request.json();

    if (!songData.artistName || !songData.songName || !songData.songKey || !songData.imageKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save metadata
    await addSongMetadata(songData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving song metadata:', error);
    return NextResponse.json(
      { error: 'Failed to save song metadata' },
      { status: 500 }
    );
  }
} 