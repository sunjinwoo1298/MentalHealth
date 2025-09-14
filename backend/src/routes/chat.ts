import express from 'express';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// POST /api/chat/message
router.post('/message', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Chat endpoint - Coming soon! (Member 1 will implement this)'
  });
});

export default router;
