import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const audioFile = formData.get('audioFile') as File;
    const coverArt = formData.get('coverArt') as File;
    const artistName = formData.get('artistName') as string;
    const songTitle = formData.get('songTitle') as string;
    const instagram = formData.get('instagram') as string;
    const twitter = formData.get('twitter') as string;

    const song = await db.addSong(
      songTitle,
      artistName,
      audioFile,
      coverArt,
      instagram,
      twitter
    );

    return NextResponse.json({ success: true, song });
  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { error: 'Error processing submission' },
      { status: 500 }
    );
  }
} 