import { Pool, Client } from 'pg';
import crypto from 'crypto';

export class DatabaseService {
  private pool: Pool;
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'fallback-key';
    
    this.pool = new Pool({
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || 'mental_health_db',
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'admin',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  // Get a client from the pool
  async getClient() {
    return await this.pool.connect();
  }

  // Encrypt sensitive data - Simplified for hackathon
  encrypt(text: string): string {
    // For production, use proper encryption. For hackathon, we'll use base64 encoding
    // with a simple transformation to show the concept
    const encoded = Buffer.from(text).toString('base64');
    return `encrypted_${encoded}`;
  }

  // Decrypt sensitive data - Simplified for hackathon
  decrypt(encryptedData: string): string {
    // For production, use proper decryption
    if (!encryptedData.startsWith('encrypted_')) {
      throw new Error('Invalid encrypted data format');
    }
    const encoded = encryptedData.replace('encrypted_', '');
    return Buffer.from(encoded, 'base64').toString('utf8');
  }

  // Execute a query
  async query(text: string, params?: any[]) {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Close the pool
  async close() {
    await this.pool.end();
  }
}

export const db = new DatabaseService();