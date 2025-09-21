import type { EmotionType } from '../vrm/config';
// import { EmotionControls } from '../components/VrmControls'; // Unused - kept for reference

export interface EmotionAnalysisResult {
  primaryEmotion: EmotionType;
  confidence: number;
  secondary?: EmotionType;
  intensity: 'low' | 'medium' | 'high';
  context: string;
  shouldTransition: boolean;
  reason: string;
}

export interface ConversationTone {
  overallMood: EmotionType;
  recentEmotions: EmotionType[];
  emotionHistory: Array<{
    emotion: EmotionType;
    timestamp: number;
    message: string;
  }>;
  stabilityScore: number; // 0-1, higher means more consistent emotions
}

export class EmotionAnalysisService {
  private conversationHistory: ConversationTone = {
    overallMood: 'neutral',
    recentEmotions: [],
    emotionHistory: [],
    stabilityScore: 1.0
  };

  // Transition throttling to prevent rapid emotion changes
  private lastTransitionTime: number = 0;
  private currentEmotion: EmotionType = 'neutral';
  private minimumTransitionDelay: number = 1000; // 1 second minimum between transitions (reduced for testing)
  private strongEmotionDuration: number = 2000; // Strong emotions stay longer (reduced for testing)

  private lastEmotionChange = 0;
  private readonly EMOTION_CHANGE_COOLDOWN = 3000; // 3 seconds between emotion changes
  private readonly EMOTION_HISTORY_LIMIT = 10;

