import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const audioFile = formData.get('audioFile') as File;
    const coverArt = formData.get('coverArt') as File;
    const artistName = formData.get('artistName') as string;
    const trackTitle = formData.get('trackTitle') as string;
    const instagram = formData.get('instagram') as string;
    const twitter = formData.get('twitter') as string;

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
    const songData = {
      id: Date.now().toString(),
      title: trackTitle,
      artist: artistName,
      audioUrl: `/uploads/songs/${audioFileName}`,
      coverArt: `/uploads/covers/${coverFileName}`,
      instagram: instagram || null,
      twitter: twitter || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Read existing songs
    let songs = [];
    const songsPath = path.join(process.cwd(), 'data/songs.json');
    
    try {
      const songsFile = await import('../../../data/songs.json');
      songs = songsFile.default;
    } catch (error) {
      // File doesn't exist yet, that's ok
      await writeFile(songsPath, '[]');
    }

    // Add new song and save
    songs.push(songData);
    await writeFile(songsPath, JSON.stringify(songs, null, 2));

    return NextResponse.json({ success: true, song: songData });
  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { error: 'Error processing submission' },
      { status: 500 }
    );
  }
} 