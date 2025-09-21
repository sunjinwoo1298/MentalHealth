import requests
import json
import base64

def test_audio_generation():
    """Test if audio is properly generated from TTS data"""
    
    print("🎵 Testing Audio Generation from TTS Data")
    print("=" * 50)
    
    # Test TTS endpoint
    url = "http://localhost:5010/tts/test"
    payload = {
        "text": "Hello! This is a test of our mental health AI voice system. I hope you are feeling well today.",
        "voiceProfile": "compassionate_female",
        "emotionContext": "supportive"
    }
    
    try:
        print("📡 Sending TTS test request...")
        response = requests.post(url, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ TTS Response received successfully")
            
            # Check response structure
            print(f"📊 Response keys: {list(data.keys())}")
            
            if 'tts_result' in data:
                tts_data = data['tts_result']
                print(f"🎙️ TTS Provider: {tts_data.get('provider', 'unknown')}")
                print(f"🎭 Voice Profile: {tts_data.get('voice_profile', 'unknown')}")
                print(f"😊 Emotion Context: {tts_data.get('emotion_context', 'unknown')}")
                print(f"⏱️ Duration: {tts_data.get('duration_seconds', 0)} seconds")
                
                # Check audio data
                if 'audio_base64' in tts_data:
                    audio_b64 = tts_data['audio_base64']
                    print(f"🎵 Audio Base64 Length: {len(audio_b64)} characters")
                    
                    # Test if base64 is valid
                    try:
                        audio_bytes = base64.b64decode(audio_b64)
                        print(f"✅ Valid Base64 - Audio Size: {len(audio_bytes)} bytes")
                        
                        # Check if it's likely MP3 data
                        if audio_bytes[:3] == b'ID3' or audio_bytes[:2] == b'\xff\xfb':
                            print("✅ Audio data appears to be valid MP3 format")
                        else:
                            print("⚠️ Audio data may not be MP3 format")
                            print(f"First 10 bytes: {audio_bytes[:10]}")
                            
                        # Test writing to file (optional)
                        try:
                            with open('test_audio_output.mp3', 'wb') as f:
                                f.write(audio_bytes)
                            print("✅ Test audio file written successfully (test_audio_output.mp3)")
                        except Exception as e:
                            print(f"⚠️ Could not write test file: {e}")
                            
                    except Exception as e:
                        print(f"❌ Invalid Base64 data: {e}")
                else:
                    print("❌ No audio_base64 data found in response")
            else:
                print("❌ No tts_result found in response")
                
        else:
            print(f"❌ TTS test failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def test_chat_with_audio():
    """Test chat endpoint with audio generation"""
    
    print("\n💬 Testing Chat Endpoint with Audio")
    print("=" * 40)
    
    url = "http://localhost:5010/chat"
    payload = {
        "message": "I'm feeling really anxious about my upcoming exam",
        "userId": "test-user-123",
        "voice_preference": "compassionate_female"
    }
    
    try:
        print("📡 Sending chat message...")
        response = requests.post(url, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Chat response received")
            print(f"💬 AI Response: {data.get('response', '')[:100]}...")
            
            if 'tts' in data:
                tts_data = data['tts']
                print(f"🎙️ TTS Provider: {tts_data.get('provider', 'unknown')}")
                print(f"✅ TTS Success: {tts_data.get('success', False)}")
                
                if 'audio_base64' in tts_data:
                    print(f"🎵 Audio Base64 Length: {len(tts_data['audio_base64'])} characters")
                    print("✅ Audio data is present in chat response")
                else:
                    print("❌ No audio data in chat response")
            else:
                print("❌ No TTS data in chat response")
                
        else:
            print(f"❌ Chat failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Chat test error: {e}")

if __name__ == "__main__":
    test_audio_generation()
    test_chat_with_audio()
    print("\n🏁 Audio generation tests completed!")