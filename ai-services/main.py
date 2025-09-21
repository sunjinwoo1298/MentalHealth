import sys
import json
import os
from dotenv import load_dotenv
import re
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from systemprompt import PROMPT
import requests
import time
from gtts import gTTS
import pygame
import io
import tempfile
import base64
from io import BytesIO

# Import enhanced Murf.ai TTS service
from murf_tts_service import murf_tts_service

# Load environment variables from parent directory
load_dotenv()  # Load from current directory first
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))  # Load from parent directory

# Initialize environment
gemini_api_key = os.environ.get("GEMINI_API_KEY", "")
murf_api_key = os.environ.get("MURF_API_KEY", "")

print(f"Debug: GEMINI_API_KEY found: {bool(gemini_api_key and gemini_api_key != 'your-gemini-api-key')}")
print(f"Debug: MURF_API_KEY found: {bool(murf_api_key)}")

# Only set the Gemini API key if it's valid (not placeholder)
if gemini_api_key and gemini_api_key != "your-gemini-api-key":
    os.environ["GOOGLE_API_KEY"] = gemini_api_key
else:
    print("Warning: Valid GEMINI_API_KEY not found, using fallback responses only")
    gemini_api_key = None

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# Initialize AI components with better error handling
try:
    if gemini_api_key and gemini_api_key != "your-gemini-api-key":
        geminiLlm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash", 
            temperature=0.7
        )
        print("✅ Gemini LLM initialized successfully")
    else:
        geminiLlm = None
        print("⚠️  Gemini LLM not initialized - using fallback responses")
except Exception as e:
    print(f"Warning: Could not initialize Gemini LLM: {e}")
    geminiLlm = None

# Global conversation history per user (simplified approach)
user_conversations = {}

def speak(text: str, lang: str = 'en'):
    """
    Convert text to speech and play it immediately using pygame.
    No FFmpeg required.

    Parameters:
    - text: str -> The text you want to speak
    - lang: str -> Language code (default is 'en')
    
    Usage:
    >>> speak("Hello, this is a test")
    """
    # Generate speech with gTTS
    tts = gTTS(text=text, lang=lang)

    # Save to a temporary file
    with tempfile.NamedTemporaryFile(delete=True, suffix=".mp3") as fp:
        tts.write_to_fp(fp)
        fp.seek(0)

        # Initialize pygame mixer
        pygame.mixer.init()
        pygame.mixer.music.load(fp.name)
        pygame.mixer.music.play()

        # Wait until audio finishes
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)


def generate_gtts_base64(text: str, lang: str = 'en') -> dict:
    """
    Generate gTTS audio and return as base64 data (no file saving).
    
    Parameters:
    - text: str -> The text to convert to speech
    - lang: str -> Language code (default is 'en')
    
    Returns:
    - dict: Result containing base64 audio data
    """
    try:
        # Generate speech with gTTS
        tts = gTTS(text=text, lang=lang)
        
        # Save to memory buffer
        audio_buffer = BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        
        # Convert to base64
        audio_base64 = base64.b64encode(audio_buffer.read()).decode('utf-8')
        
        return {
            'success': True,
            'audio_base64': audio_base64,
            'duration_seconds': 3.0,  # Estimated duration
            'provider': 'gtts'
        }
    except Exception as e:
        print(f"gTTS base64 generation error: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'provider': 'gtts'
        }


