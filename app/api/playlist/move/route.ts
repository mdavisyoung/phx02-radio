import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    const { songId, direction } = await request.json();

    if (!songId || !direction || !['up', 'down'].includes(direction)) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    const playlistPath = path.join(process.cwd(), 'data', 'playlist.json');
    const songsPath = path.join(process.cwd(), 'data', 'songs.json');

    // Read the current playlist
    let playlist: string[] = [];
    try {
      const playlistData = await readFile(playlistPath, 'utf-8');
      playlist = JSON.parse(playlistData).songIds || [];
    } catch (error) {
      return NextResponse.json(
        { error: 'Error reading playlist' },
        { status: 500 }
      );
    }

    // Find the current index of the song
    const currentIndex = playlist.indexOf(songId);
    if (currentIndex === -1) {
      return NextResponse.json(
        { error: 'Song not found in playlist' },
        { status: 404 }
      );
    }

    // Calculate the new index
    const newIndex = direction === 'up'
      ? Math.max(0, currentIndex - 1)
      : Math.min(playlist.length - 1, currentIndex + 1);

    // If the indices are the same, no movement is needed
    if (newIndex === currentIndex) {
      return NextResponse.json({ playlist: [] });
    }

    // Reorder the playlist
    const reorderedPlaylist = [...playlist];
    [reorderedPlaylist[currentIndex], reorderedPlaylist[newIndex]] = 
    [reorderedPlaylist[newIndex], reorderedPlaylist[currentIndex]];

    // Save the updated playlist
    await writeFile(
      playlistPath,
      JSON.stringify({ songIds: reorderedPlaylist }, null, 2)
    );

    // Read songs to return full objects
    let songs: Song[] = [];
    try {
      const songsData = await readFile(songsPath, 'utf-8');
      songs = JSON.parse(songsData).songs || [];
    } catch (error) {
      return NextResponse.json(
        { error: 'Error reading songs data' },
        { status: 500 }
      );
    }

    // Map song IDs to full song objects
    const playlistWithSongs = reorderedPlaylist
      .map(id => songs.find(song => song.id === id))
      .filter(Boolean) as Song[];

    return NextResponse.json({ playlist: playlistWithSongs });
  } catch (error) {
    console.error('Error moving song in playlist:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 