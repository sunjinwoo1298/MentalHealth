const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

/**
 * Proxy audio endpoint to solve CORS issues with Murf AI audio URLs
 * Downloads audio from Murf's S3 and serves it from our domain
 */
router.post('/proxy-audio', async (req, res) => {
  try {
    const { originalUrl, fileName } = req.body;
    
    if (!originalUrl) {
      return res.status(400).json({ 
        error: 'originalUrl is required' 
      });
    }
    
    console.log('🔄 Proxying audio from:', originalUrl);
    
    // Fetch audio from Murf's S3 URL
    const audioResponse = await fetch(originalUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'MentalHealth-App/1.0',
      },
      timeout: 30000 // 30 second timeout
    });
    
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio: ${audioResponse.status} ${audioResponse.statusText}`);
    }
    
    // Get content type and size
    const contentType = audioResponse.headers.get('content-type') || 'audio/mpeg';
    const contentLength = audioResponse.headers.get('content-length');
    
    console.log('✅ Audio fetched successfully:', {
      contentType,
      contentLength: contentLength ? `${Math.round(parseInt(contentLength) / 1024)}KB` : 'unknown',
      fileName: fileName || 'audio.mp3'
    });
    
    // Set appropriate headers for audio streaming
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    
    // Set filename for download (optional)
    if (fileName) {
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    }
    
    // Stream the audio data directly to the response
    audioResponse.body.pipe(res);
    
  } catch (error) {
    console.error('❌ Audio proxy error:', error);
    
    res.status(500).json({
      error: 'Failed to proxy audio',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET endpoint for direct audio streaming (alternative approach)
 */
router.get('/proxy-audio/:audioId', async (req, res) => {
  try {
    const { audioId } = req.params;
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'url query parameter is required' 
      });
    }
    
    console.log(`🔄 Proxying audio (GET) for ${audioId}:`, url);
    
    // Fetch audio from original URL
    const audioResponse = await fetch(decodeURIComponent(url), {
      method: 'GET',
      headers: {
        'User-Agent': 'MentalHealth-App/1.0',
      },
      timeout: 30000
    });
    
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio: ${audioResponse.status} ${audioResponse.statusText}`);
    }
    
    // Get content type
    const contentType = audioResponse.headers.get('content-type') || 'audio/mpeg';
    const contentLength = audioResponse.headers.get('content-length');
    
    // Set headers for audio streaming
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    
    // Stream the audio
    audioResponse.body.pipe(res);
    
  } catch (error) {
    console.error('❌ Audio proxy (GET) error:', error);
    res.status(500).json({
      error: 'Failed to proxy audio',
      message: error.message
    });
  }
});

/**
 * OPTIONS handler for CORS preflight
 */
router.options('/proxy-audio', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

module.exports = router;