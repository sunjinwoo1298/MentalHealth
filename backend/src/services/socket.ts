import { Server } from 'socket.io';
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

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
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
          text: 'Connected to MindCare AI. Your conversations are secure and private.',
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
          
          // Simulate AI processing delay (1-2 seconds)
          setTimeout(() => {
            // Stop typing indicator
            socket.emit('chat:typing', false);
            
            // Send AI response
            const aiResponse: ChatMessage = {
              id: `ai-${Date.now()}`,
              type: 'ai',
              text: 'Everything will be okay. 🌟 I\'m here to support you through whatever you\'re going through. Take a deep breath and know that you\'re not alone.',
              timestamp: new Date().toISOString(),
              ...(message.userId && { userId: message.userId })
            };
            
            socket.emit('chat:message', aiResponse);
            logger.info('Sent AI response:', aiResponse);
          }, Math.random() * 1000 + 1000); // Random delay between 1-2 seconds
          
        } catch (error) {
          logger.error('Error handling chat message:', error);
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
  sendAIMessage(userId: string, message: string) {
    const aiMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      type: 'ai',
      text: message,
      timestamp: new Date().toISOString(),
      userId
    };
    
    this.sendToUser(userId, 'chat:message', aiMessage);
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
      text: '🚨 I notice you might be going through a difficult time. Everything will be okay. Would you like me to connect you with a professional counselor or a crisis helpline?',
      timestamp: new Date().toISOString(),
      userId
    };
    
    this.sendToUser(userId, 'chat:message', crisisMessage);
  }
}

export default SocketService;
