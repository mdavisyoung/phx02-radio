import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Read the playlist from the data file
    const playlistPath = path.join(process.cwd(), 'data', 'playlist.json');
    const songsPath = path.join(process.cwd(), 'data', 'songs.json');

    let playlist = [];
    let songs = [];

    try {
      const playlistData = await readFile(playlistPath, 'utf-8');
      playlist = JSON.parse(playlistData).songIds || [];
      
      const songsData = await readFile(songsPath, 'utf-8');
      songs = JSON.parse(songsData).songs || [];
    } catch (error) {
      // If the file doesn't exist, return an empty playlist
      return NextResponse.json({ playlist: [] });
    }

    // Map the song IDs to full song objects
    const playlistWithSongs = playlist
      .map(songId => songs.find(song => song.id === songId))
      .filter(Boolean); // Remove any null entries if songs weren't found

    return NextResponse.json({ playlist: playlistWithSongs });
  } catch (error) {
    console.error('Error reading playlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 