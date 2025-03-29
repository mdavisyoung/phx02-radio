import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createSafeFileName } from '@/lib/db';

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';

export async function POST(request: Request) {
  try {
    // Check if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !BUCKET_NAME) {
      console.error('Missing AWS credentials or bucket name');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500, headers: corsHeaders }
      );
    }

    const { title, fileTypes } = await request.json();
    console.log('Received request for upload URLs:', { title, fileTypes });

    if (!title || !fileTypes || !Array.isArray(fileTypes)) {
      return NextResponse.json(
        { error: 'Invalid request - missing title or fileTypes' },
        { status: 400, headers: corsHeaders }
      );
    }

    const urls = await Promise.all(
      fileTypes.map(async (type) => {
        // More flexible audio type checking
        const isSong = type.includes('audio/') || type.includes('audio');
        const ext = isSong ? '.mp3' : '.jpg';
        const prefix = isSong ? 'songs/' : 'covers/';
        const fileName = createSafeFileName(title, ext);
        const key = prefix + fileName;

        console.log('Generating signed URL for:', { type, key });

        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          ContentType: type,
          ACL: 'public-read',
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });
        const publicUrl = `https://${BUCKET_NAME}.s3.us-east-2.amazonaws.com/${key}`;

        console.log('Generated URLs:', {
          key,
          type,
          publicUrl,
          signedUrlLength: signedUrl.length
        });

        return {
          signedUrl,
          publicUrl,
          key,
          type,
        };
      })
    );

    return NextResponse.json({ urls }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error generating signed URLs:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URLs: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500, headers: corsHeaders }
    );
  }
} 