def enhanced_speak(text: str, voice_profile: str = "compassionate_female", emotion_context: str = "supportive") -> dict:
    """
    Enhanced text-to-speech using Murf.ai for natural, empathetic voice generation
    Optimized for mental health conversations with cultural sensitivity
    
    Parameters:
    - text: str -> The text to convert to speech
    - voice_profile: str -> Voice profile optimized for mental health (compassionate_female, empathetic_male, etc.)
    - emotion_context: str -> Emotional context (supportive, calming, encouraging, empathetic)
    
    Returns:
    - dict: Result containing audio data and metadata
    """
    try:
        # Use Murf.ai TTS service for high-quality, empathetic speech
        result = murf_tts_service.generate_speech(
            text=text,
            voice_profile=voice_profile,
            emotion_context=emotion_context,
            output_format="MP3",
            encode_base64=True
        )
        
        if result and result.get('success'):
            # Return base64 audio data directly (no local file saving)
            return {
                'success': True,
                'audio_base64': result.get('audio_base64'),
                'duration_seconds': result.get('duration_seconds'),
                'voice_profile': voice_profile,
                'emotion_context': emotion_context,
                'provider': 'murf_ai'
            }
        else:
            # Fallback to gTTS if Murf.ai fails
            print("Murf.ai TTS failed, falling back to gTTS")
            gtts_result = generate_gtts_base64(text)
            if gtts_result.get('success'):
                return {
                    'success': True,
                    'audio_base64': gtts_result.get('audio_base64'),
                    'duration_seconds': gtts_result.get('duration_seconds'),
                    'voice_profile': 'gtts_fallback',
                    'emotion_context': emotion_context,
                    'provider': 'gtts',
                    'fallback': True
                }
            else:
                return {
                    'success': False,
                    'error': 'Both Murf.ai and gTTS failed',
                    'provider': 'none'
                }
            
    except Exception as e:
        print(f"Enhanced TTS error: {str(e)}")
        # Fallback to gTTS base64
        try:
            gtts_result = generate_gtts_base64(text)
            if gtts_result.get('success'):
                return {
                    'success': True,
                    'audio_base64': gtts_result.get('audio_base64'),
                    'duration_seconds': gtts_result.get('duration_seconds'),
                    'voice_profile': 'gtts_emergency',
                    'emotion_context': emotion_context,
                    'provider': 'gtts',
                    'fallback': True,
                    'error': str(e)
                }
        except:
            pass
        
        return {
            'success': False,
            'error': str(e),
            'provider': 'none'
        }


def determine_emotion_context(message_text: str) -> str:
    """
    Analyze user message to determine appropriate emotional context for TTS response
    
    Parameters:
    - message_text: str -> User's message text
    
    Returns:
    - str: Emotion context for voice generation
    """
    text_lower = message_text.lower()
    
    # Crisis/Emergency indicators
    crisis_keywords = ['suicide', 'kill myself', 'end it all', 'hurt myself', 'give up', 'hopeless']
    if any(keyword in text_lower for keyword in crisis_keywords):
        return 'empathetic'
    
    # Anxiety/Stress indicators  
    anxiety_keywords = ['anxious', 'worried', 'panic', 'stress', 'overwhelmed', 'nervous']
    if any(keyword in text_lower for keyword in anxiety_keywords):
        return 'calming'
    
    # Depression indicators
    depression_keywords = ['sad', 'depressed', 'down', 'lonely', 'empty', 'numb']
    if any(keyword in text_lower for keyword in depression_keywords):
        return 'supportive'
    
    # Positive/Progress indicators
    positive_keywords = ['better', 'good', 'happy', 'progress', 'improving', 'grateful']
    if any(keyword in text_lower for keyword in positive_keywords):
        return 'encouraging'
    
    # Default to supportive for general mental health conversations
    return 'supportive'


def select_voice_profile(user_preference: str = None, message_context: str = "") -> str:
    """
    Select appropriate voice profile based on user preference and message context
    
    Parameters:
    - user_preference: str -> User's preferred voice type
    - message_context: str -> Context of the conversation
    
    Returns:
    - str: Selected voice profile
    """
    # Available mental health optimized voices
    available_voices = [
        'compassionate_female',
        'empathetic_male', 
        'gentle_female',
        'supportive_male',
        'indian_female',
        'indian_male'
    ]
    
    # Check for user preference
    if user_preference and user_preference in available_voices:
        return user_preference
    
    # Default selection based on cultural context
    if any(hindi_word in message_context.lower() for hindi_word in ['namaste', 'hindi', 'indian', 'bharat']):
        return 'indian_female'  # Use Indian English voice for cultural relevance
    
    # Default to compassionate female voice for mental health conversations
    return 'compassionate_female'


