import { EmotionDetectionService } from '../src/services/emotionDetection'
import type { ConversationContext } from '../src/services/emotionDetection'

// Test emotion detection improvements
console.log('🧪 Testing Enhanced Emotion Detection System\n')

// Test cases for different detection layers
const testCases = [
  // Layer 1: Context-based analysis
  {
    text: "I've been feeling much better since our last session. The techniques you taught me are really helping!",
    type: 'user' as const,
    context: {
      userMessages: ["I feel anxious", "Everything seems overwhelming", "I've been feeling much better since our last session"],
      aiResponses: ["I understand", "Let's work through this", "That's wonderful progress"],
      mentalHealthIndicators: ['anxiety', 'progress']
    },
    expected: 'happy',
    description: 'Progress pattern detection'
  },
  
  // Layer 2: Sentiment analysis
  {
    text: "I can't go on anymore. I feel completely hopeless and worthless.",
    type: 'user' as const,
    expected: 'sad',
    description: 'Deep negative sentiment'
  },
  
  {
    text: "I'm having a panic attack. My heart is racing and I can't breathe!",
    type: 'user' as const,
    expected: 'surprised', // Using surprised for anxiety/panic
    description: 'High anxiety/panic state'
  },
  
  // Layer 3: Keyword fallback
  {
    text: "I feel angry about what happened today",
    type: 'user' as const,
    expected: 'angry',
    description: 'Keyword-based anger detection'
  },
  
  {
    text: "That's a nice day for a walk",
    type: 'user' as const,
    expected: 'neutral',
    description: 'Neutral/default emotion'
  },
  
  // Mental health specific patterns
  {
    text: "I think I'm having a breakthrough. I finally understand why I react this way!",
    type: 'user' as const,
    expected: 'surprised',
    description: 'Breakthrough moment detection'
  },
  
  {
    text: "Thank you so much for helping me. I feel grateful for your support.",
    type: 'ai' as const,
    expected: 'happy',
    description: 'Positive AI response'
  }
]

// Run tests
testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.description}`)
  console.log(`Input: "${testCase.text.substring(0, 60)}${testCase.text.length > 60 ? '...' : ''}"`)
  
  const result = EmotionDetectionService.analyzeEmotion(
    testCase.text, 
    testCase.type, 
    testCase.context
  )
  
  const isCorrect = result.emotion === testCase.expected
  console.log(`Expected: ${testCase.expected}`)
  console.log(`Got: ${result.emotion} (${Math.round(result.confidence * 100)}% confidence via ${result.method})`)
  console.log(`Status: ${isCorrect ? '✅ PASS' : '❌ FAIL'}`)
  
  if (result.details) {
    console.log(`Details: ${result.details}`)
  }
  
  console.log('---')
})

// Test conversation context building
console.log('\n🔄 Testing Conversation Context Analysis\n')

const contextualTest = {
  messages: [
    "I've been feeling really depressed lately",
    "Nothing seems to help",
    "But today I tried that breathing exercise you mentioned",
    "And surprisingly, it actually helped me feel calmer"
  ],
  aiResponses: [
    "I understand how difficult that must be",
    "Let's explore some coping strategies", 
    "That's a great step forward",
    "I'm so glad to hear that worked for you"
  ]
}

const context: ConversationContext = {
  userMessages: contextualTest.messages.slice(0, -1),
  aiResponses: contextualTest.aiResponses.slice(0, -1),
  mentalHealthIndicators: ['depression', 'anxiety', 'progress']
}

const finalMessage = contextualTest.messages[contextualTest.messages.length - 1]
const contextResult = EmotionDetectionService.analyzeEmotion(finalMessage, 'user', context)

console.log('Conversation progression test:')
console.log(`Messages: ${contextualTest.messages.join(' → ')}`)
console.log(`Final analysis: ${contextResult.emotion} (${Math.round(contextResult.confidence * 100)}% via ${contextResult.method})`)
console.log(`Details: ${contextResult.details}`)

console.log('\n✨ Enhanced emotion detection system ready!')
console.log('Features:')
console.log('- Context-aware analysis with conversation history')
console.log('- Mental health specific sentiment patterns') 
console.log('- Keyword-based fallback detection')
console.log('- Progressive confidence scoring')
console.log('- Backend integration for enhanced accuracy')