import type { EmotionType } from '../../vrm/config'
import { EMOTIONS } from '../../vrm/config'

interface EmotionControlsProps {
  currentEmotion: EmotionType
  isLoading: boolean
  isTransitioning: boolean
  onEmotionChange: (emotion: EmotionType) => Promise<void>
}

/**
 * Emotion control buttons component
 */
export const EmotionControls: React.FC<EmotionControlsProps> = ({
  currentEmotion,
  isLoading,
  isTransitioning,
  onEmotionChange
}) => {
  const handleEmotionClick = async (emotion: EmotionType) => {
    if (isLoading || isTransitioning) return
    await onEmotionChange(emotion)
  }

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: 1000
    }}>
      <div style={{ 
        color: 'white', 
        fontSize: '16px', 
        fontWeight: 'bold',
        marginBottom: '10px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
      }}>
        Emotion Controls
      </div>
      
      {isLoading && (
        <div style={{ 
          color: 'white', 
          fontSize: '14px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
        }}>
          Loading VRM Avatar...
        </div>
      )}
      
      {!isLoading && EMOTIONS.map(emotion => (
        <button
          key={emotion}
          onClick={() => handleEmotionClick(emotion)}
          disabled={isLoading || isTransitioning}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading || isTransitioning ? 'not-allowed' : 'pointer',
            textTransform: 'capitalize',
            transition: 'all 0.2s ease',
            backgroundColor: currentEmotion === emotion ? '#4CAF50' : '#2196F3',
            color: 'white',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            minWidth: '100px',
            opacity: isLoading || isTransitioning ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!isLoading && !isTransitioning && currentEmotion !== emotion) {
              e.currentTarget.style.backgroundColor = '#1976D2'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && !isTransitioning && currentEmotion !== emotion) {
              e.currentTarget.style.backgroundColor = '#2196F3'
            }
          }}
        >
          {emotion}
        </button>
      ))}
      
      <div style={{ 
        color: 'white', 
        fontSize: '12px', 
        marginTop: '10px',
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
      }}>
        Current: {currentEmotion}
        {isTransitioning && ' (transitioning...)'}
      </div>
    </div>
  )
}