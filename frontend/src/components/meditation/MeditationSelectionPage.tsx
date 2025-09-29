/**
 * MeditationSelectionPage Component
 * 
 * Purpose: Main meditation selection interface with card grid layout
 * Features:
 * - Responsive 2-3 column grid layout for meditation cards
 * - Staggered entrance animations for cards
 * - Background with floating shapes and gradient overlays
 * - Background ambient music with controls
 * - Smooth navigation transitions to detail page
 * - Accessibility features and keyboard navigation
 * 
 * State Management:
 * - selectedMeditation: currently selected meditation for detail view
 * - isLoading: loading state for transitions
 * 
 * Layout Notes:
 * - Mobile: 1 column stack
 * - Tablet: 2 columns
 * - Desktop: 3 columns with consistent spacing
 * - Cards animate in with 200ms stagger delay
 * 
 * Navigation:
 * - Smooth fade and slide transition to detail page
 * - Preserves meditation data in component state
 * - Back navigation returns to selection view
 */

import { useState } from 'react'
import MeditationCard from './MeditationCard'
import MeditationDetailPage from './MeditationDetailPage'
import FloatingShapes from './FloatingShapes'
import BackgroundMusic from './BackgroundMusic'


interface Meditation {
  id: string
  title: string
  description: string
  duration: string
  category: string
  icon: string
  color: string
  instructions: string[]
  keyBenefits: string[]
}

const meditationSessions: Meditation[] = [
  {
    id: 'breathing',
    title: 'Breathing Exercise',
    description: 'Calm your mind with focused breathing techniques that reduce stress and anxiety',
    duration: '5-10 mins',
    category: 'Beginners',
    icon: '🌬️',
    color: 'blue',
    instructions: [
      '🧘‍♀️ Find a comfortable seated position with spine straight',
      '👁️ Close your eyes gently and breathe naturally at first',
      '🫁 Inhale slowly through your nose for 4 counts',
      '⏸️ Hold your breath gently for 4 counts',
      '💨 Exhale slowly through your mouth for 6 counts',
      '🔄 Repeat this cycle mindfully for the duration',
      '🌊 Notice the calming sensation with each breath',
      '☮️ End with a moment of gratitude and peace'
    ],
    keyBenefits: [
      '🧘‍♀️ Reduces stress and anxiety within minutes',
      '💓 Lowers heart rate and blood pressure naturally',
      '🌊 Activates the body\'s relaxation response',
      '🧠 Improves focus and mental clarity',
      '😴 Promotes better sleep quality'
    ]
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness Practice',
    description: 'Develop present-moment awareness and cultivate inner peace through observation',
    duration: '10-15 mins',
    category: 'Intermediate',
    icon: '🧠',
    color: 'purple',
    instructions: [
      '🪑 Sit comfortably with spine naturally straight',
      '👀 Softly gaze downward or gently close your eyes',
      '🌊 Notice thoughts as they arise without judgment',
      '🎯 Gently return focus to your breath when distracted',
      '💭 Observe emotions and sensations as temporary visitors',
      '🕊️ Cultivate compassion and kindness toward yourself',
      '🌟 Rest in awareness of the present moment',
      '🙏 Close with appreciation for this time of peace'
    ],
    keyBenefits: [
      '🧠 Enhances emotional regulation and resilience',
      '🎯 Improves concentration and attention span',
      '💭 Reduces overthinking and mental chatter',
      '🌟 Increases self-awareness and insight',
      '😌 Cultivates inner peace and contentment'
    ]
  },
  {
    id: 'bodyscan',
    title: 'Body Scan Relaxation',
    description: 'Release deep tension through systematic body awareness and conscious relaxation',
    duration: '15-20 mins',
    category: 'Deep Focus',
    icon: '🌸',
    color: 'green',
    instructions: [
      '🛏️ Lie down in a comfortable, well-supported position',
      '😌 Close your eyes and take three deep, cleansing breaths',
      '🦶 Begin at your toes, noticing all physical sensations',
      '⬆️ Slowly scan upward through each part of your body',
      '💆‍♀️ Acknowledge areas of tension without trying to change them',
      '🌊 Breathe gentle awareness into tight or stressed areas',
      '🌟 Complete with full-body relaxation and integration',
      '🙏 Rest deeply in this peaceful, completely relaxed state'
    ],
    keyBenefits: [
      '💆‍♀️ Releases chronic muscle tension and pain',
      '😴 Improves sleep quality and reduces insomnia',
      '🧘‍♀️ Deepens body-mind awareness connection',
      '⚡ Reduces physical stress and fatigue',
      '🌊 Promotes profound relaxation and healing'
    ]
  },
  {
    id: 'deepmeditation',
    title: 'Deep Meditation Journey',
    description: 'Advanced practice for profound inner transformation and expanded consciousness',
    duration: '25-30 mins',
    category: 'Advanced',
    icon: '🕉️',
    color: 'orange',
    instructions: [
      '🧘‍♀️ Establish yourself in a comfortable meditation posture',
      '🌅 Set a clear, heartfelt intention for your practice',
      '🫁 Develop steady, rhythmic breathing as your foundation',
      '🎯 Choose and maintain focus on your meditation object',
      '🌊 Allow all thoughts to arise and pass like clouds',
      '💫 Deepen gradually into profound stillness and peace',
      '🔮 Explore the expansive nature of pure awareness',
      '🌟 Rest completely in the essence of consciousness',
      '🙏 Return slowly with wisdom, gratitude, and integration'
    ],
    keyBenefits: [
      '🔮 Accesses deep states of consciousness and clarity',
      '🌟 Facilitates profound spiritual insights and growth',
      '🧘‍♀️ Develops advanced concentration abilities',
      '💫 Reduces existential anxiety and fear',
      '🕉️ Cultivates lasting inner peace and wisdom'
    ]
  },
  {
    id: 'lovingkindness',
    title: 'Loving Kindness',
    description: 'Cultivate compassion and love for yourself and all beings',
    duration: '12-18 mins',
    category: 'Heart-Opening',
    icon: '💖',
    color: 'pink',
    instructions: [
      '❤️ Sit with your heart open and hands resting gently',
      '🤗 Begin by offering love and kindness to yourself',
      '🌸 Repeat: "May I be happy, may I be peaceful, may I be free"',
      '👥 Extend this love to someone dear to you',
      '🌍 Gradually include neutral people in your circle',
      '🕊️ Even offer compassion to difficult people',
      '🌈 Expand to include all beings everywhere',
      '💫 Rest in the boundless nature of loving awareness'
    ],
    keyBenefits: [
      '💖 Increases self-compassion and self-acceptance',
      '🤝 Improves relationships and social connections',
      '😊 Reduces negative emotions like anger and resentment',
      '🌈 Enhances empathy and emotional intelligence',
      '✨ Cultivates genuine happiness and joy'
    ]
  },
  {
    id: 'walkingmeditation',
    title: 'Walking Meditation',
    description: 'Mindful movement practice connecting body, breath, and awareness',
    duration: '8-15 mins',
    category: 'Active Practice',
    icon: '🚶‍♀️',
    color: 'indigo',
    instructions: [
      '👣 Find a quiet path or small area for slow walking',
      '🎯 Begin standing still, establishing mindful awareness',
      '🐌 Take very slow, deliberate steps with full attention',
      '👁️ Coordinate movement with natural breathing rhythm',
      '🌿 Notice the sensations of feet touching the ground',
      '🔄 Turn mindfully at the end of your walking path',
      '🌊 Maintain continuous awareness throughout',
      '🛑 End by standing in stillness and gratitude'
    ],
    keyBenefits: [
      '🚶‍♀️ Combines physical movement with mental training',
      '🌿 Connects you deeply with your body and environment',
      '⚡ Energizes the body while calming the mind',
      '🎯 Improves balance and body awareness',
      '🌸 Perfect for those who find sitting meditation difficult'
    ]
  }
]

