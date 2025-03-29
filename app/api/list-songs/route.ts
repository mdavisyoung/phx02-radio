import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Prefix: 'songs/',
    });

    console.log('Listing songs from S3...');
    const response = await s3Client.send(command);
    
    // Filter out the directory itself and map to just the keys
    const songKeys = response.Contents
      ?.filter(item => item.Key && item.Key !== 'songs/')
      .map(item => item.Key as string) || [];

    console.log('Found songs:', songKeys);
    
    return NextResponse.json(songKeys);
  } catch (error) {
    console.error('Error listing songs:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      { error: 'Failed to list songs' },
      { status: 500 }
    );
  }
} 