/**
 * ExerciseSelectionPage Component
 * 
 * Purpose: Main exercise selection interface with card grid layout
 * Features:
 * - Responsive 2-3 column grid layout for exercise cards
 * - Each card shows exercise with video and instructions
 * - Background with floating shapes and gradient overlays
 * - Smooth navigation transitions to detail page
 * - Accessibility features and keyboard navigation
 * 
 * Exercise Types:
 * - Yoga poses for mental wellness
 * - Breathing exercises
 * - Stretching routines
 * - Body movement therapy
 * - Mindful walking
 */

import { useState } from 'react'
import ExerciseCard from './ExerciseCard'
import ExerciseDetailPage from './ExerciseDetailPage'
import FloatingShapes from '../meditation/FloatingShapes'
import BackgroundMusic from '../meditation/BackgroundMusic'

interface Exercise {
  id: string
  title: string
  description: string
  duration: string
  difficulty: string
  icon: string
  color: string
  videoUrl: string
  instructions: string[]
  keyBenefits: string[]
  category: string
}

const exerciseSessions: Exercise[] = [
  {
    id: 'yoga-sun-salutation',
    title: 'Yoga Sun Salutation',
    description: 'A flowing sequence that energizes body and calms mind, perfect for morning practice',
    duration: '10-15 mins',
    difficulty: 'Beginner',
    icon: '🧘‍♀️',
    color: 'orange',
    category: 'Yoga Flow',
    videoUrl: 'https://www.youtube.com/embed/73sjOu0g58M',
    instructions: [
      '🌅 Stand at the front of your mat in Mountain Pose',
      '🙏 Bring hands to heart center, take a deep breath',
      '⬆️ Inhale, reach arms up overhead (Upward Salute)',
      '⬇️ Exhale, fold forward with straight back (Forward Fold)',
      '👀 Inhale, lift chest halfway (Halfway Lift)',
      '🦵 Exhale, step back to Plank position',
      '⬇️ Lower down slowly to the ground (Chaturanga)',
      '🐍 Inhale, lift chest in Cobra or Upward Dog',
      '🐕 Exhale, press back to Downward Facing Dog',
      '🦶 Hold for 5 breaths, then step feet forward',
      '⬆️ Inhale, rise up to standing with arms overhead',
      '🙏 Exhale, return hands to heart center'
    ],
    keyBenefits: [
      '☀️ Energizes the entire body and mind',
      '💪 Strengthens muscles and improves flexibility',
      '🫁 Deepens breathing and lung capacity',
      '🧘‍♀️ Reduces stress and anxiety naturally',
      '🌊 Improves balance and body awareness',
      '❤️ Boosts cardiovascular health gently'
    ]
  },
  {
    id: 'chair-yoga',
    title: 'Chair Yoga for Relaxation',
    description: 'Gentle seated movements perfect for stress relief at work or home',
    duration: '8-12 mins',
    difficulty: 'Beginner',
    icon: '🪑',
    color: 'blue',
    category: 'Gentle Movement',
    videoUrl: 'https://www.youtube.com/embed/UHQ4iJbhbUE',
    instructions: [
      '🪑 Sit comfortably at the edge of a sturdy chair',
      '🦶 Place feet flat on floor, hip-width apart',
      '🧍 Sit tall with spine naturally straight',
      '👐 Rest hands gently on thighs or knees',
      '🔄 Rotate shoulders backward 5 times slowly',
      '↔️ Tilt head side to side, stretching neck',
      '🔄 Rotate torso left and right gently',
      '⬆️ Reach arms overhead, interlace fingers',
      '↔️ Lean side to side for gentle stretch',
      '🦵 Lift one knee at a time, hold briefly',
      '🌬️ Deep breathe throughout all movements',
      '😌 End with hands at heart, gratitude'
    ],
    keyBenefits: [
      '💺 Accessible for all fitness levels',
      '🏢 Perfect for office breaks',
      '😌 Releases tension in neck and shoulders',
      '🧠 Improves circulation and mental clarity',
      '🦴 Gentle on joints and muscles',
      '⏰ Quick stress relief anytime'
    ]
  },
  {
    id: 'child-pose-stretch',
    title: 'Restorative Child\'s Pose',
    description: 'A deeply relaxing pose that calms the nervous system and releases back tension',
    duration: '5-10 mins',
    difficulty: 'Beginner',
    icon: '🌸',
    color: 'pink',
    category: 'Restorative',
    videoUrl: 'https://www.youtube.com/embed/2MN7GCRKPqA',
    instructions: [
      '🧘‍♀️ Start on hands and knees (tabletop position)',
      '🦶 Bring big toes together, knees wide apart',
      '⬇️ Sit hips back toward heels slowly',
      '🙌 Extend arms forward on the mat',
      '👃 Rest forehead gently on the ground',
      '🫁 Breathe deeply into your back body',
      '😌 Allow shoulders to relax downward',
      '🌊 Feel the gentle stretch along spine',
      '⏱️ Hold for 5-10 minutes breathing deeply',
      '🤲 Option: place pillow under chest for support',
      '🔄 To exit, walk hands back slowly',
      '🧘 Sit back on heels, pause before rising'
    ],
    keyBenefits: [
      '🧘‍♀️ Deeply calms the nervous system',
      '🌊 Releases tension in back and hips',
      '😴 Prepares body and mind for sleep',
      '💆‍♀️ Relieves stress and fatigue',
      '🫁 Encourages deeper breathing',
      '🧠 Quiets mental chatter and anxiety'
    ]
  },
  {
    id: 'box-breathing',
    title: 'Box Breathing Exercise',
    description: 'A powerful breathing technique used by athletes and military for instant calm',
    duration: '5-7 mins',
    difficulty: 'Beginner',
    icon: '📦',
    color: 'purple',
    category: 'Breathwork',
    videoUrl: 'https://www.youtube.com/embed/tEmt1Znux58',
    instructions: [
      '🧘‍♀️ Sit comfortably with spine straight',
      '👁️ Close eyes or soften your gaze',
      '🫁 Breathe naturally to begin',
      '1️⃣ Inhale slowly through nose for 4 counts',
      '⏸️ Hold breath gently for 4 counts',
      '2️⃣ Exhale slowly through mouth for 4 counts',
      '⏸️ Hold empty lungs for 4 counts',
      '🔄 This completes one box cycle',
      '↩️ Repeat for 5-10 cycles minimum',
      '🌊 Keep breathing smooth and even',
      '🧘‍♀️ Return to natural breath gradually',
      '😌 Notice the calm mental clarity'
    ],
    keyBenefits: [
      '🎯 Improves focus and concentration instantly',
      '😌 Reduces anxiety and panic symptoms',
      '❤️ Lowers heart rate and blood pressure',
      '🧠 Activates parasympathetic nervous system',
      '💪 Builds mental resilience and control',
      '😴 Promotes better sleep quality'
    ]
  },
  {
    id: 'progressive-relaxation',
    title: 'Progressive Muscle Relaxation',
    description: 'Systematically tense and release muscle groups to release deep physical tension',
    duration: '12-18 mins',
    difficulty: 'Intermediate',
    icon: '💆‍♀️',
    color: 'green',
    category: 'Body Awareness',
    videoUrl: 'https://www.youtube.com/embed/ihO02wUzgkc',
    instructions: [
      '🛋️ Lie down or sit comfortably',
      '👁️ Close your eyes and breathe naturally',
      '🦶 Start with your feet - curl toes tight',
      '⏱️ Hold tension for 5 seconds',
      '😌 Release completely, notice the difference',
      '🦵 Move to calves, then thighs',
      '🍑 Tense and release buttocks and hips',
      '🤚 Continue through hands, arms, shoulders',
      '😬 Tense facial muscles, then release',
      '🧘‍♀️ Work systematically through whole body',
      '🌊 End with full-body relaxation scan',
      '🙏 Rest deeply for a few minutes'
    ],
    keyBenefits: [
      '💆‍♀️ Releases chronic muscle tension',
      '😴 Significantly improves sleep quality',
      '🧠 Increases body awareness',
      '😌 Reduces physical stress symptoms',
      '💪 Helps identify stress-holding patterns',
      '🌊 Promotes deep physical relaxation'
    ]
  }
]

