'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getS3Client, BUCKET_NAME } from '@/app/lib/aws-config';
import type { Song, SongMetadata, PresignedUrlResponse, SongsApiResponse } from '@/app/types/audio';

/**
 * AudioPlayer Component
 * 
 * @component
 * @description
 * Core media player component for PHX02 Radio. This component handles:
 * 1. Fetching and displaying approved songs from S3
 * 2. Playing audio with cover art display
 * 3. Managing the play queue
 * 4. Displaying artist information and social links
 * 
 * @important
 * Critical functionality that must be maintained:
 * - Auto-playing next song when current song ends
 * - Fetching and displaying cover art from S3
 * - Proper error handling for audio playback
 * - Maintaining the play queue
 */
export default function AudioPlayer() {
  // State management for songs and playback
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [coverArtUrl, setCoverArtUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initial song fetch
  useEffect(() => {
    fetchSongs();
  }, []);

  // Cover art management
  useEffect(() => {
    if (currentSong?.metadata?.imageKey) {
      getCoverArtUrl(currentSong.metadata.imageKey);
    } else {
      setCoverArtUrl(null);
    }
  }, [currentSong]);

  const getDirectS3Url = (key: string) => {
    return `https://phx02-radio-uploads.s3.us-east-2.amazonaws.com/${key}`;
  };

  /**
   * Fetches a presigned URL for cover art from S3
   * @param imageKey - The S3 key for the cover art image
   */
  const getCoverArtUrl = async (imageKey: string) => {
    try {
      setCoverArtUrl(getDirectS3Url(imageKey));
    } catch (error) {
      console.error('Error getting cover art URL:', error);
      setCoverArtUrl(null);
    }
  };

  /**
   * Fetches the list of approved songs from the API
   * @important This function maintains the song queue
   */
  const fetchSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching songs...');

      const response = await fetch('/api/songs');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch songs');
      }

      const data = await response.json() as SongsApiResponse;
      console.log('Received songs:', data.songs);

      // Filter out songs without metadata or not approved
      const approvedSongs = data.songs.filter(
        (song: Song) => song.metadata && song.metadata.approved
      );

      setSongs(approvedSongs);
      
      // Auto-play the first song if available
      if (approvedSongs.length > 0 && !currentSong) {
        playSong(approvedSongs[0]);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch songs');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Plays the selected song
   * @param song - The song to play
   * @important This function handles core playback functionality
   */
  const playSong = async (song: Song) => {
    try {
      setError(null);
      setCurrentSong(song); // Set current song immediately
      setAudioUrl(getDirectS3Url(song.key));
      setIsPlaying(true);
    } catch (error) {
      console.error('Error getting audio URL:', error);
      setError(error instanceof Error ? error.message : 'Failed to play song');
      setIsPlaying(false);
      // Don't clear currentSong here - keep the UI state
    }
  };

  /**
   * Plays the next song in the queue
   * @important This function maintains continuous playback
   */
  const playNextSong = () => {
    if (!currentSong || songs.length === 0) return;
    
    const currentIndex = songs.findIndex(song => song.key === currentSong.key);
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(songs[nextIndex]);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Main render
  return (
    <div className="bg-zinc-900 rounded-xl shadow-2xl max-w-2xl mx-auto p-6">
      {error && (
        <div className="text-red-500 text-center p-4 mb-4 bg-red-100/10 rounded">
          Error: {error}
        </div>
      )}
      <div className="flex flex-col items-center space-y-4">
        {/* Cover Art */}
        <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-zinc-800">
          {coverArtUrl ? (
            <Image
              src={coverArtUrl}
              alt={`Cover art for ${currentSong?.metadata?.songName}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <Image
              src="/images/phx02 main logo.jpg"
              alt="PHX02 Radio"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>

        {/* Now Playing Info */}
        <div className="text-center">
          <h2 className="text-xl font-bold">
            {currentSong?.metadata?.songName || 'Select a song'}
          </h2>
          <p className="text-gray-400">
            {currentSong?.metadata?.artistName || 'Unknown Artist'}
          </p>
          {currentSong?.metadata?.instagramHandle && (
            <Link
              href={`https://instagram.com/${currentSong.metadata.instagramHandle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {currentSong.metadata.instagramHandle}
            </Link>
          )}
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <audio
            controls
            autoPlay
            src={audioUrl}
            className="w-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={playNextSong}
            onError={(e) => {
              console.error('Audio playback error:', e);
              setError('Failed to play audio');
            }}
          />
        )}

        {/* Song Queue */}
        <div className="w-full mt-4">
          <h3 className="text-lg font-semibold mb-2">Up Next</h3>
          <div className="space-y-2">
            {songs.map((song) => (
              <button
                key={song.key}
                onClick={() => playSong(song)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  currentSong?.key === song.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                <div className="font-medium">{song.metadata?.songName}</div>
                <div className="text-sm text-gray-400">{song.metadata?.artistName}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 