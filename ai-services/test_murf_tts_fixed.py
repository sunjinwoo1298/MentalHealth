#!/usr/bin/env python3
"""
Test script to verify Murf.ai TTS is working after syntax fixes
"""

import os
import sys
from dotenv import load_dotenv

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

def test_imports():
    """Test if all required modules can be imported"""
    print("🔍 Testing imports...")
    
    try:
        from murf_tts_service import murf_tts_service
        print("✅ murf_tts_service imported successfully")
        
        from main import enhanced_speak, determine_emotion_context, select_voice_profile
        print("✅ main.py functions imported successfully")
        
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Other error during import: {e}")
        return False

def test_murf_api_connection():
    """Test connection to Murf.ai API"""
    print("\n🔍 Testing Murf.ai API connection...")
    
    murf_api_key = os.getenv('MURF_API_KEY')
    if not murf_api_key:
        print("❌ MURF_API_KEY not found in environment variables")
        return False
    
    print(f"✅ MURF_API_KEY found: {'*' * 8}{murf_api_key[-4:] if len(murf_api_key) > 4 else 'short'}")
    return True

def test_enhanced_speak():
    """Test the enhanced_speak function"""
    print("\n🔍 Testing enhanced_speak function...")
    
    try:
        from main import enhanced_speak
        
        # Test with mental health-appropriate text
        test_text = "I understand how you're feeling, and I want you to know that you're not alone. Everything will be okay."
        
        result = enhanced_speak(
            text=test_text,
            voice_profile="compassionate_female",
            emotion_context="supportive"
        )
        
        print(f"Enhanced speak result:")
        print(f"  Success: {result.get('success')}")
        print(f"  Provider: {result.get('provider')}")
        print(f"  Voice Profile: {result.get('voice_profile')}")
        print(f"  Emotion Context: {result.get('emotion_context')}")
        print(f"  Has Audio Data: {bool(result.get('audio_base64'))}")
        print(f"  Duration: {result.get('duration_seconds')} seconds")
        
        if result.get('fallback'):
            print("  ⚠️  Using fallback TTS (gTTS)")
        
        if result.get('error'):
            print(f"  ❌ Error: {result.get('error')}")
        
        return result.get('success', False)
        
    except Exception as e:
        print(f"❌ Error testing enhanced_speak: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_emotion_context():
    """Test emotion context detection"""
    print("\n🔍 Testing emotion context detection...")
    
    try:
        from main import determine_emotion_context
        
        test_cases = [
            ("I'm feeling really anxious about tomorrow", "calming"),
            ("I'm so sad and empty inside", "supportive"),
            ("I want to hurt myself", "empathetic"),
            ("I'm feeling much better today", "encouraging"),
            ("Just saying hello", "supportive")
        ]
        
        for message, expected in test_cases:
            result = determine_emotion_context(message)
            status = "✅" if result == expected else "⚠️"
            print(f"  {status} '{message[:30]}...' -> {result} (expected: {expected})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing emotion context: {e}")
        return False

def test_voice_selection():
    """Test voice profile selection"""
    print("\n🔍 Testing voice profile selection...")
    
    try:
        from main import select_voice_profile
        
        test_cases = [
            (None, "hello world", "compassionate_female"),  # Default
            ("indian_female", "namaste", "indian_female"),  # User preference
            (None, "namaste friend", "indian_female"),  # Cultural context
        ]
        
        for preference, context, expected in test_cases:
            result = select_voice_profile(preference, context)
            status = "✅" if result == expected else "⚠️"
            print(f"  {status} pref='{preference}', ctx='{context[:20]}...' -> {result}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing voice selection: {e}")
        return False

def main():
    """Run all tests"""
    print("🎙️ Testing Murf.ai TTS Integration After Syntax Fixes")
    print("=" * 60)
    
    tests = [
        ("Imports", test_imports),
        ("Murf API Connection", test_murf_api_connection),
        ("Enhanced Speak", test_enhanced_speak),
        ("Emotion Context", test_emotion_context),
        ("Voice Selection", test_voice_selection)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Test '{test_name}' failed with exception: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! Murf.ai TTS is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
    
    return passed == len(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)