// Background music tracks for exercises page
const exerciseTracks = [
  { src: '/audio/zen-garden.mp3', name: 'Zen Garden' },
  { src: '/audio/forest-stream.mp3', name: 'Forest Stream' }
]

export default function ExerciseSelectionPage() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleExerciseStart = async (exerciseId: string) => {
    const exercise = exerciseSessions.find(e => e.id === exerciseId)
    if (!exercise) {
      return
    }

    setIsTransitioning(true)
    
    // Smooth transition delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    setSelectedExercise(exercise)
    setIsTransitioning(false)
  }

  const handleBackToSelection = async () => {
    setIsTransitioning(true)
    
    // Smooth transition delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    setSelectedExercise(null)
    setIsTransitioning(false)
  }

  // Show detail page if exercise is selected
  if (selectedExercise) {
    return (
      <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <ExerciseDetailPage 
          exercise={selectedExercise}
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
      <BackgroundMusic tracks={exerciseTracks} autoPlay={false} defaultVolume={0.15} />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="text-center mb-16 animate-fade-in-up">
          <div className="inline-block p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xl">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Wellness Exercises
            </h1>
            <p className="text-xl text-gray-700 font-medium max-w-2xl mx-auto">
              Movement and breathwork for mental clarity, stress relief, and emotional balance 🌿
            </p>
          </div>
        </header>

        {/* Exercise Cards Grid */}
        <main 
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          role="main"
          aria-label="Available wellness exercises"
        >
          {exerciseSessions.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onStart={handleExerciseStart}
              delay={index * 200} // Staggered entrance animation
            />
          ))}
        </main>

        {/* Additional Information Section */}
        <aside className="mt-20 text-center">
          <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-8 border border-white/60 shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Move Your Body, Calm Your Mind
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Each exercise is scientifically proven to reduce stress, anxiety, and improve mental well-being. 
              Choose based on your energy level, available space, and what feels right for you today.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                Beginner Friendly
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                Intermediate Level
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-400 rounded-full"></span>
                Advanced Practice
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse mb-4 mx-auto"></div>
            <p className="text-lg font-medium text-gray-700">Loading your exercise...</p>
          </div>
        </div>
      )}
    </div>
  )
}
