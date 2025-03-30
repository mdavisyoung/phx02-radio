import { NextResponse } from 'next/server';
import { getS3Client } from '@/app/lib/aws-config';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getMetadata } from '@/app/lib/metadata';

export async function GET() {
    try {
        // First, try to get existing metadata
        const metadata = await getMetadata();
        
        if (metadata) {
            return NextResponse.json({ songs: metadata });
        }

        // If no metadata exists, list files in the bucket
        const s3Client = getS3Client();
        const command = new ListObjectsV2Command({
            Bucket: process.env.S3_BUCKET_NAME || '',
            Prefix: 'songs/'
        });

        const response = await s3Client.send(command);
        const files = response.Contents?.map(obj => obj.Key || '')
            .filter(key => key !== 'songs/') || [];

        return NextResponse.json({ songs: files });
    } catch (error) {
        console.error('Error getting songs:', error);
        return NextResponse.json(
            { error: 'Failed to get songs' },
            { status: 500 }
        );
    }
} 