/**
 * ExerciseDetailPage Component
 * 
 * Purpose: Detailed exercise view with instructions and video
 * Features:
 * - Two-panel layout: Video on left, Instructions on right
 * - Embedded YouTube video player
 * - Step-by-step instructions with emoji bullets
 * - Key benefits section
 * - Back navigation to selection page
 * - Fully responsive design
 */

import { useState } from 'react'
import { ArrowLeft, PlayCircle, Clock, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface ExerciseDetailPageProps {
  exercise: Exercise
  onBack: () => void
}

export default function ExerciseDetailPage({ exercise, onBack }: ExerciseDetailPageProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  const getColorTheme = (color: string) => {
    const themes = {
      blue: 'from-blue-400 to-cyan-500',
      purple: 'from-purple-400 to-violet-500',
      green: 'from-green-400 to-emerald-500',
      orange: 'from-orange-400 to-red-500',
      pink: 'from-pink-400 to-rose-500',
      indigo: 'from-indigo-400 to-blue-500'
    }
    return themes[color as keyof typeof themes] || themes.blue
  }

  const gradientClass = getColorTheme(exercise.color)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 backdrop-blur-lg border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          aria-label="Back to exercise selection"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold text-gray-700">Back to Exercises</span>
        </button>

        {/* Header Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/60 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Icon */}
            <div className="text-7xl animate-pulse-gentle">
              {exercise.icon}
            </div>

            {/* Title and Meta */}
            <div className="flex-1">
              <h1 className={cn(
                "text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r bg-clip-text text-transparent",
                gradientClass
              )}>
                {exercise.title}
              </h1>
              <p className="text-lg text-gray-600 mb-4">{exercise.description}</p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  {exercise.duration}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                  <Tag className="w-4 h-4" />
                  {exercise.difficulty}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                  <PlayCircle className="w-4 h-4" />
                  {exercise.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Panel Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Video */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <PlayCircle className="w-6 h-6 text-purple-600" />
                Video Guide
              </h2>
              
              {/* YouTube Video Embed */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
                {!isVideoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Loading video...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src={exercise.videoUrl}
                  title={`${exercise.title} video tutorial`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setIsVideoLoaded(true)}
                  className="absolute inset-0 w-full h-full"
                />
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Watch the video first to understand the proper form, then follow the written instructions below.
                </p>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                ✨ Key Benefits
              </h2>
              <div className="space-y-3">
                {exercise.keyBenefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 border border-green-100/50"
                  >
                    <span className="text-2xl flex-shrink-0">{benefit.split(' ')[0]}</span>
                    <p className="text-gray-700 font-medium pt-1">{benefit.substring(benefit.indexOf(' ') + 1)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Instructions */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              📋 Step-by-Step Instructions
            </h2>
            
            <div className="space-y-4">
              {exercise.instructions.map((instruction, index) => (
                <div 
                  key={index}
                  className="flex gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 border border-purple-100/30 hover:shadow-md transition-all duration-300"
                >
                  {/* Step Number */}
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-lg bg-gradient-to-r",
                    gradientClass
                  )}>
                    {index + 1}
                  </div>
                  
                  {/* Instruction Text */}
                  <p className="flex-1 text-gray-700 leading-relaxed pt-2 text-base">
                    {instruction}
                  </p>
                </div>
              ))}
            </div>

            {/* Safety Note */}
            <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>⚠️ Safety First:</strong> Listen to your body. If you feel any pain or discomfort, stop immediately. Consult with a healthcare professional before starting any new exercise routine.
              </p>
            </div>

            {/* Repeat Button */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={cn(
                "w-full mt-6 py-4 rounded-2xl font-bold text-white text-lg",
                "bg-gradient-to-r transition-all duration-300 transform",
                "hover:scale-105 hover:shadow-2xl active:scale-95",
                "flex items-center justify-center gap-3",
                gradientClass
              )}
            >
              <PlayCircle className="w-5 h-5" />
              Watch Video Again
            </button>
          </div>
        </div>

        {/* Bottom Tips Section */}
        <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            🌟 Pro Tips for Best Results
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🕐</div>
              <h3 className="font-semibold text-gray-800 mb-2">Consistency</h3>
              <p className="text-sm text-gray-600">Practice regularly for best mental health benefits</p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🌬️</div>
              <h3 className="font-semibold text-gray-800 mb-2">Breathe</h3>
              <p className="text-sm text-gray-600">Focus on deep, natural breathing throughout</p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">😌</div>
              <h3 className="font-semibold text-gray-800 mb-2">Be Patient</h3>
              <p className="text-sm text-gray-600">Progress takes time, be kind to yourself</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
