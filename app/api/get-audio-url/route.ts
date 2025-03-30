import { NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client, BUCKET_NAME } from '@/app/lib/aws-config';

export async function POST(request: Request) {
  try {
    const { songKey } = await request.json();
    console.log('[get-audio-url] Request received for song:', songKey);
    console.log('[get-audio-url] Using bucket:', BUCKET_NAME);

    if (!songKey) {
      console.error('[get-audio-url] No song key provided');
      return NextResponse.json(
        { error: 'Missing song key' },
        { status: 400 }
      );
    }

    console.log('[get-audio-url] Getting S3 client...');
    const s3Client = getS3Client();
    console.log('[get-audio-url] S3 client obtained');

    if (!s3Client) {
      console.error('[get-audio-url] S3 client initialization failed');
      throw new Error('S3 client is not initialized');
    }

    // Generate presigned URL for playing the song
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: songKey,
    });

    console.log('[get-audio-url] S3 command created:', {
      bucket: BUCKET_NAME,
      key: songKey,
      region: process.env.AWS_REGION,
    });

    console.log('[get-audio-url] Generating signed URL...');
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log('[get-audio-url] URL generated successfully');

    return NextResponse.json({ url });
  } catch (error) {
    console.error('[get-audio-url] Error generating audio URL:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('[get-audio-url] Error name:', error.name);
      console.error('[get-audio-url] Error message:', error.message);
      console.error('[get-audio-url] Error stack:', error.stack);
      
      // Check if it's an AWS error
      if ('$metadata' in error) {
        console.error('[get-audio-url] AWS Error metadata:', (error as any).$metadata);
      }
    }

    // Log environment variables (without sensitive values)
    console.log('[get-audio-url] Environment check:', {
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      bucket: BUCKET_NAME,
    });

    return NextResponse.json(
      { error: 'Failed to generate audio URL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 