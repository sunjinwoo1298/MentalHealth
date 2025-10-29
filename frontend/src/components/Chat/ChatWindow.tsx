
import React, { useEffect, useRef, useState, useContext } from 'react';
import io from 'socket.io-client';
import { useVrmAvatar } from '../../hooks/useVrmAvatar';
import { generateAndPlaySpeech, checkTTSStatus, audioManager } from '../../services/audioManager';
import { useGamification } from '../../contexts/GamificationContext';
import { mentalHealthContext } from '../../App';
import { emotionAnalysisService, type EmotionAnalysisResult } from '../../services/emotionAnalysis';
import CrisisAlert from './CrisisAlert';
import AgentInfoPanel from './AgentInfoPanel';
import ContextSelector from './ContextSelector';

export type ChatMessage = {
  id: string;
  type: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  userId?: string;
  context?: string; // Support context
  emotional_context?: string[]; // Backend emotion detection
  avatar_emotion?: string; // Backend avatar emotion
  emotion_intensity?: number; // Backend emotion intensity
  crisis_info?: {
    severity_level: number;
    immediate_action_required: boolean;
    crisis_indicators: Array<{
      type: string;
      severity: number;
      evidence: string;
    }>;
    resources: {
      immediate_help: Array<{
        name: string;
        phone: string;
        available: string;
        language?: string;
      }>;
      general_support: Array<{
        name: string;
        phone: string;
        available: string;
        language?: string;
      }>;
      online_resources: Array<{
        name: string;
        url: string;
        type: string;
      }>;
    };
  };
  agent_info?: {
    agent_analysis: {
      patterns: {
        emotional: {
          dominant: string[];
          frequency: Record<string, number>;
        };
        behavioral: string[];
        risk_factors: string[];
        protective_factors: string[];
      };
      recommendations: string[];
    } | null;
    agent_intervention: {
      type: string;
      message: string;
      urgency: 'low' | 'medium' | 'high';
    } | null;
    risk_trends: Array<{
      timestamp: number;
      level: number;
      factors: string[];
    }>;
    has_agent_intervention: boolean;
  };
};

// System welcome message (currently unused)
// const systemWelcome: ChatMessage = {
//   id: 'system-welcome',
//   type: 'system',
//   text: 'You are now connected to MindCare AI. All conversations are private and monitored for your safety.',
//   timestamp: new Date().toISOString(),
// };

// Initialize socket outside the component to avoid multiple connections
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  secure: false, // Set to true for HTTPS
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Chat Window Props (interface currently unused)
// interface ChatWindowProps {
//   context?: string; // Support context (academic, family, general)
// }

// Context-specific information
const getContextInfo = (context: string) => {
  const contextMap = {
    general: {
      name: 'General Support',
      description: 'Overall mental health and emotional wellness support',
      icon: '💙',
      color: 'blue-500',
      bgColor: 'blue-50',
      borderColor: 'blue-200'
    },
    academic: {
      name: 'Academic Pressure Support',
      description: 'Study stress, exam anxiety, career guidance, and educational challenges',
      icon: '📚',
      color: 'green-500',
      bgColor: 'green-50',
      borderColor: 'green-200'
    },
    family: {
      name: 'Family Relationships Support',
      description: 'Family relationships, communication, and household dynamics',
      icon: '🏠',
      color: 'yellow-500',
      bgColor: 'yellow-50',
      borderColor: 'yellow-200'
    }
  };
  
  return contextMap[context as keyof typeof contextMap] || contextMap.general;
};

// Context-specific welcome message
const createContextWelcome = (context: string): ChatMessage => {
  const contextInfo = getContextInfo(context);
  const welcomeMessages = {
    general: 'You are now connected to MindCare AI. All conversations are private and monitored for your safety.',
    academic: `Welcome to ${contextInfo.name} ${contextInfo.icon} I understand the unique pressures students face. Let's talk about your academic journey and mental wellness.`,
    family: `Welcome to ${contextInfo.name} ${contextInfo.icon} I know family relationships can be complex. This is a safe space to discuss family dynamics and emotions.`
  };
  
  return {
    id: 'system-welcome',
    type: 'system',
    text: welcomeMessages[context as keyof typeof welcomeMessages] || welcomeMessages.general,
    timestamp: new Date().toISOString(),
    context: context
  };
};

