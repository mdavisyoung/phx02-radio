import { NextResponse } from 'next/server';
import { getS3Client } from '@/app/lib/aws-config';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getMetadata, updateMetadata } from '@/app/lib/metadata';
import type { SongMetadata } from '@/app/types/audio';

export async function POST(request: Request) {
    try {
        const { songKey } = await request.json();

        if (!songKey) {
            return NextResponse.json(
                { error: 'Song key is required' },
                { status: 400 }
            );
        }

        // Get current metadata
        const metadata = await getMetadata();
        if (!metadata || !Array.isArray(metadata)) {
            return NextResponse.json(
                { error: 'No metadata found' },
                { status: 404 }
            );
        }

        // Find and remove the song from metadata
        const songIndex = metadata.findIndex((s: SongMetadata) => s.songKey === songKey);
        if (songIndex === -1) {
            return NextResponse.json(
                { error: 'Song not found in metadata' },
                { status: 404 }
            );
        }

        const s3Client = getS3Client();

        // Delete the file from S3
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || '',
            Key: songKey
        });

        await s3Client.send(deleteCommand);

        // Remove from metadata
        metadata.splice(songIndex, 1);
        await updateMetadata(metadata);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting song:', error);
        return NextResponse.json(
            { error: 'Failed to delete song' },
            { status: 500 }
        );
    }
} 