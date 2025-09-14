import express from 'express';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// GET /api/therapists
router.get('/', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Therapists endpoint - Coming soon!'
  });
});

export default router;
