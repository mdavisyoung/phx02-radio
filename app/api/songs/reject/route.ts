import { NextResponse } from 'next/server';
import { readFile, writeFile, unlink } from 'fs/promises';
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

    // Find the song
    const song = songs.find(s => s.id === songId);
    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Delete the files
    try {
      const audioPath = path.join(process.cwd(), 'public', song.audioUrl);
      const coverPath = path.join(process.cwd(), 'public', song.coverArt);
      
      await unlink(audioPath);
      await unlink(coverPath);
    } catch (error) {
      console.error('Error deleting files:', error);
      // Continue even if file deletion fails
    }

    // Remove from songs list
    const updatedSongs = songs.filter(s => s.id !== songId);

    // Save updated songs
    await writeFile(
      songsPath,
      JSON.stringify({ songs: updatedSongs }, null, 2)
    );

    // Remove from playlist if present
    try {
      const playlistPath = path.join(process.cwd(), 'data', 'playlist.json');
      const playlistData = await readFile(playlistPath, 'utf-8');
      const playlist = JSON.parse(playlistData).songIds || [];
      
      if (playlist.includes(songId)) {
        const updatedPlaylist = playlist.filter((id: string) => id !== songId);
        await writeFile(
          playlistPath,
          JSON.stringify({ songIds: updatedPlaylist }, null, 2)
        );
      }
    } catch (error) {
      console.error('Error updating playlist:', error);
      // Continue even if playlist update fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting song:', error);
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
} 