export default function ChatWindow() {
  // Access context from App
  const context=useContext(mentalHealthContext);
  // const contextInfo = getContextInfo(context?.currentContext || 'general'); // Currently unused
  const [messages, setMessages] = useState<ChatMessage[]>([createContextWelcome(context?.currentContext || 'general')]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [chatStartTime, setChatStartTime] = useState<Date | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [emotionalContext, setEmotionalContext] = useState<string[]>([]);
  const [showEmotionalIndicator, setShowEmotionalIndicator] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [aiInitiative, setAiInitiative] = useState<string | null>(null); // Track current context
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [currentCrisisInfo, setCurrentCrisisInfo] = useState<ChatMessage['crisis_info'] | null>(null);
  const [showAgentInfo, setShowAgentInfo] = useState(false);
  const [currentAgentInfo, setCurrentAgentInfo] = useState<ChatMessage['agent_info'] | null>(null);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true); // TTS toggle
  const [isPlayingAudio, setIsPlayingAudio] = useState(false); // Audio playback state
  const [ttsError, setTtsError] = useState<string | null>(null); // TTS error state
  const [isLipSyncSetup, setIsLipSyncSetup] = useState(false); // Lip sync setup state
  const [isProcessingAudio, setIsProcessingAudio] = useState(false); // Audio processing state
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Gamification integration
  const { addPendingReward } = useGamification();

  // VRM Avatar integration
  const {
    canvasRef,
    currentEmotion,
    isLoading: vrmLoading,
    isTransitioning,
    switchToEmotion,
    setupLipSync,
    startLipSync,
    stopLipSync,
    isLipSyncActive
  } = useVrmAvatar();

  // Enhanced avatar emotion system
  const [lastEmotionAnalysis, setLastEmotionAnalysis] = useState<EmotionAnalysisResult | null>(null);
  const [emotionDebugInfo, setEmotionDebugInfo] = useState<string>('');
  const [conversationTone, setConversationTone] = useState(emotionAnalysisService.getCurrentTone());

  // Test function to manually trigger emotions (for debugging)
  const testEmotionSwitch = async (emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised') => {
    console.log('🧪 Manual emotion test:', emotion);
    console.log('🧪 Current VRM state:', { vrmLoading, isTransitioning, currentEmotion });
    
    if (vrmLoading) {
      console.log('🧪 Cannot test - VRM is loading');
      return;
    }
    
    if (isTransitioning) {
      console.log('🧪 Cannot test - VRM is transitioning');
      return;
    }
    
    console.log('🧪 Calling switchToEmotion directly:', emotion);
    try {
      await switchToEmotion(emotion);
      console.log('🧪 Manual switchToEmotion completed successfully');
    } catch (error) {
      console.error('🧪 Manual switchToEmotion failed:', error);
    }
  };

  // TTS handling functions
  const handleTTSGeneration = async (text: string, messageId?: string) => {
    if (!isTTSEnabled || isPlayingAudio) {
      return;
    }
    
    try {
      setTtsError(null);
      setIsProcessingAudio(true); // Show audio processing indicator
      console.log('🔊 Generating TTS for:', text.substring(0, 50) + '...');
      
      // Determine voice profile based on current emotion and context
      const voiceProfile = getVoiceProfileForContext(currentEmotion, context?.currentContext || 'general');
      const emotionContext = getEmotionContextFromMessage(text);
      
      const result = await generateAndPlaySpeech(text, {
        voiceProfile,
        emotionContext,
        userId: socket.id,
        backendUrl: 'http://localhost:5010',
        onStart: async (audioElement?: HTMLAudioElement) => {
          setIsProcessingAudio(false); // Hide audio processing indicator
          setIsPlayingAudio(true);
          console.log('🔊 TTS playback started');
          
          // Show AI message in UI when audio starts playing
          if (messageId) {
            const aiMessage: ChatMessage = {
              id: messageId,
              type: 'ai',
              text: text,
              timestamp: new Date().toISOString(),
              context: context?.currentContext
            };
            setMessages((prev) => [...prev, aiMessage]);
            setIsTyping(false);
            
            // Track message count for gamification
            setMessageCount(prev => prev + 1);
          }
          
          // Setup lip sync with the audio element
          if (audioElement && !isLipSyncSetup) {
            console.log('🎤 Setting up lip sync with audio element');
            const success = await setupLipSync(audioElement);
            if (success) {
              setIsLipSyncSetup(true);
              console.log('🎤 Lip sync setup completed');
            } else {
              console.warn('🎤 Lip sync setup failed');
            }
          }
          
          // Start lip sync if setup is ready
          if (isLipSyncSetup || audioElement) {
            console.log('🎤 Starting lip sync');
            startLipSync();
          }
          
          // Switch avatar to speaking emotion
          // switchToEmotion('happy');
        },
        onEnd: () => {
          setIsPlayingAudio(false);
          console.log('🔊 TTS playback ended');
          
          // Stop lip sync
          if (isLipSyncSetup) {
            console.log('🎤 Stopping lip sync');
            stopLipSync();
          }
          
          // Return avatar to appropriate emotion after speaking
          setTimeout(() => {
            updateAvatarEmotion(text, 'ai');
          }, 1000);
        },
        onError: (error) => {
          setIsProcessingAudio(false); // Hide audio processing indicator on error
          setIsPlayingAudio(false);
          setTtsError(error);
          
          // Stop lip sync on error
          if (isLipSyncSetup) {
            stopLipSync();
          }
          
          console.error('🔊 TTS error:', error);
        }
      });
      
      if (!result.success) {
        setIsProcessingAudio(false); // Hide audio processing indicator on failure
        console.warn('🔊 TTS generation failed:', result.error);
        setTtsError(result.error || 'TTS generation failed');
      }
      
    } catch (error) {
      console.error('🔊 TTS handling error:', error);
      setIsProcessingAudio(false); // Hide audio processing indicator on error
      setIsPlayingAudio(false);
      setTtsError(error instanceof Error ? error.message : String(error));
      
      // Stop lip sync on error
      if (isLipSyncSetup) {
        stopLipSync();
      }
    }
  };
  
  // Helper function to determine voice profile based on emotion and context
  const getVoiceProfileForContext = (emotion: string, chatContext: string) => {
    const profiles = {
      'academic': {
        'happy': 'supportive_female',
        'neutral': 'supportive_female', 
        'sad': 'compassionate_female',
        'angry': 'calming_male',
        'surprised': 'supportive_female',
        'default': 'supportive_female'
      },
      'family': {
        'happy': 'compassionate_female',
        'neutral': 'compassionate_female',
        'sad': 'compassionate_female', 
        'angry': 'calming_male',
        'surprised': 'supportive_female',
        'default': 'compassionate_female'
      },
      'general': {
        'happy': 'compassionate_female',
        'neutral': 'compassionate_female',
        'sad': 'compassionate_female',
        'angry': 'calming_male', 
        'surprised': 'supportive_female',
        'default': 'compassionate_female'
      }
    };
    
    const contextProfiles = profiles[chatContext as keyof typeof profiles] || profiles.general;
    return contextProfiles[emotion as keyof typeof contextProfiles] || contextProfiles.default;
  };
  
  // Helper function to determine emotion context from message
  const getEmotionContextFromMessage = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('calm') || lowerText.includes('peaceful') || lowerText.includes('breathe')) {
      return 'calming';
    } else if (lowerText.includes('support') || lowerText.includes('understand') || lowerText.includes('here for you')) {
      return 'supportive';
    } else if (lowerText.includes('sorry') || lowerText.includes('difficult') || lowerText.includes('healing')) {
      return 'compassionate';
    }
    
    return 'supportive'; // Default
  };
  
  // Stop TTS playback
  const stopTTS = () => {
    audioManager.stopAudio();
    setIsPlayingAudio(false);
    
    // Stop lip sync if active
    if (isLipSyncSetup) {
      stopLipSync();
    }
  };
  
  // Toggle TTS on/off
  const toggleTTS = () => {
    if (isPlayingAudio) {
      stopTTS();
    }
    setIsTTSEnabled(!isTTSEnabled);
    setTtsError(null);
  };

  // Enhanced auto-switch avatar emotions based on conversation
  // Function to map backend emotion names to VRM avatar emotions
  const mapBackendEmotionToVRM = (backendEmotion: string): 'neutral' | 'happy' | 'sad' | 'concerned' | 'supportive' | 'excited' | 'angry' | 'surprised' => {
    const emotionMap: Record<string, 'neutral' | 'happy' | 'sad' | 'concerned' | 'supportive' | 'excited' | 'angry' | 'surprised'> = {
      'neutral': 'neutral',
      'happy': 'happy',
      'sad': 'sad',
      'concerned': 'concerned',
      'supportive': 'supportive',
      'excited': 'excited',
      'angry': 'angry',
      'surprised': 'surprised',
      // Fallback mappings for any missing emotions
      'worried': 'concerned',
      'anxious': 'concerned',
      'joyful': 'happy',
      'calm': 'neutral'
    };
    
    return emotionMap[backendEmotion] || 'neutral';
  };

  const updateAvatarEmotion = async (messageText: string, messageType: 'user' | 'ai', aiEmotions?: string[]) => {
    console.log('🎭 updateAvatarEmotion called:', { messageText, messageType, aiEmotions, vrmLoading, isTransitioning });
    
    // if (vrmLoading || isTransitioning) {
    //   console.log('🎭 Skipping emotion update - VRM loading or transitioning:', { vrmLoading, isTransitioning });
    //   return;
    // }

    try {
      // Use the emotion analysis service with throttling to determine the appropriate emotion
      const analysis = emotionAnalysisService.analyzeMessageWithThrottling(
        messageText,
        messageType,
        context?.currentContext || 'general',
        aiEmotions
      );

      console.log('🎭 Emotion analysis result:', analysis);

      setLastEmotionAnalysis(analysis);
      setEmotionDebugInfo(`${analysis.primaryEmotion} (${Math.round(analysis.confidence * 100)}%) - ${analysis.reason}`);

      // Only change emotion if analysis suggests it's appropriate and throttling allows it
      if (analysis.shouldTransition) {
        console.log(`🎭 Avatar emotion change: ${currentEmotion} → ${analysis.primaryEmotion}`, {
          reason: analysis.reason,
          confidence: analysis.confidence,
          intensity: analysis.intensity,
          messageType,
          context: context?.currentContext,
          throttled: false
        });

        console.log('🎭 Calling switchToEmotion with:', analysis.primaryEmotion);
        try {
          await switchToEmotion(analysis.primaryEmotion);
          console.log('🎭 switchToEmotion completed successfully');
        } catch (error) {
          console.error('🎭 switchToEmotion failed:', error);
        }

        // Update conversation tone tracking
        const updatedTone = emotionAnalysisService.updateConversationTone(analysis.primaryEmotion, messageText);
        setConversationTone(updatedTone);

        // Apply conversation-wide tone adjustments
        applyConversationToneInfluence(updatedTone);
      } else {
        console.log(`🎭 Avatar emotion change blocked: ${currentEmotion}`, {
          reason: analysis.reason,
          suggestedEmotion: analysis.primaryEmotion,
          messageType,
          throttled: analysis.reason.includes('throttled')
        });
      }
    } catch (error) {
      console.error('🎭 Error in emotion analysis:', error);
      // Fallback to basic emotion logic
      if (messageType === 'ai') {
        console.log('🎭 Fallback: switching to neutral');
        switchToEmotion('neutral');
      }
    }
  };

  // Apply conversation-wide tone influence to avatar behavior
  const applyConversationToneInfluence = (tone: typeof conversationTone) => {
    // If conversation has been consistently sad/negative, show more empathy
    if (tone.overallMood === 'sad' && tone.stabilityScore > 0.7) {
      console.log('🌊 Conversation tone: Sustained sadness detected - showing sustained empathy');
      // The avatar will naturally show sad/empathetic expressions
    }
    
    // If conversation has been positive and stable, maintain upbeat demeanor
    else if (tone.overallMood === 'happy' && tone.stabilityScore > 0.8) {
      console.log('🌊 Conversation tone: Positive mood sustained - maintaining cheerful demeanor');
      // Avatar will naturally show happy expressions
    }
    
    // If emotions are very unstable, be more neutral/calming
    else if (tone.stabilityScore < 0.3) {
      console.log('🌊 Conversation tone: Emotional instability detected - providing calm presence');
      // Bias toward neutral, calming expressions
      if (currentEmotion !== 'neutral') {
        setTimeout(() => switchToEmotion('neutral'), 2000); // Gentle return to neutral
      }
    }
  };

  useEffect(() => {
    // Connect to socket
    socket.connect();

    // Reset emotion analysis for new chat session
    emotionAnalysisService.resetConversation();

    // Socket event listeners
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
      setIsConnected(true);
      
      // Start tracking chat session
      setChatStartTime(new Date());
      setMessageCount(0);
      
      // Join user room (using socket.id as temporary user ID)
      socket.emit('join_room', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      
      // Award points for chat completion when disconnecting after meaningful conversation
      if (chatStartTime && messageCount >= 3) {
        const sessionDuration = Date.now() - chatStartTime.getTime();
        const durationMinutes = Math.floor(sessionDuration / (1000 * 60));
        
        console.log(`Chat session completed: ${messageCount} messages, ${durationMinutes} minutes`);
        
        // Add pending reward for chat completion
        addPendingReward('chat_completion', {
          messageCount,
          durationMinutes,
          sessionId: socket.id,
          completedAt: new Date().toISOString()
        });
      }
    });

    socket.on('chat:message', (msg: ChatMessage) => {
      console.log('Received message:', msg);
      
      // Handle crisis info if present
      if (msg.type === 'ai' && msg.crisis_info) {
        setCurrentCrisisInfo(msg.crisis_info);
        if (msg.crisis_info.severity_level >= 3) {
          setShowCrisisAlert(true);
        }
      }

      // Handle agent info if present
      if (msg.type === 'ai' && msg.agent_info) {
        setCurrentAgentInfo(msg.agent_info);
        if (msg.agent_info.has_agent_intervention) {
          setShowAgentInfo(true);
        }
      }

      // For user messages or when TTS is disabled, show immediately
      if (msg.type === 'user' || !isTTSEnabled) {
        setMessages((prev) => [...prev, msg]);
        setIsTyping(false);
        
        // Track message count for gamification
        if (msg.type === 'user') {
          setMessageCount(prev => prev + 1);
        }
      }
      
      // Handle avatar emotion updates with enhanced backend integration
      if (msg.type === 'ai' && msg.avatar_emotion) {
        // Use backend-provided emotion data for AI messages
        console.log('🎭 Using backend emotion data:', {
          emotion: msg.avatar_emotion,
          intensity: msg.emotion_intensity,
          emotional_context: msg.emotional_context
        });
        
        // Apply emotion with intensity support
        const emotionIntensity = msg.emotion_intensity || 3;
        
        try {
          // Map backend emotion to VRM emotion if needed
          const mappedEmotion = mapBackendEmotionToVRM(msg.avatar_emotion);
          console.log(`🎭 Switching to emotion: ${mappedEmotion} (intensity: ${emotionIntensity})`);
          switchToEmotion(mappedEmotion);
        } catch (error) {
          console.error('🎭 Error applying backend emotion:', error);
          // Fallback to analysis
          updateAvatarEmotion(msg.text, msg.type as 'user' | 'ai', msg.emotional_context);
        }
      } else {
        // Fallback to analysis for other messages or missing emotion data
        updateAvatarEmotion(msg.text, msg.type as 'user' | 'ai', msg.emotional_context);
      }
      
      // Generate TTS for AI messages - message will be shown when audio starts
      if (msg.type === 'ai' && isTTSEnabled && msg.text) {
        handleTTSGeneration(msg.text, msg.id);
      } else if (msg.type === 'ai' && !isTTSEnabled) {
        // If TTS is disabled, the message was already added above
        setIsTyping(false);
      }
    });

    socket.on('chat:system', (msg: ChatMessage) => {
      console.log('Received system message:', msg);
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('chat:typing', (typing: boolean) => {
      console.log('Typing indicator:', typing);
      setIsTyping(typing);
      
      // When AI starts typing, show thinking expression
      if (typing) {
        switchToEmotion('neutral');
      }
    });

    socket.on('chat:error', (error: { message: string }) => {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        text: error.message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setIsTyping(false);
    });

    // Handle emotional awareness updates
    socket.on('chat:emotional_awareness', (data: { 
      emotions?: string[]; 
      type?: string; 
      message?: string; 
      conversation_count?: number;
      context?: string;
      timestamp?: string;
    }) => {
      console.log('🧠 AI Emotional Awareness Update:', data);
      
      if (data.emotions && data.emotions.length > 0) {
        setEmotionalContext(data.emotions);
        setShowEmotionalIndicator(true);
        setTimeout(() => setShowEmotionalIndicator(false), 5000); // Hide after 5 seconds
        
        // Get the most recent AI message to apply emotion to
        setMessages(prevMessages => {
          const lastAIMessage = [...prevMessages].reverse().find(msg => msg.type === 'ai');
          if (lastAIMessage && data.emotions) {
            // Apply AI-detected emotions to the avatar with higher priority
            console.log('🤖 Applying AI-detected emotions to avatar:', data.emotions);
            updateAvatarEmotion(lastAIMessage.text, 'ai', data.emotions);
            
            // Update conversation tone with AI emotions for better tracking
            const primaryAIEmotion = data.emotions[0];
            const mappedEmotion = emotionAnalysisService.analyzeMessage(
              `AI detected: ${primaryAIEmotion}`,
              'ai',
              data.context || context?.currentContext || 'general',
              data.emotions
            );
            
            if (mappedEmotion.shouldTransition) {
              const updatedTone = emotionAnalysisService.updateConversationTone(
                mappedEmotion.primaryEmotion, 
                `AI emotional insight: ${data.emotions.join(', ')}`
              );
              setConversationTone(updatedTone);
            }
          }
          return prevMessages;
        });
      }
      
      if (data.conversation_count) {
        setConversationCount(data.conversation_count);
      }
      
      if (data.type && data.message) {
        setAiInitiative(data.message);
        setTimeout(() => setAiInitiative(null), 3000); // Hide after 3 seconds
      }
    });

    // Handle emotional status updates
    socket.on('emotional_status_update', (data: { 
      userId: string; 
      emotional_state: any; 
      timestamp: string; 
    }) => {
      console.log('Emotional status update:', data);
      // You can use this data to show emotional trends or insights
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('chat:message');
      socket.off('chat:system');
      socket.off('chat:typing');
      socket.off('chat:error');
      socket.off('chat:emotional_awareness');
      socket.off('emotional_status_update');
      socket.disconnect();
    };
  }, []);

  // Separate effect to handle chat completion on unmount with current state values
  useEffect(() => {
    return () => {
      // Cleanup states
      setShowCrisisAlert(false);
      setCurrentCrisisInfo(null);
      setShowAgentInfo(false);
      setCurrentAgentInfo(null);

      // Award points for chat completion when component unmounts after meaningful conversation
      if (chatStartTime && messageCount >= 3) {
        const sessionDuration = Date.now() - chatStartTime.getTime();
        const durationMinutes = Math.floor(sessionDuration / (1000 * 60));
        
        console.log(`Chat component unmounting: ${messageCount} messages, ${durationMinutes} minutes`);
        
        // Add pending reward for chat completion
        addPendingReward('chat_completion', {
          messageCount,
          durationMinutes,
          sessionId: socket.id,
          completedAt: new Date().toISOString(),
          completionType: 'component_unmount'
        });
      }
    };
  }, [chatStartTime, messageCount, addPendingReward]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isConnected) {
      return;
    }
    
    const msg: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: input,
      timestamp: new Date().toISOString(),
      userId: socket.id,
      context: context?.currentContext, // Include support context
    };

    // Update avatar emotion based on user message immediately
    updateAvatarEmotion(msg.text, 'user');

    // Emit message to server
    socket.emit('chat:message', msg);
    
    // Notify avatar of new message
    window.dispatchEvent(new CustomEvent('chatMessage', { 
      detail: { message: msg } 
    }));
    
    setInput('');
  };

  // Function to request proactive conversation (currently disabled)
  // const requestProactiveMessage = () => {
  //   if (isConnected) {
  //     socket.emit('request_proactive_message', socket.id);
  //   }
  // };

  // Function to request emotional check-in (currently disabled)
  // const requestCheckIn = () => {
  //   if (isConnected) {
  //     socket.emit('initiate_check_in', socket.id);
  //   }
  // };

  // Function to request emotional status (currently disabled)
  // const requestEmotionalStatus = () => {
  //   if (isConnected) {
  //     socket.emit('request_emotional_status', socket.id);
  //   }
  // };

  return (
    <div className="h-full relative bg-transparent overflow-hidden">
      {/* VRM Avatar Background - Full Screen */}
      <div className="absolute inset-0">
        <canvas 
          ref={canvasRef as React.RefObject<HTMLCanvasElement>}
          className="w-full h-full"
          style={{ 
            background: 'transparent',
            display: 'block'
          }}
        />
        
        {/* Avatar Loading Indicator */}
        {vrmLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="text-white text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <span className="text-sm">Loading Avatar...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Overlay - Positioned over avatar */}
      <div className="absolute inset-0 flex flex-col pointer-events-none">
        {/* Connection Status - Top Center */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto">
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-3 py-1 rounded-full backdrop-blur-md ${
              isConnected 
                ? 'bg-green-500/30 text-green-300 border border-green-500/50' 
                : 'bg-red-500/30 text-red-300 border border-red-500/50'
            }`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            {conversationCount > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/30 text-blue-300 border border-blue-500/50 backdrop-blur-md">
                Messages: {conversationCount}
              </span>
            )}
          </div>
        </div>

        {/* Emotional Awareness Indicator - Top Right */}
        {showEmotionalIndicator && emotionalContext.length > 0 && (
          <div className="absolute top-4 right-4 z-10 pointer-events-auto">
            <div className="bg-purple-500/30 border border-purple-400/50 rounded-lg p-3 backdrop-blur-md">
              <div className="text-xs text-purple-200 mb-1">AI is aware of:</div>
              <div className="flex flex-wrap gap-1">
                {emotionalContext.map((emotion, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-purple-600/40 text-purple-100 rounded-full">
                    {emotion}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Initiative Indicator - Center Top */}
        {aiInitiative && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto">
            <div className="bg-teal-500/30 border border-teal-400/50 rounded-lg p-2 backdrop-blur-md">
              <span className="text-xs text-teal-200">💡 {aiInitiative}</span>
            </div>
          </div>
        )}

        {/* Context Header - Top Right */}
        <div className="absolute top-4 right-4 z-10 pointer-events-auto">
          <ContextSelector
            currentContext={context?.currentContext || 'general'}
            contexts={{
              general: {
                name: 'General Support',
                description: 'Overall mental health and emotional wellness support',
                icon: '💙',
                color: 'rgb(59, 130, 246)' // blue-500
              },
              academic: {
                name: 'Academic Pressure Support',
                description: 'Study stress, exam anxiety, career guidance',
                icon: '📚',
                color: 'rgb(34, 197, 94)' // green-500
              },
              family: {
                name: 'Family Relationships Support',
                description: 'Family dynamics and communication',
                icon: '🏠',
                color: 'rgb(234, 179, 8)' // yellow-500
              }
            }}
            onContextChange={(newContext) => {
              if (context?.setCurrentContext) {
                context.setCurrentContext(newContext);
                // Add system message about context change
                const contextChangeMsg: ChatMessage = {
                  id: `context-change-${Date.now()}`,
                  type: 'system',
                  text: `Switching to ${getContextInfo(newContext).name} context...`,
                  timestamp: new Date().toISOString(),
                  context: newContext
                };
                setMessages(prev => [...prev, contextChangeMsg]);
                
                // Reset any active crisis or agent info when context changes
                setShowCrisisAlert(false);
                setCurrentCrisisInfo(null);
                setShowAgentInfo(false);
                setCurrentAgentInfo(null);
              }
            }}
          />
        </div>

        {/* Proactive Conversation Controls - Bottom Left */}
        

        {/* Crisis Alert */}
        {showCrisisAlert && currentCrisisInfo && (
          <CrisisAlert
            crisisInfo={currentCrisisInfo}
            onClose={() => setShowCrisisAlert(false)}
          />
        )}

        {/* Agent Info Panel */}
        {showAgentInfo && currentAgentInfo && (
          <AgentInfoPanel
            agentInfo={currentAgentInfo}
            isVisible={showAgentInfo}
          />
        )}

        {/* Chat Messages - Center/Bottom Area */}
        <div className="flex-1 flex flex-col justify-end p-6 pointer-events-none">
          <div className="max-h-[60vh] overflow-y-auto space-y-4 pointer-events-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[30%]">
                  {msg.type !== 'user' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.id.includes('proactive') || msg.id.includes('checkin') 
                          ? 'bg-gradient-to-r from-teal-500 to-blue-500' 
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}>
                        <span className="text-white text-sm font-bold">
                          {msg.id.includes('proactive') || msg.id.includes('checkin') ? '🤗' : 'AI'}
                        </span>
                      </div>
                      <span className="text-white/90 text-sm drop-shadow-lg">
                        {msg.id.includes('proactive') || msg.id.includes('checkin') 
                          ? 'MindCare AI (reaching out)' 
                          : 'MindCare AI'
                        }
                      </span>
                      {msg.id.includes('proactive') && (
                        <span className="text-xs px-2 py-1 bg-teal-500/30 text-teal-200 rounded-full border border-teal-400/30">
                          💡 proactive
                        </span>
                      )}
                    </div>
                  )}
                  <div
                    className={`px-6 py-4 rounded-2xl shadow-xl backdrop-blur-md border ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-pink-500/80 to-teal-500/80 text-white ml-auto border-pink-300/30'
                        : msg.type === 'ai'
                        ? msg.id.includes('proactive') || msg.id.includes('checkin')
                          ? 'bg-gradient-to-r from-teal-500/80 to-blue-600/80 text-white border-teal-300/30'
                          : 'bg-gradient-to-r from-purple-500/80 to-indigo-600/80 text-white border-purple-300/30'
                        : 'bg-gray-800/60 border-gray-500/40 text-gray-100'
                    }`}
                  >
                    {msg.type === 'system' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-semibold text-blue-300">🔒 SECURE CONNECTION</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed drop-shadow-sm">{msg.text}</p>
                    <span className="block text-xs opacity-75 mt-2 drop-shadow-sm">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <span className="text-white/90 text-sm drop-shadow-lg">MindCare AI</span>
                  </div>
                  <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500/80 to-indigo-600/80 text-white shadow-xl backdrop-blur-md border border-purple-300/30">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-200"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-400"></div>
                      </div>
                      <span className="text-sm drop-shadow-sm">I'm thinking about your message...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {isProcessingAudio && (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🔊</span>
                    </div>
                    <span className="text-white/90 text-sm drop-shadow-lg">MindCare AI</span>
                  </div>
                  <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-500/80 to-red-600/80 text-white shadow-xl backdrop-blur-md border border-orange-300/30">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse animation-delay-300"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse animation-delay-600"></div>
                      </div>
                      <span className="text-sm drop-shadow-sm">Processing audio response...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
        
        {/* Input Area - Bottom */}
        <div className="p-6 bg-gradient-to-t from-black/40 via-black/20 to-transparent backdrop-blur-none pointer-events-auto">
          <form onSubmit={sendMessage} className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!isConnected}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-900/60 border border-gray-400/30 focus:outline-none focus:ring-2 focus:ring-pink-400/70 focus:border-transparent text-white placeholder-gray-300 text-sm backdrop-blur-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                  placeholder={isConnected ? "Share what's on your mind..." : "Connecting..."}
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="text-xs drop-shadow-sm">Press Enter to send</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={!input.trim() || !isConnected}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500/90 to-teal-500/90 text-white font-semibold shadow-xl hover:from-pink-600/90 hover:to-teal-600/90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none backdrop-blur-md border border-pink-300/30"
              >
                Send
              </button>
            </div>
            
            {/* TTS Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={toggleTTS}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                    isTTSEnabled 
                      ? 'bg-green-500/20 border border-green-400/50 text-green-300 hover:bg-green-500/30' 
                      : 'bg-gray-500/20 border border-gray-400/50 text-gray-300 hover:bg-gray-500/30'
                  }`}
                >
                  🔊 Voice {isTTSEnabled ? 'ON' : 'OFF'}
                </button>
                
                {/* Lip Sync Status Indicator */}
                <div className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                  isLipSyncSetup && isLipSyncActive()
                    ? 'bg-blue-500/20 border border-blue-400/50 text-blue-300'
                    : isLipSyncSetup
                    ? 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-300'
                    : 'bg-gray-500/20 border border-gray-400/50 text-gray-300'
                }`}>
                  {isLipSyncSetup && isLipSyncActive() 
                    ? '🎤 Lip Sync Active' 
                    : isLipSyncSetup 
                    ? '🎤 Lip Sync Ready'
                    : '🎤 Lip Sync Off'
                  }
                </div>
                
                {isPlayingAudio && (
                  <button
                    type="button"
                    onClick={stopTTS}
                    className="px-3 py-2 rounded-lg bg-red-500/20 border border-red-400/50 text-red-300 hover:bg-red-500/30 text-xs font-medium transition-all duration-300"
                  >
                    ⏹️ Stop Audio
                  </button>
                )}
                
                {isPlayingAudio && (
                  <div className="flex items-center space-x-2 text-xs text-green-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Playing with lip sync...</span>
                  </div>
                )}
              </div>
              
              {ttsError && (
                <div className="text-xs text-red-300 bg-red-500/10 border border-red-400/30 rounded-lg px-2 py-1">
                  ⚠️ {ttsError}
                </div>
              )}
            </div>
            
            {/* Quick Response Suggestions */}
            <div className="flex flex-wrap gap-2">
              {[
                'I feel anxious today', 
                'Can you help me relax?', 
                'I need someone to talk to',
                'How can I manage stress?',
                'I\'m feeling overwhelmed',
                'Tell me something positive'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={!isConnected}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-2 rounded-full bg-gray-800/50 border border-gray-400/30 text-gray-200 text-xs hover:bg-gray-700/60 hover:border-pink-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm shadow-lg"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
