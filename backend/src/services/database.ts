import { Pool, Client } from 'pg';
import { types as pgTypes } from 'pg';
import crypto from 'crypto';

export class DatabaseService {
  protected _pool!: Pool;
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'fallback-key';
    // Ensure Postgres DATE types are returned as strings (YYYY-MM-DD) to avoid timezone shifts
    // 1082 is the OID for DATE
    try {
      pgTypes.setTypeParser(1082, (val: string) => val);
    } catch (e: any) {
      // Non-fatal if this fails in some environments
      // eslint-disable-next-line no-console
      console.warn('Warning: could not set pg type parser for DATE:', e?.message ?? e);
    }
    // Prefer a full DATABASE_URL if provided (e.g., postgres://user:pass@host:port/db)
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      this._pool = new Pool({
        connectionString: databaseUrl,
        max: 10,
        idleTimeoutMillis: 60000,
        connectionTimeoutMillis: 10000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      });
    } else {
      this._pool = new Pool({
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        database: process.env.DATABASE_NAME || 'mental_health_db',
        user: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'admin',
        max: 10, // Reduced max connections to prevent pool exhaustion
        idleTimeoutMillis: 60000, // Increased to 60 seconds
        connectionTimeoutMillis: 10000, // Increased to 10 seconds
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      });
    }

    // Handle pool errors
    this._pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
    });

    // Try a quick test connection to provide an earlier, clearer error message
    (async () => {
      try {
        const client = await this.pool.connect();
        client.release();
        // eslint-disable-next-line no-console
        console.info('Database connection test succeeded');
      } catch (err: any) {
        // Provide helpful debug info (do not print password)
        // eslint-disable-next-line no-console
        console.error('Database connection test failed. Check your DATABASE_URL or DATABASE_* env vars.');
        // eslint-disable-next-line no-console
        console.error('Connection error:', err?.message || err);
      }
    })();
  }

  // Get a client from the pool
  async getClient() {
    return await this._pool.connect();
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
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  private static instance: DatabaseService | null = null;
  private isClosed = false;

  // Get singleton instance
  static getInstance() {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Close the pool
  async close() {
    if (!this.isClosed) {
      this.isClosed = true;
      await this.pool.end();
      DatabaseService.instance = null;
    }
  }

  // For testing purposes
  get pool(): Pool {
    return this._pool;
  }
}

export const db = new DatabaseService();
// Export pool instance for testing
export const { pool } = db;