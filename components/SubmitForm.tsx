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
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadToS3 = async (url: string, file: File) => {
    const response = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      if (!title || !artist || !audioFile || !coverArt) {
        throw new Error('Please fill in all required fields');
      }

      // Check file sizes
      if (audioFile.size > 50 * 1024 * 1024) {
        throw new Error('Audio file must be smaller than 50MB');
      }

      if (coverArt.size > 5 * 1024 * 1024) {
        throw new Error('Cover art must be smaller than 5MB');
      }

      // Get signed URLs for uploads
      const urlResponse = await fetch('/api/get-upload-urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          fileTypes: [audioFile.type, coverArt.type],
        }),
      });

      if (!urlResponse.ok) {
        throw new Error('Failed to get upload URLs');
      }

      const { urls } = await urlResponse.json();
      const [audioUrls, coverUrls] = urls;

      // Upload files to S3
      setUploadProgress(10);
      await uploadToS3(audioUrls.signedUrl, audioFile);
      setUploadProgress(50);
      await uploadToS3(coverUrls.signedUrl, coverArt);
      setUploadProgress(80);

      // Submit metadata to our API
      const submitResponse = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          artist,
          audioUrl: audioUrls.publicUrl,
          coverUrl: coverUrls.publicUrl,
          instagram,
          twitter,
        }),
      });

      if (!submitResponse.ok) {
        throw new Error('Failed to submit song metadata');
      }

      setUploadProgress(100);
      setSuccess(true);
      
      // Reset form
      setTitle('');
      setArtist('');
      setAudioFile(null);
      setCoverArt(null);
      setInstagram('');
      setTwitter('');

      const data = await submitResponse.json();
      console.log('Submission successful:', data);
      
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

      {isSubmitting && (
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                Upload Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {uploadProgress}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <div
              style={{ width: `${uploadProgress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
            />
          </div>
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
        {isSubmitting ? 'Uploading...' : 'Submit Track'}
      </button>
    </form>
  );
} 