def get_conversation_history(user_id):
    """Get conversation history for a specific user"""
    if user_id not in user_conversations:
        user_conversations[user_id] = []
    return user_conversations[user_id]

def add_to_conversation(user_id, human_message, ai_message):
    """Add messages to conversation history"""
    history = get_conversation_history(user_id)
    history.append(HumanMessage(content=human_message))
    history.append(AIMessage(content=ai_message))
    
    # Keep only last 20 messages to prevent context overflow
    if len(history) > 20:
        user_conversations[user_id] = history[-20:]

def create_conversation_prompt(user_id, current_message):
    """Create a conversation prompt with history and system instructions"""
    history = get_conversation_history(user_id)
    
    # Build the conversation context
    conversation_text = f"System Instructions: {PROMPT}\n\n"
    conversation_text += "Previous Conversation:\n"
    
    for msg in history[-10:]:  # Only include last 10 messages for context
        if isinstance(msg, HumanMessage):
            conversation_text += f"Human: {msg.content}\n"
        elif isinstance(msg, AIMessage):
            conversation_text += f"AI: {msg.content}\n"
    
    conversation_text += f"\nHuman: {current_message}\nAI: "
    return conversation_text

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy", 
        "service": "MindCare AI Service",
        "gemini_configured": bool(os.environ.get("GEMINI_API_KEY")),
        "timestamp": time.time()
    })

