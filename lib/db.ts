import { uploadToS3 } from './s3';

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

// In-memory storage for development
let songs: Song[] = [];

export const db = {
  // Get all songs with a specific status
  getSongs: (status: 'pending' | 'active'): Song[] => {
    return songs
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
    // Generate unique filenames
    const timestamp = Date.now();
    const audioFileName = `${timestamp}-${audioFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const coverFileName = `${timestamp}-${coverFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    
    // Convert files to buffers
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
    
    // Upload files to S3
    const audioUrl = await uploadToS3(audioBuffer, `songs/${audioFileName}`, audioFile.type);
    const coverUrl = await uploadToS3(coverBuffer, `covers/${coverFileName}`, coverFile.type);

    const newSong: Song = {
      id: crypto.randomUUID(),
      title,
      artist,
      audioUrl,
      coverArt: coverUrl,
      instagram,
      twitter,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    songs.push(newSong);
    return newSong;
  },

  // Update song status
  updateSongStatus: (songId: string, status: 'pending' | 'active'): void => {
    songs = songs.map((song: Song) =>
      song.id === songId ? { ...song, status } : song
    );
  },
}; 