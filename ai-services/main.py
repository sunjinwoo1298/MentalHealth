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
from context_prompts import get_context_prompt, get_available_contexts
import requests
import time
from datetime import datetime
from gtts import gTTS
import pygame
import io
try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    print("Warning: sentence_transformers not available. Vector similarity features will be disabled.")
    SentenceTransformer = None
    cosine_similarity = None
    SENTENCE_TRANSFORMERS_AVAILABLE = False
import tempfile
import base64
import random
import traceback
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

# Initialize embedding model for vector similarity
try:
    if SENTENCE_TRANSFORMERS_AVAILABLE and SentenceTransformer:
        embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ Embedding model initialized successfully")
    else:
        print("⚠️  SentenceTransformer not available - vector similarity features disabled")
        embedding_model = None
except Exception as e:
    print(f"Warning: Could not initialize embedding model: {e}")
    embedding_model = None

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


# Conversation context and emotional state tracking
user_conversation_context = {}
user_emotional_states = {}

# Vector database for conversation context (in-memory for now)
conversation_vectors = {}
conversation_metadata = {}

# Proactive conversation starters based on emotional context - DEPRECATED
# These are now replaced by LLM-generated responses based on vector context
PROACTIVE_STARTERS = {
    'first_time': [
        "नमस्ते! Welcome to MindCare. I'm here to listen and support you. How has your heart been feeling today?",
        "Hello! I'm so glad you're here. Sometimes it takes courage to reach out. What's been on your mind lately?",
        "Welcome! I'm here to create a safe space for you. Would you like to share what brought you here today?"
    ],
    'returning_positive': [
        "It's wonderful to see you again! How are you feeling since our last conversation?",
        "Welcome back! I've been thinking about our previous chat. How have things been unfolding for you?",
        "Good to see you here again. What emotions have been visiting you since we last talked?"
    ],
    'returning_concerned': [
        "I'm glad you came back. I was thinking about what you shared before. How are you processing everything?",
        "It's really good that you're here again. How has your heart been since our last conversation?",
        "I'm here for you. After what you shared last time, I wanted to check in - how are you feeling right now?"
    ],
    'check_in': [
        "How are you feeling in this moment? Sometimes it helps to pause and notice what's happening inside.",
        "I'd love to hear what's been in your heart lately. What emotions have been present for you?",
        "Take a breath with me. What's been weighing on your mind or bringing you joy recently?"
    ]
}

