import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { songId } = await request.json();
    
    // Read songs.json
    const songsPath = path.join(process.cwd(), 'data/songs.json');
    const songsData = await readFile(songsPath, 'utf-8');
    const songs = JSON.parse(songsData);

    // Find the song
    const song = songs.find((s: any) => s.id === songId);
    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Save active song ID to a separate file
    const activeSongPath = path.join(process.cwd(), 'data/active-song.json');
    await writeFile(
      activeSongPath,
      JSON.stringify({ activeSongId: songId }, null, 2)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting active song:', error);
    return NextResponse.json(
      { error: 'Error setting active song' },
      { status: 500 }
    );
  }
} 