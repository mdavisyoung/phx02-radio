import { NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { deleteSongMetadata } from '@/app/lib/metadata';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: Request) {
  try {
    const { songKey, imageKey } = await request.json();

    if (!songKey || !imageKey) {
      return NextResponse.json(
        { error: 'Missing song or image key' },
        { status: 400 }
      );
    }

    // Delete files from S3
    await Promise.all([
      s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: songKey,
        })
      ),
      s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: imageKey,
        })
      ),
    ]);

    // Delete metadata
    await deleteSongMetadata(songKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json(
      { error: 'Failed to delete song' },
      { status: 500 }
    );
  }
} 