  // Emotion keyword patterns with intensity scoring
  private readonly emotionPatterns = {
    happy: {
      positive: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'perfect', 'love', 'blessed'],
      intensity: ['ecstatic', 'thrilled', 'overjoyed', 'elated', 'euphoric'],
      contextual: ['grateful', 'relieved', 'accomplished', 'proud', 'satisfied', 'content']
    },
    sad: {
      positive: ['sad', 'depressed', 'down', 'low', 'blue', 'melancholy', 'miserable', 'heartbroken'],
      intensity: ['devastated', 'crushed', 'shattered', 'destroyed', 'hopeless'],
      contextual: ['disappointed', 'discouraged', 'defeated', 'lonely', 'empty', 'lost']
    },
    angry: {
      positive: ['angry', 'mad', 'furious', 'rage', 'pissed', 'irritated', 'annoyed'],
      intensity: ['livid', 'enraged', 'infuriated', 'outraged'],
      contextual: ['frustrated', 'fed up', 'disgusted', 'hate', 'can\'t stand']
    },
    surprised: {
      positive: ['surprised', 'shocked', 'amazed', 'wow', 'incredible', 'unbelievable'],
      intensity: ['stunned', 'bewildered', 'confused', 'perplexed'],
      contextual: ['unexpected', 'sudden', 'caught off guard']
    }
  } as const;

  // Context-specific emotion mapping for mental health scenarios
  private readonly contextualEmotions = {
    academic: {
      stress: 'sad',
      pressure: 'sad', 
      exam: 'sad',
      study: 'neutral',
      achievement: 'happy',
      success: 'happy'
    },
    family: {
      conflict: 'angry',
      argument: 'angry',
      support: 'happy',
      understanding: 'happy',
      misunderstanding: 'sad'
    },
    therapy: {
      breakthrough: 'happy',
      progress: 'happy',
      setback: 'sad',
      struggle: 'sad',
      healing: 'neutral'
    }
  };

  // AI service emotion mapping (from emotional_context)
  private readonly aiEmotionMapping = {
    'sadness': 'sad',
    'anxiety': 'sad',
    'anger': 'angry',
    'joy': 'happy',
    'gratitude': 'happy',
    'confusion': 'surprised',
    'hope': 'happy',
    'loneliness': 'sad'
  } as const;

  /**
   * Analyze a message and determine the appropriate avatar emotion
   */
  analyzeMessage(
    message: string, 
    messageType: 'user' | 'ai', 
    context?: string,
    aiEmotions?: string[]
  ): EmotionAnalysisResult {
    const text = message.toLowerCase();
    
    // If AI provided emotion analysis, prioritize that
    if (aiEmotions && aiEmotions.length > 0) {
      const mappedEmotion = this.mapAiEmotionToAvatar(aiEmotions[0]);
      if (mappedEmotion !== 'neutral') {
        return this.createAnalysisResult(
          mappedEmotion,
          0.9,
          'high',
          'Based on AI emotion analysis',
          true
        );
      }
    }

    // Analyze based on message content
    const emotionScores = this.scoreEmotions(text, context);
    const primaryEmotion = this.getPrimaryEmotion(emotionScores);
    const confidence = emotionScores[primaryEmotion] || 0;

    // Determine intensity based on keywords and punctuation
    const intensity = this.determineIntensity(text, primaryEmotion);

    // Check if emotion change is appropriate
    const shouldTransition = this.shouldChangeEmotion(primaryEmotion, messageType);

    // Generate explanation
    const reason = this.generateReason(primaryEmotion, messageType, confidence, context);

    return this.createAnalysisResult(
      primaryEmotion,
      confidence,
      intensity,
      reason,
      shouldTransition
    );
  }

  /**
   * Update conversation history and analyze overall tone
   */
  updateConversationTone(emotion: EmotionType, message: string): ConversationTone {
    // Add to history
    this.conversationHistory.emotionHistory.push({
      emotion,
      timestamp: Date.now(),
      message: message.substring(0, 100) // Store first 100 chars
    });

    // Limit history size
    if (this.conversationHistory.emotionHistory.length > this.EMOTION_HISTORY_LIMIT) {
      this.conversationHistory.emotionHistory = this.conversationHistory.emotionHistory.slice(-this.EMOTION_HISTORY_LIMIT);
    }

    // Update recent emotions (last 5)
    this.conversationHistory.recentEmotions = this.conversationHistory.emotionHistory
      .slice(-5)
      .map(h => h.emotion);

    // Calculate overall mood
    this.conversationHistory.overallMood = this.calculateOverallMood();

    // Calculate stability score
    this.conversationHistory.stabilityScore = this.calculateStabilityScore();

    return { ...this.conversationHistory };
  }

  /**
   * Get current conversation analysis
   */
  getCurrentTone(): ConversationTone {
    return { ...this.conversationHistory };
  }

  /**
   * Reset conversation history (for new chat sessions)
   */
  resetConversation(): void {
    this.conversationHistory = {
      overallMood: 'neutral',
      recentEmotions: [],
      emotionHistory: [],
      stabilityScore: 1.0
    };
    this.lastEmotionChange = 0;
  }

  private scoreEmotions(text: string, context?: string): Record<EmotionType, number> {
    const scores: Record<EmotionType, number> = {
      neutral: 0.3, // Base neutral score
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0
    };

    // Simple keyword-based scoring
    const keywordMappings = {
      happy: [
        ...this.emotionPatterns.happy.positive,
        ...this.emotionPatterns.happy.intensity,
        ...this.emotionPatterns.happy.contextual
      ],
      sad: [
        ...this.emotionPatterns.sad.positive,
        ...this.emotionPatterns.sad.intensity,
        ...this.emotionPatterns.sad.contextual
      ],
      angry: [
        ...this.emotionPatterns.angry.positive,
        ...this.emotionPatterns.angry.intensity,
        ...this.emotionPatterns.angry.contextual
      ],
      surprised: [
        ...this.emotionPatterns.surprised.positive,
        ...this.emotionPatterns.surprised.intensity,
        ...this.emotionPatterns.surprised.contextual
      ]
    };

    // Score each emotion based on keyword matches
    Object.entries(keywordMappings).forEach(([emotion, keywords]) => {
      let score = 0;
      keywords.forEach((keyword: string) => {
        if (text.includes(keyword)) {
          // Simple scoring without intensity checking for now
          score += 0.4;
        }
      });
      scores[emotion as EmotionType] = Math.min(score, 1.0);
    });

    // Context-specific adjustments
    if (context && this.contextualEmotions[context as keyof typeof this.contextualEmotions]) {
      const contextEmotions = this.contextualEmotions[context as keyof typeof this.contextualEmotions];
      Object.entries(contextEmotions).forEach(([keyword, emotion]) => {
        if (text.includes(keyword)) {
          scores[emotion as EmotionType] += 0.3;
        }
      });
    }

    // Normalize scores
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
      Object.keys(scores).forEach(emotion => {
        scores[emotion as EmotionType] /= maxScore;
      });
    }

    return scores;
  }

  private getPrimaryEmotion(scores: Record<EmotionType, number>): EmotionType {
    let maxEmotion: EmotionType = 'neutral';
    let maxScore = scores.neutral;

    Object.entries(scores).forEach(([emotion, score]) => {
      if (score > maxScore) {
        maxScore = score;
        maxEmotion = emotion as EmotionType;
      }
    });

    // Require minimum confidence to override neutral
    if (maxEmotion !== 'neutral' && maxScore < 0.4) {
      return 'neutral';
    }

    return maxEmotion;
  }

  private determineIntensity(text: string, emotion: EmotionType): 'low' | 'medium' | 'high' {
    // Check for intensity indicators
    const intensityIndicators = {
      high: ['!!!', '!!!', 'really', 'very', 'extremely', 'so much', 'completely', 'totally'],
      medium: ['quite', 'pretty', 'fairly', '!', '!!'],
      low: ['.', 'a bit', 'somewhat', 'little']
    };

    for (const [level, indicators] of Object.entries(intensityIndicators)) {
      if (indicators.some(indicator => text.includes(indicator))) {
        return level as 'low' | 'medium' | 'high';
      }
    }

    // Check for emotion-specific intensity patterns
    if (emotion !== 'neutral') {
      const patterns = this.emotionPatterns[emotion as keyof typeof this.emotionPatterns];
      if (patterns && patterns.intensity) {
        const hasIntenseKeywords = patterns.intensity.some(keyword => text.includes(keyword));
        if (hasIntenseKeywords) {
          return 'high';
        }
      }
    }

    return 'medium';
  }

  private shouldChangeEmotion(newEmotion: EmotionType, messageType: 'user' | 'ai'): boolean {
    const now = Date.now();

    // Always allow emotion changes for user messages (they drive the conversation)
    if (messageType === 'user') {
      return true;
    }

    // For AI messages, consider cooldown and context
    if (now - this.lastEmotionChange < this.EMOTION_CHANGE_COOLDOWN) {
      return false;
    }

    // Don't change to same emotion
    const currentEmotion = this.conversationHistory.recentEmotions.slice(-1)[0] || 'neutral';
    if (currentEmotion === newEmotion) {
      return false;
    }

    // Allow change if it's contextually appropriate
    return true;
  }

  private mapAiEmotionToAvatar(aiEmotion: string): EmotionType {
    return this.aiEmotionMapping[aiEmotion as keyof typeof this.aiEmotionMapping] || 'neutral';
  }

  private calculateOverallMood(): EmotionType {
    if (this.conversationHistory.recentEmotions.length === 0) {
      return 'neutral';
    }

    // Count emotion frequency in recent messages
    const emotionCounts: Record<EmotionType, number> = {
      neutral: 0,
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0
    };

    this.conversationHistory.recentEmotions.forEach(emotion => {
      emotionCounts[emotion]++;
    });

    // Find most frequent emotion
    let maxEmotion: EmotionType = 'neutral';
    let maxCount = 0;

    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxEmotion = emotion as EmotionType;
      }
    });

    return maxEmotion;
  }

  private calculateStabilityScore(): number {
    if (this.conversationHistory.recentEmotions.length < 2) {
      return 1.0;
    }

    const transitions = this.conversationHistory.recentEmotions.length - 1;
    let changes = 0;

    for (let i = 1; i < this.conversationHistory.recentEmotions.length; i++) {
      if (this.conversationHistory.recentEmotions[i] !== this.conversationHistory.recentEmotions[i - 1]) {
        changes++;
      }
    }

    return Math.max(0, 1 - (changes / transitions));
  }

  private generateReason(
    emotion: EmotionType, 
    messageType: 'user' | 'ai', 
    confidence: number, 
    context?: string
  ): string {
    const reasons = {
      happy: `Detected positive sentiment (${Math.round(confidence * 100)}% confidence)`,
      sad: `Detected sadness or distress in message (${Math.round(confidence * 100)}% confidence)`,
      angry: `Detected anger or frustration (${Math.round(confidence * 100)}% confidence)`,
      surprised: `Detected surprise or confusion (${Math.round(confidence * 100)}% confidence)`,
      neutral: `No strong emotion detected, maintaining neutral expression`
    };

    let reason = reasons[emotion];
    
    if (context) {
      reason += ` (${context} context)`;
    }

    if (messageType === 'ai') {
      reason += ' - AI responding with empathy';
    }

    return reason;
  }

  private createAnalysisResult(
    primaryEmotion: EmotionType,
    confidence: number,
    intensity: 'low' | 'medium' | 'high',
    reason: string,
    shouldTransition: boolean,
    secondary?: EmotionType
  ): EmotionAnalysisResult {
    if (shouldTransition) {
      this.lastEmotionChange = Date.now();
    }

    return {
      primaryEmotion,
      confidence,
      secondary,
      intensity,
      context: reason,
      shouldTransition,
      reason
    };
  }

  /**
   * Checks if an emotion transition should be allowed based on timing constraints
   * Prevents too-frequent emotion changes that would be jarring
   */
  private shouldAllowTransition(newEmotion: EmotionType, emotionStrength: number): boolean {
    const now = Date.now();
    const timeSinceLastTransition = now - this.lastTransitionTime;
    
    console.log('🎭 Throttling check:', {
      currentEmotion: this.currentEmotion,
      newEmotion,
      timeSinceLastTransition,
      emotionStrength,
      lastTransitionTime: this.lastTransitionTime
    });
    
    // Always allow neutral -> emotion transitions
    if (this.currentEmotion === 'neutral' && newEmotion !== 'neutral') {
      console.log('🎭 Allowing neutral → emotion transition');
      return true;
    }
    
    // Allow same emotion (no transition needed, but should pass through)
    if (this.currentEmotion === newEmotion) {
      console.log('🎭 Same emotion, allowing');
      return true;
    }
    
    // For strong emotions, require longer delay
    const requiredDelay = emotionStrength > 0.7 ? this.strongEmotionDuration : this.minimumTransitionDelay;
    
    // Allow if enough time has passed or if new emotion is significantly stronger
    const shouldTransition = timeSinceLastTransition >= requiredDelay || emotionStrength > 0.8;
    
    console.log('🎭 Transition decision:', {
      shouldTransition,
      requiredDelay,
      timeSinceLastTransition,
      reason: shouldTransition ? 
        (timeSinceLastTransition >= requiredDelay ? 'Time passed' : 'Strong emotion') : 
        'Throttled'
    });
    
    return shouldTransition;
  }

  /**
   * Updates the current emotion state with transition control
   */
  private updateEmotionState(emotion: EmotionType): void {
    console.log('🎭 Updating emotion state:', { from: this.currentEmotion, to: emotion });
    this.currentEmotion = emotion;
    this.lastTransitionTime = Date.now();
  }

  /**
   * Bypass throttling for testing - always allows emotion transitions
   */
  public analyzeMessageWithoutThrottling(
    message: string, 
    messageType: 'user' | 'ai' = 'user',
    context: string = 'general',
    aiEmotions?: string[]
  ): EmotionAnalysisResult {
    // Get the base emotion analysis
    const baseAnalysis = this.analyzeMessage(message, messageType, context, aiEmotions);
    
    console.log('🎭 Analysis WITHOUT throttling:', baseAnalysis);
    
    // Force update emotion state (for testing)
    this.updateEmotionState(baseAnalysis.primaryEmotion);
    
    return {
      ...baseAnalysis,
      shouldTransition: true, // Always allow for testing
      reason: `${baseAnalysis.reason} (throttling bypassed for testing)`
    };
  }

  /**
   * Enhanced analyze message with transition throttling
   */
  public analyzeMessageWithThrottling(
    message: string, 
    messageType: 'user' | 'ai' = 'user',
    context: string = 'general',
    aiEmotions?: string[]
  ): EmotionAnalysisResult {
    // Get the base emotion analysis
    const baseAnalysis = this.analyzeMessage(message, messageType, context, aiEmotions);
    
    console.log('🎭 Base emotion analysis:', baseAnalysis);
    
    // Apply transition throttling
    const emotionStrength = baseAnalysis.confidence;
    const shouldTransition = this.shouldAllowTransition(baseAnalysis.primaryEmotion, emotionStrength);
    
    // Update emotion state if transition is allowed
    if (shouldTransition) {
      this.updateEmotionState(baseAnalysis.primaryEmotion);
    }
    
    console.log('🎭 Final analysis with throttling:', {
      emotion: baseAnalysis.primaryEmotion,
      shouldTransition,
      reason: shouldTransition ? baseAnalysis.reason : `${baseAnalysis.reason} (transition throttled)`
    });
    
    return {
      ...baseAnalysis,
      shouldTransition,
      reason: shouldTransition 
        ? baseAnalysis.reason 
        : `${baseAnalysis.reason} (transition throttled - too soon since last change)`
    };
  }

  /**
   * Get current emotion state for debugging
   */
  public getCurrentEmotionState(): { emotion: EmotionType; lastTransition: number } {
    return {
      emotion: this.currentEmotion,
      lastTransition: this.lastTransitionTime
    };
  }
}

// Singleton instance
export const emotionAnalysisService = new EmotionAnalysisService();