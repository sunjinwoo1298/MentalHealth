"""
Test script for Murf.ai TTS integration in Mental Health AI Platform
"""

import os
import sys
import requests
import json
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our Murf TTS service
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ai-services'))
from murf_tts_service import murf_tts_service

def test_murf_service_directly():
    """Test Murf.ai service directly"""
    print("=" * 60)
    print("🧪 TESTING MURF.AI TTS SERVICE DIRECTLY")
    print("=" * 60)
    
    # Test messages for mental health context
    test_messages = [
        {
            "text": "Hello, I'm here to support you. Everything will be okay. You're not alone in this journey.",
            "voice": "compassionate_female",
            "emotion": "supportive"
        },
        {
            "text": "I understand you're feeling anxious. Let's take a deep breath together. सब कुछ ठीक हो जाएगा.",
            "voice": "indian_female", 
            "emotion": "calming"
        },
        {
            "text": "You've made great progress today. I'm proud of how you're handling this challenge.",
            "voice": "empathetic_male",
            "emotion": "encouraging"
        }
    ]
    
    for i, test_case in enumerate(test_messages, 1):
        print(f"\n📝 Test {i}: {test_case['emotion'].upper()} response")
        print(f"Voice: {test_case['voice']}")
        print(f"Text: {test_case['text'][:50]}...")
        
        start_time = time.time()
        result = murf_tts_service.generate_speech(
            text=test_case["text"],
            voice_profile=test_case["voice"],
            emotion_context=test_case["emotion"]
        )
        generation_time = time.time() - start_time
        
        if result and result.get('success'):
            print(f"✅ SUCCESS - Generated in {generation_time:.2f}s")
            print(f"   Duration: {result.get('duration_seconds', 'unknown')}s")
            print(f"   Audio format: {result.get('format', 'unknown')}")
            
            # Save audio file for testing
            if result.get('audio_base64'):
                filename = f"test_murf_{i}_{test_case['emotion']}.mp3"
                if murf_tts_service.save_audio_file(result['audio_base64'], filename):
                    print(f"   Saved: {filename}")
        else:
            print(f"❌ FAILED - No audio generated")
        
        print("-" * 40)

def test_api_endpoints():
    """Test the AI service API endpoints"""
    print("\n" + "=" * 60)
    print("🌐 TESTING API ENDPOINTS")
    print("=" * 60)
    
    base_url = "http://localhost:5010"
    
    # Test health endpoint
    print("\n🏥 Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed")
            print(f"   Service: {data.get('service')}")
            print(f"   Gemini configured: {data.get('gemini_configured')}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
    
    # Test TTS voices endpoint
    print("\n🎭 Testing TTS voices endpoint...")
    try:
        response = requests.get(f"{base_url}/tts/voices", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Voices endpoint working")
            print(f"   Available voices: {len(data.get('mental_health_voices', {}))}")
            print(f"   Murf API configured: {data.get('murf_api_configured')}")
        else:
            print(f"❌ Voices endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Voices endpoint error: {str(e)}")
    
    # Test TTS test endpoint
    print("\n🔊 Testing TTS test endpoint...")
    try:
        test_payload = {
            "text": "This is a test of our enhanced mental health TTS system using Murf.ai",
            "voiceProfile": "compassionate_female",
            "emotionContext": "supportive"
        }
        
        response = requests.post(
            f"{base_url}/tts/test",
            json=test_payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ TTS test passed")
            tts_result = data.get('tts_result', {})
            print(f"   Provider: {tts_result.get('provider', 'unknown')}")
            print(f"   Success: {tts_result.get('success', False)}")
        else:
            print(f"❌ TTS test failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ TTS test error: {str(e)}")
    
    # Test chat endpoint with TTS
    print("\n💬 Testing chat endpoint with enhanced TTS...")
    try:
        chat_payload = {
            "message": "I'm feeling really anxious about my upcoming exam",
            "userId": "test_user_123",
            "voicePreference": "indian_female"
        }
        
        response = requests.post(
            f"{base_url}/chat",
            json=chat_payload,
            timeout=45
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Chat endpoint working")
            print(f"   Response length: {len(data.get('response', ''))}")
            print(f"   Voice profile: {data.get('voice_profile')}")
            print(f"   Emotion context: {data.get('emotion_context')}")
            
            tts_data = data.get('tts', {})
            print(f"   TTS provider: {tts_data.get('provider')}")
            print(f"   TTS success: {tts_data.get('success')}")
        else:
            print(f"❌ Chat endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Chat endpoint error: {str(e)}")

def check_environment():
    """Check environment configuration"""
    print("=" * 60)
    print("🔧 ENVIRONMENT CONFIGURATION CHECK")
    print("=" * 60)
    
    env_vars = {
        "MURF_API_KEY": "Murf.ai API key for enhanced TTS",
        "GEMINI_API_KEY": "Google Gemini API key for AI responses"
    }
    
    all_configured = True
    
    for var_name, description in env_vars.items():
        value = os.getenv(var_name)
        if value:
            print(f"✅ {var_name}: Configured ({'*' * (len(value) - 8) + value[-8:]})")
        else:
            print(f"❌ {var_name}: Missing - {description}")
            all_configured = False
    
    print(f"\n📊 Configuration status: {'✅ READY' if all_configured else '⚠️  INCOMPLETE'}")
    
    return all_configured

def main():
    """Main test function"""
    print("🎭 MURF.AI TTS INTEGRATION TEST")
    print("Mental Health AI Platform - Enhanced Voice Generation")
    print("=" * 60)
    
    # Check environment first
    env_ok = check_environment()
    
    if not env_ok:
        print("\n⚠️  Environment not fully configured. Some tests may fail.")
        print("Please ensure MURF_API_KEY and GEMINI_API_KEY are set in your .env file.")
    
    # Test direct service
    if os.getenv("MURF_API_KEY"):
        test_murf_service_directly()
    else:
        print("\n⚠️  Skipping direct Murf service test - API key not configured")
    
    # Test API endpoints (requires server to be running)
    print("\n🌐 Testing API endpoints...")
    print("⚠️  Make sure the AI service is running (python main.py)")
    input("Press Enter to continue with API tests, or Ctrl+C to exit...")
    
    test_api_endpoints()
    
    print("\n" + "=" * 60)
    print("🎉 TEST COMPLETE!")
    print("=" * 60)
    print("\n📋 Next steps:")
    print("1. Review test results above")
    print("2. Check generated audio files (test_murf_*.mp3)")
    print("3. Ensure AI service is running for full functionality")
    print("4. Test with frontend chat interface")

if __name__ == "__main__":
    main()
