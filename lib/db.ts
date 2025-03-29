import fs from 'fs/promises';
import path from 'path';

export interface SongMetadata {
  artistName: string;
  songName: string;
  instagram: string;
  songKey: string;
  coverKey: string;
  dateAdded: string;
  status: 'pending' | 'approved';
}

const METADATA_FILE = path.join(process.cwd(), 'data', 'songs.json');

// Ensure the data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
  }
}

// Read metadata from file
async function readMetadata(): Promise<Record<string, SongMetadata>> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(METADATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Write metadata to file
async function writeMetadata(metadata: Record<string, SongMetadata>) {
  await ensureDataDir();
  await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
}

// Add new song metadata
export async function addSongMetadata(metadata: SongMetadata) {
  const allMetadata = await readMetadata();
  allMetadata[metadata.songKey] = metadata;
  await writeMetadata(allMetadata);
}

// Get metadata for a specific song
export async function getSongMetadata(songKey: string) {
  const allMetadata = await readMetadata();
  return allMetadata[songKey] || null;
}

// Update song status and move to approved songs
export async function approveSong(oldKey: string, newKey: string): Promise<void> {
  const metadata = await getSongMetadata(oldKey);
  if (!metadata) {
    throw new Error('Metadata not found for song');
  }

  // Update the metadata with the new key and status
  metadata.songKey = newKey;
  metadata.status = 'approved';

  // Save the updated metadata
  await addSongMetadata(metadata);
}

// Get all pending submissions
export async function getPendingSubmissions(): Promise<SongMetadata[]> {
  const allMetadata = await readMetadata();
  return Object.values(allMetadata).filter(
    metadata => metadata.status === 'pending'
  );
}

// Get all approved songs
export async function getApprovedSongs() {
  const allMetadata = await readMetadata();
  return Object.values(allMetadata).filter(meta => meta.status === 'approved');
}

export async function clearMetadata(): Promise<void> {
  await writeMetadata({});
}

export async function deleteSongMetadata(songKey: string): Promise<void> {
  const allMetadata = await readMetadata();
  delete allMetadata[songKey];
  await writeMetadata(allMetadata);
} 