/**
 * Murf AI Audio Management Service
 * Handles audio file creation, playback, and auto-cleanup
 */

export interface AudioMetadata {
  fileName: string;
  duration: number;
  voiceProfile: string;
  emotionContext: string;
  timestamp: number;
}

export interface MurfTTSResponse {
  success: boolean;
  audio_data?: string; // Base64 encoded audio (legacy)
  audio_url?: string; // Direct URL to audio file (new)
  audio_filename?: string;
  duration_seconds?: number;
  audio_length?: number; // Duration from Murf API
  voice_profile: string;
  emotion_context: string;
  provider: string;
  error?: string;
  fallback_message?: string;
}

class AudioManager {
  private audioCache = new Map<string, { blob: Blob; url: string; metadata: AudioMetadata }>();
  private currentAudio: HTMLAudioElement | null = null;
  private cleanupTimeouts = new Map<string, NodeJS.Timeout>();
  
  /**
   * Convert base64 audio data to blob URL and store in browser cache
   */
  createAudioFromBase64(base64Data: string, metadata: AudioMetadata): string {
    try {
      // Remove data URL prefix if present
      const base64Audio = base64Data.replace(/^data:audio\/[^;]+;base64,/, '');
      
      // Convert base64 to binary
      const binaryString = window.atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create blob and URL
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      
      // Store in cache
      this.audioCache.set(metadata.fileName, {
        blob,
        url: audioUrl,
        metadata
      });
      
      // Schedule cleanup after playback + 30 seconds buffer
      this.scheduleCleanup(metadata.fileName, (metadata.duration + 30) * 1000);
      
      console.log(`Audio cached: ${metadata.fileName}, URL: ${audioUrl}`);
      return audioUrl;
      
    } catch (error) {
      console.error('Failed to create audio from base64:', error);
      throw new Error('Failed to process audio data');
    }
  }
  
  /**
   * Get the current audio element (if any)
   */
  getCurrentAudioElement(): HTMLAudioElement | null {
    return this.currentAudio;
  }

  /**
   * Setup audio element and return it, but don't wait for full playback
   */
  async setupAndPlayAudio(audioUrl: string, metadata: AudioMetadata): Promise<HTMLAudioElement> {
    try {
      // Stop current audio if playing
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }
      
      console.log(`🔊 Setting up audio: ${audioUrl}`);
      console.log(`📊 Audio metadata:`, metadata);
      
      // Create new audio element
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      
      // Configure audio settings
      audio.volume = 0.8;
      audio.preload = 'auto';
      
      // Add event listeners for debugging
      audio.addEventListener('loadstart', () => {
        console.log('🔄 Audio loading started...');
      });
      
      audio.addEventListener('canplay', () => {
        console.log('✅ Audio can play');
      });
      
      audio.addEventListener('canplaythrough', () => {
        console.log('✅ Audio can play through');
      });
      
      audio.addEventListener('error', (e) => {
        console.error('❌ Audio error:', e);
        console.error('Audio error details:', {
          error: audio.error,
          src: audio.src,
          readyState: audio.readyState,
          networkState: audio.networkState
        });
      });
      
      audio.addEventListener('ended', () => {
        console.log('🎵 Audio playback ended');
        this.currentAudio = null;
      });
      
      // Start loading and playing
      await audio.play();
      
      return audio;
      
    } catch (error) {
      console.error(`❌ Audio setup/play failed:`, error);
      this.currentAudio = null;
      throw error;
    }
  }

  /**
   * Play audio with browser compatibility and auto-play handling
   */
  async playAudio(audioUrl: string, metadata: AudioMetadata): Promise<void> {
    try {
      // Stop current audio if playing
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }
      
      console.log(`🔊 Playing audio: ${audioUrl}`);
      console.log(`📊 Audio metadata:`, metadata);
      
      // Create new audio element
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      
      // Configure audio settings
      audio.volume = 0.8;
      audio.preload = 'auto';
      
      // Add event listeners for debugging
      audio.addEventListener('loadstart', () => {
        console.log('🔄 Audio loading started...');
      });
      
      audio.addEventListener('canplay', () => {
        console.log('✅ Audio can play');
      });
      
      audio.addEventListener('canplaythrough', () => {
        console.log('✅ Audio can play through');
      });
      
      audio.addEventListener('error', (e) => {
        console.error('❌ Audio error:', e);
        console.error('Audio error details:', {
          error: audio.error,
          src: audio.src,
          readyState: audio.readyState,
          networkState: audio.networkState
        });
      });
      
      audio.addEventListener('ended', () => {
        console.log('🎵 Audio playback ended');
        this.currentAudio = null;
      });
      
      // Return promise that resolves when playback starts or fails
      return new Promise((resolve, reject) => {
        audio.addEventListener('playing', () => {
          console.log('🎵 Audio started playing');
          resolve();
        });
        
        audio.addEventListener('error', () => {
          reject(new Error('Audio failed to play'));
        });
        
        // Start playback
        audio.play().catch(reject);
      });
      
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  }

  /**
   * Stop currently playing audio
   */
  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      console.log('Audio playback stopped');
    }
  }
  
  /**
   * Schedule audio file cleanup
   */
  private scheduleCleanup(fileName: string, delayMs: number): void {
    // Clear existing timeout
    const existingTimeout = this.cleanupTimeouts.get(fileName);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Schedule new cleanup
    const timeout = setTimeout(() => {
      this.cleanupAudioFile(fileName);
    }, delayMs);
    
    this.cleanupTimeouts.set(fileName, timeout);
    console.log(`Scheduled cleanup for ${fileName} in ${delayMs}ms`);
  }
  
  /**
   * Clean up audio file from memory and cache
   */
  private cleanupAudioFile(fileName: string): void {
    const cached = this.audioCache.get(fileName);
    if (cached) {
      // Revoke blob URL to free memory
      URL.revokeObjectURL(cached.url);
      
      // Remove from cache
      this.audioCache.delete(fileName);
      
      // Clear timeout
      const timeout = this.cleanupTimeouts.get(fileName);
      if (timeout) {
        clearTimeout(timeout);
        this.cleanupTimeouts.delete(fileName);
      }
      
      console.log(`Cleaned up audio file: ${fileName}`);
    }
  }
  
  /**
   * Clean up all cached audio files
   */
  cleanup(): void {
    // Stop any playing audio
    this.stopAudio();
    
    // Clean up all cached files
    for (const [fileName] of this.audioCache) {
      this.cleanupAudioFile(fileName);
    }
    
    console.log('All audio files cleaned up');
  }
}

