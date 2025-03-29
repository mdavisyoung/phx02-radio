import { NextResponse } from 'next/server';
import { getS3Client } from '@/app/lib/aws-config';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function GET() {
    try {
        const s3Client = getS3Client();
        const command = new ListObjectsV2Command({
            Bucket: process.env.S3_BUCKET_NAME || '',
            Prefix: 'submissions/'
        });

        const response = await s3Client.send(command);
        console.log('S3 response:', response);

        const files = response.Contents?.map(obj => obj.Key || '')
            .filter(key => key !== 'submissions/') || [];

        return NextResponse.json({ files });
    } catch (error) {
        console.error('Error listing submissions:', error);
        return NextResponse.json(
            { error: 'Failed to list submissions' },
            { status: 500 }
        );
    }
} 