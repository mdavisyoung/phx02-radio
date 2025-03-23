import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';

// Route Segment Config
export const fetchCache = 'force-no-store';
export const revalidate = 0;
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

interface PlaylistData {
  songIds: string[];
}

interface SongsData {
  songs: Song[];
}

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET() {
  try {
    // Read the playlist from the data file
    const playlistPath = path.join(process.cwd(), 'data', 'playlist.json');
    const songsPath = path.join(process.cwd(), 'data', 'songs.json');

    let playlist: string[] = [];
    let songs: Song[] = [];

    try {
      const playlistData = await readFile(playlistPath, 'utf-8');
      const parsedPlaylist = JSON.parse(playlistData) as PlaylistData;
      playlist = parsedPlaylist.songIds || [];
      
      const songsData = await readFile(songsPath, 'utf-8');
      const parsedSongs = JSON.parse(songsData) as SongsData;
      songs = parsedSongs.songs || [];
    } catch (error) {
      // If the file doesn't exist, return an empty playlist
      return NextResponse.json({ playlist: [] });
    }

    // Map the song IDs to full song objects
    const playlistWithSongs = playlist
      .map((songId: string) => songs.find((song: Song): boolean => song.id === songId))
      .filter((song): song is Song => song !== undefined);

    return NextResponse.json({ playlist: playlistWithSongs });
  } catch (error) {
    console.error('Error reading playlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 