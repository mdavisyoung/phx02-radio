/**
 * Represents the metadata structure for a song
 * @important This interface must be maintained for S3 compatibility
 */
export interface SongMetadata {
  /** Artist name as submitted in the form */
  artistName: string;
  /** Song title as submitted in the form */
  songName: string;
  /** Instagram handle with or without @ symbol */
  instagramHandle: string;
  /** Full path to the song file in S3 */
  songKey: string;
  /** Full path to the cover art image in S3 */
  imageKey?: string;
  /** Whether the song has been approved by admin */
  approved: boolean;
  /** ISO timestamp of when the song was submitted */
  submittedAt: string;
}

/**
 * Represents a song with its metadata as used in the AudioPlayer
 * @important This structure is required for the player to function
 */
export interface Song {
  /** S3 key for the song file */
  key: string;
  /** Metadata associated with the song */
  metadata: SongMetadata;
}

/**
 * Response structure for the presigned URL API
 */
export interface PresignedUrlResponse {
  /** Presigned URL for accessing S3 content */
  url: string;
}

/**
 * Response structure for the songs API
 */
export interface SongsApiResponse {
  /** List of songs with their metadata */
  songs: Song[];
} 