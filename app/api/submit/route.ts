import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
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

interface SongsData {
  songs: Song[];
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const audioFile = formData.get('audioFile') as File;
    const coverArt = formData.get('coverArt') as File;
    const artistName = formData.get('artistName') as string;
    const trackTitle = formData.get('trackTitle') as string;
    const instagram = formData.get('instagram') as string | null;
    const twitter = formData.get('twitter') as string | null;

    if (!audioFile || !coverArt || !artistName || !trackTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create unique filenames
    const audioFileName = `${Date.now()}-${audioFile.name}`;
    const coverFileName = `${Date.now()}-${coverArt.name}`;

    // Save files
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const coverBuffer = Buffer.from(await coverArt.arrayBuffer());

    const audioPath = path.join(process.cwd(), 'public/uploads/songs', audioFileName);
    const coverPath = path.join(process.cwd(), 'public/uploads/covers', coverFileName);

    await writeFile(audioPath, audioBuffer);
    await writeFile(coverPath, coverBuffer);

    // Save metadata to songs.json
    const songData: Song = {
      id: Date.now().toString(),
      title: trackTitle,
      artist: artistName,
      audioUrl: `/uploads/songs/${audioFileName}`,
      coverArt: `/uploads/covers/${coverFileName}`,
      instagram: instagram || undefined,
      twitter: twitter || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Read existing songs
    let songs: Song[] = [];
    const songsPath = path.join(process.cwd(), 'data/songs.json');
    
    try {
      const songsData = await readFile(songsPath, 'utf-8');
      const parsedData = JSON.parse(songsData) as SongsData;
      songs = parsedData.songs || [];
    } catch (error) {
      // File doesn't exist yet, that's ok
      await writeFile(songsPath, JSON.stringify({ songs: [] }));
    }

    // Add new song and save
    songs.push(songData);
    await writeFile(songsPath, JSON.stringify({ songs }, null, 2));

    return NextResponse.json({ success: true, song: songData });
  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { error: 'Error processing submission' },
      { status: 500 }
    );
  }
} 