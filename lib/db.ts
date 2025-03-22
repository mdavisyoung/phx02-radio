import fs from 'fs';
import path from 'path';

// Ensure our storage directories exist
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const SONGS_DIR = path.join(UPLOAD_DIR, 'songs');
const COVERS_DIR = path.join(UPLOAD_DIR, 'covers');
const DB_FILE = path.join(process.cwd(), 'data', 'songs.json');

// Create directories if they don't exist
[UPLOAD_DIR, SONGS_DIR, COVERS_DIR, path.dirname(DB_FILE)].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize empty database if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ songs: [] }));
}

interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverArt: string;
  instagram?: string;
  twitter?: string;
  status: 'pending' | 'active';
  createdAt: string;
}

export const db = {
  // Get all songs with a specific status
  getSongs: (status: 'pending' | 'active'): Song[] => {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    return data.songs
      .filter((song: Song) => song.status === status)
      .sort((a: Song, b: Song) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Get the current active song
  getCurrentSong: (): Song | null => {
    const activeSongs = db.getSongs('active');
    return activeSongs.length > 0 ? activeSongs[0] : null;
  },

  // Add a new song
  addSong: async (
    title: string,
    artist: string,
    audioFile: File,
    coverFile: File,
    instagram?: string,
    twitter?: string
  ): Promise<Song> => {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    
    // Generate unique filenames
    const audioFileName = `${Date.now()}-${audioFile.name}`;
    const coverFileName = `${Date.now()}-${coverFile.name}`;
    
    // Save files
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
    
    fs.writeFileSync(path.join(SONGS_DIR, audioFileName), audioBuffer);
    fs.writeFileSync(path.join(COVERS_DIR, coverFileName), coverBuffer);

    const newSong: Song = {
      id: crypto.randomUUID(),
      title,
      artist,
      audioUrl: `/uploads/songs/${audioFileName}`,
      coverArt: `/uploads/covers/${coverFileName}`,
      instagram,
      twitter,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    data.songs.push(newSong);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return newSong;
  },

  // Update song status
  updateSongStatus: (songId: string, status: 'pending' | 'active'): void => {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    data.songs = data.songs.map((song: Song) =>
      song.id === songId ? { ...song, status } : song
    );
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  },
}; 