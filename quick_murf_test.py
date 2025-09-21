"""
Simple test script for Murf.ai API integration
"""

import os
import sys
import requests
from dotenv import load_dotenv

# Add the ai-services directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai-services'))

# Load environment variables
load_dotenv()

def test_murf_api_directly():
    """Test Murf.ai API directly without using our service class"""
    
    api_key = os.getenv('MURF_API_KEY')
    if not api_key:
        print("❌ MURF_API_KEY not found in environment")
        return False
    
    print(f"✅ MURF_API_KEY found: {api_key[:10]}...")
    
    # Test basic Murf.ai API call
    url = "https://api.murf.ai/v1/speech/generate"
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': api_key
    }
    
    payload = {
        'text': "Hello! This is a test of Murf.ai text to speech integration.",
        'voiceId': 'en-US-natalie',
        'format': 'MP3',
        'encodeAsBase64': True
    }
    
    try:
        print("🧪 Testing Murf.ai API directly...")
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Murf.ai API test successful!")
            print(f"   Audio length: {result.get('audioLengthInSeconds', 'unknown')}s")
            print(f"   Remaining characters: {result.get('remainingCharacterCount', 'unknown')}")
            
            # Save the audio file for verification
            if result.get('encodedAudio'):
                import base64
                audio_data = base64.b64decode(result['encodedAudio'])
                with open('murf_test_output.mp3', 'wb') as f:
                    f.write(audio_data)
                print("   Audio saved to: murf_test_output.mp3")
            
            return True
        else:
            print(f"❌ Murf.ai API test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Murf.ai API test error: {str(e)}")
        return False

def test_local_service():
    """Test our local AI service with TTS"""
    
    print("\n🌐 Testing local AI service...")
    
    # Test health endpoint
    try:
        response = requests.get("http://localhost:5010/health", timeout=10)
        if response.status_code == 200:
            print("✅ AI service is running")
        else:
            print(f"❌ AI service health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ AI service not reachable: {str(e)}")
        return False
    
    # Test TTS voices endpoint
    try:
        response = requests.get("http://localhost:5010/tts/voices", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ TTS voices endpoint working")
            print(f"   Murf API configured: {data.get('murf_api_configured')}")
        else:
            print(f"❌ TTS voices endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ TTS voices endpoint error: {str(e)}")
    
    # Test chat with TTS
    try:
        chat_data = {
            "message": "I'm feeling anxious and need support",
            "userId": "test_user_123", 
            "voicePreference": "compassionate_female"
        }
        
        response = requests.post(
            "http://localhost:5010/chat",
            json=chat_data,
            timeout=45
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Chat endpoint working")
            print(f"   Response: {data.get('response', 'No response')[:100]}...")
            
            tts_data = data.get('tts', {})
            print(f"   TTS Provider: {tts_data.get('provider', 'unknown')}")
            print(f"   TTS Success: {tts_data.get('success', False)}")
            
            if tts_data.get('provider') == 'murf_ai':
                print("🎉 Murf.ai TTS is working in chat!")
            else:
                print("⚠️  Using fallback TTS (gTTS)")
                
        else:
            print(f"❌ Chat endpoint failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Chat endpoint error: {str(e)}")

if __name__ == "__main__":
    print("🎭 MURF.AI INTEGRATION TEST")
    print("=" * 50)
    
    # Test 1: Direct API call
    murf_works = test_murf_api_directly()
    
    # Test 2: Local service integration
    test_local_service()
    
    print("\n" + "=" * 50)
    if murf_works:
        print("🎉 Murf.ai API is working! Your chatbot now has enhanced TTS.")
        print("\n📋 Next steps:")
        print("1. The enhanced TTS is integrated into your chat endpoint")
        print("2. Test with your frontend chat interface")
        print("3. Voice responses will be automatically generated for AI replies")
        print("4. Check the browser console for TTS data in chat responses")
    else:
        print("⚠️  Murf.ai API test failed. Check your API key and network connection.")
        print("The chatbot will use gTTS as fallback.")