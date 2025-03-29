import { NextResponse } from 'next/server';
import { HeadObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client, BUCKET_NAME } from '@/app/lib/aws-config';
import { getMetadata, updateMetadata } from '@/app/lib/metadata';

export async function POST(request: Request) {
  try {
    const s3Client = getS3Client();
    if (!s3Client) {
      throw new Error('S3 client is not initialized');
    }

    const { songKey } = await request.json();
    if (!songKey) {
      return NextResponse.json(
        { error: 'Song key is required' },
        { status: 400 }
      );
    }

    console.log('Processing song:', songKey);
    console.log('Bucket name:', BUCKET_NAME);

    // Get the filename from the path
    const filename = songKey.split('/').pop();
    if (!filename) {
      return NextResponse.json(
        { error: 'Invalid song key' },
        { status: 400 }
      );
    }

    // Create the new key in the songs folder
    const newSongKey = `songs/${filename}`;
    
    // Format the CopySource with URL-encoded key portion
    const copySource = `${BUCKET_NAME}/${encodeURIComponent(songKey)}`;
    console.log('Copy command params:', {
      Bucket: BUCKET_NAME,
      CopySource: copySource,
      Key: newSongKey,
      SourcePath: songKey
    });

    try {
      // First verify the source file exists
      try {
        await s3Client.send(
          new HeadObjectCommand({
            Bucket: BUCKET_NAME,
            Key: songKey
          })
        );
      } catch (error) {
        console.error('Source file does not exist:', error);
        return NextResponse.json(
          { error: `File ${songKey} does not exist in bucket ${BUCKET_NAME}` },
          { status: 404 }
        );
      }

      // Copy the file to the new location
      await s3Client.send(
        new CopyObjectCommand({
          Bucket: BUCKET_NAME,
          CopySource: copySource,
          Key: newSongKey,
        })
      );
      console.log('File copied successfully');

      // Delete the original file
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: songKey,
        })
      );
      console.log('Original file deleted successfully');

      // Update metadata with new path
      const metadata = await getMetadata();
      if (metadata[songKey]) {
        const updatedMetadata = { ...metadata };
        updatedMetadata[newSongKey] = {
          ...metadata[songKey],
          songKey: newSongKey,
          approved: true,
        };
        delete updatedMetadata[songKey];
        await updateMetadata(updatedMetadata);
        console.log('Metadata updated successfully');
      }

      return NextResponse.json({ success: true });
    } catch (s3Error: any) {
      console.error('S3 operation failed:', s3Error);
      throw new Error(s3Error.message || 'S3 operation failed');
    }
  } catch (error: any) {
    console.error('Error moving song:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to move song files' },
      { status: 500 }
    );
  }
} 