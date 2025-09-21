"""
Murf.ai Text-to-Speech Service for Mental Health AI Platform
"""

import os
import requests
import base64
import logging
from typing import Optional, Dict, Any
from io import BytesIO
from dotenv import load_dotenv

# Load environment variables from both current and parent directory
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MurfTTSService:
    """
    Enhanced TTS service using Murf.ai API for high-quality, natural-sounding voices
    Perfect for mental health applications requiring empathetic and culturally sensitive speech
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Murf TTS service
        
        Args:
            api_key: Murf.ai API key (if not provided, will look for MURF_API_KEY env var)
        """
        self.api_key = api_key or os.getenv('MURF_API_KEY')
        self.base_url = "https://api.murf.ai/v1"
        
        if not self.api_key:
            logger.warning("MURF_API_KEY not found. TTS service will not function properly.")
            
        # Mental health optimized voice configurations
        self.mental_health_voices = {
            'compassionate_female': {
                'voice_id': 'en-US-natalie',
                'style': 'conversational',
                'pitch': -5,  # Slightly lower pitch for calming effect
                'rate': -10,  # Slower speech for better comprehension
                'variation': 2  # Natural variation
            },
            'empathetic_male': {
                'voice_id': 'en-US-terrell', 
                'style': 'conversational',
                'pitch': -3,
                'rate': -8,
                'variation': 2
            },
            'gentle_female': {
                'voice_id': 'en-US-julia',
                'style': 'conversational',
                'pitch': -7,
                'rate': -12,
                'variation': 1
            },
            'supportive_male': {
                'voice_id': 'en-US-wayne',
                'style': 'conversational', 
                'pitch': -5,
                'rate': -10,
                'variation': 2
            },
            # Alternative voices for variety
            'caring_female': {
                'voice_id': 'en-US-carol',
                'style': 'conversational',
                'pitch': -3,
                'rate': -8,
                'variation': 2
            },
            'warm_male': {
                'voice_id': 'en-US-clint',
                'style': 'conversational',
                'pitch': -4,
                'rate': -10,
                'variation': 2
            }
        }
        
        # Default voice for mental health conversations
        self.default_voice = 'compassionate_female'
        
    def get_available_voices(self) -> Dict[str, Any]:
        """
        Get list of available voices from Murf.ai
        
        Returns:
            Dictionary of available voices
        """
        try:
            headers = {
                'Accept': 'application/json',
                'api-key': self.api_key
            }
            
            response = requests.get(
                f"{self.base_url}/speech/voices",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to get voices: {response.status_code} - {response.text}")
                return {}
                
        except Exception as e:
            logger.error(f"Error fetching voices: {str(e)}")
            return {}
    
    def generate_speech(
        self,
        text: str,
        voice_profile: str = None,
        output_format: str = "MP3",
        sample_rate: int = 44100,
        encode_base64: bool = True,
        emotion_context: str = "neutral"
    ) -> Optional[Dict[str, Any]]:
        """
        Generate speech using Murf.ai API optimized for mental health conversations
        
        Args:
            text: Text to convert to speech
            voice_profile: Voice profile from mental_health_voices (default: compassionate_female)
            output_format: Audio format (MP3, WAV, FLAC)
            sample_rate: Audio sample rate (8000, 24000, 44100, 48000)
            encode_base64: Return audio as base64 string for immediate use
            emotion_context: Context for voice adjustment (supportive, calming, encouraging)
            
        Returns:
            Dictionary with audio data or None if failed
        """
        
        if not self.api_key:
            logger.error("No Murf API key available")
            return None
            
        if not text or not text.strip():
            logger.error("No text provided for speech generation")
            return None
            
        # Clean and prepare text for mental health context
        cleaned_text = self._prepare_mental_health_text(text)
        
        # Select voice profile
        voice_profile = voice_profile or self.default_voice
        if voice_profile not in self.mental_health_voices:
            logger.warning(f"Unknown voice profile '{voice_profile}', using default")
            voice_profile = self.default_voice
            
        voice_config = self.mental_health_voices[voice_profile]
        
        # Adjust voice parameters based on emotion context
        adjusted_config = self._adjust_for_emotion_context(voice_config.copy(), emotion_context)
        
        try:
            headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'api-key': self.api_key
            }
            
            payload = {
                'text': cleaned_text,
                'voiceId': adjusted_config['voice_id'],
                'format': output_format.upper(),
                'sampleRate': sample_rate,
                'channelType': 'STEREO',
                'modelVersion': 'GEN2',  # Use latest generation model
                'encodeAsBase64': encode_base64,
                'pitch': adjusted_config.get('pitch', 0),
                'rate': adjusted_config.get('rate', 0),
                'style': adjusted_config.get('style', 'conversational'),
                'variation': adjusted_config.get('variation', 1)
            }
            
            logger.info(f"Generating speech with Murf.ai: voice={voice_profile}, emotion={emotion_context}")
            
            response = requests.post(
                f"{self.base_url}/speech/generate",
                headers=headers,
                json=payload,
                timeout=30  # Allow time for audio generation
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Speech generated successfully. Audio length: {result.get('audioLengthInSeconds', 'unknown')}s")
                
                return {
                    'success': True,
                    'audio_url': result.get('audioFile'),
                    'audio_base64': result.get('encodedAudio'),
                    'duration_seconds': result.get('audioLengthInSeconds'),
                    'remaining_characters': result.get('remainingCharacterCount'),
                    'voice_profile': voice_profile,
                    'emotion_context': emotion_context,
                    'format': output_format.lower()
                }
            else:
                logger.error(f"Murf API error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.Timeout:
            logger.error("Murf API request timed out")
            return None
        except Exception as e:
            logger.error(f"Error generating speech with Murf: {str(e)}")
            return None
    
    def _prepare_mental_health_text(self, text: str) -> str:
        """
        Prepare text for mental health context, adding appropriate pauses and emphasis
        
        Args:
            text: Original text
            
        Returns:
            Text optimized for mental health TTS
        """
        # Remove excessive markdown formatting
        cleaned = text.replace('**', '').replace('*', '')
        
        # Add natural pauses for emotional impact
        emotional_keywords = [
            'feel', 'feeling', 'understand', 'here for you', 'support', 
            'okay', 'fine', 'better', 'help', 'listen', 'care'
        ]
        
        for keyword in emotional_keywords:
            if keyword in cleaned.lower():
                cleaned = cleaned.replace(keyword, f'{keyword} [pause 0.5s]')
                break  # Only add one pause per sentence
        
        # Add gentle pauses after periods for reflection
        cleaned = cleaned.replace('. ', '. [pause 0.8s] ')
        
        # Ensure Hindi/Sanskrit phrases are pronounced correctly
        hindi_pronunciations = {
            'सब कुछ ठीक हो जाएगा': '[pause 0.3s] Sab kuch theek ho jayega [pause 0.5s]',
            'नमस्ते': 'Namaste [pause 0.3s]'
        }
        
        for hindi, pronunciation in hindi_pronunciations.items():
            if hindi in cleaned:
                cleaned = cleaned.replace(hindi, pronunciation)
        
        return cleaned
    
    def _adjust_for_emotion_context(self, voice_config: Dict, emotion_context: str) -> Dict:
        """
        Adjust voice parameters based on emotional context
        
        Args:
            voice_config: Base voice configuration
            emotion_context: Emotional context (supportive, calming, encouraging, etc.)
            
        Returns:
            Adjusted voice configuration
        """
        adjustments = {
            'supportive': {'pitch': -2, 'rate': -5, 'variation': 2},
            'calming': {'pitch': -8, 'rate': -15, 'variation': 1},
            'encouraging': {'pitch': 2, 'rate': 0, 'variation': 3},
            'empathetic': {'pitch': -5, 'rate': -12, 'variation': 2},
            'gentle': {'pitch': -10, 'rate': -18, 'variation': 1},
            'neutral': {'pitch': 0, 'rate': 0, 'variation': 1}
        }
        
        if emotion_context in adjustments:
            adjustment = adjustments[emotion_context]
            voice_config['pitch'] = max(-50, min(50, voice_config.get('pitch', 0) + adjustment['pitch']))
            voice_config['rate'] = max(-50, min(50, voice_config.get('rate', 0) + adjustment['rate']))
            voice_config['variation'] = max(0, min(5, adjustment['variation']))
        
        return voice_config
    
    def save_audio_file(self, audio_base64: str, filename: str) -> bool:
        """
        Save base64 audio to file
        
        Args:
            audio_base64: Base64 encoded audio data
            filename: Output filename
            
        Returns:
            True if saved successfully, False otherwise
        """
        try:
            audio_data = base64.b64decode(audio_base64)
            with open(filename, 'wb') as f:
                f.write(audio_data)
            logger.info(f"Audio saved to {filename}")
            return True
        except Exception as e:
            logger.error(f"Error saving audio file: {str(e)}")
            return False
    
    def test_service(self) -> bool:
        """
        Test the Murf TTS service with a sample mental health message
        
        Returns:
            True if service is working, False otherwise
        """
        test_text = "Hello, I'm here to support you. Everything will be okay. You're not alone in this journey."
        
        result = self.generate_speech(
            text=test_text,
            voice_profile='compassionate_female',
            emotion_context='supportive'
        )
        
        if result and result.get('success'):
            logger.info("Murf TTS service test successful")
            return True
        else:
            logger.error("Murf TTS service test failed")
            return False

# Initialize global service instance
murf_tts_service = MurfTTSService()