@app.route("/chat", methods=["POST"])
def chat():
    """Enhanced chat endpoint with Murf.ai TTS for empathetic conversations"""
    try:
        data = request.get_json()
        print("Received chat request:", data)
        
        message = data.get("message", "")
        user_id = data.get("userId", "anonymous")
        voice_preference = data.get("voicePreference")  # Optional user voice preference
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # Check if GEMINI_API_KEY is configured
        if not os.environ.get("GEMINI_API_KEY") or not geminiLlm:
            print("Warning: GEMINI_API_KEY not configured or LLM not initialized, using fallback response")
            fallback_responses = [
                "Everything will be okay. 🌟 I'm here to support you through whatever you're going through.",
                "I hear you, and I want you to know that your feelings are valid. Take a deep breath with me. 💙",
                "You're not alone in this. सब कुछ ठीक हो जाएगा (Everything will be fine). 🌈",
                "Thank you for sharing with me. Your courage to reach out shows how strong you are. ✨"
            ]
            import random
            selected_response = random.choice(fallback_responses)
            
            # Generate TTS for fallback response
            emotion_context = determine_emotion_context(message)
            voice_profile = select_voice_profile(voice_preference, message)
            tts_result = enhanced_speak(selected_response, voice_profile, emotion_context)
            
            return jsonify({
                "response": selected_response,
                "userId": user_id,
                "timestamp": time.time(),
                "fallback": True,
                "tts": tts_result
            })
        
        # Create conversation prompt with history
        conversation_prompt = create_conversation_prompt(user_id, message)
        
        # Get AI response using invoke method
        response = geminiLlm.invoke(conversation_prompt)
        
        # Extract the content from the response
        if hasattr(response, 'content'):
            ai_response = response.content
        else:
            ai_response = str(response)
        
        print(f"AI Response for user {user_id}:", ai_response)
        
        # Add to conversation history
        add_to_conversation(user_id, message, ai_response)
        
        # Format response: clean up any markdown formatting
        formatted_response = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", ai_response)
        formatted_response = formatted_response.replace("\\n", "\n")
        formatted_response = formatted_response.replace("\\*", "*")
        
        # Determine appropriate voice settings based on message context
        emotion_context = determine_emotion_context(message)
        voice_profile = select_voice_profile(voice_preference, message + " " + formatted_response)
        
        # Generate enhanced TTS with Murf.ai
        tts_result = enhanced_speak(formatted_response, voice_profile, emotion_context)
        
        print(f"TTS generated: provider={tts_result.get('provider')}, emotion={emotion_context}, voice={voice_profile}")
        
        return jsonify({
            "response": formatted_response,
            "userId": user_id,
            "timestamp": time.time(),
            "tts": tts_result,
            "emotion_context": emotion_context,
            "voice_profile": voice_profile
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Fallback response for any errors
        fallback_responses = [
            "Everything will be okay. 🌟 I'm here to support you through whatever you're going through.",
            "I hear you, and I want you to know that your feelings are valid. Take a deep breath with me. 💙",
            "You're not alone in this. Every challenge you face is making you stronger. सब कुछ ठीक हो जाएगा (Everything will be fine). 🌈"
        ]
        
        import random
        selected_response = random.choice(fallback_responses)
        
        # Generate TTS even for error responses
        try:
            emotion_context = determine_emotion_context(message if 'message' in locals() else "")
            voice_profile = select_voice_profile(None, "")
            tts_result = enhanced_speak(selected_response, voice_profile, emotion_context)
        except:
            tts_result = {'success': False, 'error': 'TTS generation failed'}
        
        return jsonify({
            "response": selected_response,
            "userId": user_id if 'user_id' in locals() else "anonymous",
            "timestamp": time.time(),
            "error": "AI service temporarily unavailable, using fallback response",
            "tts": tts_result
        }), 200  # Return 200 to avoid frontend errors

@app.route("/clear_memory", methods=["POST"])
def clear_memory():
    """Clear conversation memory for a user"""
    try:
        data = request.get_json()
        user_id = data.get("userId", "anonymous")
        
        if user_id in user_conversations:
            del user_conversations[user_id]
            return jsonify({"status": "Memory cleared", "userId": user_id})
        else:
            return jsonify({"status": "No memory found", "userId": user_id})
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/tts/test", methods=["POST"])
def test_murf_tts():
    """Test endpoint for Murf.ai TTS functionality"""
    try:
        data = request.get_json()
        text = data.get("text", "Hello! This is a test of our enhanced mental health AI voice system.")
        voice_profile = data.get("voiceProfile", "compassionate_female")
        emotion_context = data.get("emotionContext", "supportive")
        
        print(f"Testing Murf TTS: text='{text[:50]}...', voice={voice_profile}, emotion={emotion_context}")
        
        # Test Murf service availability
        if murf_tts_service.test_service():
            # Generate speech with Murf.ai
            result = enhanced_speak(text, voice_profile, emotion_context)
            
            return jsonify({
                "success": True,
                "message": "Murf.ai TTS test completed",
                "tts_result": result,
                "available_voices": list(murf_tts_service.mental_health_voices.keys()),
                "available_emotions": ["supportive", "calming", "encouraging", "empathetic", "gentle", "neutral"]
            })
        else:
            return jsonify({
                "success": False,
                "message": "Murf.ai TTS service is not available",
                "fallback": "Using gTTS instead"
            }), 503
            
    except Exception as e:
        print(f"Error in TTS test: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "TTS test failed"
        }), 500


@app.route("/tts/voices", methods=["GET"])
def get_available_tts_voices():
    """Get list of available TTS voices and configurations"""
    try:
        return jsonify({
            "success": True,
            "mental_health_voices": murf_tts_service.mental_health_voices,
            "emotion_contexts": [
                "supportive", "calming", "encouraging", 
                "empathetic", "gentle", "neutral"
            ],
            "murf_api_configured": bool(os.environ.get("MURF_API_KEY")),
            "service_status": "available" if murf_tts_service.api_key else "api_key_missing"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/play_audio_test", methods=["POST"])
def play_audio_test():
    """Test endpoint to generate and immediately play audio using system player"""
    try:
        data = request.get_json()
        text = data.get("text", "Hello, this is a test of the enhanced TTS system.")
        
        print(f"🎵 Generating and playing audio for: {text}")
        
        # Generate TTS
        tts_result = enhanced_speak(text, "compassionate_female", "supportive")
        
        if tts_result.get('success') and tts_result.get('audio_filename'):
            audio_file = tts_result['audio_filename']
            
            # Try to play the audio file using system player
            try:
                import subprocess
                if os.name == 'nt':  # Windows
                    os.startfile(audio_file)
                else:  # Linux/Mac
                    subprocess.call(['xdg-open', audio_file])
                    
                print(f"🔊 Playing audio file: {audio_file}")
                
            except Exception as play_error:
                print(f"Could not auto-play audio: {play_error}")
            
            return jsonify({
                "success": True,
                "message": "Audio generated and playback attempted",
                "audio_file": audio_file,
                "tts_result": tts_result
            })
        else:
            return jsonify({
                "success": False,
                "message": "Failed to generate audio",
                "tts_result": tts_result
            }), 400
            
    except Exception as e:
        print(f"Error in play_audio_test: {str(e)}")
        return jsonify({"error": str(e)}), 500


# @app.route("/audio/<filename>", methods=["GET"])
# def serve_audio(filename):
#     """Serve generated audio files - DISABLED: Using base64 audio instead"""
#     # This endpoint is disabled since we now use base64 audio data
#     # instead of saving files to disk
#     return jsonify({"error": "Audio file serving disabled - using base64 audio"}), 404


if __name__ == "__main__":
    print("Starting MindCare AI Service with Enhanced TTS...")
    print(f"System Prompt configured: {bool(PROMPT)}")
    print(f"GEMINI_API_KEY configured: {bool(os.environ.get('GEMINI_API_KEY'))}")
    print(f"MURF_API_KEY configured: {bool(os.environ.get('MURF_API_KEY'))}")
    
    if not os.environ.get("GEMINI_API_KEY"):
        print("⚠️  WARNING: GEMINI_API_KEY not found in environment variables!")
        print("   The service will work with fallback responses, but AI functionality will be limited.")
        print("   Please add GEMINI_API_KEY to your .env file for full functionality.")
    
    if not os.environ.get("MURF_API_KEY"):
        print("⚠️  WARNING: MURF_API_KEY not found in environment variables!")
        print("   The service will fall back to gTTS for text-to-speech.")
        print("   Please add MURF_API_KEY to your .env file for enhanced voice quality.")
    else:
        print("✅ Murf.ai TTS service configured for enhanced mental health voices")
        # Test Murf service on startup
        if murf_tts_service.test_service():
            print("✅ Murf.ai TTS service test successful")
        else:
            print("❌ Murf.ai TTS service test failed - check API key and network connection")
    
    print("\n🎭 Available Mental Health Voice Profiles:")
    for voice_name, config in murf_tts_service.mental_health_voices.items():
        print(f"   • {voice_name}: {config['voice_id']} ({config['style']})")
    
    print("\n🎯 Available Emotion Contexts:")
    emotions = ["supportive", "calming", "encouraging", "empathetic", "gentle", "neutral"]
    print(f"   {', '.join(emotions)}")
    
    print(f"\n🚀 Server starting on port 5010...")
    print("📡 Endpoints:")
    print("   • POST /chat - Enhanced chat with Murf.ai TTS (browser cache audio)")
    print("   • POST /tts/test - Test TTS functionality")
    print("   • GET /tts/voices - Get available voices")
    print("   • GET /health - Health check")
    
    print("\n💾 Audio Storage:")
    print("   • Base64 audio data (no disk files)")
    print("   • Browser cache for temporary playback")
    print("   • Automatic cleanup after playback")
    print("   • No device storage usage")
    
    app.run(host='0.0.0.0', port=5010, debug=True)