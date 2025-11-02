import { Server } from 'socket.io';
import axios from 'axios';
import { logger } from '../utils/logger';
import { db } from './database';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  userId?: string;
  context?: string; // Added support context
  sessionId?: string; // Track session
}

export class SocketService {
  private io: Server;
  private aiServiceUrl: string;
  private userSessions: Map<string, string>; // Map userId to sessionId

  constructor(io: Server) {
    this.io = io;
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5010';
    this.userSessions = new Map();
    this.setupSocketHandlers();
    this.checkAIServiceHealth();
  }

  // Check if AI service is running
  private async checkAIServiceHealth() {
    try {
      const response = await axios.get(`${this.aiServiceUrl}/health`, { timeout: 5000 });
      logger.info('AI Service health check:', response.data);
    } catch (error) {
      logger.warn('AI Service not available:', (error instanceof Error ? error.message : String(error)));
      logger.info('Will use fallback responses until AI service is ready');
    }
  }

  // Get or create active session for user
  private async getOrCreateSession(userId: string, context: string = 'general'): Promise<string> {
    try {
      logger.info(`🔍 Attempting to get/create session for userId: ${userId}, context: ${context}`);
      
      // Check if user has an active session
      const existingSession = await db.query(`
        SELECT id FROM chat_sessions
        WHERE user_id = $1 AND status = 'active' AND session_type = $2
        ORDER BY started_at DESC
        LIMIT 1
      `, [userId, context]);

      if (existingSession.rows.length > 0) {
        const sessionId = existingSession.rows[0].id;
        this.userSessions.set(userId, sessionId);
        logger.info(`♻️ Reusing existing session ${sessionId} for user ${userId}`);
        return sessionId;
      }

      // Create new session
      logger.info(`➕ Creating new session for userId: ${userId}`);
      const newSession = await db.query(`
        INSERT INTO chat_sessions (user_id, session_type, status, started_at)
        VALUES ($1, $2, 'active', NOW())
        RETURNING id
      `, [userId, context]);

      const sessionId = newSession.rows[0].id;
      this.userSessions.set(userId, sessionId);
      logger.info(`✅ Created new session ${sessionId} for user ${userId}`);
      return sessionId;
    } catch (error) {
      logger.error(`❌ Error getting/creating session for userId ${userId}:`, error);
      throw error;
    }
  }

  // Save message to database
  private async saveMessage(
    sessionId: string,
    senderType: 'user' | 'ai' | 'system',
    content: string,
    metadata?: any
  ): Promise<void> {
    try {
      await db.query(`
        INSERT INTO chat_messages 
        (session_id, sender_type, message_content_encrypted, timestamp, metadata)
        VALUES ($1, $2, pgp_sym_encrypt($3, $4), NOW(), $5)
      `, [
        sessionId,
        senderType,
        content,
        process.env.DB_ENCRYPTION_KEY || 'default_key',
        JSON.stringify(metadata || {})
      ]);
      logger.info(`Saved ${senderType} message to session ${sessionId}`);
    } catch (error) {
      logger.error('Error saving message:', error);
      // Don't throw - we don't want to stop chat if DB save fails
    }
  }

