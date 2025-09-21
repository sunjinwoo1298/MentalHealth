#!/usr/bin/env python3
"""
Complete backend test script for mental health chatbot
Tests all endpoints and verifies Murf.ai + Gemini integration
"""

import requests
import json
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_URL = "http://localhost:5000"

def test_health():
    """Test the health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health test failed: {e}")
        return False

def test_tts_voices():
    """Test TTS voices endpoint"""
    print("\n🔍 Testing TTS voices endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/tts/voices")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Available voices: {len(data.get('voices', []))}")
        print(f"Response: {json.dumps(data, indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ TTS voices test failed: {e}")
        return False

def test_tts_generation():
    """Test TTS generation endpoint"""
    print("\n🔍 Testing TTS generation...")
    payload = {
        "text": "Hello, I'm here to support your mental health journey. सब कुछ ठीक हो जाएगा।",
        "voice_profile": "compassionate_female",
        "emotion_context": "supportive"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/tts/test", json=payload)
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"TTS Result: {json.dumps(data, indent=2)}")
        return response.status_code == 200 and data.get('success', False)
    except Exception as e:
        print(f"❌ TTS generation test failed: {e}")
        return False

def test_chat_endpoint():
    """Test the main chat endpoint"""
    print("\n🔍 Testing chat endpoint...")
    payload = {
        "message": "I'm feeling anxious about my upcoming exams. Can you help me?",
        "userId": "test_user_123",
        "voicePreference": "female"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/chat", json=payload)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        print(f"Chat Response Preview: {data.get('response', '')[:100]}...")
        print(f"TTS Provider: {data.get('tts', {}).get('provider', 'unknown')}")
        print(f"Emotion Context: {data.get('emotion_context', 'unknown')}")
        print(f"Voice Profile: {data.get('voice_profile', 'unknown')}")
        print(f"Fallback Mode: {data.get('fallback', False)}")
        
        # Full response for debugging
        print(f"\nFull Response: {json.dumps(data, indent=2)}")
        
        return response.status_code == 200 and 'response' in data
    except Exception as e:
        print(f"❌ Chat endpoint test failed: {e}")
        return False

def check_environment():
    """Check if API keys are properly configured"""
    print("🔍 Checking environment configuration...")
    
    gemini_key = os.getenv('GEMINI_API_KEY')
    murf_key = os.getenv('MURF_API_KEY')
    
    print(f"Gemini API Key: {'✅ Present' if gemini_key and gemini_key != 'your-gemini-api-key' else '❌ Missing or placeholder'}")
    print(f"Murf API Key: {'✅ Present' if murf_key else '❌ Missing'}")
    
    if gemini_key == 'your-gemini-api-key':
        print("⚠️  Gemini API key is still a placeholder!")
    
    return bool(gemini_key and murf_key)

def main():
    """Run all tests"""
    print("🚀 Starting complete backend test suite...\n")
    
    # Check environment first
    env_ok = check_environment()
    print()
    
    tests = [
        ("Health Check", test_health),
        ("TTS Voices", test_tts_voices),
        ("TTS Generation", test_tts_generation),
        ("Chat Endpoint", test_chat_endpoint)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print("="*50)
        success = test_func()
        results[test_name] = success
        print(f"{'✅' if success else '❌'} {test_name}: {'PASSED' if success else 'FAILED'}")
    
    print("\n" + "="*50)
    print("📊 TEST SUMMARY")
    print("="*50)
    
    for test_name, success in results.items():
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print(f"\nOverall: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")
    
    if not env_ok:
        print("\n⚠️  Environment Issues Detected:")
        print("1. Make sure your .env file has valid API keys")
        print("2. Get a real Gemini API key from Google AI Studio")
        print("3. Verify your Murf.ai API key is correct")

if __name__ == "__main__":
    main()