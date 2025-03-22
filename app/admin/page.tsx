'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'phx02pass') {
      // Store auth in sessionStorage
      sessionStorage.setItem('phx02admin', 'true');
      router.push('/admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
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
      <div className="relative z-10 min-h-screen bg-black/50 backdrop-blur-sm py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Login</h1>
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Back to Home
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-black/70 rounded-lg p-8">
            {error && (
              <p className="text-red-500 text-center mb-4">{error}</p>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 rounded bg-black/50 border border-gray-800 text-white focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded bg-black/50 border border-gray-800 text-white focus:border-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-black/50 hover:bg-black/70 text-white font-semibold rounded transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </main>
  );
} 