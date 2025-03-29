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
    const { title, artist, audioUrl, coverUrl, instagram, twitter } = data;

    if (!title || !artist || !audioUrl || !coverUrl) {
      console.error('Missing required fields:', { title, artist, audioUrl, coverUrl });
      return NextResponse.json(
        { error: 'Missing required fields' },
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
    return NextResponse.json(
      { error: 'Error processing submission' },
      { status: 500 }
    );
  }
} 