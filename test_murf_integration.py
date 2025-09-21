#!/usr/bin/env python3
"""
Test Murf.ai TTS Integration with Browser Cache Audio
"""

import os
import sys
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_murf_tts_integration():
    """Test the complete TTS flow with Murf.ai"""
    
    print("🧪 Testing Murf.ai TTS Integration")
    print("=" * 50)
    
    # Check if Murf API key is available
    murf_api_key = os.getenv('MURF_API_KEY')
    if not murf_api_key:
        print("❌ MURF_API_KEY not found in environment variables")
        print("💡 Please add your Murf.ai API key to .env file")
        return False
    
    print(f"✅ Murf API Key: {'*' * (len(murf_api_key) - 4)}{murf_api_key[-4:]}")
    
    # Test the chat endpoint
    try:
        print("\n🌐 Testing /chat endpoint with TTS...")
        
        # Prepare test payload
        payload = {
            "message": "Hello, I'm feeling a bit anxious today. Can you help me feel better?",
            "userId": "test-user-browser-cache",
            "voicePreference": "female"
        }
        
        # Send request to local backend
        response = requests.post(
            "http://localhost:5010/chat",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"✅ Chat Response: {data.get('response', 'No response')[:100]}...")
            
            # Check TTS data
            tts_data = data.get('tts')
            if tts_data:
                print(f"🎵 TTS Provider: {tts_data.get('provider')}")
                print(f"🎤 Voice Profile: {tts_data.get('voice_profile')}")
                print(f"😊 Emotion Context: {tts_data.get('emotion_context')}")
                print(f"⏱️ Duration: {tts_data.get('duration_seconds', 0):.1f}s")
                
                # Check base64 audio
                audio_base64 = tts_data.get('audio_base64')
                if audio_base64:
                    print(f"📊 Base64 Audio Size: {len(audio_base64) / 1024:.1f} KB")
                    print(f"🔍 Base64 Preview: {audio_base64[:50]}...")
                    print("✅ Murf.ai TTS working correctly with browser cache!")
                    return True
                else:
                    print("❌ No base64 audio data found")
                    return False
            else:
                print("❌ No TTS data in response")
                return False
        else:
            print(f"❌ Chat endpoint error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("💡 Make sure the backend is running on http://localhost:5010")
        return False
    except Exception as e:
        print(f"❌ Test error: {str(e)}")
        return False

def test_murf_service_directly():
    """Test Murf service directly"""
    try:
        print("\n🔧 Testing Murf service directly...")
        
        # Import the service
        sys.path.append('ai-services')
        from murf_tts_service import murf_tts_service
        
        # Test direct call
        result = murf_tts_service.generate_speech(
            text="This is a test of our mental health TTS system",
            voice_profile="compassionate_female",
            emotion_context="supportive",
            encode_base64=True
        )
        
        if result and result.get('success'):
            print("✅ Direct Murf service test passed!")
            print(f"🎵 Voice: {result.get('voice_profile')}")
            print(f"⏱️ Duration: {result.get('duration_seconds', 0):.1f}s")
            print(f"📊 Base64 size: {len(result.get('audio_base64', '')) / 1024:.1f} KB")
            return True
        else:
            print("❌ Direct Murf service test failed")
            return False
            
    except Exception as e:
        print(f"❌ Direct test error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🎤 Murf.ai TTS Integration Test")
    print("Testing browser cache audio implementation")
    print()
    
    # Test 1: Direct service test
    direct_success = test_murf_service_directly()
    
    # Test 2: Full integration test
    integration_success = test_murf_tts_integration()
    
    print("\n" + "=" * 50)
    if direct_success and integration_success:
        print("🎉 ALL TESTS PASSED!")
        print("✅ Murf.ai TTS is working correctly with browser cache")
        print("🎵 Voice responses will be delivered as base64 data")
        print("💾 No files will be stored on device")
    else:
        print("⚠️ Some tests failed:")
        print(f"   Direct service: {'✅' if direct_success else '❌'}")
        print(f"   Full integration: {'✅' if integration_success else '❌'}")