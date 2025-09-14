import express from 'express';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// GET /api/users/profile
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Users profile endpoint - Coming soon!'
  });
});

export default router;
