import { NextResponse } from 'next/server';
import { generateUploadURL } from '@/app/lib/s3';

export async function POST(request: Request) {
  try {
    const { songFileName, imageFileName, songName } = await request.json();

    if (!songFileName || !imageFileName || !songName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format the date for the filename
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    
    // Clean the song name for use in filename (remove special chars, spaces to dashes)
    const cleanSongName = songName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Generate unique keys for S3 with new naming convention
    const songKey = `submissions/${cleanSongName}-${timestamp}.mp3`;
    const imageKey = `covers/${cleanSongName}-${timestamp}.jpg`;

    // Get signed URLs
    const [songUploadUrl, imageUploadUrl] = await Promise.all([
      generateUploadURL(songKey, 'audio/mpeg'),
      generateUploadURL(imageKey, 'image/jpeg'),
    ]);

    return NextResponse.json({
      songUploadUrl,
      imageUploadUrl,
      songKey,
      imageKey,
    });
  } catch (error) {
    console.error('Error generating upload URLs:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URLs' },
      { status: 500 }
    );
  }
} 