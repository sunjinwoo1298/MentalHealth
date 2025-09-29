import { VRM } from '@pixiv/three-vrm';

/**
 * VrmLipSync handles real-time lip synchronization with audio playback
 * Applies 'aa' expression based on audio volume analysis
 * Designed to work AFTER emotion expressions but BEFORE VRM update
 */
export class VrmLipSync {
  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array = new Uint8Array(0);
  
  private currentLipSyncWeight: number = 0;
  private isActive: boolean = false;
  private vrm: VRM | null = null;
  private animationFrameId: number | null = null;
  
  // Configuration
  private readonly VOLUME_THRESHOLD = 0.01; // Minimum volume to trigger lip sync
  private readonly SMOOTHING_FACTOR = 0.3;  // Volume smoothing (0 = no smoothing, 1 = max smoothing)
  private readonly MAX_LIP_SYNC_WEIGHT = 0.8; // Maximum 'aa' expression weight

  /**
   * Set the VRM instance for lip sync
   */
  public setVRM(vrm: VRM): void {
    this.vrm = vrm;
  }

  /**
   * Setup audio analysis for the given audio element
   */
  public async setupAudio(audioElement: HTMLAudioElement): Promise<boolean> {
    try {
      // Clean up previous setup
      this.cleanup();
      
      this.audioElement = audioElement;
      
      // Create or reuse audio context
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Resume context if suspended (required by browser autoplay policies)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Create analyser
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      // Create buffer for frequency data
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      // Create source and connect to analyser
      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      // Add audio end event listener to reset 'aa' expression
      audioElement.addEventListener('ended', this.onAudioEnded);
      audioElement.addEventListener('pause', this.onAudioEnded);
      
      console.log('🎤 VrmLipSync: Audio analysis setup completed');
      return true;
      
    } catch (error) {
      console.error('❌ VrmLipSync: Failed to setup audio analysis:', error);
      return false;
    }
  }

  /**
   * Start lip sync analysis and application
   */
  public startLipSync(): void {
    if (!this.audioElement || !this.analyser || !this.vrm) {
      console.warn('⚠️ VrmLipSync: Cannot start - missing audio element, analyser, or VRM');
      return;
    }
    
    this.isActive = true;
    console.log('▶️ VrmLipSync: Started');
    
    // Start analysis loop if not already running
    if (!this.animationFrameId) {
      this.updateLoop();
    }
  }

  /**
   * Stop lip sync analysis
   */
  public stopLipSync(): void {
    this.isActive = false;
    this.currentLipSyncWeight = 0;
    
    // Reset 'aa' expression
    if (this.vrm?.expressionManager) {
      try {
        this.vrm.expressionManager.setValue('aa', 0);
      } catch (error) {
        // 'aa' expression might not exist on this model
      }
    }
    
    console.log('⏹️ VrmLipSync: Stopped');
  }

  /**
   * Handle audio ended/paused - reset 'aa' expression
   */
  private onAudioEnded = (): void => {
    this.currentLipSyncWeight = 0;
    
    // Reset 'aa' expression to 0
    if (this.vrm?.expressionManager) {
      try {
        this.vrm.expressionManager.setValue('aa', 0);
      } catch (error) {
        // 'aa' expression might not exist on this model
      }
    }
    
    console.log('🔇 VrmLipSync: Audio ended, reset aa expression to 0');
  };

  /**
   * Main update loop for volume analysis
   */
  private updateLoop = (): void => {
    if (this.isActive) {
      this.updateLipSync();
      this.animationFrameId = requestAnimationFrame(this.updateLoop);
    } else {
      this.animationFrameId = null;
    }
  };

  /**
   * Calculate current volume and update lip sync weight
   * Call this method during the render loop
   */
  public updateLipSync(): void {
    if (!this.isActive || !this.analyser || !this.audioElement) {
      return;
    }
    
    // Skip if audio is paused or ended
    if (this.audioElement.paused || this.audioElement.ended) {
      this.currentLipSyncWeight = 0;
      return;
    }
    
    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate RMS (Root Mean Square) for volume
    const volume = this.calculateVolume();
    
    // Apply threshold and normalize
    const normalizedVolume = volume > this.VOLUME_THRESHOLD 
      ? Math.min(volume * this.MAX_LIP_SYNC_WEIGHT, this.MAX_LIP_SYNC_WEIGHT)
      : 0;
    
    // Apply smoothing to prevent jittery movement
    this.currentLipSyncWeight = this.currentLipSyncWeight * this.SMOOTHING_FACTOR + 
                               normalizedVolume * (1 - this.SMOOTHING_FACTOR);
  }

  /**
   * Apply lip sync to VRM - call this AFTER expression manager updates
   */
  public applyLipSync(): void {
    if (!this.vrm?.expressionManager || !this.isActive) {
      return;
    }
    
    try {
      // Direct assignment since 'aa' is protected from emotion transitions
      this.vrm.expressionManager.setValue('aa', this.currentLipSyncWeight);
      
    } catch (error) {
      // 'aa' expression might not exist on this model - silently ignore
    }
  }

  /**
   * Calculate volume from frequency data using RMS
   */
  private calculateVolume(): number {
    let sum = 0;
    
    // Focus on lower frequencies for speech (roughly 0-2kHz range)
    // This helps ignore high frequency noise and focus on voice
    const speechRange = Math.min(this.dataArray.length, 32);
    
    for (let i = 0; i < speechRange; i++) {
      const amplitude = this.dataArray[i] / 255.0; // Normalize to 0-1
      sum += amplitude * amplitude;
    }
    
    // Calculate RMS and normalize
    const rms = Math.sqrt(sum / speechRange);
    
    // Apply a curve to make lip sync more responsive to speech
    return Math.pow(rms, 0.6); // Slight power curve for better visual response
  }

  /**
   * Get current lip sync weight for debugging/monitoring
   */
  public getCurrentWeight(): number {
    return this.currentLipSyncWeight;
  }

  /**
   * Check if lip sync is active and currently detecting speech
   */
  public isActiveAndSpeaking(): boolean {
    return this.isActive && this.currentLipSyncWeight > this.VOLUME_THRESHOLD;
  }

  /**
   * Preserve lip sync state during expression transitions
   * Useful for maintaining lip sync during emotion changes
   */
  public preserveStateDuring(callback: () => void): void {
    const savedWeight = this.currentLipSyncWeight;
    const wasActive = this.isActive;
    
    try {
      callback();
      
      // Restore lip sync state
      if (wasActive) {
        this.currentLipSyncWeight = savedWeight;
        this.applyLipSync();
      }
    } catch (error) {
      console.error('❌ VrmLipSync: Error during state preservation:', error);
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    // Stop animation loop
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.isActive = false;
    this.currentLipSyncWeight = 0;
    
    // Remove audio event listeners
    if (this.audioElement) {
      this.audioElement.removeEventListener('ended', this.onAudioEnded);
      this.audioElement.removeEventListener('pause', this.onAudioEnded);
    }
    
    // Disconnect audio nodes
    if (this.source) {
      try {
        this.source.disconnect();
      } catch (e) {
        // Node might already be disconnected
      }
      this.source = null;
    }
    
    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch (e) {
        // Node might already be disconnected
      }
      this.analyser = null;
    }
    
    // Note: We don't close audioContext here as it might be reused
    // The context will be closed when the component unmounts
    
    this.audioElement = null;
    
    console.log('🧹 VrmLipSync: Cleanup completed');
  }

  /**
   * Dispose of all resources including audio context
   */
  public dispose(): void {
    this.cleanup();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    console.log('🗑️ VrmLipSync: Disposed');
  }
}