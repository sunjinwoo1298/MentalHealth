import { useCallback, useRef, useState } from 'react';

interface TTSResponse {
  audio_base64?: string;
  audio_filename?: string;
  provider: string;
  voice_profile: string;
  emotion_context: string;
  duration_seconds: number;
}

interface ChatResponse {
  response: string;
  tts?: TTSResponse;
  voice_profile?: string;
  emotion_context?: string;
  timestamp: number;
  userId: string;
}

interface AudioTTSHookConfig {
  backendUrl?: string;
  autoPlay?: boolean;
  onAudioStart?: () => void;
  onAudioEnd?: () => void;
  onError?: (error: string) => void;
}

export const useAudioTTS = (config: AudioTTSHookConfig = {}) => {
  const {
    backendUrl = 'http://localhost:5010',
    autoPlay = true,
    onAudioStart,
    onAudioEnd,
    onError
  } = config;

  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  const initializeAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onloadstart = () => {
        setIsPlaying(true);
        onAudioStart?.();
      };
      audioRef.current.onended = () => {
        setIsPlaying(false);
        onAudioEnd?.();
      };
      audioRef.current.onerror = () => {
        setIsPlaying(false);
        onError?.('Audio playback failed');
      };
    }
  }, [onAudioStart, onAudioEnd, onError]);

  // Send message to TTS backend
  const sendMessage = useCallback(async (
    message: string, 
    userId: string = 'web-user',
    voicePreference: string = 'female'
  ): Promise<ChatResponse | null> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId,
          voicePreference
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      setLastResponse(data);
      
      // Auto-play audio if enabled (sending message counts as user interaction)
      if (autoPlay && data.tts) {
        console.log('Auto-play enabled, playing audio in 300ms...');
        setTimeout(() => {
          console.log('Attempting to play audio:', data.tts);
          playResponseAudio(data);
        }, 300);
      } else {
        console.log('Auto-play conditions:', { autoPlay, hasTTS: !!data.tts });
      }

      return data;
    } catch (error) {
      console.error('Error sending message to TTS backend:', error);
      onError?.(`Failed to send message: ${error}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl, autoPlay, onError]);

  // Play audio from response
  const playResponseAudio = useCallback((response: ChatResponse) => {
    console.log('playResponseAudio called with:', response);
    initializeAudio();
    
    if (!audioRef.current || !response.tts) {
      console.log('Audio setup failed:', { audioRef: !!audioRef.current, tts: !!response.tts });
      return;
    }

    try {
      if (response.tts.audio_base64) {
        console.log('Playing from base64 - creating browser cache blob');
        // Convert base64 to blob and create URL (stored in browser cache)
        const audioBlob = new Blob(
          [Uint8Array.from(atob(response.tts.audio_base64), c => c.charCodeAt(0))], 
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        
        // Cleanup blob URL after audio ends or errors
        const cleanup = () => {
          setIsPlaying(false);
          onAudioEnd?.();
          URL.revokeObjectURL(audioUrl);
          console.log('Audio blob URL cleaned up from browser cache');
        };
        
        audioRef.current.onended = cleanup;
        audioRef.current.onerror = cleanup;
        
      } else {
        console.warn('No base64 audio data found - audio files are no longer supported');
        onError?.('No audio data available');
        return;
      }

      console.log('Attempting to play audio from browser cache...');
      audioRef.current.play().then(() => {
        console.log('Audio playback started successfully from browser cache');
      }).catch(error => {
        console.error('Audio play error:', error);
        onError?.('Could not play audio');
        setIsPlaying(false);
      });
    } catch (error) {
      console.error('Audio setup error:', error);
      onError?.('Audio setup failed');
    }
  }, [backendUrl, initializeAudio, onAudioEnd, onError]);

  // Stop current audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  // Replay last response audio
  const replayLastAudio = useCallback(() => {
    if (lastResponse) {
      playResponseAudio(lastResponse);
    }
  }, [lastResponse, playResponseAudio]);

  // Test TTS endpoint
  const testTTS = useCallback(async (text: string = 'Hello, this is a test of the TTS system') => {
    try {
      const response = await fetch(`${backendUrl}/tts/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_profile: 'compassionate_female',
          emotion_context: 'supportive'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('TTS test response:', data);
      return data;
    } catch (error) {
      console.error('TTS test error:', error);
      onError?.('TTS test failed');
      return null;
    }
  }, [backendUrl, onError]);

  // Get available voices
  const getVoices = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/tts/voices`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching voices:', error);
      onError?.('Failed to fetch voices');
      return null;
    }
  }, [backendUrl, onError]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return {
    // State
    isLoading,
    isPlaying,
    lastResponse,
    
    // Actions
    sendMessage,
    playResponseAudio,
    stopAudio,
    replayLastAudio,
    testTTS,
    getVoices,
    cleanup,
    
    // Utils
    initializeAudio
  };
};