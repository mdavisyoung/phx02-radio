import { NextResponse } from 'next/server';
import { s3Client } from '@/app/lib/aws-config';
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getMetadata, updateMetadata } from '@/app/lib/metadata';
import type { SongMetadata } from '@/app/types/audio';

export async function POST(request: Request) {
    if (!s3Client) {
        console.error('S3 client is not initialized');
        return NextResponse.json({ error: 'S3 client is not initialized' }, { status: 500 });
    }

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

        // Find the song in metadata
        const song = metadata.find((s: SongMetadata) => s.songKey === songKey);
        if (!song) {
            return NextResponse.json(
                { error: 'Song not found in metadata' },
                { status: 404 }
            );
        }

        // Calculate new path
        const newKey = songKey.replace('submissions/', 'songs/');

        // Copy the file to the new location
        const copyCommand = new CopyObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || '',
            CopySource: `${process.env.S3_BUCKET_NAME}/${songKey}`,
            Key: newKey
        });

        await s3Client.send(copyCommand);

        // Delete the original file
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || '',
            Key: songKey
        });

        await s3Client.send(deleteCommand);

        // Update metadata
        song.songKey = newKey;
        song.approved = true;
        await updateMetadata(metadata);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error moving song:', error);
        return NextResponse.json(
            { error: 'Failed to move song' },
            { status: 500 }
        );
    }
} 