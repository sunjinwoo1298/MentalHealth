#!/usr/bin/env python3
"""
Quick test script to verify the enhanced TTS endpoint works
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def test_enhanced_tts_endpoint():
    """Test the enhanced TTS endpoint in our Flask app"""
    
    # Test data
    test_cases = [
        {
            "text": "Hello, I'm here to support you today. How are you feeling?",
            "context": "general",
            "voiceType": "empathetic"
        },
        {
            "text": "Take a deep breath. Everything is going to be okay.",
            "context": "crisis", 
            "voiceType": "calming"
        },
        {
            "text": "You're doing amazing! I'm so proud of your progress.",
            "context": "celebration",
            "voiceType": "supportive"
        }
    ]
    
    ai_service_url = "http://localhost:5010"
    
    print("Testing Enhanced TTS Endpoint...")
    print("=" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest {i}: {test_case['context']} context")
        print(f"Text: {test_case['text'][:50]}...")
        print(f"Voice: {test_case['voiceType']}")
        
        try:
            response = requests.post(
                f"{ai_service_url}/tts/enhanced",
                json=test_case,
                timeout=60
            )
            
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ SUCCESS!")
                print(f"   TTS Provider: {data.get('ttsProvider', 'Unknown')}")
                print(f"   Audio ID: {data.get('audioId', 'Not provided')}")
                print(f"   Voice Type: {data.get('voiceType', 'Unknown')}")
                print(f"   Context: {data.get('context', 'Unknown')}")
                
                if data.get('fallback'):
                    print("   ⚠️ Note: Used fallback (gTTS)")
                else:
                    print("   🎵 Using Murf.ai enhanced voice!")
                    
            else:
                print("❌ FAILED!")
                print(f"   Error: {response.text[:200]}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection failed - AI service not running")
            print("   Start the service with: cd ai-services && python main.py")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("To start the AI service: cd ai-services && python main.py")
    print("Then test in the chat interface with the 🎵 button!")

if __name__ == "__main__":
    test_enhanced_tts_endpoint()