import { db } from './database';
import { AuthUtils } from '../utils/auth';
import { 
  User, 
  UserProfile, 
  CreateUserRequest, 
  LoginRequest, 
  AuthResponse,
  UserProfileRequest,
  PrivacySettings
} from '../types/auth';

export class AuthService {
  // Check if user exists by email
  static async findUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Database error');
    }
  }

  // Check if username exists
  static async findUserByUsername(username: string): Promise<User | null> {
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw new Error('Database error');
    }
  }

  // Create new user
  static async createUser(userData: CreateUserRequest): Promise<AuthResponse> {
    try {
      console.log('Creating user for email:', userData.email);
      
      // Check if user already exists
      const existingUser = await this.findUserByEmail(userData.email);
      if (existingUser) {
        console.log('User already exists:', userData.email);
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Check username uniqueness if provided
      if (userData.username) {
        const existingUsername = await this.findUserByUsername(userData.username);
        if (existingUsername) {
          console.log('Username already taken:', userData.username);
          return {
            success: false,
            message: 'Username is already taken'
          };
        }
      }

      console.log('Hashing password...');
      // Hash password
      const passwordHash = await AuthUtils.hashPassword(userData.password);

      // Encrypt sensitive data
      const encryptedData: any = {};
      if (userData.firstName) {
        encryptedData.first_name_encrypted = Buffer.from(db.encrypt(userData.firstName), 'hex');
      }
      if (userData.lastName) {
        encryptedData.last_name_encrypted = Buffer.from(db.encrypt(userData.lastName), 'hex');
      }
      if (userData.dateOfBirth) {
        encryptedData.date_of_birth_encrypted = Buffer.from(db.encrypt(userData.dateOfBirth), 'hex');
      }
      if (userData.phone) {
        encryptedData.phone_encrypted = Buffer.from(db.encrypt(userData.phone), 'hex');
      }
      if (userData.emergencyContact) {
        encryptedData.emergency_contact_encrypted = Buffer.from(db.encrypt(userData.emergencyContact), 'hex');
      }

      // Default privacy settings
      const defaultPrivacySettings: PrivacySettings = {
        shareData: false,
        analytics: false,
        emergencyContact: true,
        dataRetention: '2years',
        ...userData.privacySettings
      };

      console.log('Inserting user into database...');
      // Insert user into database
      const userResult = await db.query(`
        INSERT INTO users (
          email, password_hash, username, first_name_encrypted, last_name_encrypted,
          date_of_birth_encrypted, phone_encrypted, emergency_contact_encrypted,
          language_preference, timezone, privacy_settings, avatar_preference
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, email, username, language_preference, timezone, 
                 is_verified, is_active, privacy_settings, avatar_preference,
                 created_at, updated_at
      `, [
        userData.email,
        passwordHash,
        userData.username || null,
        encryptedData.first_name_encrypted || null,
        encryptedData.last_name_encrypted || null,
        encryptedData.date_of_birth_encrypted || null,
        encryptedData.phone_encrypted || null,
        encryptedData.emergency_contact_encrypted || null,
        userData.languagePreference || 'en',
        userData.timezone || 'Asia/Kolkata',
        JSON.stringify(defaultPrivacySettings),
        JSON.stringify({ type: 'default', customization: {} })
      ]);

      console.log('User inserted successfully:', userResult.rows[0]?.id);
      const newUser = userResult.rows[0];

      // Create user profile
      await db.query(`
        INSERT INTO user_profiles (user_id, risk_level)
        VALUES ($1, $2)
      `, [newUser.id, 'low']);

      // Generate tokens
      const tokenPayload = {
        userId: newUser.id,
        email: newUser.email
      };

      const token = AuthUtils.generateToken(tokenPayload);
      const refreshToken = AuthUtils.generateRefreshToken(tokenPayload);

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          user: newUser,
          token,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        }
      };

    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }

  // Login user
  static async loginUser(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await this.findUserByEmail(loginData.email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Check if user is active
      if (!user.is_active) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact support.'
        };
      }

      // Verify password
      const isPasswordValid = await AuthUtils.verifyPassword(loginData.password, user.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Update last login
      await db.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email
      };

      const token = AuthUtils.generateToken(tokenPayload);
      const refreshToken = AuthUtils.generateRefreshToken(tokenPayload);

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        }
      };

    } catch (error) {
      console.error('Error logging in user:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const result = await db.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error('Database error');
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, profileData: UserProfileRequest): Promise<boolean> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (profileData.mentalHealthGoals) {
        updates.push(`mental_health_goals = $${paramCount++}`);
        values.push(profileData.mentalHealthGoals);
      }

      if (profileData.stressTriggers) {
        updates.push(`stress_triggers = $${paramCount++}`);
        values.push(profileData.stressTriggers);
      }

      if (profileData.preferredCopingMethods) {
        updates.push(`preferred_coping_methods = $${paramCount++}`);
        values.push(profileData.preferredCopingMethods);
      }

      if (profileData.therapyHistory) {
        updates.push(`therapy_history_encrypted = $${paramCount++}`);
        values.push(Buffer.from(db.encrypt(profileData.therapyHistory), 'hex'));
      }

      if (profileData.medicationInfo) {
        updates.push(`medication_info_encrypted = $${paramCount++}`);
        values.push(Buffer.from(db.encrypt(profileData.medicationInfo), 'hex'));
      }

      if (profileData.crisisPlan) {
        updates.push(`crisis_plan_encrypted = $${paramCount++}`);
        values.push(Buffer.from(db.encrypt(profileData.crisisPlan), 'hex'));
      }

      if (profileData.supportNetwork) {
        updates.push(`support_network = $${paramCount++}`);
        values.push(JSON.stringify(profileData.supportNetwork));
      }

      if (profileData.wellnessPreferences) {
        updates.push(`wellness_preferences = $${paramCount++}`);
        values.push(JSON.stringify(profileData.wellnessPreferences));
      }

      if (updates.length === 0) {
        return false;
      }

      updates.push(`updated_at = NOW()`);
      values.push(userId);

      const query = `
        UPDATE user_profiles 
        SET ${updates.join(', ')}
        WHERE user_id = $${paramCount}
      `;

      await db.query(query, values);
      return true;

    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Database error');
    }
  }

  // Refresh token
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const decoded = AuthUtils.verifyRefreshToken(refreshToken);
      
      // Verify user still exists and is active
      const user = await this.findUserByEmail(decoded.email);
      if (!user || !user.is_active) {
        return {
          success: false,
          message: 'Invalid refresh token'
        };
      }

      // Generate new tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email
      };

      const newToken = AuthUtils.generateToken(tokenPayload);
      const newRefreshToken = AuthUtils.generateRefreshToken(tokenPayload);

      const { password_hash, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: userWithoutPassword,
          token: newToken,
          refreshToken: newRefreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'Invalid refresh token'
      };
    }
  }

  // Get privacy settings
  static async getPrivacySettings(userId: string): Promise<any> {
    try {
      const result = await db.query(
        'SELECT privacy_settings FROM users WHERE id = $1',
        [userId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      // Return default privacy settings if none exist
      return result.rows[0].privacy_settings || {
        dataSharing: {
          anonymousResearch: false,
          improvementAnalytics: true,
          thirdPartyIntegrations: false,
        },
        visibility: {
          profileVisibility: 'private',
          journalVisibility: 'private',
          progressSharing: false,
        },
        notifications: {
          reminderNotifications: true,
          supportNotifications: true,
          progressNotifications: true,
          crisisAlerts: true,
        },
        dataRetention: {
          autoDelete: false,
          retentionPeriod: 12,
        },
        encryption: {
          doubleEncryption: true,
          localStorageEncryption: true,
        }
      };
    } catch (error) {
      console.error('Error getting privacy settings:', error);
      throw new Error('Database error');
    }
  }

  // Update privacy settings
  static async updatePrivacySettings(userId: string, settings: any): Promise<boolean> {
    try {
      const result = await db.query(
        'UPDATE users SET privacy_settings = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [JSON.stringify(settings), userId]
      );
      
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw new Error('Database error');
    }
  }

  // Export user data
  static async exportUserData(userId: string): Promise<any> {
    try {
      // Get user info
      const userResult = await db.query(
        'SELECT id, email, username, language_preference, timezone, created_at, updated_at, privacy_settings FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Get user profile
      const profileResult = await db.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [userId]
      );

      // Get chat sessions (without sensitive content for privacy)
      const chatResult = await db.query(
        'SELECT id, title, created_at, updated_at FROM chat_sessions WHERE user_id = $1',
        [userId]
      );

      // Get mood entries
      const moodResult = await db.query(
        'SELECT mood_rating, notes, created_at FROM mood_entries WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      return {
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          languagePreference: user.language_preference,
          timezone: user.timezone,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          privacySettings: user.privacy_settings
        },
        profile: profileResult.rows[0] || null,
        chatSessions: chatResult.rows,
        moodEntries: moodResult.rows,
        disclaimer: 'This export contains your personal mental health data. Please handle with care and store securely.'
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw new Error('Database error');
    }
  }

  // Delete user account and all associated data
  static async deleteUserAccount(userId: string): Promise<boolean> {
    try {
      // Start transaction
      await db.query('BEGIN');

      // Delete in order to respect foreign key constraints
      await db.query('DELETE FROM mood_entries WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM journal_entries WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM crisis_interventions WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM ai_interactions WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM wellness_goals WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM user_therapist_connections WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM user_therapist_connections WHERE therapist_id = $1', [userId]);
      await db.query('DELETE FROM chat_messages WHERE chat_session_id IN (SELECT id FROM chat_sessions WHERE user_id = $1)', [userId]);
      await db.query('DELETE FROM chat_sessions WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM user_profiles WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM users WHERE id = $1', [userId]);

      // Commit transaction
      await db.query('COMMIT');
      
      return true;
    } catch (error) {
      // Rollback transaction on error
      await db.query('ROLLBACK');
      console.error('Error deleting user account:', error);
      throw new Error('Database error');
    }
  }
}