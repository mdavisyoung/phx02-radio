import { NextResponse } from 'next/server';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '@/app/lib/aws-config';
import { getMetadata, addSongMetadata } from '@/app/lib/metadata';

export async function GET() {
  try {
    if (!s3Client) {
      throw new Error('S3 client is not initialized');
    }

    console.log('Getting songs and metadata...');
    let metadata = await getMetadata();

    // If no metadata exists, check for files and create metadata
    if (Object.keys(metadata).length === 0) {
      console.log('No metadata found, checking S3 for files...');
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: 'submissions/',
      });

      const response = await s3Client.send(command);
      const files = response.Contents?.map(obj => obj.Key || '')
        .filter(key => key !== 'submissions/' && key.endsWith('.mp3')) || [];

      if (files.length > 0) {
        console.log('Found files:', files);
        // Create metadata entries for each file
        for (const songKey of files) {
          const songName = songKey.split('/').pop()?.replace('.mp3', '') || 'Unknown';
          await addSongMetadata({
            songKey,
            songName,
            artistName: 'Unknown',
            instagramHandle: '',
            imageKey: '',
          });
        }
        // Get the updated metadata
        metadata = await getMetadata();
      }
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error getting songs:', error);
    return NextResponse.json(
      { error: 'Failed to get songs' },
      { status: 500 }
    );
  }
} 