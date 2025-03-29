'use client';

import { useState, useEffect } from 'react';
import type { SongMetadata } from '@/app/lib/metadata';
import { useRouter } from 'next/navigation';

type TabType = 'submissions' | 'approved';

export default function AdminDashboard() {
  const [songs, setSongs] = useState<Record<string, SongMetadata>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('submissions');
  const router = useRouter();

  const fetchSongs = async () => {
    try {
      console.log('Fetching songs...');
      const response = await fetch('/api/admin/get-songs');
      if (!response.ok) throw new Error('Failed to fetch songs');
      const data = await response.json();
      console.log('Received songs:', data);
      setSongs(data);
    } catch (err) {
      console.error('Error fetching songs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleLogout = () => {
    fetch('/api/admin/logout', { method: 'POST' })
      .then(() => router.push('/admin/login'))
      .catch(console.error);
  };

  const handleApprove = async (songKey: string) => {
    try {
      setError(null);
      console.log('Approving song:', songKey);

      // First, approve the song
      const approveResponse = await fetch('/api/admin/approve-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songKey }),
      });

      if (!approveResponse.ok) {
        const data = await approveResponse.json();
        throw new Error(data.error || 'Failed to approve song');
      }

      console.log('Song approved, moving files...');

      // Then move the files
      const moveResponse = await fetch('/api/admin/move-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songKey }),
      });

      if (!moveResponse.ok) {
        const data = await moveResponse.json();
        throw new Error(data.error || 'Failed to move song files');
      }

      console.log('Song files moved successfully');

      // Refresh the song list
      await fetchSongs();
    } catch (err) {
      console.error('Error in handleApprove:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve song');
    }
  };

  const handleDelete = async (songKey: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;

    try {
      const response = await fetch('/api/admin/delete-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songKey: songs[songKey].songKey,
          imageKey: songs[songKey].imageKey,
        }),
      });

      if (!response.ok) throw new Error('Failed to delete song');

      // Refresh the song list
      await fetchSongs();
    } catch (err) {
      setError('Failed to delete song');
      console.error(err);
    }
  };

  // Filter songs based on active tab
  const filteredSongs = Object.entries(songs).filter(([_, song]) => {
    if (activeTab === 'submissions') {
      return song.songKey.startsWith('submissions/');
    } else {
      return song.songKey.startsWith('songs/');
    }
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-center mb-8">Admin Dashboard</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded ${
            activeTab === 'submissions'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
          }`}
        >
          Submissions
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 rounded ${
            activeTab === 'approved'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
          }`}
        >
          Approved Songs
        </button>
      </div>
      
      {error && (
        <div className="text-red-400 text-center mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {filteredSongs.map(([key, song]) => (
          <div key={key} className="bg-zinc-900 rounded-xl p-6 border border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{song.songName}</h2>
                <p className="text-gray-400">Artist: {song.artistName}</p>
                <p className="text-gray-400">Instagram: {song.instagramHandle}</p>
                <p className="text-gray-400 text-sm mt-2">
                  Location: {song.songKey}
                </p>
                <p className="text-gray-400 text-sm">
                  Submitted: {new Date(song.submittedAt).toLocaleString()}
                </p>
              </div>
              <div className="space-x-2">
                {activeTab === 'submissions' && (
                  <button
                    onClick={() => handleApprove(key)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={() => handleDelete(key)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredSongs.length === 0 && (
          <div className="text-center text-gray-400">
            {activeTab === 'submissions' 
              ? 'No pending submissions'
              : 'No approved songs'}
          </div>
        )}
      </div>
    </div>
  );
}