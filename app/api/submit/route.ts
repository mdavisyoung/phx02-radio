import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Route Segment Config
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const dynamic = 'force-dynamic';

// Configure body size limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    },
    responseLimit: '50mb'
  }
};

export async function POST(request: Request) {
  try {
    console.log('Received submission request');
    
    // Get the content type
    const contentType = request.headers.get('content-type') || '';
    
    // Ensure it's a multipart form data request
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content type must be multipart/form-data' },
        { status: 415 }
      );
    }

    const formData = await request.formData();
    console.log('Form data fields:', Array.from(formData.keys()));

    // Check required fields
    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const audioFile = formData.get('audioFile') as File;
    const coverArt = formData.get('coverArt') as File;

    if (!title || !artist || !audioFile || !coverArt) {
      console.error('Missing required fields:', { title, artist, audioFile, coverArt });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check file sizes
    const maxAudioSize = 50 * 1024 * 1024; // 50MB
    const maxImageSize = 5 * 1024 * 1024;  // 5MB

    if (audioFile.size > maxAudioSize) {
      return NextResponse.json(
        { error: 'Audio file must be smaller than 50MB' },
        { status: 400 }
      );
    }

    if (coverArt.size > maxImageSize) {
      return NextResponse.json(
        { error: 'Cover art must be smaller than 5MB' },
        { status: 400 }
      );
    }

    // Optional fields
    const instagram = formData.get('instagram') as string;
    const twitter = formData.get('twitter') as string;

    console.log('Processing submission:', {
      title,
      artist,
      audioFileName: audioFile.name,
      audioFileSize: audioFile.size,
      coverFileName: coverArt.name,
      coverFileSize: coverArt.size,
      instagram,
      twitter
    });

    // Add song to database
    const song = await db.addSong(
      title,
      artist,
      audioFile,
      coverArt,
      instagram,
      twitter
    );

    console.log('Song added successfully:', song);

    return NextResponse.json({ success: true, song });
  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { error: 'Error processing submission' },
      { status: 500 }
    );
  }
} 