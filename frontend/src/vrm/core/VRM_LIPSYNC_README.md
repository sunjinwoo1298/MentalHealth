# VRM Lip Sync Implementation

This document explains how to use the VRM Lip Sync system that provides real-time mouth synchronization with audio playback.

## Overview

The VRM Lip Sync system analyzes audio volume in real-time and applies the 'aa' expression to create natural-looking lip movement during speech. It integrates seamlessly with the existing emotion and pose transition systems.

## Architecture

```
Audio Element → Web Audio API → Volume Analysis → 'aa' Expression → VRM
                                      ↓
                              Emotion Expressions (applied first)
                                      ↓
                              Lip Sync (applied after)
                                      ↓
                              VRM Update (final blend)
```

## Core Components

### 1. VrmLipSync Class (`frontend/src/vrm/core/VrmLipSync.ts`)
- Handles Web Audio API setup and real-time volume analysis
- Maps audio volume to 'aa' expression intensity
- Maintains state independently of expression transitions

### 2. ExpressionManager Integration
- Modified to coordinate with lip sync system
- Applies lip sync after emotion expressions but before VRM update
- Preserves lip sync during emotion transitions

### 3. useVrmAvatar Hook
- Provides easy-to-use lip sync methods
- Handles initialization and cleanup
- Integrates with existing VRM system

## Usage

### Basic Setup

```typescript
import { useVrmAvatar } from '../hooks/useVrmAvatar'

const {
  canvasRef,
  setupLipSync,
  startLipSync,
  stopLipSync,
  isLipSyncActive
} = useVrmAvatar()

// Setup lip sync with audio element
const audioElement = document.querySelector('audio')
await setupLipSync(audioElement)

// Start/stop lip sync
startLipSync()  // Call when audio starts playing
stopLipSync()   // Call when audio stops
```

### With Murf TTS Integration

```typescript
// 1. Get audio URL from Murf TTS service
const audioUrl = await murfTTSService.generateSpeech(text, voiceId)

// 2. Create audio element
const audioElement = new Audio(audioUrl)

// 3. Setup lip sync
await setupLipSync(audioElement)

// 4. Play with lip sync
audioElement.addEventListener('play', () => startLipSync())
audioElement.addEventListener('pause', () => stopLipSync())
audioElement.addEventListener('ended', () => stopLipSync())

audioElement.play()
```

### React Component Example

```tsx
function VoiceAvatar() {
  const { setupLipSync, startLipSync, stopLipSync } = useVrmAvatar()
  const audioRef = useRef<HTMLAudioElement>(null)
  
  useEffect(() => {
    if (audioRef.current) {
      setupLipSync(audioRef.current)
    }
  }, [])
  
  const handleSpeak = async () => {
    if (!audioRef.current) return
    
    // Generate speech with Murf TTS
    const audioUrl = await generateSpeech("Hello, how are you feeling today?")
    audioRef.current.src = audioUrl
    
    // Start lip sync and play
    startLipSync()
    await audioRef.current.play()
  }
  
  return (
    <>
      <canvas ref={canvasRef} />
      <audio 
        ref={audioRef}
        onEnded={stopLipSync}
        onPause={stopLipSync}
      />
      <button onClick={handleSpeak}>Speak</button>
    </>
  )
}
```

## API Reference

### VrmLipSync Methods

#### `setupAudio(audioElement: HTMLAudioElement): Promise<boolean>`
Initializes Web Audio API connection to the audio element.

```typescript
const success = await lipSync.setupAudio(audioElement)
if (success) {
  console.log('Lip sync ready')
}
```

#### `startLipSync(): void`
Begins real-time volume analysis and lip sync application.

#### `stopLipSync(): void`
Stops lip sync and resets 'aa' expression to 0.

#### `isActiveAndSpeaking(): boolean`
Returns true if lip sync is active and currently detecting speech.

#### `getCurrentWeight(): number`
Returns current lip sync intensity (0-1) for debugging.

### useVrmAvatar Hook Methods

#### `setupLipSync(audioElement: HTMLAudioElement): Promise<boolean>`
Hook wrapper for VrmLipSync.setupAudio()

#### `startLipSync(): void`
Hook wrapper for VrmLipSync.startLipSync()

#### `stopLipSync(): void`
Hook wrapper for VrmLipSync.stopLipSync()

#### `isLipSyncActive(): boolean`
Hook wrapper for VrmLipSync.isActiveAndSpeaking()

## Configuration

### Audio Analysis Settings

Located in `VrmLipSync.ts`:

```typescript
private readonly VOLUME_THRESHOLD = 0.01;     // Minimum volume to trigger
private readonly SMOOTHING_FACTOR = 0.3;      // Volume smoothing
private readonly MAX_LIP_SYNC_WEIGHT = 0.8;   // Maximum expression intensity
```

### Integration with Emotions

Lip sync works alongside emotion expressions:

```typescript
// Emotion applied first
expressionManager.applyExpression('happy')

// Lip sync applied after (automatically in render loop)
// Result: Happy expression + lip movement
```

## Best Practices

### 1. Audio Element Management
```typescript
// Always setup lip sync after audio element is ready
useEffect(() => {
  if (audioElement && audioElement.readyState >= 2) {
    setupLipSync(audioElement)
  }
}, [audioElement])
```

### 2. Error Handling
```typescript
try {
  const success = await setupLipSync(audioElement)
  if (!success) {
    console.warn('Lip sync setup failed, continuing without')
  }
} catch (error) {
  console.error('Lip sync error:', error)
}
```

### 3. Performance
- Lip sync analysis runs on animation frames (60fps)
- Web Audio API is reused across different audio elements
- Automatic cleanup when audio ends

### 4. Browser Compatibility
- Requires Web Audio API support (all modern browsers)
- Handles autoplay policies by resuming audio context on user interaction

## Troubleshooting

### Common Issues

**Lip sync not working:**
- Check browser console for Web Audio API errors
- Ensure audio element has loaded (`readyState >= 2`)
- Verify audio is not muted or volume is not 0

**No mouth movement during speech:**
- Check if VRM model has 'aa' expression (not all models do)
- Verify `isLipSyncActive()` returns true during speech
- Check audio volume levels and threshold settings

**Choppy or delayed lip sync:**
- Ensure smooth animation loop (check FPS)
- Verify audio element is properly connected to Web Audio API
- Check for other performance issues affecting render loop

### Debug Methods

```typescript
// Check if lip sync is working
console.log('Lip sync active:', isLipSyncActive())
console.log('Current weight:', lipSync.getCurrentWeight())

// Monitor expression values
vrm.expressionManager.getValue('aa') // Should show non-zero during speech
```

## Integration Examples

See `VrmLipSyncExample.tsx` for a complete working example demonstrating:
- Audio URL input
- Lip sync setup and controls
- Real-time status monitoring
- Integration with emotion switching

This example can be used as a starting point for implementing lip sync in your application.