'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlay, FaPause, FaArrowUp, FaArrowDown, FaCheck, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

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

interface S3File {
  key: string;
  url: string;
  size: number;
  lastModified: string;
}

export default function AdminDashboard() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [s3Files, setS3Files] = useState<S3File[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const isAdmin = sessionStorage.getItem('phx02admin');
    if (!isAdmin) {
      router.push('/admin');
      return;
    }

    // Load songs, playlist, and S3 files
    Promise.all([
      fetch('/api/songs').then(res => res.json()),
      fetch('/api/playlist').then(res => res.json()),
      fetch('/api/s3-files').then(res => res.json())
    ])
      .then(([songsData, playlistData, s3Data]) => {
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
        if (s3Data.songs) {
          setS3Files(s3Data.songs);
        }
      })
      .catch((error) => {
        console.error('Error loading data:', error);
      })
      .finally(() => {
        setLoading(false);
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
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* S3 Files Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">S3 Files</h2>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {s3Files.map((file) => (
                <div
                  key={file.key}
                  className="border rounded-lg p-4 flex flex-col space-y-2"
                >
                  {file.key.includes('covers/') ? (
                    <div className="relative w-full aspect-square">
                      <Image
                        src={file.url}
                        alt={file.key}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ) : null}
                  <div>
                    <p className="font-medium truncate">{file.key}</p>
                    <p className="text-sm text-gray-500">
                      Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-sm text-gray-500">
                      Modified: {new Date(file.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-center rounded transition-colors"
                    >
                      Download
                    </a>
                    <button
                      onClick={() => deleteSong({ id: file.key } as Song)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                      title="Delete Song"
                    >
                      <FaTimes />
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
    </main>
  );
} 