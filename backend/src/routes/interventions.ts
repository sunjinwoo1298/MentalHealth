import express from 'express';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// POST /api/interventions/crisis
router.post('/crisis', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Interventions endpoint - Coming soon! (Member 4 will implement this)'
  });
});

export default router;
