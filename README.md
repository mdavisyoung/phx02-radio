# PHX02 Radio - Underground Hip Hop Station

A modern web application for streaming underground hip hop music with user submissions and admin management.

## Features

- Modern audio player with waveform visualization
- User song submissions with cover art
- Admin panel for managing song submissions
- Real-time audio visualization
- Social media integration
- Dark theme design

## Tech Stack

- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- Local file storage
- WaveSurfer.js (Audio Visualization)

## Setup Instructions

1. Clone the repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Usage

### For Users
- Visit the homepage to listen to current tracks
- Submit your own tracks using the submission form
- Include cover art and social media links

### For Admins
- Access the admin panel at /admin
- Review pending submissions
- Approve or reject tracks
- Manage active playlist

## File Storage

All files are stored locally in:
- `/public/uploads/songs` - Audio files
- `/public/uploads/covers` - Cover art images
- `/data/songs.json` - Song database

## License

MIT License 