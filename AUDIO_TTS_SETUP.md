# 🎙️ Audio TTS Integration Setup Guide

## Quick Start

You now have **voice-enabled mental health chat** integrated into your React frontend! Here's how to use and test it:

### 🚀 Available Components

1. **AudioTTSChat** - Standalone chat with voice responses
2. **ChatWindowWithTTS** - Enhanced version of your existing chat
3. **AudioPlayer** - Reusable audio player component
4. **useAudioTTS** - Hook for TTS functionality

### 📍 Test the Audio Chat

1. **Start your backend** (if not already running):
   ```bash
   cd ai-services
   python main.py
   ```

2. **Start your frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Visit the test page**:
   ```
   http://localhost:5173/audio-chat
   ```

### 🎯 How It Works

1. **User types a message** → Sent to Python backend (`http://localhost:5010/chat`)
2. **AI generates response** → Processed by Gemini AI (or fallback responses)
3. **Murf.ai creates audio** → High-quality voice synthesis
4. **Audio plays automatically** → Natural voice response
5. **User can replay** → Click "Play Audio" button

### 🔧 Integration Options

#### Option 1: Use the Test Page
- Visit `/audio-chat` for a complete experience
- Features voice stats, controls, and info panels

#### Option 2: Replace Your Chat Component
Replace your existing ChatWindow import:
```tsx
// Before
import ChatWindow from '../components/Chat/ChatWindow'

// After  
import ChatWindowWithTTS from '../components/Chat/ChatWindowWithTTS'
```

#### Option 3: Add to Existing Components
Use the `useAudioTTS` hook in any component:
```tsx
import { useAudioTTS } from '../hooks/useAudioTTS'

const { sendMessage, isPlaying, replayLastAudio } = useAudioTTS({
  backendUrl: 'http://localhost:5010',
  autoPlay: true
})
```

### 🎭 Voice Features

- **Multiple Voice Profiles**: Compassionate female, empathetic male, gentle female
- **Emotion-Aware**: Voice adapts to message context (supportive, calming, encouraging)
- **Cultural Sensitivity**: Optimized for Indian context
- **High Quality**: Powered by Murf.ai professional TTS
- **Real-time**: Immediate audio generation and playback

### 🎵 Audio Controls

- **Auto-play**: Voice responses play automatically
- **Replay**: Click to replay any AI response
- **Stop**: Stop current audio playback
- **Progress**: See audio duration and current position

### 🔍 Debug & Testing

#### Check Backend Status
```bash
curl http://localhost:5010/health
```

#### Test TTS Directly
```bash
curl -X POST http://localhost:5010/tts/test \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, this is a test!"}'
```

#### Check Generated Audio Files
```bash
# In ai-services directory
ls murf_audio_*.mp3
```

### 🎨 Customization

#### Backend Configuration
- **Change voice profiles** in `murf_tts_service.py`
- **Adjust emotion contexts** in `main.py`
- **Modify fallback responses** for missing Gemini API

#### Frontend Styling
- **AudioTTSChat**: Full standalone chat UI
- **AudioPlayer**: Customizable with className prop
- **useAudioTTS**: Headless hook for custom UIs

### ⚠️ Troubleshooting

#### Audio Not Playing
1. Check browser auto-play policies
2. Verify backend is running on port 5010
3. Check browser developer console for errors
4. Ensure audio files are being generated

#### Backend Errors
1. Install requirements: `pip install -r requirements.txt`
2. Check .env file has MURF_API_KEY
3. Gemini API key optional (uses fallback responses)

#### CORS Issues
- Backend includes CORS headers
- Frontend should connect to `http://localhost:5010`

### 🎉 Success Indicators

✅ **Backend logs show**: "Speech generated successfully"
✅ **Audio files created**: `murf_audio_*.mp3` files appear
✅ **Frontend shows**: Audio player controls
✅ **Browser plays**: Natural voice responses
✅ **Stats update**: Message and audio counters increase

### 🔊 Example Conversation

Try these messages to test different emotions:

1. **"I'm feeling anxious about my exams"** → Supportive response
2. **"I had a great day today!"** → Happy/encouraging response  
3. **"I'm struggling with depression"** → Gentle/empathetic response
4. **"Can you help me with meditation?"** → Calming response

Each response will include natural voice synthesis with appropriate emotional tone!

---

🎙️ **Your mental health chatbot now speaks with empathy and care!** 💙