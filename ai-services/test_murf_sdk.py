"""
Test script for the new Murf TTS service using official Python SDK
Run this after installing the murf package: pip install murf==2.1.0
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from murf_tts_service import MurfTTSService

def test_murf_tts():
    print("🧪 Testing Murf TTS Service with official SDK...")
    
    # Initialize service
    service = MurfTTSService()
    
    # Test text
    test_text = "Hello! I'm your mental health assistant. How are you feeling today?"
    
    # Generate speech
    result = service.generate_speech(test_text, voice_id="en-US-natalie")
    
    print("\n📋 Test Results:")
    print(f"Success: {result.get('success')}")
    if result.get('success'):
        print(f"Audio URL: {result.get('audio_url')}")
        print(f"Audio Length: {result.get('audio_length')}s")
        print(f"Remaining Characters: {result.get('remaining_characters')}")
    else:
        print(f"Error: {result.get('error')}")
        print(f"Message: {result.get('message')}")

if __name__ == "__main__":
    test_murf_tts()