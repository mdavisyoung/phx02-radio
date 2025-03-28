import { uploadToS3, deleteFromS3 } from './s3';

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

// Helper function to create a safe filename
export function createSafeFileName(title: string, extension: string): string {
  const date = new Date();
  const timestamp = date.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19); // Gets YYYY-MM-DD_HH-mm-ss
  
  // Clean the title: remove special chars and spaces, convert to lowercase
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${safeTitle}_${timestamp}${extension}`;
}

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

  // Add a new song with pre-uploaded files
  addSongMetadata: async (
    title: string,
    artist: string,
    audioUrl: string,
    coverArt: string,
    instagram?: string,
    twitter?: string
  ): Promise<Song> => {
    const newSong: Song = {
      id: crypto.randomUUID(),
      title,
      artist,
      audioUrl,
      coverArt,
      instagram,
      twitter,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    console.log('Created new song:', newSong);
    songs.push(newSong);
    return newSong;
  },

  // Clear all songs
  clearSongs: (): void => {
    songs = [];
  },

  // Delete a song
  deleteSong: async (songId: string): Promise<void> => {
    try {
      const song = songs.find(s => s.id === songId);
      if (!song) {
        console.log('Song not found:', songId);
        return;
      }

      console.log('Deleting song:', song);

      // Extract file keys from URLs
      const audioKey = song.audioUrl.split('/').slice(-2).join('/'); // "songs/filename"
      const coverKey = song.coverArt.split('/').slice(-2).join('/'); // "covers/filename"

      // Delete files from S3
      await deleteFromS3(audioKey);
      await deleteFromS3(coverKey);

      // Remove from songs array
      songs = songs.filter(s => s.id !== songId);
      console.log('Song deleted successfully');
    } catch (error) {
      console.error('Error in deleteSong:', error);
      throw error;
    }
  },

  // Update song status
  updateSongStatus: (songId: string, status: 'pending' | 'active'): void => {
    songs = songs.map((song: Song) =>
      song.id === songId ? { ...song, status } : song
    );
  },
}; 