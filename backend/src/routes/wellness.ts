import express from 'express';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// GET /api/wellness/mood
router.get('/mood', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Wellness endpoint - Coming soon! (Member 5 will implement this)'
  });
});

export default router;
