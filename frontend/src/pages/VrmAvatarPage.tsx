import ChatWindow from '../components/Chat/ChatWindow'
import bgImage from '../assets/original-d72d788dbed5079c4bfa0140d6845ae8.webp'


const VrmAvatarPage = () => {
  return (
     <div
      className="h-screen w-screen overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* Integrated Chat with VRM Avatar */}
      <ChatWindow />
    </div>
  )
}

export default VrmAvatarPage