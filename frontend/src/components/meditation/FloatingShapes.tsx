/**
 * FloatingShapes Component
 * 
 * Purpose: Creates animated floating background shapes for atmospheric effect
 * Features:
 * - Randomly positioned and sized shapes
 * - Continuous floating animation with different speeds
 * - Pastel gradient colors
 * - Respects reduced motion preferences
 * 
 * Props:
 * - count: number of shapes to generate (default: 15)
 * - colors: array of gradient color combinations
 * 
 * Animation Notes:
 * - Uses CSS animations for smooth floating motion
 * - Each shape has random delay and duration for organic feel
 * - Shapes fade in/out and move in gentle circular patterns
 */

import { useEffect, useState } from 'react'

interface FloatingShapesProps {
  count?: number
  colors?: string[]
}

interface Shape {
  id: number
  size: number
  x: number
  y: number
  delay: number
  duration: number
  color: string
}

export default function FloatingShapes({ count = 15, colors }: FloatingShapesProps) {
  const [shapes, setShapes] = useState<Shape[]>([])

  const defaultColors = [
    'from-pink-200/30 to-rose-300/30',
    'from-blue-200/30 to-cyan-300/30',
    'from-purple-200/30 to-violet-300/30',
    'from-green-200/30 to-emerald-300/30',
    'from-yellow-200/30 to-orange-300/30',
    'from-indigo-200/30 to-purple-300/30'
  ]

  useEffect(() => {
    const generatedShapes: Shape[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 120 + 40, // 40-160px
      x: Math.random() * 100, // 0-100%
      y: Math.random() * 100, // 0-100%
      delay: Math.random() * 10, // 0-10s delay
      duration: Math.random() * 15 + 10, // 10-25s duration
      color: (colors || defaultColors)[Math.floor(Math.random() * (colors || defaultColors).length)]
    }))
    
    setShapes(generatedShapes)
  }, [count, colors])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className={`absolute rounded-full bg-gradient-to-br ${shape.color} blur-sm animate-float-gentle motion-reduce:animate-none`}
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            animationDelay: `${shape.delay}s`,
            animationDuration: `${shape.duration}s`
          }}
        />
      ))}
      
      {/* Additional gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-purple-50/20 to-pink-50/20" />
    </div>
  )
}