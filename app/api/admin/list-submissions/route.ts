import { NextResponse } from 'next/server';
import { getS3Client } from '@/app/lib/aws-config';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import type { S3Client } from '@aws-sdk/client-s3';

export async function GET() {
    try {
        // Get the S3 client instance
        const s3: S3Client = getS3Client();

        // Create the command to list objects
        const command = new ListObjectsV2Command({
            Bucket: process.env.S3_BUCKET_NAME || '',
            Prefix: 'submissions/'
        });

        // Send the command
        const response = await s3.send(command);
        console.log('S3 response:', response);

        // Extract and filter the files
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