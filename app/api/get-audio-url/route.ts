import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: Request) {
  try {
    const { songKey } = await request.json();
    console.log('Generating URL for song:', songKey);

    if (!songKey) {
      console.error('No song key provided');
      return NextResponse.json(
        { error: 'Missing song key' },
        { status: 400 }
      );
    }

    // Generate presigned URL for playing the song
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Key: songKey,
    });

    console.log('S3 command:', {
      bucket: process.env.AWS_BUCKET_NAME,
      key: songKey,
      region: process.env.AWS_REGION,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log('Generated URL:', url);

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating audio URL:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to generate audio URL' },
      { status: 500 }
    );
  }
} 