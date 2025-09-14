import express, { Request, Response } from 'express';
import { AuthService } from '../services/auth';
import { authMiddleware } from '../middleware/auth';
import { 
  validateRequest, 
  registerValidation, 
  loginValidation, 
  profileValidation 
} from '../middleware/validation';
import { CreateUserRequest, LoginRequest, UserProfileRequest } from '../types/auth';

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerValidation, validateRequest, async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Registration attempt:', req.body.email);
    const userData: CreateUserRequest = req.body;
    const result = await AuthService.createUser(userData);
    
    if (result.success) {
      console.log('Registration successful for:', req.body.email);
      res.status(201).json(result);
    } else {
      console.log('Registration failed for:', req.body.email, 'Reason:', result.message);
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Registration error details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, validateRequest, async (req: Request, res: Response): Promise<void> => {
  try {
    const loginData: LoginRequest = req.body;
    const result = await AuthService.loginUser(loginData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
      return;
    }

    const result = await AuthService.refreshToken(refreshToken);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const user = await AuthService.findUserByEmail(req.user.email);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const { password_hash, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    // In a production app, you'd want to blacklist the token
    // For now, we'll just return success (client-side logout)
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/auth/profile
router.get('/profile', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const profile = await AuthService.getUserProfile(req.user.userId);
    
    res.status(200).json({
      success: true,
      data: { profile }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, profileValidation, validateRequest, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const profileData: UserProfileRequest = req.body;
    const updated = await AuthService.updateUserProfile(req.user.userId, profileData);
    
    if (updated) {
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'No updates provided'
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/auth/privacy-settings
router.get('/privacy-settings', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const settings = await AuthService.getPrivacySettings(req.user.userId);
    res.status(200).json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    console.error('Get privacy settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/auth/privacy-settings
router.put('/privacy-settings', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const updated = await AuthService.updatePrivacySettings(req.user.userId, req.body);
    
    if (updated) {
      res.status(200).json({
        success: true,
        message: 'Privacy settings updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update privacy settings'
      });
    }
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/auth/export-data
router.get('/export-data', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const userData = await AuthService.exportUserData(req.user.userId);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${req.user.userId}-${new Date().toISOString().split('T')[0]}.json"`);
    res.status(200).json(userData);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/auth/delete-account
router.delete('/delete-account', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const deleted = await AuthService.deleteUserAccount(req.user.userId);
    
    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete account'
      });
    }
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
