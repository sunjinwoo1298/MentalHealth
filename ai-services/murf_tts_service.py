"""
Murf.ai TTS Service for Mental Health AI Platform
Provides empathetic, natural voice generation for mental health conversations
"""

import os
import requests
import base64
import time
import logging
from typing import Dict, Optional, Any
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MurfTTSService:
    """Enhanced TTS service using Murf.ai for mental health conversations"""
    
    def __init__(self):
        """Initialize Murf.ai TTS service with mental health optimized voices"""
        load_dotenv()  # Load from current directory first
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))  # Load from parent directory
        
        self.api_key = os.environ.get("MURF_API_KEY", "")
        self.base_url = "https://api.murf.ai/v1"
        
        # Debug: Check if API key is loaded
        print(f"Debug: MURF_API_KEY loaded in service: {bool(self.api_key)}")
        if self.api_key:
            print(f"Debug: API key starts with: {self.api_key[:8]}...")
        
        # Mental health optimized voice profiles with emotional context
        self.mental_health_voices = {
            'compassionate_female': {
                'voice_id': 'en-US-natalie',
                'style': 'conversational',
                'speed': 0.9,
                'pitch': 0,
                'emotion': 'empathetic'
            },
            'empathetic_male': {
                'voice_id': 'en-US-terrell', 
                'style': 'conversational',
                'speed': 0.85,
                'pitch': -2,
                'emotion': 'supportive'
            },
            'gentle_female': {
                'voice_id': 'en-US-julia',
                'style': 'conversational', 
                'speed': 0.8,
                'pitch': 1,
                'emotion': 'calming'
            },
            'supportive_male': {
                'voice_id': 'en-US-wayne',
                'style': 'conversational',
                'speed': 0.9,
                'pitch': -1,
                'emotion': 'encouraging'
            },
            'caring_female': {
                'voice_id': 'en-US-carol',
                'style': 'conversational',
                'speed': 0.85,
                'pitch': 2,
                'emotion': 'gentle'
            },
            'warm_male': {
                'voice_id': 'en-US-clint',
                'style': 'conversational',
                'speed': 0.9,
                'pitch': 0,
                'emotion': 'neutral'
            }
        }
        
        # Emotion-based speech adjustments
        self.emotion_adjustments = {
            'supportive': {'speed': 0.9, 'pitch': 0, 'pause': 300},
            'calming': {'speed': 0.8, 'pitch': 1, 'pause': 400}, 
            'encouraging': {'speed': 0.95, 'pitch': 1, 'pause': 250},
            'empathetic': {'speed': 0.85, 'pitch': -1, 'pause': 350},
            'gentle': {'speed': 0.8, 'pitch': 2, 'pause': 400},
            'neutral': {'speed': 0.9, 'pitch': 0, 'pause': 300}
        }
    
    def test_service(self) -> bool:
        """Test if Murf.ai service is available and configured"""
        if not self.api_key:
            logger.warning("Murf API key not configured")
            return False
        
        try:
            # Test with a simple speech generation
            result = self.generate_speech(
                text="This is a test of the mental health voice system.",
                voice_profile="compassionate_female",
                emotion_context="supportive"
            )
            
            return result.get('success', False)
            
        except Exception as e:
            logger.error(f"Murf service test failed: {e}")
            return False
    
    def generate_speech(self, 
                       text: str, 
                       voice_profile: str = "compassionate_female",
                       emotion_context: str = "supportive",
                       output_format: str = "MP3",
                       encode_base64: bool = True) -> Dict[str, Any]:
        """
        Generate empathetic speech using Murf.ai optimized for mental health conversations
        
        Args:
            text: Text to convert to speech
            voice_profile: Mental health optimized voice profile
            emotion_context: Emotional context for speech adjustment
            output_format: Audio format (MP3, WAV)
            encode_base64: Whether to return base64 encoded audio
            
        Returns:
            Dict containing success status, audio data, and metadata
        """
        
        if not self.api_key:
            return {
                'success': False,
                'error': 'Murf API key not configured',
                'provider': 'murf_ai'
            }
        
        try:
            logger.info(f"Generating speech with Murf.ai: voice={voice_profile}, emotion={emotion_context}")
            
            # Get voice configuration
            voice_config = self.mental_health_voices.get(voice_profile, self.mental_health_voices['compassionate_female'])
            emotion_config = self.emotion_adjustments.get(emotion_context, self.emotion_adjustments['supportive'])
            
            # Prepare request headers for Murf.ai API
            headers = {
                'api-key': self.api_key,  # Murf.ai uses 'api-key' header, not 'Authorization'
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            # Murf.ai API v1 format - correct endpoint and payload structure
            payload = {
                'text': text,
                'voiceId': voice_config['voice_id'],
                'style': voice_config.get('style', 'conversational'),
                'speed': emotion_config['speed'],
                'pitch': emotion_config['pitch'],
                'audioFormat': output_format.upper(),
                'sampleRate': 24000,  # Valid sample rate for Murf.ai (8000, 16000, 24000, 44100, 48000)
                'pronunciationDictionary': {},
                'encodeAsBase64': encode_base64
            }
            
            logger.info(f"Making request to Murf API: POST {self.base_url}/speech/generate")
            
            # Make API request to Murf.ai - correct endpoint
            response = requests.post(
                f"{self.base_url}/speech/generate",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            logger.info(f"Murf API response status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    result_data = response.json()
                    logger.info(f"Murf API response keys: {list(result_data.keys())}")
                    
                    # Extract audio data from Murf.ai response
                    audio_base64 = None
                    duration_seconds = None
                    
                    if 'encodedAudio' in result_data:
                        audio_base64 = result_data['encodedAudio']
                    elif 'audioContent' in result_data:
                        audio_base64 = result_data['audioContent']
                    elif 'data' in result_data:
                        audio_base64 = result_data['data']
                    elif 'audio' in result_data:
                        audio_base64 = result_data['audio']
                    else:
                        # If response contains direct binary data
                        audio_data = response.content
                        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                    
                    # Get actual duration from Murf.ai response
                    if 'audioLengthInSeconds' in result_data:
                        duration_seconds = float(result_data['audioLengthInSeconds'])
                    else:
                        # Fallback duration calculation
                        duration_seconds = max(2.0, len(text) * 0.08)
                    
                    if not audio_base64:
                        return {
                            'success': False,
                            'error': 'No audio data found in Murf.ai response',
                            'provider': 'murf_ai',
                            'response_keys': list(result_data.keys())
                        }
                    
                    # Calculate duration (estimate based on text length)
                    estimated_duration = max(2.0, len(text) * 0.08)  # ~12.5 chars per second
                    
                    result = {
                        'success': True,
                        'provider': 'murf_ai',
                        'voice_profile': voice_profile,
                        'emotion_context': emotion_context,
                        'duration_seconds': duration_seconds,
                        'text_length': len(text),
                        'consumed_characters': result_data.get('consumedCharacterCount', len(text)),
                        'remaining_characters': result_data.get('remainingCharacterCount', 'unknown')
                    }
                    
                    if encode_base64:
                        result['audio_base64'] = audio_base64
                    else:
                        result['audio_data'] = base64.b64decode(audio_base64)
                    
                    logger.info(f"Speech generated successfully. Audio length: {duration_seconds:.6f}s")
                    return result
                    
                except Exception as parse_error:
                    logger.error(f"Error parsing Murf API response: {parse_error}")
                    logger.error(f"Response content: {response.text[:500]}")
                    return {
                        'success': False,
                        'error': f'Failed to parse API response: {str(parse_error)}',
                        'provider': 'murf_ai'
                    }
            else:
                error_msg = f"Murf API error: HTTP {response.status_code}"
                try:
                    error_data = response.json()
                    error_details = error_data.get('message') or error_data.get('error') or error_data.get('errorMessage', 'Unknown error')
                    error_msg += f" - {error_details}"
                    logger.error(f"Murf API error details: {error_data}")
                except:
                    error_msg += f" - {response.text[:200]}"
                    logger.error(f"Murf API raw error: {response.text}")
                
                return {
                    'success': False,
                    'error': error_msg,
                    'provider': 'murf_ai'
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': 'Murf API request timeout',
                'provider': 'murf_ai'
            }
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f'Network error: {str(e)}',
                'provider': 'murf_ai'
            }
        except Exception as e:
            logger.error(f"Unexpected error in Murf TTS: {e}")
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}',
                'provider': 'murf_ai'
            }
    
    def get_available_voices(self) -> Dict[str, Any]:
        """Get list of available mental health optimized voices"""
        return {
            'mental_health_voices': self.mental_health_voices,
            'emotion_contexts': list(self.emotion_adjustments.keys()),
            'api_configured': bool(self.api_key)
        }

# Create singleton instance
murf_tts_service = MurfTTSService()

# Test the service on module import
if __name__ == "__main__":
    logger.info("Testing Murf TTS service...")
    if murf_tts_service.test_service():
        logger.info("✅ Murf TTS service test successful")
    else:
        logger.warning("❌ Murf TTS service test failed")