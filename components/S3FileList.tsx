'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface S3Song {
  id: string;
  audioUrl: string;
  coverUrl: string;
  title: string;
}

interface S3FileListProps {
  onAddToQueue: (song: S3Song) => void;
}

export default function S3FileList({ onAddToQueue }: S3FileListProps) {
  const [songs, setSongs] = useState<S3Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch('/api/s3-files');
        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }
        const data = await response.json();
        setSongs(data.songs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load songs');
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No songs found in S3 storage
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {songs.map((song) => (
        <div
          key={song.id}
          className="border rounded-lg p-4 flex flex-col items-center space-y-4 hover:shadow-lg transition-shadow"
        >
          {song.coverUrl ? (
            <div className="relative w-48 h-48">
              <Image
                src={song.coverUrl}
                alt={song.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No Cover</span>
            </div>
          )}
          
          <h3 className="text-lg font-semibold text-center">{song.title}</h3>
          
          <button
            onClick={() => onAddToQueue(song)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors"
          >
            Add to Queue
          </button>
        </div>
      ))}
    </div>
  );
} 