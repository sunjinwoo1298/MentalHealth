import os
from dotenv import load_dotenv
from murf import Murf
from murf.core.api_error import ApiError

class MurfTTSService:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        load_dotenv('c:\\Users\\rohit\\Desktop\\mentalHealth\\.env')
        
        print("🔧 MurfTTSService initializing...")
        self.api_key = os.getenv('MURF_API_KEY')
        print(f"🔑 MURF_API_KEY found: {'Yes' if self.api_key else 'No'}")
        
        if not self.api_key:
            print("❌ Warning: MURF_API_KEY not found in environment variables")
            self.client = None
        else:
            print("✅ Initializing Murf client with API key")
            self.client = Murf(api_key=self.api_key)
    
    def generate_speech(self, text: str, voice_id: str = "en-US-natalie") -> dict:
        """
        Generate speech using Murf AI TTS
        
        Args:
            text (str): Text to convert to speech
            voice_id (str): Voice ID to use (default: en-US-natalie)
            
        Returns:
            dict: Response containing audio file URL or error message
        """
        print(f"🎤 Generating speech for text: '{text[:50]}{'...' if len(text) > 50 else ''}'")
        print(f"🗣️ Using voice: {voice_id}")
        
        if not self.client:
            print("❌ Murf client not initialized (API key missing)")
            return {
                'success': False,
                'error': 'Murf API key not configured',
                'message': 'MURF_API_KEY environment variable not set'
            }
        
        try:
            print("📡 Making request to Murf API...")
            response = self.client.text_to_speech.generate(
                text=text,
                voice_id=voice_id,
                format="MP3",
                sample_rate=44100.0
            )
            
            print("✅ Murf API response received successfully")
            print(f"🎵 Audio file URL: {response.audio_file}")
            print(f"⏱️ Audio length: {response.audio_length_in_seconds}s")
            
            return {
                'success': True,
                'audio_url': response.audio_file,
                'audio_length': response.audio_length_in_seconds,
                'remaining_characters': response.remaining_character_count
            }
            
        except ApiError as e:
            print(f"❌ Murf API error: {e.status_code} - {e.body}")
            return {
                'success': False,
                'error': f'Murf API error: {e.status_code}',
                'message': str(e.body)
            }
        except Exception as e:
            print(f"❌ Unexpected error: {str(e)}")
            return {
                'success': False,
                'error': 'Unexpected error',
                'message': str(e)
            }