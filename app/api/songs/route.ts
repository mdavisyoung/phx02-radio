import { NextResponse } from 'next/server';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getS3Client, BUCKET_NAME } from '@/app/lib/aws-config';
import { getMetadata } from '@/app/lib/metadata';

// Helper function to get filename from path
const getFilenameFromPath = (path: string) => {
  const parts = path.split('/');
  return parts[parts.length - 1];
};

export async function GET() {
  try {
    const s3Client = getS3Client();
    if (!s3Client) {
      throw new Error('S3 client is not initialized');
    }

    // List all songs in the songs directory
    console.log('Listing songs from S3...');
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'songs/',
    });

    const response = await s3Client.send(command);
    const songs = response.Contents?.filter(obj => obj.Key && obj.Key !== 'songs/')
      .map(obj => obj.Key as string) || [];
    
    console.log('Found songs:', songs);

    // Get metadata for the songs
    const metadata = await getMetadata();
    console.log('Got metadata:', metadata);

    // Combine songs with their metadata by matching filenames
    const songsWithMetadata = songs.map(songKey => {
      const filename = getFilenameFromPath(songKey);
      
      // Find metadata entry by matching filename
      const metadataEntry = Object.values(metadata).find(meta => {
        const metaFilename = getFilenameFromPath(meta.songKey);
        return metaFilename === filename;
      });

      return {
        key: songKey,
        metadata: metadataEntry || null
      };
    });

    return NextResponse.json({ songs: songsWithMetadata });
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch songs' },
      { status: 500 }
    );
  }
} 