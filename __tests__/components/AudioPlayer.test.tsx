import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AudioPlayer from '@/app/components/AudioPlayer';
import type { Song } from '@/app/types/audio';

// Mock fetch globally
global.fetch = jest.fn();

// Mock data
const mockSongs: Song[] = [
  {
    key: 'songs/test-song-1.mp3',
    metadata: {
      artistName: 'Test Artist 1',
      songName: 'Test Song 1',
      instagramHandle: '@testartist1',
      songKey: 'songs/test-song-1.mp3',
      imageKey: 'images/test-cover-1.jpg',
      approved: true,
      submittedAt: '2024-01-01T00:00:00Z'
    }
  },
  {
    key: 'songs/test-song-2.mp3',
    metadata: {
      artistName: 'Test Artist 2',
      songName: 'Test Song 2',
      instagramHandle: '@testartist2',
      songKey: 'songs/test-song-2.mp3',
      imageKey: 'images/test-cover-2.jpg',
      approved: true,
      submittedAt: '2024-01-02T00:00:00Z'
    }
  }
];

describe('AudioPlayer', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock successful API responses
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/songs') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ songs: mockSongs })
        });
      }
      if (url === '/api/get-audio-url') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ url: 'https://test-url.com/audio.mp3' })
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('loads and displays songs correctly', async () => {
    render(<AudioPlayer />);

    // Check loading state
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Wait for songs to load
    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument();
      expect(screen.getByText('Test Song 2')).toBeInTheDocument();
    });
  });

  it('handles song playback correctly', async () => {
    render(<AudioPlayer />);

    // Wait for songs to load
    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    });

    // Click play on first song
    fireEvent.click(screen.getByText('Test Song 1'));

    // Verify audio element is created with correct URL
    await waitFor(() => {
      const audioElement = screen.getByRole('audio');
      expect(audioElement).toHaveAttribute('src', 'https://test-url.com/audio.mp3');
    });
  });

  it('displays error state correctly', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.reject(new Error('Failed to fetch'))
    );

    render(<AudioPlayer />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('auto-plays next song when current song ends', async () => {
    render(<AudioPlayer />);

    // Wait for songs to load
    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    });

    // Play first song
    fireEvent.click(screen.getByText('Test Song 1'));

    // Simulate song ending
    const audioElement = await waitFor(() => screen.getByRole('audio'));
    fireEvent.ended(audioElement);

    // Verify next song is requested
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/get-audio-url', expect.any(Object));
    });
  });

  it('displays social links correctly', async () => {
    render(<AudioPlayer />);

    // Wait for songs to load and first song to play
    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Test Song 1'));

    // Check Instagram link
    await waitFor(() => {
      const instagramLink = screen.getByText('@testartist1');
      expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/testartist1');
    });
  });
}); 