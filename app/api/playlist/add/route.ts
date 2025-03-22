import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { songId } = await request.json();

    if (!songId) {
      return NextResponse.json(
        { error: 'Song ID is required' },
        { status: 400 }
      );
    }

    const playlistPath = path.join(process.cwd(), 'data', 'playlist.json');
    const songsPath = path.join(process.cwd(), 'data', 'songs.json');

    // Verify the song exists
    let songs = [];
    try {
      const songsData = await readFile(songsPath, 'utf-8');
      songs = JSON.parse(songsData).songs || [];
    } catch (error) {
      return NextResponse.json(
        { error: 'Error reading songs data' },
        { status: 500 }
      );
    }

    const songExists = songs.some((song) => song.id === songId);
    if (!songExists) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Read existing playlist or create new one
    let playlist = [];
    try {
      const playlistData = await readFile(playlistPath, 'utf-8');
      playlist = JSON.parse(playlistData).songIds || [];
    } catch (error) {
      // If file doesn't exist, start with empty playlist
    }

    // Add song if it's not already in playlist
    if (!playlist.includes(songId)) {
      playlist.push(songId);
      await writeFile(playlistPath, JSON.stringify({ songIds: playlist }, null, 2));
    }

    // Return updated playlist with full song objects
    const playlistWithSongs = playlist
      .map(id => songs.find(song => song.id === id))
      .filter(Boolean);

    return NextResponse.json({ playlist: playlistWithSongs });
  } catch (error) {
    console.error('Error adding to playlist:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 