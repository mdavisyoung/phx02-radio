import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    db.clearSongs();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing songs:', error);
    return NextResponse.json(
      { error: 'Error clearing songs' },
      { status: 500 }
    );
  }
} 