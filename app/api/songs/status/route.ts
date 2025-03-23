import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Route Segment Config
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { songId, status } = await request.json();
    db.updateSongStatus(songId, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating song status:', error);
    return NextResponse.json(
      { error: 'Error updating song status' },
      { status: 500 }
    );
  }
} 