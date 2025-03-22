'use client';

import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { FaPlay, FaPause, FaInstagram, FaTwitter, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverArt: string;
  instagram?: string;
  twitter?: string;
}

interface AudioPlayerProps {
  song: Song;
  onEnded?: () => void;
}

export default function AudioPlayer({ song, onEnded }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const previousVolume = useRef(volume);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#4a5568',
      progressColor: '#f7fafc',
      cursorColor: '#f7fafc',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 80,
      barGap: 3,
    });

    wavesurferRef.current = wavesurfer;

    // Create audio context and analyser
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Connect WaveSurfer to analyser
    wavesurfer.on('ready', () => {
      if (!wavesurfer.getMediaElement()) return;
      
      const source = audioContext.createMediaElementSource(wavesurfer.getMediaElement());
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      wavesurfer.play();
      setIsPlaying(true);

      // Start drawing the equalizer
      function drawEqualizer() {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = '#000000'; // Black background
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const barWidth = (WIDTH / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * HEIGHT;

          ctx.fillStyle = '#FFFFFF'; // White bars
          ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

          x += barWidth + 1;
        }

        requestAnimationFrame(drawEqualizer);
      }

      drawEqualizer();
    });

    wavesurfer.load(song.audioUrl);
    wavesurfer.setVolume(volume);

    wavesurfer.on('finish', () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    });

    return () => {
      wavesurfer.destroy();
    };
  }, [song.audioUrl, onEnded, volume]);

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    previousVolume.current = newVolume;
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume.current);
    } else {
      previousVolume.current = volume;
      setVolume(0);
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="bg-black rounded-lg p-6 shadow-xl border border-gray-800">
      <div className="flex items-center mb-6">
        <img
          src={song.coverArt}
          alt={`${song.title} cover`}
          className="w-20 h-20 rounded-lg object-cover mr-4"
        />
        <div>
          <h2 className="text-xl font-bold text-white">{song.title}</h2>
          <p className="text-gray-400">{song.artist}</p>
          {(song.instagram || song.twitter) && (
            <div className="flex space-x-4 mt-2">
              {song.instagram && (
                <a
                  href={`https://instagram.com/${song.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  @{song.instagram}
                </a>
              )}
              {song.twitter && (
                <a
                  href={`https://twitter.com/${song.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  @{song.twitter}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div ref={containerRef} className="mb-4" />
      
      <canvas 
        ref={canvasRef} 
        width="800" 
        height="100" 
        className="w-full mb-4 rounded-lg bg-black"
      />

      <div className="flex items-center space-x-4">
        <button
          onClick={togglePlayPause}
          className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white"
        >
          {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
        </button>

        <button
          onClick={toggleMute}
          className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white"
        >
          {isMuted || volume === 0 ? (
            <FaVolumeMute size={16} />
          ) : (
            <FaVolumeUp size={16} />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-white/5 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ffffff ${volume * 100}%, rgba(255, 255, 255, 0.05) ${volume * 100}%)`,
          }}
        />
      </div>
    </div>
  );
} 