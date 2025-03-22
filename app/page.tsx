'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AudioPlayer from '../components/AudioPlayer';
import SubmitForm from '../components/SubmitForm';

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

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  useEffect(() => {
    // Load songs and playlist
    Promise.all([
      fetch('/api/songs').then(res => res.json()),
      fetch('/api/playlist').then(res => res.json())
    ])
      .then(([songsData, playlistData]) => {
        if (songsData.songs) {
          // Only store active songs
          const activeSongs = songsData.songs.filter((song: Song) => song.status === 'active');
          setSongs(activeSongs);
        }
        if (playlistData.playlist) {
          setPlaylist(playlistData.playlist);
          // If there's an active song, find its index in the playlist
          if (songsData.activeSongId) {
            const activeIndex = playlistData.playlist.findIndex(
              (song: Song) => song.id === songsData.activeSongId
            );
            if (activeIndex !== -1) {
              setCurrentPlaylistIndex(activeIndex);
              setCurrentSong(playlistData.playlist[activeIndex]);
            }
          }
        }
      })
      .catch((error) => {
        console.error('Error loading data:', error);
      });
  }, []);

  const handleSongEnd = () => {
    if (playlist.length === 0) return;
    
    // Move to the next song in the playlist
    const nextIndex = (currentPlaylistIndex + 1) % playlist.length;
    setCurrentPlaylistIndex(nextIndex);
    setCurrentSong(playlist[nextIndex]);
  };

  return (
    <main className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/phx02.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.3) saturate(1.2)',
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">PHX02 Radio</h1>
              <p className="text-xl text-gray-400">Underground Hip Hop</p>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/submit"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Submit Track
              </Link>
              <Link
                href="/admin"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-16">
            {currentSong ? (
              <AudioPlayer
                key={currentSong.id}
                song={currentSong}
                onEnded={handleSongEnd}
              />
            ) : (
              <div className="text-center text-gray-400 py-16 bg-gray-900/50 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">Welcome to PHX02 Radio</h2>
                <p>No tracks are currently playing. Check back soon or submit your own!</p>
              </div>
            )}
          </div>

          {/* Submit Form Modal */}
          {showSubmitForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
              <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Submit Your Track</h2>
                  <button
                    onClick={() => setShowSubmitForm(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <SubmitForm
                  onSubmitSuccess={(newSong) => {
                    setSongs([...songs, newSong]);
                    setShowSubmitForm(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 