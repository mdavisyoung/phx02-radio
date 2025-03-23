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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !artist || !audioFile || !coverArt) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('artist', artist);
      formData.append('audioFile', audioFile);
      formData.append('coverArt', coverArt);
      if (instagram) formData.append('instagram', instagram);
      if (twitter) formData.append('twitter', twitter);

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit song');
      }

      const newSong = await response.json();
      onSubmitSuccess(newSong);

      // Reset form
      setTitle('');
      setArtist('');
      setAudioFile(null);
      setCoverArt(null);
      setInstagram('');
      setTwitter('');

      alert('Song submitted successfully!');
    } catch (error) {
      console.error('Error submitting song:', error);
      alert('Error submitting song. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-black/70 rounded-lg p-8 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Submit Your Track</h2>
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          Back to Home
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">
            Track Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md bg-black/80 border-2 border-gray-600 text-white shadow-sm focus:border-white focus:ring-white placeholder-gray-400"
          />
        </div>

        <div>
          <label htmlFor="artist" className="block text-sm font-medium text-gray-300">
            Artist Name *
          </label>
          <input
            type="text"
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
            className="mt-1 block w-full rounded-md bg-black/80 border-2 border-gray-600 text-white shadow-sm focus:border-white focus:ring-white placeholder-gray-400"
          />
        </div>

        <div>
          <label htmlFor="audioFile" className="block text-sm font-medium text-gray-300">
            Audio File (MP3) *
          </label>
          <input
            type="file"
            id="audioFile"
            accept="audio/mp3"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            required
            className="mt-1 block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-2 file:border-gray-600 file:text-sm file:font-semibold file:bg-black/80 file:text-white hover:file:bg-black/90 hover:file:border-gray-500"
          />
        </div>

        <div>
          <label htmlFor="coverArt" className="block text-sm font-medium text-gray-300">
            Cover Art *
          </label>
          <input
            type="file"
            id="coverArt"
            accept="image/*"
            onChange={(e) => setCoverArt(e.target.files?.[0] || null)}
            required
            className="mt-1 block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-2 file:border-gray-600 file:text-sm file:font-semibold file:bg-black/80 file:text-white hover:file:bg-black/90 hover:file:border-gray-500"
          />
        </div>

        <div>
          <label htmlFor="instagram" className="block text-sm font-medium text-gray-300">
            Instagram Handle (optional)
          </label>
          <input
            type="text"
            id="instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="mt-1 block w-full rounded-md bg-black/80 border-2 border-gray-600 text-white shadow-sm focus:border-white focus:ring-white placeholder-gray-400"
          />
        </div>

        <div>
          <label htmlFor="twitter" className="block text-sm font-medium text-gray-300">
            Twitter Handle (optional)
          </label>
          <input
            type="text"
            id="twitter"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            className="mt-1 block w-full rounded-md bg-black/80 border-2 border-gray-600 text-white shadow-sm focus:border-white focus:ring-white placeholder-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors disabled:opacity-50 border-2 border-gray-600 hover:border-gray-500"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Track'}
        </button>
      </div>
    </form>
  );
} 