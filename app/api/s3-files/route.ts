import { NextResponse } from 'next/server';
import { listS3Files } from '@/lib/s3';

export async function GET() {
  try {
    const files = await listS3Files();
    
    // Group files by type (songs and covers)
    const songs = files.filter(file => file?.key?.startsWith('songs/'));
    const covers = files.filter(file => file?.key?.startsWith('covers/'));

    // Match songs with their cover art
    const songsWithCovers = songs.map(song => {
      if (!song) return null;
      const songName = song.key.replace('songs/', '').replace('.mp3', '');
      const cover = covers.find(cover => 
        cover?.key?.replace('covers/', '').replace('.jpg', '') === songName
      );

      return {
        id: songName,
        audioUrl: song.url,
        coverUrl: cover?.url || '',
        title: songName.replace(/-/g, ' '),
      };
    });

    return NextResponse.json({ songs: songsWithCovers.filter(Boolean) });
  } catch (error) {
    console.error('Error listing S3 files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
} 