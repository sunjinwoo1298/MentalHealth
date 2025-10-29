import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST. Try multiple likely .env locations so dev scripts
// started from different working directories still pick up the repo root .env.
// Avoid using __dirname to remain compatible with ts-node and different run contexts.
const envCandidates = [
  path.resolve(process.cwd(), '.env'),               // current working directory
  path.resolve(process.cwd(), '..', '.env'),         // parent (repo root if started from backend)
  path.resolve(process.cwd(), 'backend', '.env'),    // backend/.env when started from repo root
  path.resolve(process.cwd(), '..', 'backend', '.env') // backend/.env when started from a sibling folder
];

let loaded = false;
for (const p of envCandidates) {
  try {
    const res = dotenv.config({ path: p });
    if (res && res.parsed) {
      // eslint-disable-next-line no-console
      console.info(`Loaded environment from ${p}`);
      loaded = true;
      break;
    }
  } catch (err) {
    // ignore and try next
  }
}

if (!loaded) {
  // Fallback to default behavior (search process.cwd())
  dotenv.config();
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import chatRoutes from './routes/chat';
import wellnessRoutes from './routes/wellness';
import interventionRoutes from './routes/interventions';
import gamificationRoutes from './routes/gamification';
import audioProxyRoutes from './routes/audioProxy';

// Import middleware
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { validateRequest } from './middleware/validation';

// Import services
import { DatabaseService, db } from './services/database';
import { RedisService } from './services/redis';
import { SocketService } from './services/socket';

const app = express();

// Trust proxy for rate limiting and security
app.set('trust proxy', 1);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000"  // Create React App dev server
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

app.use(compression());

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200'), // increased to 200 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for gamification endpoints during development
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && req.path.includes('/api/gamification');
  }
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:5173", // Vite dev server
    "http://localhost:3000"  // Create React App dev server
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/wellness', authMiddleware, wellnessRoutes);
app.use('/api/interventions', authMiddleware, interventionRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/audio', audioProxyRoutes);

// Socket.IO connection handling
const socketService = new SocketService(io);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  
  // Stop accepting new connections
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });
  
  try {
    // Close database connections
    await db.close();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
  }
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });
  
  await db.close();
  
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Export app, httpServer and startServer for testing
export { app, httpServer };

// Function to start the server
export const startServer = (port: number = parseInt(process.env.BACKEND_PORT || '3001')) => {
  return new Promise((resolve) => {
    const server = httpServer.listen(port, () => {
      logger.info(`Mental Health AI Platform API Server running on port ${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      resolve(server);
    });
  });
};

// Only start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = parseInt(process.env.BACKEND_PORT || '3001');
  startServer(PORT);
}

export default app;