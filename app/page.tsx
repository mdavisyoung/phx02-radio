'use client';

import { useState } from 'react';
import Link from 'next/link';
import AudioPlayer from '../components/AudioPlayer';
import SubmitForm from '../components/SubmitForm';
import Image from 'next/image';
import S3FileList from '@/components/S3FileList';

interface S3Song {
  id: string;
  audioUrl: string;
  coverUrl: string;
  title: string;
}

export default function Home() {
  const [queue, setQueue] = useState<S3Song[]>([]);
  const [currentSong, setCurrentSong] = useState<S3Song | null>(null);

  const handleAddToQueue = (song: S3Song) => {
    if (!currentSong) {
      setCurrentSong(song);
    } else {
      setQueue([...queue, song]);
    }
  };

  const handleSongEnd = () => {
    if (queue.length > 0) {
      const [nextSong, ...remainingQueue] = queue;
      setCurrentSong(nextSong);
      setQueue(remainingQueue);
    } else {
      setCurrentSong(null);
    }
  };

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="relative w-64 h-64 mx-auto mb-4">
            <Image
              src="/phx02-main-logo.jpg"
              alt="PHX02 Radio Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold mb-2">PHX02 Radio</h1>
          <p className="text-xl text-gray-600">Your Underground Electronic Music Station</p>
        </div>

        {/* Audio Player */}
        <div className="mb-8">
          {currentSong ? (
            <div className="bg-gray-100 rounded-lg p-4">
              <AudioPlayer
                key={currentSong.id}
                audioUrl={currentSong.audioUrl}
                onEnded={handleSongEnd}
              />
              <div className="mt-4">
                <h3 className="font-semibold">Now Playing: {currentSong.title}</h3>
                {queue.length > 0 && (
                  <p className="text-gray-600">Next up: {queue[0].title}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100 rounded-lg">
              <p className="text-gray-600">Select a track to start playing</p>
            </div>
          )}
        </div>

        {/* Queue Display */}
        {queue.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Queue</h2>
            <div className="bg-gray-100 rounded-lg p-4">
              <ul className="space-y-2">
                {queue.map((song, index) => (
                  <li key={`${song.id}-${index}`} className="flex items-center space-x-4">
                    {song.coverUrl && (
                      <div className="relative w-12 h-12">
                        <Image
                          src={song.coverUrl}
                          alt={song.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <span>{song.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Available Tracks</h2>
          <S3FileList onAddToQueue={handleAddToQueue} />
        </div>
      </div>
    </main>
  );
} 