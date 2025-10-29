import dotenv from 'dotenv';
import { DatabaseService } from '../src/services/database';
import { clearTestData } from './helpers/db';
import { Server } from 'http';
import { createServer } from 'net';
import { startServer, httpServer } from '../src/server';

let db: DatabaseService;

// Load test environment variables
dotenv.config({ path: '.env.test' });

let server: Server;

// Get a random available port
const getAvailablePort = () => {
  const s = createServer();
  return new Promise<number>((resolve) => {
    s.listen(0, () => {
      const { port } = s.address() as { port: number };
      s.close(() => resolve(port));
    });
  });
};

// Setup before all tests
beforeAll(async () => {
  // Initialize database connection
  db = DatabaseService.getInstance();
  const testConnection = await db.query('SELECT 1');
  if (!testConnection) {
    throw new Error('Could not connect to test database');
  }
  
  // Start server on a random available port
  const port = await getAvailablePort();
  process.env.TEST_PORT = port.toString();
  server = await startServer(port) as Server;
});

// Clean up after each test
afterEach(async () => {
  await clearTestData();
});

// Cleanup after all tests
afterAll(async () => {
  await new Promise<void>((resolve) => {
    server?.close(() => resolve());
  });
  await db.close();
});