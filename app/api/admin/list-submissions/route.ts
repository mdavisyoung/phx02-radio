import { NextResponse } from 'next/server';
import { s3Client } from '@/app/lib/aws-config';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function GET() {
    if (!s3Client) {
        console.error('S3 client is not initialized');
        return NextResponse.json({ error: 'S3 client is not initialized' }, { status: 500 });
    }

    try {
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