import React, { useState } from 'react';

export default function SubmitSongForm() {
  const [formData, setFormData] = useState({
    artistName: '',
    songTitle: '',
    audioFile: null as File | null,
    coverArt: null as File | null,
    instagram: '',
    twitter: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    if (formData.artistName) formDataToSend.append('artistName', formData.artistName);
    if (formData.songTitle) formDataToSend.append('songTitle', formData.songTitle);
    if (formData.audioFile) formDataToSend.append('audioFile', formData.audioFile);
    if (formData.coverArt) formDataToSend.append('coverArt', formData.coverArt);
    if (formData.instagram) formDataToSend.append('instagram', formData.instagram);
    if (formData.twitter) formDataToSend.append('twitter', formData.twitter);

    try {
      const response = await fetch('/api/submit-song', {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (response.ok) {
        alert('Song submitted successfully! It will be reviewed by our team.');
        // Reset form
        setFormData({
          artistName: '',
          songTitle: '',
          audioFile: null,
          coverArt: null,
          instagram: '',
          twitter: '',
        });
      } else {
        alert('Error submitting song. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting song. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'audioFile' | 'coverArt') => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.files![0]
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Submit Your Track</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Artist Name</label>
          <input
            type="text"
            required
            value={formData.artistName}
            onChange={(e) => setFormData(prev => ({ ...prev, artistName: e.target.value }))}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Song Title</label>
          <input
            type="text"
            required
            value={formData.songTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, songTitle: e.target.value }))}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Audio File</label>
          <input
            type="file"
            required
            accept="audio/*"
            onChange={(e) => handleFileChange(e, 'audioFile')}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cover Art</label>
          <input
            type="file"
            required
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'coverArt')}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Instagram (optional)</label>
          <input
            type="text"
            value={formData.instagram}
            onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-white focus:outline-none"
            placeholder="@username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Twitter (optional)</label>
          <input
            type="text"
            value={formData.twitter}
            onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:border-white focus:outline-none"
            placeholder="@username"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-white text-black font-semibold rounded hover:bg-gray-200 transition-colors"
        >
          Submit Track
        </button>
      </div>
    </form>
  );
} 