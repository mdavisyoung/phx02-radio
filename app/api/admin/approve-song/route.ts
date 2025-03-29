import { NextResponse } from 'next/server';
import { getMetadata, updateMetadata } from '@/app/lib/metadata';

export async function POST(request: Request) {
  try {
    const { songKey } = await request.json();

    if (!songKey) {
      return NextResponse.json(
        { error: 'Song key is required' },
        { status: 400 }
      );
    }

    console.log('Approving song:', songKey);

    // Get current metadata
    const metadata = await getMetadata();
    
    if (!metadata[songKey]) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Update the song's approval status
    metadata[songKey].approved = true;
    await updateMetadata(metadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving song:', error);
    return NextResponse.json(
      { error: 'Failed to approve song' },
      { status: 500 }
    );
  }
} 