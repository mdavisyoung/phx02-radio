'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlay, FaPause, FaArrowUp, FaArrowDown, FaCheck, FaTimes } from 'react-icons/fa';
import Link from 'next/link';

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

export default function AdminDashboard() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const isAdmin = sessionStorage.getItem('phx02admin');
    if (!isAdmin) {
      router.push('/admin');
      return;
    }

    // Load songs and playlist
    Promise.all([
      fetch('/api/songs').then(res => res.json()),
      fetch('/api/playlist').then(res => res.json())
    ])
      .then(([songsData, playlistData]) => {
        if (songsData.songs) {
          setSongs(songsData.songs);
        }
        if (playlistData.playlist) {
          setPlaylist(playlistData.playlist);
          if (songsData.activeSongId) {
            const active = songsData.songs.find((s: Song) => s.id === songsData.activeSongId);
            if (active) setCurrentSong(active);
          }
        }
      })
      .catch((error) => {
        console.error('Error loading data:', error);
      });
  }, [router]);

  const setActiveTrack = async (song: Song) => {
    try {
      const response = await fetch('/api/songs/set-active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songId: song.id }),
      });

      if (response.ok) {
        setCurrentSong(song);
        alert('Active track updated successfully!');
      }
    } catch (error) {
      console.error('Error setting active track:', error);
      alert('Error updating active track');
    }
  };

  const approveSong = async (song: Song) => {
    try {
      const response = await fetch('/api/songs/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songId: song.id }),
      });

      if (response.ok) {
        const updatedSongs = songs.map(s => 
          s.id === song.id ? { ...s, status: 'active' as const } : s
        );
        setSongs(updatedSongs);
        alert('Song approved successfully!');
      }
    } catch (error) {
      console.error('Error approving song:', error);
      alert('Error approving song');
    }
  };

  const rejectSong = async (song: Song) => {
    if (!confirm('Are you sure you want to delete this song? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/songs/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songId: song.id }),
      });

      if (response.ok) {
        setSongs(songs.filter(s => s.id !== song.id));
        setPlaylist(playlist.filter(s => s.id !== song.id));
        if (currentSong?.id === song.id) {
          setCurrentSong(null);
        }
        alert('Song rejected and removed successfully!');
      }
    } catch (error) {
      console.error('Error rejecting song:', error);
      alert('Error rejecting song');
    }
  };

  const deleteSong = async (song: Song) => {
    if (!confirm('Are you sure you want to delete this song? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/songs/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songId: song.id }),
      });

      if (response.ok) {
        setSongs(songs.filter(s => s.id !== song.id));
        setPlaylist(playlist.filter(s => s.id !== song.id));
        if (currentSong?.id === song.id) {
          setCurrentSong(null);
        }
        alert('Song deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Error deleting song');
    }
  };

  const addToPlaylist = async (song: Song) => {
    if (song.status !== 'active') {
      alert('Please approve the song before adding it to the playlist.');
      return;
    }

    try {
      const response = await fetch('/api/playlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songId: song.id }),
      });

      if (response.ok) {
        const updatedPlaylist = await response.json();
        setPlaylist(updatedPlaylist.playlist);
      }
    } catch (error) {
      console.error('Error updating playlist:', error);
      alert('Error updating playlist');
    }
  };

  const moveInPlaylist = async (songId: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch('/api/playlist/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songId, direction }),
      });

      if (response.ok) {
        const updatedPlaylist = await response.json();
        setPlaylist(updatedPlaylist.playlist);
      }
    } catch (error) {
      console.error('Error moving song in playlist:', error);
      alert('Error updating playlist order');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('phx02admin');
    router.push('/admin');
  };

  return (
    <main className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/phx02-skel.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.3) saturate(1.2)',
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-white">PHX02 Radio Admin</h1>
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Back to Home
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Songs */}
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Available Songs</h2>
              <div className="space-y-4">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className={`bg-black/70 rounded-lg overflow-hidden shadow-lg flex items-center ${
                      song.status === 'pending' ? 'border-l-4 border-yellow-500' : ''
                    }`}
                  >
                    <img
                      src={song.coverArt}
                      alt={`${song.title} cover`}
                      className="w-16 h-16 object-cover"
                    />
                    <div className="flex-1 px-4">
                      <h3 className="font-semibold text-white">{song.title}</h3>
                      <p className="text-gray-400">{song.artist}</p>
                    </div>
                    <div className="flex items-center space-x-2 px-4">
                      {song.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => approveSong(song)}
                            className="p-2 text-green-500 hover:text-green-400 transition-colors"
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => rejectSong(song)}
                            className="p-2 text-red-500 hover:text-red-400 transition-colors"
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setActiveTrack(song)}
                            className={`p-2 ${
                              currentSong?.id === song.id
                                ? 'text-green-500'
                                : 'text-white hover:text-green-500'
                            } transition-colors`}
                            title={currentSong?.id === song.id ? 'Now Playing' : 'Set as Active'}
                          >
                            {currentSong?.id === song.id ? <FaPause /> : <FaPlay />}
                          </button>
                          <button
                            onClick={() => addToPlaylist(song)}
                            className="p-2 text-blue-500 hover:text-blue-400 transition-colors"
                            title="Add to Playlist"
                          >
                            ➕
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteSong(song)}
                        className="p-2 text-red-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Playlist */}
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Current Playlist</h2>
              <div className="space-y-4">
                {playlist.map((song, index) => (
                  <div
                    key={song.id}
                    className="bg-black/70 rounded-lg overflow-hidden shadow-lg flex items-center"
                  >
                    <div className="w-12 h-12 flex items-center justify-center text-gray-500 font-mono">
                      {index + 1}
                    </div>
                    <img
                      src={song.coverArt}
                      alt={`${song.title} cover`}
                      className="w-16 h-16 object-cover"
                    />
                    <div className="flex-1 p-4">
                      <h3 className="font-bold">{song.title}</h3>
                      <p className="text-gray-400">{song.artist}</p>
                    </div>
                    <div className="flex flex-col space-y-2 p-4">
                      <button
                        onClick={() => moveInPlaylist(song.id, 'up')}
                        disabled={index === 0}
                        className="p-2 rounded bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                      >
                        <FaArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => moveInPlaylist(song.id, 'down')}
                        disabled={index === playlist.length - 1}
                        className="p-2 rounded bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                      >
                        <FaArrowDown size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 