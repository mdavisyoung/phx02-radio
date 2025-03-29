'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  artistName: string;
  songName: string;
  instagramHandle: string;
  songFile: File | null;
  coverArt: File | null;
}

export default function SubmitPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    artistName: '',
    songName: '',
    instagramHandle: '',
    songFile: null,
    coverArt: null
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.songFile || !formData.coverArt) {
      setError('Please select both a song file and cover art');
      setIsSubmitting(false);
      return;
    }

    try {
      // Get upload URLs
      const urlResponse = await fetch('/api/get-upload-urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songFileName: formData.songFile.name,
          imageFileName: formData.coverArt.name,
          songName: formData.songName,
        }),
      });

      if (!urlResponse.ok) throw new Error('Failed to get upload URLs');
      const { songUploadUrl, imageUploadUrl, songKey, imageKey } = await urlResponse.json();

      // Upload files to S3
      await Promise.all([
        fetch(songUploadUrl, {
          method: 'PUT',
          body: formData.songFile,
          headers: {
            'Content-Type': formData.songFile.type || 'audio/mpeg',
          },
        }),
        fetch(imageUploadUrl, {
          method: 'PUT',
          body: formData.coverArt,
          headers: {
            'Content-Type': formData.coverArt.type || 'image/jpeg',
          },
        }),
      ]);

      // Save metadata
      const metadataResponse = await fetch('/api/submit-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistName: formData.artistName,
          songName: formData.songName,
          instagramHandle: formData.instagramHandle,
          songKey,
          imageKey,
        }),
      });

      if (!metadataResponse.ok) throw new Error('Failed to save song metadata');

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit song');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">
        Submit Your Song
      </h1>
      <div className="bg-zinc-900 rounded-xl p-6 max-w-2xl mx-auto border border-gray-800">
        {success ? (
          <div className="text-green-400 text-center">
            Song submitted successfully! Redirecting...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-red-400 text-center mb-4">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="artistName" className="block text-sm font-medium text-gray-300 mb-2">
                Artist Name
              </label>
              <input
                type="text"
                id="artistName"
                name="artistName"
                required
                value={formData.artistName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-zinc-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="songName" className="block text-sm font-medium text-gray-300 mb-2">
                Song Name
              </label>
              <input
                type="text"
                id="songName"
                name="songName"
                required
                value={formData.songName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-zinc-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="instagramHandle" className="block text-sm font-medium text-gray-300 mb-2">
                Instagram Handle
              </label>
              <input
                type="text"
                id="instagramHandle"
                name="instagramHandle"
                required
                value={formData.instagramHandle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-zinc-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="@yourusername"
              />
            </div>

            <div>
              <label htmlFor="songFile" className="block text-sm font-medium text-gray-300 mb-2">
                Song File (MP3)
              </label>
              <input
                type="file"
                id="songFile"
                name="songFile"
                required
                accept="audio/mpeg"
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-zinc-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
            </div>

            <div>
              <label htmlFor="coverArt" className="block text-sm font-medium text-gray-300 mb-2">
                Cover Art (JPG/PNG)
              </label>
              <input
                type="file"
                id="coverArt"
                name="coverArt"
                required
                accept="image/jpeg,image/png"
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-zinc-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                isSubmitting 
                  ? 'bg-blue-600 cursor-not-allowed opacity-70'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Song'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 