// Background music tracks for selection page
const selectionTracks = [
  { src: '/audio/zen-garden.mp3', name: 'Zen Garden' },
  { src: '/audio/forest-stream.mp3', name: 'Forest Stream' },
  { src: '/audio/tibetan-bowls.mp3', name: 'Tibetan Bowls' }
]

export default function MeditationSelectionPage() {
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleMeditationStart = async (meditationId: string) => {
    const meditation = meditationSessions.find(m => m.id === meditationId)
    if (!meditation) {
      return
    }

    setIsTransitioning(true)
    
    // Smooth transition delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    setSelectedMeditation(meditation)
    setIsTransitioning(false)
  }

  const handleBackToSelection = async () => {
    setIsTransitioning(true)
    
    // Smooth transition delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    setSelectedMeditation(null)
    setIsTransitioning(false)
  }

  // Show detail page if meditation is selected
  if (selectedMeditation) {
    return (
      <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <MeditationDetailPage 
          meditation={selectedMeditation}
          onBack={handleBackToSelection}
        />
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {/* Floating Background Shapes */}
      <FloatingShapes count={20} />
      
      {/* Background Music */}
      <BackgroundMusic tracks={selectionTracks} autoPlay={true} defaultVolume={0.2} />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="text-center mb-16 animate-fade-in-up">
          <div className="inline-block p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xl">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent mb-4">
              Meditation Sessions
            </h1>
            <p className="text-xl text-gray-700 font-medium max-w-2xl mx-auto">
              Choose your perfect meditation journey. Find peace, clarity, and inner harmony ✨
            </p>
          </div>
        </header>

        {/* Meditation Cards Grid */}
        <main 
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          role="main"
          aria-label="Available meditation sessions"
        >
          {meditationSessions.map((meditation, index) => (
            <MeditationCard
              key={meditation.id}
              meditation={meditation}
              onStart={handleMeditationStart}
              delay={index * 200} // Staggered entrance animation
            />
          ))}
        </main>

        {/* Additional Information Section */}
        <aside className="mt-20 text-center">
          <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-8 border border-white/60 shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Welcome to Your Meditation Practice
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Each meditation session is designed to guide you toward greater peace, awareness, and well-being. 
              Choose based on your experience level, available time, and what you'd like to cultivate today.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                Beginner Friendly
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-400 rounded-full"></span>
                Intermediate Practice
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-400 rounded-full"></span>
                Advanced Journey
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse mb-4 mx-auto"></div>
            <p className="text-lg font-medium text-gray-700">Loading your meditation...</p>
          </div>
        </div>
      )}
    </div>
  )
}