def store_conversation_vector(user_id, message_text, ai_response, emotions, timestamp):
    """Store conversation in vector database for future context retrieval"""
    if not embedding_model or not SENTENCE_TRANSFORMERS_AVAILABLE:
        return
    
    try:
        # Create context string that includes both user message and AI response
        context_text = f"User: {message_text}\nAI: {ai_response}"
        
        # Generate embedding for the conversation context
        embedding = embedding_model.encode(context_text)
        
        # Create unique key for this conversation
        conversation_key = f"{user_id}_{int(timestamp)}"
        
        # Store in vector database
        if user_id not in conversation_vectors:
            conversation_vectors[user_id] = {}
            conversation_metadata[user_id] = {}
        
        conversation_vectors[user_id][conversation_key] = embedding
        conversation_metadata[user_id][conversation_key] = {
            'user_message': message_text,
            'ai_response': ai_response,
            'emotions': emotions,
            'timestamp': timestamp,
            'date': datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # Keep only last 50 conversations per user to manage memory
        if len(conversation_vectors[user_id]) > 50:
            # Remove oldest conversations
            sorted_keys = sorted(conversation_vectors[user_id].keys(), 
                               key=lambda x: conversation_metadata[user_id][x]['timestamp'])
            oldest_key = sorted_keys[0]
            del conversation_vectors[user_id][oldest_key]
            del conversation_metadata[user_id][oldest_key]
            
    except Exception as e:
        print(f"Error storing conversation vector: {e}")

def find_similar_conversations(user_id, query_text, top_k=3):
    """Find similar past conversations using vector similarity"""
    if not embedding_model or not SENTENCE_TRANSFORMERS_AVAILABLE or user_id not in conversation_vectors:
        return []
    
    try:
        # Generate embedding for query
        query_embedding = embedding_model.encode(query_text)
        
        # Get all conversation embeddings for this user
        user_vectors = conversation_vectors[user_id]
        user_metadata = conversation_metadata[user_id]
        
        if not user_vectors:
            return []
        
        # Calculate similarities
        similarities = []
        for conv_key, conv_embedding in user_vectors.items():
            similarity = cosine_similarity([query_embedding], [conv_embedding])[0][0]
            similarities.append((conv_key, similarity, user_metadata[conv_key]))
        
        # Sort by similarity and return top k
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        return similarities[:top_k]
        
    except Exception as e:
        print(f"Error finding similar conversations: {e}")
        return []

def generate_proactive_message_with_context(user_id, context_type, support_context='general'):
    """Generate intelligent proactive message using LLM and conversation context"""
    if not geminiLlm:
        # Fallback to simple proactive starters if LLM unavailable
        return generate_fallback_proactive_message(context_type, support_context)
    
    try:
        # Get recent conversation history
        recent_conversations = get_conversation_history(user_id)[-6:]  # Last 3 exchanges
        
        # Get emotional state history
        emotional_state = user_emotional_states.get(user_id, {})
        recent_emotions = emotional_state.get('emotion_history', [])[-3:]  # Last 3 emotional states
        
        # Get context-specific system prompt
        context_prompt = get_context_prompt(support_context)
        
        # Build context for proactive message generation
        context_prompt_text = f"""
You are a compassionate AI mental health companion in {support_context.upper()} SUPPORT mode.

{context_prompt}

Generate a proactive, caring message to check in with a user.

Context Type: {context_type}
Support Context: {support_context}
User ID: {user_id}

Recent Emotional Patterns:
"""
        
        # Add emotional context
        if recent_emotions:
            for emotion_entry in recent_emotions:
                emotions_str = ', '.join(emotion_entry.get('emotions', []))
                timestamp = datetime.fromtimestamp(emotion_entry.get('timestamp', time.time()))
                context_prompt_text += f"- {timestamp.strftime('%Y-%m-%d')}: {emotions_str}\n"
        else:
            context_prompt_text += "- No recent emotional data available\n"
        
        context_prompt_text += "\nRecent Conversation Context:\n"
        
        # Add recent conversation context
        if recent_conversations:
            for msg in recent_conversations[-4:]:  # Last 2 exchanges
                if isinstance(msg, HumanMessage):
                    context_prompt_text += f"User: {msg.content[:100]}...\n"
                elif isinstance(msg, AIMessage):
                    context_prompt_text += f"AI: {msg.content[:100]}...\n"
        else:
            context_prompt_text += "- This is a new conversation\n"
        
        # Find similar past conversations for additional context
        if recent_conversations:
            last_user_message = None
            for msg in reversed(recent_conversations):
                if isinstance(msg, HumanMessage):
                    last_user_message = msg.content
                    break
            
            if last_user_message:
                similar_convs = find_similar_conversations(user_id, last_user_message, top_k=2)
                if similar_convs:
                    context_prompt_text += "\nSimilar Past Conversations:\n"
                    for conv_key, similarity, metadata in similar_convs:
                        date = metadata['date']
                        user_msg = metadata['user_message'][:80]
                        context_prompt_text += f"- {date}: User said '{user_msg}...'\n"
        
        # Add context-specific guidance
        context_specific_guidance = {
            'academic': """
            For ACADEMIC SUPPORT, focus on:
            - Study stress, exam anxiety, career pressure
            - Academic performance and future concerns
            - Educational transitions and choices
            - Competition and comparison stress
            """,
            'family': """
            For FAMILY SUPPORT, focus on:
            - Family relationships and communication
            - Generational conflicts and expectations
            - Cultural and traditional pressures
            - Household dynamics and conflicts
            """,
            'general': """
            For GENERAL SUPPORT, focus on:
            - Overall emotional well-being
            - Life challenges and personal growth
            - Relationships and social connections
            - Mental health and self-care
            """
        }
        
        # Add proactive message generation instructions
        context_prompt_text += f"""

{context_specific_guidance.get(support_context, context_specific_guidance['general'])}

Please generate a proactive, empathetic message that:
1. Shows you remember and care about their previous conversations
2. Acknowledges their emotional journey if relevant
3. Invites them to share what's currently on their mind related to {support_context} support
4. Is culturally sensitive to Indian context
5. Is warm, non-intrusive, and supportive
6. Is 1-2 sentences maximum
7. Uses appropriate Hindi words naturally if it feels right (like namaste, dil, etc.)
8. Focuses specifically on {support_context}-related matters

Context-specific guidance:
- first_time: Welcome them to {support_context} support and create a safe space
- returning_positive: Acknowledge their growth in {support_context} area
- returning_concerned: Show gentle concern about {support_context} challenges
- check_in: Natural, caring check-in based on {support_context} patterns

Generate only the proactive message, nothing else:
"""
        
        # Generate the proactive message
        response = geminiLlm.invoke(context_prompt_text)
        
        if hasattr(response, 'content'):
            proactive_message = response.content.strip()
        else:
            proactive_message = str(response).strip()
        
        # Clean up the response
        proactive_message = proactive_message.replace('"', '').replace("'", "'")
        
        return proactive_message
        
    except Exception as e:
        print(f"Error generating proactive message with context: {e}")
        return generate_fallback_proactive_message(context_type, support_context)

def generate_fallback_proactive_message(context_type, support_context='general'):
    """Generate fallback proactive message when LLM is unavailable"""
    fallback_messages = {
        'general': {
            'first_time': "नमस्ते! Welcome to MindCare. I'm here to listen and support you. How are you feeling today? 🌟",
            'returning_positive': "It's wonderful to see you again! How have you been since we last talked? 💙",
            'returning_concerned': "I'm glad you're here. I've been thinking about you - how are you feeling right now? 🤗",
            'check_in': "How is your heart today? I'm here if you'd like to share what's on your mind. ✨"
        },
        'academic': {
            'first_time': "नमस्ते! Welcome to Academic Support. I understand the unique pressures students face - how has your academic journey been feeling lately? 📚✨",
            'returning_positive': "Great to see you back! How have your studies been progressing since we last talked? 🌟",
            'returning_concerned': "I'm here for you. Academic pressure can be overwhelming - how are you managing your studies and stress right now? 💙",
            'check_in': "How is your academic life treating you today? Any study stress or career thoughts you'd like to share? 📖"
        },
        'family': {
            'first_time': "नमस्ते! Welcome to Family Support. I know family relationships can be complex - how has your दिल (heart) been with family matters? 🏠💙",
            'returning_positive': "Good to see you again! How have things been with your family since our last conversation? 🌸",
            'returning_concerned': "I'm glad you're back. Family situations can be challenging - how are you feeling about things at home? 🤗",
            'check_in': "How are things in your family world today? Any relationship dynamics you'd like to talk through? 💕"
        }
    }
    
    context_messages = fallback_messages.get(support_context, fallback_messages['general'])
    return context_messages.get(context_type, context_messages['check_in'])

# Emotional awareness patterns
EMOTIONAL_PATTERNS = {
    'sadness': ['sad', 'down', 'depressed', 'empty', 'hopeless', 'low', 'upset', 'hurt'],
    'anxiety': ['anxious', 'worried', 'stressed', 'nervous', 'scared', 'afraid', 'panic', 'overwhelmed'],
    'anger': ['angry', 'mad', 'frustrated', 'annoyed', 'furious', 'irritated', 'rage'],
    'loneliness': ['lonely', 'alone', 'isolated', 'abandoned', 'disconnected'],
    'joy': ['happy', 'good', 'great', 'excited', 'wonderful', 'amazing', 'joyful'],
    'gratitude': ['grateful', 'thankful', 'blessed', 'appreciate'],
    'confusion': ['confused', 'lost', 'uncertain', 'unclear', 'mixed up'],
    'hope': ['hope', 'hopeful', 'optimistic', 'positive', 'better']
}

# Therapeutic response templates
THERAPEUTIC_RESPONSES = {
    'emotional_validation': [
        "I can really sense the {emotion} in your words. It takes courage to share these feelings.",
        "Thank you for trusting me with how you're feeling. Your {emotion} is completely valid.",
        "I hear you, and I want you to know that feeling {emotion} is okay. You're not alone in this."
    ],
    'gentle_probing': [
        "Can you tell me a bit more about what this {emotion} feels like for you?",
        "What do you think might be underneath this {emotion}?",
        "When did you first notice feeling this way?"
    ],
    'strength_recognition': [
        "I notice that even while feeling {emotion}, you chose to reach out. That shows real strength.",
        "It's remarkable that you're able to articulate these feelings so clearly.",
        "Your willingness to explore these emotions speaks to your inner wisdom."
    ],
    'positive_reframing': [
        "While this is difficult, I wonder what this experience might be teaching you about yourself?",
        "Sometimes our deepest struggles lead to our greatest growth. What have you learned so far?",
        "Even in this challenge, I can see your resilience. How have you been taking care of yourself?"
    ]
}


def get_conversation_history(user_id):
    """Get conversation history for a specific user"""
    if user_id not in user_conversations:
        user_conversations[user_id] = []
    return user_conversations[user_id]

def add_to_conversation(user_id, human_message, ai_message, emotions=None):
    """Add messages to conversation history and store in vector database"""
    history = get_conversation_history(user_id)
    history.append(HumanMessage(content=human_message))
    history.append(AIMessage(content=ai_message))
    
    # Store in vector database for future context retrieval
    store_conversation_vector(user_id, human_message, ai_message, emotions or [], time.time())
    
    # Keep only last 20 messages to prevent context overflow
    if len(history) > 20:
        user_conversations[user_id] = history[-20:]

def analyze_emotional_state(message_text, user_id):
    """Analyze emotional content of user message and update emotional state"""
    message_lower = message_text.lower()
    detected_emotions = []
    
    # Detect emotions based on keywords
    for emotion, keywords in EMOTIONAL_PATTERNS.items():
        for keyword in keywords:
            if keyword in message_lower:
                detected_emotions.append(emotion)
                break
    
    # Update user's emotional state
    if user_id not in user_emotional_states:
        user_emotional_states[user_id] = {
            'current_emotions': [],
            'emotion_history': [],
            'last_updated': time.time(),
            'conversation_count': 0
        }
    
    state = user_emotional_states[user_id]
    state['current_emotions'] = detected_emotions
    state['emotion_history'].append({
        'emotions': detected_emotions,
        'timestamp': time.time(),
        'message': message_text[:100]  # Store first 100 chars for context
    })
    state['last_updated'] = time.time()
    state['conversation_count'] += 1
    
    # Keep only last 10 emotional states
    if len(state['emotion_history']) > 10:
        state['emotion_history'] = state['emotion_history'][-10:]
    
    return detected_emotions

def generate_empathetic_response_prefix(emotions, user_id):
    """Generate an empathetic response prefix based on detected emotions"""
    if not emotions:
        return ""
    
    primary_emotion = emotions[0]  # Use the first detected emotion
    
    validation_responses = THERAPEUTIC_RESPONSES['emotional_validation']
    response = random.choice(validation_responses).format(emotion=primary_emotion)
    
    return f"{response} "

def should_use_proactive_starter(user_id):
    """Determine if we should use a proactive conversation starter"""
    if user_id not in user_conversation_context:
        user_conversation_context[user_id] = {
            'first_interaction': True,
            'last_interaction': time.time(),
            'total_messages': 0,
            'needs_check_in': False
        }
        return 'first_time'
    
    context = user_conversation_context[user_id]
    
    # Check if it's been a while since last interaction
    time_since_last = time.time() - context['last_interaction']
    
    # If first interaction
    if context['first_interaction']:
        context['first_interaction'] = False
        return 'first_time'
    
    # If returning after some time
    if time_since_last > 86400:  # 24 hours
        emotional_state = user_emotional_states.get(user_id, {})
        recent_emotions = emotional_state.get('current_emotions', [])
        
        # Check if user had concerning emotions in last session
        concerning_emotions = ['sadness', 'anxiety', 'loneliness', 'confusion']
        if any(emotion in concerning_emotions for emotion in recent_emotions):
            return 'returning_concerned'
        else:
            return 'returning_positive'
    
    return None

def enhance_conversation_with_therapeutic_elements(conversation_text, emotions, user_id, context='general'):
    """Enhance the conversation prompt with therapeutic guidance"""
    enhanced_prompt = conversation_text
    
    if emotions:
        primary_emotion = emotions[0]
        
        # Add context-specific therapeutic guidance
        context_guidance = {
            'academic': f"""
            Academic Support Context: The user is experiencing {primary_emotion} related to academic/educational matters. Please:
            1. Validate their academic stress as real and challenging in the Indian education system
            2. Ask about specific academic concerns (exams, career pressure, study stress)
            3. Offer study-life balance suggestions and stress management techniques
            4. Address academic perfectionism and comparison anxiety if relevant
            5. Encourage healthy academic habits while maintaining mental wellness
            6. Use student-friendly language and academic metaphors
            """,
            'family': f"""
            Family Support Context: The user is experiencing {primary_emotion} related to family/relationship matters. Please:
            1. Acknowledge the complexity of Indian family dynamics and their feelings
            2. Ask about specific family relationships or conflicts with sensitivity
            3. Offer communication strategies that respect cultural values
            4. Help balance individual needs with family harmony
            5. Address guilt, shame, or pressure related to family expectations
            6. Use family-friendly language and cultural understanding
            """,
            'general': f"""
            General Support Context: The user is experiencing {primary_emotion}. Please:
            1. Acknowledge this emotional state with empathy
            2. Ask a gentle follow-up question to understand deeper
            3. Offer a strength-based perspective if appropriate
            4. Guide toward a small positive action or reflection
            5. End with an open-ended question that encourages further sharing
            """
        }
        
        # Add therapeutic guidance based on context and emotion
        therapeutic_guidance = context_guidance.get(context, context_guidance['general'])
        
        therapeutic_guidance += f"""
        
        Emotional Intelligence Notes:
        - Show that you notice and care about their emotional state
        - Use reflective listening phrases like "It sounds like..." or "I'm sensing..."
        - Validate their experience before offering any guidance
        - Be patient and don't rush to "fix" their feelings
        - Consider the {context} context in all responses
        """
        
        enhanced_prompt += therapeutic_guidance
    
    return enhanced_prompt

def create_conversation_prompt(user_id, current_message, context='general'):
    """Create a conversation prompt with history, system instructions, emotional awareness, and vector context"""
    # Check for proactive conversation starters
    starter_type = should_use_proactive_starter(user_id)
    
    # Analyze emotional state of current message
    detected_emotions = analyze_emotional_state(current_message, user_id)
    
    # Update conversation context
    if user_id in user_conversation_context:
        user_conversation_context[user_id]['last_interaction'] = time.time()
        user_conversation_context[user_id]['total_messages'] += 1
        user_conversation_context[user_id]['support_context'] = context
    else:
        user_conversation_context[user_id] = {
            'last_interaction': time.time(),
            'total_messages': 1,
            'support_context': context,
            'first_interaction': False,
            'needs_check_in': False
        }
    
    history = get_conversation_history(user_id)
    
    # Find similar past conversations for additional context
    similar_conversations = find_similar_conversations(user_id, current_message, top_k=2)
    
    # Get context-specific system prompt
    context_prompt = get_context_prompt(context)
    
    # Build the conversation context with emotional intelligence and vector context
    conversation_text = f"System Instructions: {context_prompt}\n\n"
    
    # Add context information
    if context != 'general':
        conversation_text += f"Support Context: You are currently in {context.upper()} SUPPORT mode. Focus specifically on {context}-related challenges and solutions.\n\n"
    
    # Add emotional context if emotions detected
    if detected_emotions:
        conversation_text += f"Emotional Context: The user is expressing {', '.join(detected_emotions)}. Please respond with extra empathy and emotional awareness specific to {context} context.\n\n"
    
    # Add relevant similar conversations if found
    if similar_conversations:
        conversation_text += "Relevant Past Context (use to understand user patterns, but don't explicitly reference these unless very relevant):\n"
        for conv_key, similarity, metadata in similar_conversations:
            date = metadata['date']
            user_msg = metadata['user_message'][:80]
            emotions = ', '.join(metadata['emotions']) if metadata['emotions'] else 'neutral'
            conversation_text += f"- {date} (similarity: {similarity:.2f}): User mentioned '{user_msg}...' [emotions: {emotions}]\n"
        conversation_text += "\n"
    
    # Add conversation history
    conversation_text += "Previous Conversation:\n"
    
    for msg in history[-10:]:  # Only include last 10 messages for context
        if isinstance(msg, HumanMessage):
            conversation_text += f"Human: {msg.content}\n"
        elif isinstance(msg, AIMessage):
            conversation_text += f"AI: {msg.content}\n"
    
    # Enhance with therapeutic elements
    conversation_text = enhance_conversation_with_therapeutic_elements(
        conversation_text, detected_emotions, user_id, context
    )
    
    conversation_text += f"\nHuman: {current_message}\nAI: "
    
    # Add empathetic response prefix if emotions detected
    empathy_prefix = generate_empathetic_response_prefix(detected_emotions, user_id)
    if empathy_prefix:
        conversation_text += empathy_prefix
    
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
    try:
        data = request.get_json()
        print("Received chat request:", data)
        
        message = data.get("message", "")
        user_id = data.get("userId", "anonymous")
        support_context = data.get("context", "general")  # Add support_context
        voice_preference = data.get("voice_preference", None)  # Add voice_preference
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # Validate context
        available_contexts = get_available_contexts()
        if support_context not in available_contexts:
            support_context = "general"
        
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
            return jsonify({
                "response": random.choice(fallback_responses),
                "userId": user_id,
                "timestamp": time.time(),
                "context": support_context,
                "fallback": True
            })
        
        # Create conversation prompt with emotional intelligence and context
        conversation_prompt = create_conversation_prompt(user_id, message, support_context)
        
        # Analyze emotional state for this message (needed for conversation history)
        detected_emotions = analyze_emotional_state(message, user_id)
        
        # Get AI response using invoke method
        response = geminiLlm.invoke(conversation_prompt)
        
        # Extract the content from the response
        if hasattr(response, 'content'):
            ai_response = response.content
        else:
            ai_response = str(response)
        
        print(f"AI Response for user {user_id} in {support_context} context:", ai_response)
        
        # Add to conversation history with emotional context
        add_to_conversation(user_id, message, ai_response, detected_emotions)
        
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

@app.route("/proactive_chat", methods=["POST"])
def proactive_chat():
    """Endpoint for AI to initiate intelligent proactive conversations based on context"""
    try:
        data = request.get_json()
        user_id = data.get("userId", "anonymous")
        support_context = data.get("context", "general")  # New: support context
        
        # Validate context
        available_contexts = get_available_contexts()
        if support_context not in available_contexts:
            support_context = "general"
        
        # Determine appropriate proactive starter type
        starter_type = should_use_proactive_starter(user_id)
        
        if starter_type:
            # Generate intelligent proactive message using LLM and conversation context
            proactive_message = generate_proactive_message_with_context(user_id, starter_type, support_context)
            
            # Update conversation context
            if user_id not in user_conversation_context:
                user_conversation_context[user_id] = {
                    'first_interaction': False,
                    'last_interaction': time.time(),
                    'total_messages': 0,
                    'needs_check_in': False,
                    'support_context': support_context
                }
            else:
                user_conversation_context[user_id]['last_interaction'] = time.time()
                user_conversation_context[user_id]['support_context'] = support_context
            
            return jsonify({
                "proactive_message": proactive_message,
                "userId": user_id,
                "timestamp": time.time(),
                "starter_type": starter_type,
                "context": support_context,
                "context_aware": True,
                "message": f"Generated intelligent proactive message using {starter_type} context for {support_context} support"
            })
        else:
            return jsonify({
                "proactive_message": None,
                "userId": user_id,
                "timestamp": time.time(),
                "context": support_context,
                "message": "No proactive message needed at this time"
            })
            
    except Exception as e:
        print(f"Error in proactive chat endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Fallback to simple proactive message
        support_context = data.get("context", "general") if 'data' in locals() else "general"
        fallback_message = generate_fallback_proactive_message('check_in', support_context)
        return jsonify({
            "proactive_message": fallback_message,
            "userId": user_id,
            "timestamp": time.time(),
            "context": support_context,
            "error": "Using fallback proactive message",
            "context_aware": False
        })

@app.route("/emotional_status", methods=["GET"])
def get_emotional_status():
    """Get emotional status for a user"""
    try:
        user_id = request.args.get("userId", "anonymous")
        
        emotional_state = user_emotional_states.get(user_id, {
            'current_emotions': [],
            'emotion_history': [],
            'last_updated': None,
            'conversation_count': 0
        })
        
        return jsonify({
            "userId": user_id,
            "emotional_state": emotional_state,
            "timestamp": time.time()
        })
        
    except Exception as e:
        print(f"Error in emotional status endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/contexts", methods=["GET"])
def get_contexts():
    """Get available support contexts"""
    try:
        contexts = get_available_contexts()
        context_info = {
            'general': {
                'name': 'General Support',
                'description': 'Overall mental health and emotional wellness support',
                'icon': '💙',
                'color': '#3B82F6'
            },
            'academic': {
                'name': 'Academic Support', 
                'description': 'Study stress, exam anxiety, career guidance, and educational challenges',
                'icon': '📚',
                'color': '#10B981'
            },
            'family': {
                'name': 'Family Support',
                'description': 'Family relationships, communication, and household dynamics',
                'icon': '🏠',
                'color': '#F59E0B'
            }
        }
        
        return jsonify({
            "contexts": contexts,
            "context_info": context_info,
            "timestamp": time.time()
        })
        
    except Exception as e:
        print(f"Error in contexts endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/conversation_context", methods=["GET"])
def get_conversation_context():
    """Get conversation context and vector similarities for a user"""
    try:
        user_id = request.args.get("userId", "anonymous")
        query = request.args.get("query", "")
        
        context_data = {
            "userId": user_id,
            "conversation_count": len(conversation_vectors.get(user_id, {})),
            "emotional_state": user_emotional_states.get(user_id, {}),
            "conversation_context": user_conversation_context.get(user_id, {}),
            "similar_conversations": []
        }
        
        # If query provided, find similar conversations
        if query and user_id in conversation_vectors:
            similar_convs = find_similar_conversations(user_id, query, top_k=5)
            context_data["similar_conversations"] = [
                {
                    "similarity_score": float(similarity),
                    "conversation_date": metadata['date'],
                    "user_message": metadata['user_message'][:100],
                    "ai_response": metadata['ai_response'][:100],
                    "emotions": metadata['emotions']
                }
                for conv_key, similarity, metadata in similar_convs
            ]
        
        return jsonify(context_data)
        
    except Exception as e:
        print(f"Error in conversation context endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

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