import { Server } from 'socket.io';

export class SocketService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join_room', (userId: string) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their room`);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }

  // Send message to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  // Broadcast to all connected users
  broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }
}
