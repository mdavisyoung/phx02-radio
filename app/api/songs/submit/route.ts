import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const audioFile = formData.get('audioFile') as File;
    const coverArt = formData.get('coverArt') as File;
    const instagram = formData.get('instagram') as string;
    const twitter = formData.get('twitter') as string;

    if (!title || !artist || !audioFile || !coverArt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique IDs for files
    const songId = uuidv4();
    const audioFileName = `${songId}-${audioFile.name}`;
    const coverFileName = `${songId}-${coverArt.name}`;

    // Save files
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const coverBuffer = Buffer.from(await coverArt.arrayBuffer());

    await writeFile(
      path.join(process.cwd(), 'public', 'uploads', 'songs', audioFileName),
      audioBuffer
    );
    await writeFile(
      path.join(process.cwd(), 'public', 'uploads', 'covers', coverFileName),
      coverBuffer
    );

    // Create song object
    const newSong = {
      id: songId,
      title,
      artist,
      audioUrl: `/uploads/songs/${audioFileName}`,
      coverArt: `/uploads/covers/${coverFileName}`,
      instagram: instagram || undefined,
      twitter: twitter || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Read existing songs
    let songs = [];
    try {
      const songsData = await readFile(
        path.join(process.cwd(), 'data', 'songs.json'),
        'utf-8'
      );
      songs = JSON.parse(songsData).songs;
    } catch (error) {
      // If file doesn't exist, start with empty array
      songs = [];
    }

    // Add new song and save
    songs.push(newSong);
    await writeFile(
      path.join(process.cwd(), 'data', 'songs.json'),
      JSON.stringify({ songs }, null, 2)
    );

    return NextResponse.json(newSong);
  } catch (error) {
    console.error('Error submitting song:', error);
    return NextResponse.json(
      { error: 'Error processing submission' },
      { status: 500 }
    );
  }
} 