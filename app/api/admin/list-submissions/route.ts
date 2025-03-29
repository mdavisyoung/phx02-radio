import { NextResponse } from 'next/server';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '@/app/lib/aws-config';

export async function GET() {
  try {
    console.log('Listing submissions from S3...');
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'submissions/',
    });

    const response = await s3Client.send(command);
    console.log('S3 response:', response);

    const files = response.Contents?.map(obj => obj.Key || '')
      .filter(key => key !== 'submissions/') || [];
    
    console.log('Found files:', files);
    return NextResponse.json(files);
  } catch (error) {
    console.error('Error listing submissions:', error);
    return NextResponse.json(
      { error: 'Failed to list submissions' },
      { status: 500 }
    );
  }
} 