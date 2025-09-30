# Meditation Audio Assets

This folder must contain the background music used by the Meditation feature.

## Required files (filenames are referenced in code)

Place high-quality, loop-friendly MP3 files with these exact names:

- zen-garden.mp3
- forest-stream.mp3
- tibetan-bowls.mp3
- deep-meditation.mp3
- nature-sounds.mp3
- singing-bowls.mp3
- ocean-waves.mp3

Paths in the app reference them as:

- /audio/zen-garden.mp3
- /audio/forest-stream.mp3
- /audio/tibetan-bowls.mp3
- /audio/deep-meditation.mp3
- /audio/nature-sounds.mp3
- /audio/singing-bowls.mp3
- /audio/ocean-waves.mp3

These are used by:

- `src/components/meditation/MeditationSelectionPage.tsx` (selection background tracks)
- `src/components/meditation/MeditationDetailPage.tsx` (music tab + playback during timer)

## Format recommendations

- Format: MP3, 128–192 kbps CBR (balance of quality/size)
- Sample rate: 44.1 kHz
- Duration: 3–10 minutes (loops seamlessly)
- Normalize loudness to around -14 LUFS and avoid clipping

## Where to source audio (license-friendly)

- Free ambient loops: `https://freesound.org` (check individual licenses)
- Free background music: `https://pixabay.com/music/` (royalty-free)
- Open source ambience: `https://archive.org` (verify license)

Always respect attribution and licensing terms. Prefer CC0/royalty-free where possible.

## Looping tips

- Trim leading/trailing silence
- Ensure waveform starts/ends at zero-crossing
- Use gentle fade-in/out (5–20 ms) to avoid clicks

## If you want different filenames

Update the track lists in:

- `src/components/meditation/MeditationSelectionPage.tsx` (`selectionTracks`)
- `src/components/meditation/MeditationDetailPage.tsx` (`meditationTracks`)

Example:

```ts
// Replace with your file
{ src: '/audio/my-calm-track.mp3', name: 'My Calm Track' }
```

## Quick test

1. Copy the files above into this folder.
2. Run frontend: `npm run dev` in `frontend/`.
3. Visit `/meditation`.
4. You should see the music controller; select tracks under the Music tab and press Start.

## Troubleshooting

- If a track doesn’t play, open DevTools → Network and verify the file loads from `/audio/<name>.mp3`.
- On first interaction, browsers may block autoplay. Press Play to start.
- Ensure filenames match exactly (case-sensitive on some systems).
