import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Log received data
    console.log('Received form data:', {
      title: formData.get('title'),
      artist: formData.get('artist'),
      hasAudioFile: !!formData.get('audioFile'),
      hasCoverFile: !!formData.get('coverArt'),
    });

    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const audioFile = formData.get('audioFile') as File;
    const coverFile = formData.get('coverArt') as File;
    const instagram = formData.get('instagram') as string | null;
    const twitter = formData.get('twitter') as string | null;

    if (!title || !artist || !audioFile || !coverFile) {
      console.error('Missing required fields:', { 
        hasTitle: !!title, 
        hasArtist: !!artist, 
        hasAudioFile: !!audioFile, 
        hasCoverFile: !!coverFile 
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add song to database
    const song = await db.addSong(
      title,
      artist,
      audioFile,
      coverFile,
      instagram || undefined,
      twitter || undefined
    );

    return NextResponse.json({ success: true, song });
  } catch (error) {
    console.error('Error in submit API:', error);
    return NextResponse.json(
      { error: 'Error processing submission: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 