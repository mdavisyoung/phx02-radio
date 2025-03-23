import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { uploadToS3 } from '@/lib/s3';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverArt: string;
  instagram?: string | null;
  twitter?: string | null;
  status: 'pending' | 'active';
  createdAt: string;
}

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

    // Generate unique filenames
    const timestamp = Date.now();
    const audioFileName = `${timestamp}-${audioFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const coverFileName = `${timestamp}-${coverFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

    console.log('Generated filenames:', { audioFileName, coverFileName });

    try {
      // Convert files to buffers
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer());

      console.log('File sizes:', {
        audioSize: audioBuffer.length / 1024 / 1024 + 'MB',
        coverSize: coverBuffer.length / 1024 / 1024 + 'MB'
      });

      // Upload files to S3
      console.log('Uploading to S3...');
      const audioUrl = await uploadToS3(audioBuffer, `songs/${audioFileName}`, audioFile.type);
      console.log('Audio uploaded:', audioUrl);
      const coverUrl = await uploadToS3(coverBuffer, `covers/${coverFileName}`, coverFile.type);
      console.log('Cover uploaded:', coverUrl);

      // Ensure data directory exists
      const dataDir = path.join(process.cwd(), 'data');
      try {
        await writeFile(path.join(dataDir, '.keep'), '');
      } catch (error) {
        console.log('Data directory already exists');
      }

      // Read existing songs
      const songsPath = path.join(process.cwd(), 'data', 'songs.json');
      console.log('Reading songs from:', songsPath);
      let songs: Song[] = [];
      
      try {
        const songsData = await readFile(songsPath, 'utf-8');
        songs = JSON.parse(songsData).songs || [];
      } catch (error) {
        console.error('Error reading songs file:', error);
        // Create songs.json if it doesn't exist
        await writeFile(songsPath, JSON.stringify({ songs: [] }));
      }

      // Create new song with full S3 URLs
      const newSong: Song = {
        id: crypto.randomUUID(),
        title,
        artist,
        audioUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/songs/${audioFileName}`,
        coverArt: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/covers/${coverFileName}`,
        instagram: instagram || undefined,
        twitter: twitter || undefined,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      console.log('Created new song:', newSong);

      // Add to songs array
      songs.push(newSong);

      // Save updated songs
      await writeFile(
        songsPath,
        JSON.stringify({ songs }, null, 2)
      );

      console.log('Saved songs file successfully');

      return NextResponse.json({ success: true });
    } catch (uploadError) {
      console.error('Error during file processing:', uploadError);
      return NextResponse.json(
        { error: 'Error uploading files: ' + (uploadError as Error).message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in submit API:', error);
    return NextResponse.json(
      { error: 'Error processing submission: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 