#!/usr/bin/env python3
"""
Browser Cache Audio Test - Python Implementation
Tests audio generation, browser cache simulation, and cleanup
"""

import requests
import json
import base64
import time
from datetime import datetime

class BrowserCacheAudioTest:
    def __init__(self):
        self.backend_url = "http://localhost:5010"
        self.test_results = []
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {level}: {message}"
        print(log_entry)
        self.test_results.append(log_entry)
        
    def test_backend_connection(self):
        """Test if backend is accessible"""
        self.log("🔍 Testing backend connection...")
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.log(f"✅ Backend online: {data.get('service', 'Unknown')}")
                return True
            else:
                self.log(f"❌ Backend returned status {response.status_code}")
                return False
        except Exception as e:
            self.log(f"❌ Backend connection failed: {e}")
            return False
    
    def test_audio_generation(self):
        """Test audio generation from TTS endpoint"""
        self.log("🎵 Testing audio generation...")
        
        test_payload = {
            "text": "This is a comprehensive test of our browser cache audio system. We will generate audio, simulate browser cache storage, and verify cleanup.",
            "voiceProfile": "compassionate_female", 
            "emotionContext": "supportive"
        }
        
        try:
            response = requests.post(
                f"{self.backend_url}/tts/test",
                json=test_payload,
                timeout=30
            )
            
            if response.status_code != 200:
                self.log(f"❌ TTS request failed with status {response.status_code}")
                return None
                
            data = response.json()
            
            if not data.get('success') or not data.get('tts_result'):
                self.log("❌ TTS response indicates failure")
                return None
                
            tts_data = data['tts_result']
            
            self.log(f"✅ Audio generated successfully:")
            self.log(f"   🎙️ Provider: {tts_data.get('provider', 'unknown')}")
            self.log(f"   🎭 Voice: {tts_data.get('voice_profile', 'unknown')}")
            self.log(f"   😊 Emotion: {tts_data.get('emotion_context', 'unknown')}")
            self.log(f"   ⏱️ Duration: {tts_data.get('duration_seconds', 0)}s")
            self.log(f"   📦 Base64 size: {len(tts_data.get('audio_base64', ''))} chars")
            
            return tts_data
            
        except Exception as e:
            self.log(f"❌ Audio generation failed: {e}")
            return None
    
    def test_base64_processing(self, tts_data):
        """Test base64 audio data processing (simulates browser behavior)"""
        self.log("📦 Testing base64 audio processing...")
        
        if not tts_data or not tts_data.get('audio_base64'):
            self.log("❌ No audio base64 data to process")
            return False
            
        try:
            audio_base64 = tts_data['audio_base64']
            
            # Test base64 decoding (simulates browser atob())
            audio_bytes = base64.b64decode(audio_base64)
            self.log(f"✅ Base64 decoded successfully: {len(audio_bytes)} bytes")
            
            # Validate MP3 format
            if audio_bytes.startswith(b'ID3') or audio_bytes.startswith(b'\xff\xfb'):
                self.log("✅ Audio data is valid MP3 format")
            else:
                self.log("⚠️ Audio may not be MP3 format")
                self.log(f"   First 10 bytes: {audio_bytes[:10]}")
            
            # Test file writing (simulates browser blob creation)
            test_filename = f"cache_test_audio_{int(time.time())}.mp3"
            with open(test_filename, 'wb') as f:
                f.write(audio_bytes)
            self.log(f"✅ Audio blob simulated: {test_filename}")
            
            # Test file reading (simulates browser audio playback)
            with open(test_filename, 'rb') as f:
                read_bytes = f.read()
            
            if len(read_bytes) == len(audio_bytes):
                self.log("✅ Audio blob integrity verified")
            else:
                self.log("❌ Audio blob integrity check failed")
                return False
            
            # Cleanup test file (simulates browser cache cleanup)
            import os
            os.remove(test_filename)
            self.log("✅ Audio blob cleaned up successfully")
            
            # Verify cleanup worked
            if not os.path.exists(test_filename):
                self.log("✅ Confirmed: Audio blob removed from storage")
            else:
                self.log("❌ Cleanup failed: File still exists")
                return False
            
            return True
            
        except Exception as e:
            self.log(f"❌ Base64 processing failed: {e}")
            return False
    
    def test_voice_generation_quality(self):
        """Test different voice profiles and emotions"""
        self.log("🎤 Testing voice generation quality...")
        
        voice_tests = [
            {
                "voice": "compassionate_female",
                "emotion": "supportive", 
                "text": "I understand how you're feeling, and I want you to know that you're not alone."
            },
            {
                "voice": "empathetic_male",
                "emotion": "calming",
                "text": "Take a deep breath with me. Everything is going to be okay."
            },
            {
                "voice": "indian_female", 
                "emotion": "encouraging",
                "text": "You are stronger than you think. आप बहुत मजबूत हैं।"
            }
        ]
        
        successful_voices = 0
        
        for test in voice_tests:
            self.log(f"   Testing {test['voice']} with {test['emotion']} emotion...")
            
            try:
                response = requests.post(
                    f"{self.backend_url}/tts/test",
                    json={
                        "text": test['text'],
                        "voiceProfile": test['voice'],
                        "emotionContext": test['emotion']
                    },
                    timeout=20
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success') and data.get('tts_result'):
                        tts_result = data['tts_result']
                        duration = tts_result.get('duration_seconds', 0)
                        audio_size = len(tts_result.get('audio_base64', ''))
                        
                        self.log(f"   ✅ {test['voice']}: {duration}s, {audio_size} chars")
                        successful_voices += 1
                    else:
                        self.log(f"   ❌ {test['voice']}: TTS generation failed")
                else:
                    self.log(f"   ❌ {test['voice']}: HTTP {response.status_code}")
                    
            except Exception as e:
                self.log(f"   ❌ {test['voice']}: Exception - {e}")
        
        self.log(f"✅ Voice test results: {successful_voices}/{len(voice_tests)} voices working")
        return successful_voices == len(voice_tests)
    
    def test_chat_endpoint_audio(self):
        """Test the main chat endpoint with audio generation"""
        self.log("💬 Testing chat endpoint with audio...")
        
        try:
            response = requests.post(
                f"{self.backend_url}/chat",
                json={
                    "message": "I'm feeling really stressed about my upcoming exam. Can you help me?",
                    "userId": "cache-test-user",
                    "voice_preference": "compassionate_female"
                },
                timeout=20
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log(f"✅ Chat response received: {data.get('response', '')[:100]}...")
                
                if 'tts' in data and data['tts']:
                    tts_data = data['tts']
                    self.log(f"   🎙️ TTS provider: {tts_data.get('provider', 'unknown')}")
                    self.log(f"   ✅ TTS success: {tts_data.get('success', False)}")
                    
                    if 'audio_base64' in tts_data:
                        audio_size = len(tts_data['audio_base64'])
                        self.log(f"   📦 Audio data: {audio_size} chars")
                        return True
                    else:
                        self.log("   ❌ No audio base64 data in response")
                        return False
                else:
                    self.log("   ❌ No TTS data in chat response")
                    return False
            else:
                self.log(f"❌ Chat endpoint returned status {response.status_code}")
                return False
                
        except Exception as e:
            self.log(f"❌ Chat endpoint test failed: {e}")
            return False
    
    def run_comprehensive_test(self):
        """Run all tests and generate report"""
        self.log("🚀 Starting comprehensive browser cache audio test...")
        self.log("=" * 60)
        
        # Test 1: Backend connection
        backend_ok = self.test_backend_connection()
        if not backend_ok:
            self.log("❌ Test suite aborted: Backend not accessible")
            return False
        
        # Test 2: Audio generation
        tts_data = self.test_audio_generation()
        if not tts_data:
            self.log("❌ Test suite aborted: Audio generation failed")
            return False
        
        # Test 3: Base64 processing (browser cache simulation)
        cache_ok = self.test_base64_processing(tts_data)
        
        # Test 4: Voice quality
        voice_ok = self.test_voice_generation_quality()
        
        # Test 5: Chat endpoint
        chat_ok = self.test_chat_endpoint_audio()
        
        # Generate final report
        self.log("=" * 60)
        self.log("📋 COMPREHENSIVE TEST RESULTS:")
        self.log("=" * 60)
        self.log(f"✅ Backend Connection: {'PASS' if backend_ok else 'FAIL'}")
        self.log(f"✅ Audio Generation: {'PASS' if tts_data else 'FAIL'}")
        self.log(f"✅ Browser Cache Simulation: {'PASS' if cache_ok else 'FAIL'}")
        self.log(f"✅ Voice Generation Quality: {'PASS' if voice_ok else 'FAIL'}")
        self.log(f"✅ Chat Endpoint Audio: {'PASS' if chat_ok else 'FAIL'}")
        
        all_passed = all([backend_ok, tts_data, cache_ok, voice_ok, chat_ok])
        
        if all_passed:
            self.log("🎉 ALL TESTS PASSED! Browser cache audio system is working perfectly!")
        else:
            self.log("⚠️ Some tests failed. Check individual test results above.")
        
        return all_passed

if __name__ == "__main__":
    tester = BrowserCacheAudioTest()
    success = tester.run_comprehensive_test()
    
    print("\n" + "="*60)
    if success:
        print("🎊 BROWSER CACHE AUDIO SYSTEM: FULLY FUNCTIONAL! 🎊")
    else:
        print("⚠️ BROWSER CACHE AUDIO SYSTEM: ISSUES DETECTED ⚠️")
    print("="*60)