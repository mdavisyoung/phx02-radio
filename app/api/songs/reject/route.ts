import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { deleteFromS3 } from '@/lib/s3';

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

    // Extract S3 keys from URLs
    const audioKey = song.audioUrl.split('.com/').pop() || '';
    const coverKey = song.coverArt.split('.com/').pop() || '';

    // Delete files from S3
    try {
      await Promise.all([
        deleteFromS3(audioKey),
        deleteFromS3(coverKey)
      ]);
    } catch (error) {
      console.error('Error deleting files from S3:', error);
      // Continue with song removal even if S3 deletion fails
    }

    // Remove song from array
    songs = songs.filter(s => s.id !== songId);

    // Save updated songs
    await writeFile(
      songsPath,
      JSON.stringify({ songs }, null, 2)
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