// Global instance
export const audioManager = new AudioManager();

// Main function for generating and playing speech
export async function generateAndPlaySpeech(
  text: string,
  options: {
    voiceProfile?: string;
    emotionContext?: string;
    userId?: string;
    backendUrl?: string;
    onStart?: (audioElement?: HTMLAudioElement) => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  } = {}
): Promise<{ success: boolean; audioUrl?: string; error?: string }> {
  const {
    voiceProfile = 'compassionate_female',
    emotionContext,
    userId = 'anonymous',
    backendUrl = 'http://localhost:5010',
    onStart,
    onEnd,
    onError
  } = options;
  
  try {
    console.log('🎤 Generating speech with Murf AI...', { text: text.substring(0, 50) + '...', voiceProfile, emotionContext });
    
    // Call TTS endpoint
    const response = await fetch(`${backendUrl}/generate_speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice_profile: voiceProfile,
        emotion_context: emotionContext,
        userId
      })
    });
    
    if (!response.ok) {
      throw new Error(`TTS request failed: ${response.status} ${response.statusText}`);
    }
    
    const result: MurfTTSResponse = await response.json();
    console.log('🎤 TTS Response:', result);
    
    if (!result.success) {
      throw new Error(result.error || result.fallback_message || 'TTS generation failed');
    }
    
    // Create audio metadata
    const metadata: AudioMetadata = {
      fileName: result.audio_filename || `audio_${Date.now()}.mp3`,
      duration: result.duration_seconds || result.audio_length || 0,
      voiceProfile: result.voice_profile,
      emotionContext: result.emotion_context,
      timestamp: Date.now()
    };
    
    let audioUrl: string;
    
    // Handle both URL and base64 responses
    if (result.audio_url) {
      // Direct URL from Murf API - proxy it through backend to avoid CORS
      console.log('🎵 Proxying audio URL through backend to avoid CORS...');
      
      try {
        // Use backend proxy to avoid CORS issues
        const proxyResponse = await fetch('http://localhost:3001/api/audio/proxy-audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            originalUrl: result.audio_url,
            fileName: metadata.fileName
          }),
        });

        if (!proxyResponse.ok) {
          throw new Error(`Audio proxy failed: ${proxyResponse.status}`);
        }

        // Create a blob URL from the proxied audio
        const audioBlob = await proxyResponse.blob();
        audioUrl = URL.createObjectURL(audioBlob);
        
        console.log('✅ Audio proxied successfully, using blob URL for playback');
        
      } catch (proxyError) {
        console.warn('⚠️ Audio proxy failed, falling back to direct URL (may have CORS issues):', proxyError);
        audioUrl = result.audio_url;
      }
      
    } else if (result.audio_data) {
      // Legacy base64 data - convert to blob URL
      console.log('🎵 Converting base64 audio data to blob URL');
      audioUrl = audioManager.createAudioFromBase64(result.audio_data, metadata);
    } else {
      throw new Error('No audio data or URL provided');
    }
    
    // // Notify start
    // if (onStart) onStart();
    
    // // Play audio
    // await audioManager.playAudio(audioUrl, metadata);

    // Setup and start audio, get the audio element immediately
    const audioElement = await audioManager.setupAndPlayAudio(audioUrl, metadata);
    
    // Notify start with audio element (audio is now playing)
    if (onStart) {
      onStart(audioElement);
    }
    
    // Wait for audio to complete by listening to ended event
    return new Promise<{ success: boolean; audioUrl: string }>((resolve) => {
      audioElement.addEventListener('ended', () => {
        console.log('✅ Speech generation and playback completed successfully');
        if (onEnd) onEnd();
        resolve({ success: true, audioUrl });
      });
      
      audioElement.addEventListener('error', () => {
        console.error('🔊 Audio playback error during playback');
        if (onError) onError('Audio playback failed');
        resolve({ success: false, audioUrl });
      });
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('🔊 TTS generation failed:', errorMessage);
    
    if (onError) onError(errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Check TTS service status
export async function checkTTSStatus(backendUrl: string = 'http://localhost:5010') {
  try {
    const response = await fetch(`${backendUrl}/tts_status`);
    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }
    
    const status = await response.json();
    console.log('TTS Status:', status);
    return status;
    
  } catch (error) {
    console.error('Failed to check TTS status:', error);
    return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}