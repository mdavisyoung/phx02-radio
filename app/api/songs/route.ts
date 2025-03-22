import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
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

export async function GET() {
  try {
    // Read all songs
    const songsPath = path.join(process.cwd(), 'data', 'songs.json');
    let songs: Song[] = [];
    
    try {
      const songsData = await readFile(songsPath, 'utf-8');
      const data = JSON.parse(songsData);
      songs = Array.isArray(data) ? data : data.songs || [];
    } catch (error) {
      console.error('Error reading songs:', error);
      songs = [];
    }

    // Read active song ID
    let activeSongId = null;
    try {
      const activeSongPath = path.join(process.cwd(), 'data', 'active-song.json');
      const activeSongData = await readFile(activeSongPath, 'utf-8');
      const { activeSongId: id } = JSON.parse(activeSongData);
      activeSongId = id;
    } catch (error) {
      // No active song set yet
      if (songs.length > 0) {
        activeSongId = songs[songs.length - 1].id;
      }
    }
    
    return NextResponse.json({ 
      songs,
      activeSongId
    });
  } catch (error) {
    console.error('Error in songs API:', error);
    return NextResponse.json(
      { songs: [], activeSongId: null },
      { status: 500 }
    );
  }
} 