import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

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

    if (!songId) {
      return NextResponse.json(
        { error: 'Song ID is required' },
        { status: 400 }
      );
    }

    // Read songs file
    const songsPath = path.join(process.cwd(), 'data', 'songs.json');
    let songs: Song[] = [];
    
    try {
      const songsData = await readFile(songsPath, 'utf-8');
      songs = JSON.parse(songsData).songs;
    } catch (error) {
      return NextResponse.json(
        { error: 'Error reading songs data' },
        { status: 500 }
      );
    }

    // Find and update the song
    const songIndex = songs.findIndex(song => song.id === songId);
    if (songIndex === -1) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Update song status
    songs[songIndex].status = 'active';

    // Save updated songs
    await writeFile(
      songsPath,
      JSON.stringify({ songs }, null, 2)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving song:', error);
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
} 