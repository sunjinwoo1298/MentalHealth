import { useVrmAvatar } from '../hooks/useVrmAvatar'
import { EmotionControls } from '../components/VrmControls'

const VrmAvatarPage = () => {
  const {
    canvasRef,
    currentEmotion,
    isLoading,
    isTransitioning,
    switchToEmotion
  } = useVrmAvatar()

  return (
    <div style={{ /* styling */ }}>
      <canvas ref={canvasRef} />
      <EmotionControls
        currentEmotion={currentEmotion}
        isLoading={isLoading}
        isTransitioning={isTransitioning}
        onEmotionChange={switchToEmotion}
      />
    </div>
  )
}

export default VrmAvatarPage