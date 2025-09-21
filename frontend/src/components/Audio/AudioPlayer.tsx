import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  audioUrl?: string;
  audioBase64?: string;
  autoPlay?: boolean;
  className?: string;
  onPlay?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  showControls?: boolean;
  children?: React.ReactNode;
}

export default function AudioPlayer({
  audioUrl,
  audioBase64,
  autoPlay = false,
  className = '',
  onPlay,
  onEnd,
  onError,
  showControls = true,
  children
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.onloadstart = () => {
        setIsLoading(true);
        setError(null);
      };

      audioRef.current.onloadeddata = () => {
        setIsLoading(false);
        setDuration(audioRef.current?.duration || 0);
      };

      audioRef.current.onplay = () => {
        setIsPlaying(true);
        onPlay?.();
      };

      audioRef.current.onpause = () => {
        setIsPlaying(false);
      };

      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        onEnd?.();
      };

      audioRef.current.ontimeupdate = () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      };

      audioRef.current.onerror = () => {
        const errorMsg = 'Audio playback failed';
        setError(errorMsg);
        setIsLoading(false);
        setIsPlaying(false);
        onError?.(errorMsg);
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [onPlay, onEnd, onError]);

  useEffect(() => {
    if (!audioRef.current) return;

    let audioSrc = '';
    
    if (audioBase64) {
      try {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], 
          { type: 'audio/mpeg' }
        );
        audioSrc = URL.createObjectURL(audioBlob);
        
        // Cleanup function for blob URL
        const cleanup = () => URL.revokeObjectURL(audioSrc);
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setCurrentTime(0);
          onEnd?.();
          cleanup();
        };
      } catch (err) {
        setError('Invalid audio data');
        onError?.('Invalid audio data');
        return;
      }
    } else if (audioUrl) {
      audioSrc = audioUrl;
    } else {
      return;
    }

    audioRef.current.src = audioSrc;

    if (autoPlay) {
      audioRef.current.play().catch(err => {
        console.error('Auto-play failed:', err);
        setError('Auto-play blocked by browser');
        onError?.('Auto-play blocked by browser');
      });
    }

    return () => {
      if (audioBase64 && audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, [audioUrl, audioBase64, autoPlay, onEnd, onError]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Play failed:', err);
        setError('Playback failed');
        onError?.('Playback failed');
      });
    }
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!audioUrl && !audioBase64) {
    return null;
  }

  return (
    <div className={`audio-player ${className}`}>
      {children}
      
      {showControls && (
        <div className="flex items-center space-x-2 text-sm">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={isLoading || !!error}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>{isPlaying ? '⏸️' : '▶️'}</span>
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </>
            )}
          </button>

          {/* Stop Button */}
          {isPlaying && (
            <button
              onClick={stop}
              className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
              title="Stop"
            >
              ⏹️
            </button>
          )}

          {/* Progress */}
          {duration > 0 && (
            <div className="flex items-center space-x-2 flex-1">
              <span className="text-xs text-gray-600">
                {formatTime(currentTime)}
              </span>
              
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                  aria-label="Audio progress"
                  title={`Seek to ${formatTime(currentTime)} of ${formatTime(duration)}`}
                />
              </div>
              
              <span className="text-xs text-gray-600">
                {formatTime(duration)}
              </span>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="text-red-500 text-xs">
              ⚠️ {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}