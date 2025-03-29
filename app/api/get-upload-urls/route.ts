import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createSafeFileName } from '@/lib/db';

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
    const { title, fileTypes } = await request.json();

    if (!title || !fileTypes || !Array.isArray(fileTypes)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const urls = await Promise.all(
      fileTypes.map(async (type) => {
        const isSong = type === 'audio/mp3';
        const ext = isSong ? '.mp3' : '.jpg';
        const prefix = isSong ? 'songs/' : 'covers/';
        const fileName = createSafeFileName(title, ext);
        const key = prefix + fileName;

        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          ContentType: type,
          ACL: 'public-read',
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });
        const publicUrl = `https://${BUCKET_NAME}.s3.us-east-2.amazonaws.com/${key}`;

        return {
          signedUrl,
          publicUrl,
          key,
          type,
        };
      })
    );

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Error generating signed URLs:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URLs' },
      { status: 500 }
    );
  }
} 