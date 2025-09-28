import type { EmotionType } from '../vrm/config'

// Comprehensive emotion detection service with multiple layers
export interface EmotionAnalysisResult {
  emotion: EmotionType
  confidence: number
  method: 'context' | 'sentiment' | 'keyword' | 'backend' | 'hybrid' | 'default'
  details?: string
}

export interface ConversationContext {
  userMessages: string[]
  aiResponses: string[]
  currentTopic?: string
  mentalHealthIndicators?: string[]
}

/**
 * Enhanced emotion detection service with fallback layers
 * Priority: Context Analysis > Sentiment Analysis > Keyword Detection > Default
 */
export class EmotionDetectionService {
  
  /**
   * Main emotion detection function with layered approach
   */
  public static analyzeEmotion(
    text: string, 
    messageType: 'user' | 'ai',
    context?: ConversationContext
  ): EmotionAnalysisResult {
    
    // Layer 1: Context-based analysis (if context available)
    if (context) {
      const contextResult = this.analyzeByContext(text, messageType, context)
      if (contextResult.confidence > 0.7) {
        return contextResult
      }
    }
    
    // Layer 2: Sentiment analysis with mental health focus
    const sentimentResult = this.analyzeBySentiment(text, messageType)
    if (sentimentResult.confidence > 0.6) {
      return sentimentResult
    }
    
    // Layer 3: Keyword-based detection (fallback)
    const keywordResult = this.analyzeByKeywords(text, messageType)
    if (keywordResult.confidence > 0.5) {
      return keywordResult
    }
    
    // Layer 4: Default emotion based on message type
    return this.getDefaultEmotion(messageType)
  }

  /**
   * Context-aware emotion analysis
   */
  private static analyzeByContext(
    text: string, 
    messageType: 'user' | 'ai',
    context: ConversationContext
  ): EmotionAnalysisResult {
    const lowerText = text.toLowerCase()
    
    // Analyze conversation flow patterns
    if (context.userMessages.length > 0) {
      const recentMessages = context.userMessages.slice(-3).join(' ').toLowerCase()
      
      // Progressive conversation patterns
      if (this.detectProgressPattern(recentMessages, lowerText)) {
        return {
          emotion: 'happy',
          confidence: 0.8,
          method: 'context',
          details: 'Detected positive progress in conversation'
        }
      }
      
      // Crisis escalation patterns
      if (this.detectCrisisPattern(recentMessages, lowerText)) {
        return {
          emotion: 'sad',
          confidence: 0.9,
          method: 'context',
          details: 'Detected crisis escalation pattern'
        }
      }
      
      // Breakthrough moments
      if (this.detectBreakthroughPattern(recentMessages, lowerText)) {
        return {
          emotion: 'surprised',
          confidence: 0.8,
          method: 'context',
          details: 'Detected emotional breakthrough'
        }
      }
    }
    
    // Mental health topic analysis
    if (context.mentalHealthIndicators) {
      const topicEmotion = this.analyzeByMentalHealthTopic(lowerText, context.mentalHealthIndicators)
      if (topicEmotion) {
        return {
          ...topicEmotion,
          method: 'context'
        }
      }
    }
    
    return { emotion: 'neutral', confidence: 0.0, method: 'context' }
  }

