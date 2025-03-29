'use client';

import { useState, FormEvent } from 'react';
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

interface SubmitFormProps {
  onSubmitSuccess: (song: Song) => void;
}

export default function SubmitForm({ onSubmitSuccess }: SubmitFormProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      if (!title || !artist || !audioFile || !coverArt) {
        throw new Error('Please fill in all required fields');
      }

      // Check file size
      if (audioFile.size > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('Audio file must be smaller than 50MB');
      }

      if (coverArt.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Cover art must be smaller than 5MB');
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('artist', artist);
      formData.append('audioFile', audioFile);
      formData.append('coverArt', coverArt);

      if (instagram) formData.append('instagram', instagram);
      if (twitter) formData.append('twitter', twitter);

      console.log('Submitting form data:', {
        title,
        artist,
        audioFileName: audioFile.name,
        coverArtName: coverArt.name,
        instagram,
        twitter
      });

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit song');
      }

      const data = await response.json();
      console.log('Submission successful:', data);
      
      // Reset form
      setTitle('');
      setArtist('');
      setAudioFile(null);
      setCoverArt(null);
      setInstagram('');
      setTwitter('');
      setSuccess(true);

      onSubmitSuccess(data.song);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Submit Your Track</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Track submitted successfully!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          Track Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Artist Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Audio File (MP3) <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept="audio/mp3"
          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
          className="w-full"
          required
        />
        <p className="text-sm text-gray-500 mt-1">Maximum size: 50MB</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Cover Art <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverArt(e.target.files?.[0] || null)}
          className="w-full"
          required
        />
        <p className="text-sm text-gray-500 mt-1">Maximum size: 5MB</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Instagram Handle (optional)
        </label>
        <input
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Twitter Handle (optional)
        </label>
        <input
          type="text"
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Track'}
      </button>
    </form>
  );
} 