  // Get AI response from Python service
  private async getAIResponse(message: string, userId: string, context: string = 'general'): Promise<{
    response: string;
    emotional_context?: string[];
    conversation_count?: number;
    context?: string;
  }> {
    try {
      logger.info(`Sending message to AI service: ${message} (context: ${context})\n`);
      
      const response = await axios.post(`${this.aiServiceUrl}/chat`, {
        message: message,
        userId: userId,
        context: context
      }, {
        timeout: 15000, // 15 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      logger.info('AI Service response:', response.data);
      
      return {
        response: response.data.response || 'I understand how you\'re feeling. Everything will be okay. 🌟',
        emotional_context: response.data.emotional_context || [],
        conversation_count: response.data.conversation_count || 0,
        context: response.data.context || context
      };
      
    } catch (error) {
      logger.error('Error calling AI service:', error instanceof Error ? error.message : String(error));
      
      // Context-specific fallback responses
      const fallbackResponses = {
        general: [
          'Everything will be okay. 🌟 I\'m here to support you through whatever you\'re going through.',
          'I hear you, and I want you to know that your feelings are valid. Take a deep breath with me. 💙',
          'You\'re not alone in this. Every challenge you face is making you stronger. सब कुछ ठीक हो जाएगा (Everything will be fine). 🌈',
          'It\'s okay to feel overwhelmed sometimes. Remember that this feeling is temporary, and you have the strength to get through it. 🌸',
          'Thank you for sharing with me. Your courage to reach out shows how strong you are. I believe in you. ✨'
        ],
        academic: [
          'Academic pressure can be overwhelming, but you\'re not alone in this journey. 📚💙',
          'Your education is important, but so is your mental health. Take care of yourself. 🌟',
          'Every student faces challenges. You have the strength to overcome this. पढ़ाई का stress होना normal है. ✨',
          'Remember, marks don\'t define your worth. You are valuable beyond any grade. 🌈',
          'Take breaks when you need them. Your well-being matters more than perfect scores. 💙'
        ],
        family: [
          'Family relationships can be complex. Your feelings about this are completely valid. 🏠💙',
          'I understand family dynamics can be challenging. You\'re doing your best. 🌸',
          'Family matters touch our hearts deeply. Take time to process your emotions. 💕',
          'It\'s okay to set boundaries while still loving your family. आपकी खुशी भी important है. ✨',
          'Family conflicts are hard, but they can also lead to better understanding. 🌟'
        ]
      };
      
      const contextResponses = fallbackResponses[context as keyof typeof fallbackResponses] || fallbackResponses.general;
      const fallbackResponse = contextResponses[Math.floor(Math.random() * contextResponses.length)] || 'I understand how you\'re feeling. Everything will be okay. 🌟';
      
      return {
        response: fallbackResponse,
        emotional_context: [],
        conversation_count: 0,
        context: context
      };
    }
  }

  // Get proactive conversation starter from AI service
  private async getProactiveStarter(userId: string, context: string = 'general'): Promise<string | null> {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/proactive_chat`, {
        userId: userId,
        context: context
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data.proactive_message || null;
      
    } catch (error) {
      logger.error('Error getting proactive starter:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  // Get emotional status from AI service
  private async getEmotionalStatus(userId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.aiServiceUrl}/emotional_status?userId=${userId}`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data.emotional_state || {};
      
    } catch (error) {
      logger.error('Error getting emotional status:', error instanceof Error ? error.message : String(error));
      return {};
    }
  }

  private setupSocketHandlers() {
    logger.info('🔧 Setting up Socket.IO handlers...');
    
    this.io.on('connection', (socket) => {
      logger.info('👥 User connected:', socket.id);

      // Handle user joining their personal room
      socket.on('join_room', async (userId: string) => {
        socket.join(`user_${userId}`);
        logger.info(`🏠 User ${userId} joined their room`);

        // Check for proactive conversation starter
        try {
          const proactiveMessage = await this.getProactiveStarter(userId);
          if (proactiveMessage) {
            setTimeout(() => {
              const aiMessage: ChatMessage = {
                id: `ai-proactive-${Date.now()}`,
                type: 'ai',
                text: proactiveMessage,
                timestamp: new Date().toISOString(),
                userId: 'ai'
              };
              socket.emit('chat:message', aiMessage);
              socket.emit('chat:emotional_awareness', { 
                type: 'proactive_engagement', 
                message: 'AI initiated conversation' 
              });
            }, 2000); // Wait 2 seconds before sending proactive message
          }
        } catch (error) {
          logger.error('Error sending proactive message:', error);
        }
      });

      // Handle chat messages
      socket.on('chat:message', async (message: ChatMessage) => {
        try {
          logger.info('📨 Received chat message:', message);
          
          const userId = message.userId || socket.id;
          const context = message.context || 'general';
          
          logger.info(`👤 User ID: ${userId} (type: ${typeof userId})`);
          logger.info(`📍 Context: ${context}`);
          logger.info(`💬 Message text: ${message.text.substring(0, 50)}...`);
          
          console.log(`💬 Processing message from user: ${userId}, context: ${context}`);
          
          // Get or create session for this user
          const sessionId = await this.getOrCreateSession(userId, context);
          console.log(`📝 Using session: ${sessionId}`);
          
          // Save user message to database
          await this.saveMessage(sessionId, 'user', message.text, {
            context,
            socketId: socket.id,
            clientMessageId: message.id
          });
          console.log(`✅ User message saved to database`);
          
          // Echo the user message back to confirm receipt (with sessionId)
          socket.emit('chat:message', { ...message, sessionId });
          
          // Show typing indicator
          socket.emit('chat:typing', true);
          
          // Get AI response with emotional awareness and context
          const aiResponseData = await this.getAIResponse(message.text, userId, context);
          
          // Stop typing indicator
          socket.emit('chat:typing', false);
          
          // Send AI response with emotional context
          const aiMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            type: 'ai',
            text: aiResponseData.response,
            timestamp: new Date().toISOString(),
            userId: userId,
            context: aiResponseData.context || context,
            sessionId: sessionId
          };
          
          // Save AI message to database
          await this.saveMessage(sessionId, 'ai', aiResponseData.response, {
            emotional_context: aiResponseData.emotional_context,
            conversation_count: aiResponseData.conversation_count,
            context: aiResponseData.context
          });
          console.log(`✅ AI message saved to database`);
          
          socket.emit('chat:message', aiMessage);
          
          // Send emotional awareness data if available
          if (aiResponseData.emotional_context && aiResponseData.emotional_context.length > 0) {
            socket.emit('chat:emotional_awareness', { 
              emotions: aiResponseData.emotional_context,
              conversation_count: aiResponseData.conversation_count,
              context: aiResponseData.context,
              timestamp: new Date().toISOString(),
              sessionId: sessionId
            });
          }
          
          logger.info('Sent AI response:', aiMessage);
          
        } catch (error) {
          logger.error('Error handling chat message:', error);
          
          // Stop typing indicator in case of error
          socket.emit('chat:typing', false);
          
          socket.emit('chat:error', { 
            message: 'Sorry, there was an error processing your message. Please try again.' 
          });
        }
      });

      // Handle typing indicators
      socket.on('chat:typing_start', (userId: string) => {
        socket.to(`user_${userId}`).emit('chat:user_typing', true);
      });

      socket.on('chat:typing_stop', (userId: string) => {
        socket.to(`user_${userId}`).emit('chat:user_typing', false);
      });

      // Handle proactive conversation requests
      socket.on('request_proactive_message', async (userId: string) => {
        try {
          const proactiveMessage = await this.getProactiveStarter(userId);
          if (proactiveMessage) {
            const aiMessage: ChatMessage = {
              id: `ai-proactive-${Date.now()}`,
              type: 'ai',
              text: proactiveMessage,
              timestamp: new Date().toISOString(),
              userId: 'ai'
            };
            socket.emit('chat:message', aiMessage);
            socket.emit('chat:emotional_awareness', { 
              type: 'proactive_response', 
              message: 'AI provided proactive support' 
            });
          }
        } catch (error) {
          logger.error('Error handling proactive message request:', error);
        }
      });

      // Handle emotional status requests
      socket.on('request_emotional_status', async (userId: string) => {
        try {
          const emotionalStatus = await this.getEmotionalStatus(userId);
          socket.emit('emotional_status_update', {
            userId,
            emotional_state: emotionalStatus,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          logger.error('Error handling emotional status request:', error);
        }
      });

      // Handle check-in requests
      socket.on('initiate_check_in', async (userId: string) => {
        try {
          const checkInMessage = "How are you feeling right now? I'm here to listen and support you through whatever you're experiencing. 💙";
          const aiMessage: ChatMessage = {
            id: `ai-checkin-${Date.now()}`,
            type: 'ai',
            text: checkInMessage,
            timestamp: new Date().toISOString(),
            userId: 'ai'
          };
          socket.emit('chat:message', aiMessage);
          socket.emit('chat:emotional_awareness', { 
            type: 'check_in_initiated', 
            message: 'AI initiated emotional check-in' 
          });
        } catch (error) {
          logger.error('Error handling check-in initiation:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info('User disconnected:', socket.id);
      });
    });
  }

  // Send message to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  // Send AI message to user
  async sendAIMessage(userId: string, message: string) {
    try {
      // Show typing indicator
      this.sendToUser(userId, 'chat:typing', true);
      
      // Get AI response with emotional awareness
      const aiResponseData = await this.getAIResponse(message, userId);
      
      // Stop typing indicator
      this.sendToUser(userId, 'chat:typing', false);
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        text: aiResponseData.response,
        timestamp: new Date().toISOString(),
        userId
      };
      
      this.sendToUser(userId, 'chat:message', aiMessage);
      
      // Send emotional awareness data if available
      if (aiResponseData.emotional_context && aiResponseData.emotional_context.length > 0) {
        this.sendToUser(userId, 'chat:emotional_awareness', { 
          emotions: aiResponseData.emotional_context,
          conversation_count: aiResponseData.conversation_count,
          timestamp: new Date().toISOString()
        });
      }
      logger.info('Sent AI message to user:', { userId, message: aiMessage });
      
    } catch (error) {
      logger.error('Error sending AI message:', error);
      this.sendToUser(userId, 'chat:typing', false);
      this.sendToUser(userId, 'chat:error', { 
        message: 'Sorry, there was an error processing your message. Please try again.' 
      });
    }
  }

  // Broadcast to all connected users
  broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Send crisis intervention message
  sendCrisisIntervention(userId: string) {
    const crisisMessage: ChatMessage = {
      id: `crisis-${Date.now()}`,
      type: 'system',
      text: '🚨 I notice you might be going through a difficult time. Everything will be okay. Would you like me to connect you with a professional counselor or a crisis helpline? In India, you can reach:\n\n📞 AASRA: 022-27546669\n📞 Sneha: 044-24640050\n📞 Vandrevala Foundation: 9999 666 555',
      timestamp: new Date().toISOString(),
      userId
    };
    
    this.sendToUser(userId, 'chat:message', crisisMessage);
    logger.info('Sent crisis intervention message to user:', userId);
  }

  // Get connection status
  getConnectionCount(): number {
    return this.io.engine.clientsCount;
  }

  // Check if user is connected
  isUserConnected(userId: string): boolean {
    const room = this.io.sockets.adapter.rooms.get(`user_${userId}`);
    return room ? room.size > 0 : false;
  }
}

export default SocketService;