  /**
   * Sentiment-based emotion analysis with mental health focus
   */
  private static analyzeBySentiment(text: string, messageType: 'user' | 'ai'): EmotionAnalysisResult {
    const lowerText = text.toLowerCase()
    
    // Mental health specific sentiment patterns
    const sentimentPatterns = {
      // High confidence patterns
      deeply_positive: {
        patterns: [
          /feel(?:ing)?\s+(?:much|so|really)\s+(?:better|good|great|amazing|wonderful)/,
          /(?:breakthrough|progress|improvement|healing|recovery)/,
          /(?:grateful|thankful|blessed|hopeful|optimistic)/
        ],
        emotion: 'happy' as EmotionType,
        confidence: 0.9
      },
      
      deeply_negative: {
        patterns: [
          /(?:can't|cannot)\s+(?:go on|take it|handle|cope)/,
          /feel(?:ing)?\s+(?:hopeless|worthless|empty|numb)/,
          /(?:giving up|end it all|no point|what's the point)/
        ],
        emotion: 'sad' as EmotionType,
        confidence: 0.9
      },
      
      high_anxiety: {
        patterns: [
          /(?:panic|anxiety|overwhelm)(?:ing|ed)?\s+(?:attack|feeling|sensation)/,
          /(?:heart racing|can't breathe|dizzy|shaking)/,
          /(?:terrified|petrified|scared to death)/
        ],
        emotion: 'surprised' as EmotionType, // Using surprised for anxiety/panic
        confidence: 0.8
      },
      
      anger_frustration: {
        patterns: [
          /(?:so|really|extremely)\s+(?:angry|mad|furious|frustrated)/,
          /(?:fed up|sick of|hate|can't stand)/,
          /(?:unfair|injustice|outrageous|ridiculous)/
        ],
        emotion: 'angry' as EmotionType,
        confidence: 0.8
      },
      
      // Medium confidence patterns
      positive_progress: {
        patterns: [
          /feel(?:ing)?\s+(?:better|good|okay|fine|alright)/,
          /(?:helping|working|progress|improvement)/,
          /(?:thank you|appreciate|glad|happy)/
        ],
        emotion: 'happy' as EmotionType,
        confidence: 0.7
      },
      
      mild_distress: {
        patterns: [
          /feel(?:ing)?\s+(?:sad|down|low|blue|upset)/,
          /(?:difficult|hard|tough|struggling|challenging)/,
          /(?:worried|concerned|anxious|stressed)/
        ],
        emotion: 'sad' as EmotionType,
        confidence: 0.7
      }
    }
    
    // Check each pattern category
    for (const [category, config] of Object.entries(sentimentPatterns)) {
      for (const pattern of config.patterns) {
        if (pattern.test(lowerText)) {
          return {
            emotion: config.emotion,
            confidence: config.confidence,
            method: 'sentiment',
            details: `Matched ${category} pattern`
          }
        }
      }
    }
    
    return { emotion: 'neutral', confidence: 0.0, method: 'sentiment' }
  }

  /**
   * Keyword-based emotion detection (fallback method)
   */
  private static analyzeByKeywords(text: string, messageType: 'user' | 'ai'): EmotionAnalysisResult {
    const keywordMap: { [key: string]: { keywords: string[], confidence: number } } = {
      'happy': { 
        keywords: ['good', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic', 'joy', 'excited', 'pleased', 'delighted'],
        confidence: 0.6
      },
      'sad': { 
        keywords: ['sad', 'depressed', 'down', 'upset', 'crying', 'tears', 'lonely', 'empty', 'hopeless', 'despair'],
        confidence: 0.6
      },
      'angry': { 
        keywords: ['angry', 'mad', 'frustrated', 'annoyed', 'furious', 'rage', 'irritated', 'outraged'],
        confidence: 0.6
      },
      'surprised': { 
        keywords: ['wow', 'amazing', 'incredible', 'unbelievable', 'shocking', 'surprised', 'astonished'],
        confidence: 0.6
      },
      'relaxed': { 
        keywords: ['calm', 'peaceful', 'relaxed', 'meditation', 'breathe', 'serene', 'tranquil', 'zen'],
        confidence: 0.6
      }
    }

    const lowerText = text.toLowerCase()
    
    // Find matching emotions with scores
    const matches: Array<{emotion: EmotionType, score: number, keywords: string[]}> = []
    
    for (const [emotion, config] of Object.entries(keywordMap)) {
      const matchedKeywords = config.keywords.filter(keyword => lowerText.includes(keyword))
      if (matchedKeywords.length > 0) {
        // Score based on number of matches and keyword strength
        const score = matchedKeywords.length * config.confidence
        matches.push({
          emotion: emotion as EmotionType,
          score,
          keywords: matchedKeywords
        })
      }
    }
    
    if (matches.length > 0) {
      // Return highest scoring emotion
      const bestMatch = matches.sort((a, b) => b.score - a.score)[0]
      return {
        emotion: bestMatch.emotion,
        confidence: Math.min(bestMatch.score, 0.8), // Cap at 0.8 for keyword method
        method: 'keyword',
        details: `Matched keywords: ${bestMatch.keywords.join(', ')}`
      }
    }
    
    return { emotion: 'neutral', confidence: 0.0, method: 'keyword' }
  }

  /**
   * Default emotion based on message type
   */
  private static getDefaultEmotion(messageType: 'user' | 'ai'): EmotionAnalysisResult {
    return {
      emotion: messageType === 'user' ? 'neutral' : 'happy',
      confidence: 0.3,
      method: 'default',
      details: `Default emotion for ${messageType} message`
    }
  }

  // Helper methods for context analysis
  private static detectProgressPattern(recentMessages: string, currentText: string): boolean {
    const progressIndicators = [
      'feeling better', 'getting better', 'improvement', 'progress',
      'helping', 'working', 'breakthrough', 'understanding'
    ]
    
    return progressIndicators.some(indicator => 
      currentText.includes(indicator) || recentMessages.includes(indicator)
    )
  }

  private static detectCrisisPattern(recentMessages: string, currentText: string): boolean {
    const crisisIndicators = [
      'worse', 'getting worse', 'can\'t take it', 'giving up',
      'hopeless', 'end it all', 'no point', 'can\'t go on'
    ]
    
    return crisisIndicators.some(indicator => 
      currentText.includes(indicator) || recentMessages.includes(indicator)
    )
  }

  private static detectBreakthroughPattern(recentMessages: string, currentText: string): boolean {
    const breakthroughIndicators = [
      'never thought', 'didn\'t realize', 'now i understand',
      'makes sense now', 'eye opening', 'revelation', 'aha moment'
    ]
    
    return breakthroughIndicators.some(indicator => 
      currentText.includes(indicator) || recentMessages.includes(indicator)
    )
  }

  private static analyzeByMentalHealthTopic(
    text: string, 
    topics: string[]
  ): Partial<EmotionAnalysisResult> | null {
    const topicEmotionMap: { [key: string]: EmotionType } = {
      'anxiety': 'surprised',
      'depression': 'sad',
      'anger': 'angry',
      'trauma': 'sad',
      'stress': 'surprised',
      'grief': 'sad',
      'joy': 'happy',
      'mindfulness': 'relaxed'
    }
    
    for (const topic of topics) {
      if (text.includes(topic.toLowerCase()) && topicEmotionMap[topic.toLowerCase()]) {
        return {
          emotion: topicEmotionMap[topic.toLowerCase()],
          confidence: 0.75,
          details: `Mental health topic: ${topic}`
        }
      }
    }
    
    return null
  }
}

/**
 * Utility function for quick emotion detection (maintains backward compatibility)
 */
export const detectEmotionFromText = (
  text: string, 
  messageType: 'user' | 'ai' = 'user'
): EmotionType => {
  const result = EmotionDetectionService.analyzeEmotion(text, messageType)
  return result.emotion
}

/**
 * Advanced emotion detection with context and backend integration
 */
export const detectEmotionWithContext = (
  text: string,
  messageType: 'user' | 'ai',
  context?: ConversationContext
): EmotionAnalysisResult => {
  return EmotionDetectionService.analyzeEmotion(text, messageType, context)
}

/**
 * Call backend emotion analysis service for enhanced detection
 */
export const getBackendEmotionAnalysis = async (
  text: string,
  messageType: 'user' | 'ai',
  userId: string = 'web-user'
): Promise<EmotionAnalysisResult> => {
  try {
    const response = await fetch('http://localhost:5010/analyze_emotion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: text,
        messageType,
        userId
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      emotion: data.emotion || 'neutral',
      confidence: data.confidence || 0.5,
      method: 'backend',
      details: data.details || 'Backend emotion analysis'
    }
  } catch (error) {
    console.error('Backend emotion analysis failed:', error)
    // Fallback to frontend analysis
    return EmotionDetectionService.analyzeEmotion(text, messageType)
  }
}

/**
 * Hybrid emotion detection: Backend first, frontend fallback
 */
export const detectEmotionHybrid = async (
  text: string,
  messageType: 'user' | 'ai',
  userId: string = 'web-user',
  context?: ConversationContext
): Promise<EmotionAnalysisResult> => {
  console.log(`🔬 detectEmotionHybrid started:`, {
    text: text.substring(0, 50),
    messageType,
    userId
  });

  try {
    // Try backend analysis first
    console.log('🔬 Attempting backend analysis...');
    const backendResult = await getBackendEmotionAnalysis(text, messageType, userId);
    
    console.log('🔬 Backend result:', backendResult);
    
    // If backend confidence is high enough, use it
    if (backendResult.confidence > 0.6) {
      console.log(`🔬 ✅ Using backend result (confidence ${backendResult.confidence} > 0.6):`, backendResult.emotion);
      return backendResult;
    }
    
    console.log(`🔬 Backend confidence too low (${backendResult.confidence}), trying frontend...`);
    
    // Otherwise, use frontend analysis with context
    const frontendResult = EmotionDetectionService.analyzeEmotion(text, messageType, context);
    
    console.log('🔬 Frontend result:', frontendResult);
    
    // Return the result with higher confidence
    const winner = frontendResult.confidence > backendResult.confidence 
      ? frontendResult 
      : backendResult;
      
    console.log(`🔬 ✅ Hybrid winner:`, {
      chosen: winner.emotion,
      method: winner.method,
      confidence: winner.confidence,
      reason: frontendResult.confidence > backendResult.confidence ? 'frontend_higher' : 'backend_higher'
    });
      
    return winner;
      
  } catch (error) {
    console.error('🔬 ❌ Hybrid emotion detection failed:', error);
    // Final fallback to frontend-only analysis
    const fallbackResult = EmotionDetectionService.analyzeEmotion(text, messageType, context);
    console.log('🔬 🔄 Using fallback frontend result:', fallbackResult);
    return fallbackResult;
  }
}