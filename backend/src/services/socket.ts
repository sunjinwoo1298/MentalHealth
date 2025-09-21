import { Server } from 'socket.io';
import axios from 'axios';
import { logger } from '../utils/logger';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  userId?: string;
}

export class SocketService {
  private io: Server;
  private aiServiceUrl: string;

  constructor(io: Server) {
    this.io = io;
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5010';
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

  // Get AI response from Python service
  private async getAIResponse(message: string, userId: string): Promise<string> {
    try {
      logger.info(`Sending message to AI service: ${message}\n`);
      
      const response = await axios.post(`${this.aiServiceUrl}/chat`, {
        message: message,
        userId: userId
      }, {
        timeout: 15000, // 15 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      logger.info('AI Service response:', response.data);
      return response.data.response || 'I understand how you\'re feeling. Everything will be okay. 🌟';
      
    } catch (error) {
      logger.error('Error calling AI service:', error instanceof Error ? error.message : String(error));
      
      // Fallback responses when AI service is unavailable
      const fallbackResponses = [
        'Everything will be okay. 🌟 I\'m here to support you through whatever you\'re going through.',
        'I hear you, and I want you to know that your feelings are valid. Take a deep breath with me. 💙',
        'You\'re not alone in this. Every challenge you face is making you stronger. सब कुछ ठीक हो जाएगा (Everything will be fine). 🌈',
        'It\'s okay to feel overwhelmed sometimes. Remember that this feeling is temporary, and you have the strength to get through it. 🌸',
        'Thank you for sharing with me. Your courage to reach out shows how strong you are. I believe in you. ✨'
      ];
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)] || 'I understand how you\'re feeling. Everything will be okay. 🌟';
    }
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      logger.info('User connected:', socket.id);

      // Handle user joining their personal room
      socket.on('join_room', (userId: string) => {
        socket.join(`user_${userId}`);
        logger.info(`User ${userId} joined their room`);
        
        // Send welcome message
        socket.emit('chat:system', {
          id: `system-${Date.now()}`,
          type: 'system',
          text: 'नमस्ते! Welcome to MindCare AI. Your conversations are secure and private. I\'m here to listen and support you. 💙',
          timestamp: new Date().toISOString()
        });
      });

      // Handle chat messages
      socket.on('chat:message', async (message: ChatMessage) => {
        try {
          logger.info('Received chat message:', message);
          
          // Echo the user message back to confirm receipt
          socket.emit('chat:message', message);
          
          // Show typing indicator
          socket.emit('chat:typing', true);
          
          // Get AI response
          const aiResponseText = await this.getAIResponse(message.text, message.userId || socket.id);
          
          // Stop typing indicator
          socket.emit('chat:typing', false);
          
          // Send AI response
          const aiResponse: ChatMessage = {
            id: `ai-${Date.now()}`,
            type: 'ai',
            text: aiResponseText,
            timestamp: new Date().toISOString(),
            ...(message.userId && { userId: message.userId })
          };
          
          socket.emit('chat:message', aiResponse);
          logger.info('Sent AI response:', aiResponse);
          
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
      
      // Get AI response
      const aiResponseText = await this.getAIResponse(message, userId);
      
      // Stop typing indicator
      this.sendToUser(userId, 'chat:typing', false);
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        text: aiResponseText,
        timestamp: new Date().toISOString(),
        userId
      };
      
      this.sendToUser(userId, 'chat:message', aiMessage);
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
