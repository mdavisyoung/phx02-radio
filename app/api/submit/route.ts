import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Route Segment Config
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log('Received submission request');
    const formData = await request.formData();
    
    // Log received form data
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

    // Optional fields
    const instagram = formData.get('instagram') as string;
    const twitter = formData.get('twitter') as string;

    console.log('Processing submission:', {
      title,
      artist,
      audioFileName: audioFile.name,
      coverFileName: coverArt.name,
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