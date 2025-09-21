import express from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Audio service configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5010';

// POST /api/audio/tts - Convert text to speech
router.post('/tts', authMiddleware, async (req, res) => {
  try {
    const { text, lang = 'auto' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    logger.info(`TTS request for text: ${text.substring(0, 50)}...`);

    // Forward request to AI service
    const response = await axios.post(`${AI_SERVICE_URL}/tts`, {
      text,
      lang
    }, {
      timeout: 30000, // 30 second timeout for audio generation
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return res.json(response.data);

  } catch (error) {
    logger.error('TTS request failed:', error);
    
    if (axios.isAxiosError(error)) {
      return res.status(500).json({
        success: false,
        error: 'TTS service unavailable'
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// GET /api/audio/:audioId - Serve audio file (no auth required for audio serving)
router.get('/:audioId', async (req, res) => {
  try {
    const { audioId } = req.params;

    if (!audioId) {
      return res.status(400).json({
        error: 'Audio ID is required'
      });
    }

    logger.info(`Audio file request: ${audioId}`);

    // Set CORS headers before making the request
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });

    // Forward request to AI service
    const response = await axios.get(`${AI_SERVICE_URL}/audio/${audioId}`, {
      responseType: 'stream',
      timeout: 15000
    });

    // Set audio-specific headers
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Accept-Ranges': 'bytes'
    });

    // Stream the audio file
    response.data.pipe(res);
    return; // Explicit return for streaming response

  } catch (error) {
    logger.error('Audio file request failed:', error);
    
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return res.status(404).json({
        error: 'Audio file not found'
      });
    } else {
      return res.status(500).json({
        error: 'Failed to serve audio file'
      });
    }
  }
});

// Handle preflight requests for audio files
router.options('/:audioId', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  });
  return res.status(200).end();
});

// GET /api/audio/cache/info - Get TTS cache information
router.get('/cache/info', authMiddleware, async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/tts/cache_info`, {
      timeout: 5000
    });

    return res.json(response.data);

  } catch (error) {
    logger.error('TTS cache info request failed:', error);
    return res.status(500).json({
      error: 'Failed to get cache information'
    });
  }
});

// POST /api/audio/cache/cleanup - Clean up TTS cache
router.post('/cache/cleanup', authMiddleware, async (req, res) => {
  try {
    const { maxAgeHours = 24 } = req.body;

    const response = await axios.post(`${AI_SERVICE_URL}/tts/cleanup`, {
      maxAgeHours
    }, {
      timeout: 10000
    });

    return res.json(response.data);

  } catch (error) {
    logger.error('TTS cache cleanup failed:', error);
    return res.status(500).json({
      error: 'Failed to cleanup cache'
    });
  }
});

export default router;
