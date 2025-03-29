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
    
    const data = await request.json();
    console.log('Received data:', data);
    
    const { title, artist, audioUrl, coverUrl, instagram, twitter } = data;

    if (!title || !artist || !audioUrl || !coverUrl) {
      const missingFields = [];
      if (!title) missingFields.push('title');
      if (!artist) missingFields.push('artist');
      if (!audioUrl) missingFields.push('audioUrl');
      if (!coverUrl) missingFields.push('coverUrl');
      
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate URLs
    try {
      new URL(audioUrl);
      new URL(coverUrl);
    } catch (error) {
      console.error('Invalid URLs:', { audioUrl, coverUrl });
      return NextResponse.json(
        { error: 'Invalid audio or cover art URLs' },
        { status: 400 }
      );
    }

    console.log('Processing submission:', {
      title,
      artist,
      audioUrl,
      coverUrl,
      instagram,
      twitter
    });

    // Add song to database
    const song = await db.addSongMetadata(
      title,
      artist,
      audioUrl,
      coverUrl,
      instagram,
      twitter
    );

    console.log('Song added successfully:', song);

    return NextResponse.json({ success: true, song });
  } catch (error) {
    console.error('Error processing submission:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Error processing submission: ${errorMessage}` },
      { status: 500 }
    );
  }
} 