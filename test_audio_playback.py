import requests
import json

print("🎵 Testing audio generation and playback...")

# Test the new play_audio_test endpoint
response = requests.post("http://localhost:5010/play_audio_test", json={
    "text": "Hello! I'm your mental health companion. How are you feeling today?"
})

print(f"Status Code: {response.status_code}")
print("Response:")
print(json.dumps(response.json(), indent=2))

if response.status_code == 200:
    result = response.json()
    if result.get('audio_file'):
        print(f"\n✅ Audio file created: {result['audio_file']}")
        print("🔊 The audio should start playing automatically on Windows!")
    else:
        print("❌ No audio file was created")
else:
    print("❌ Request failed")