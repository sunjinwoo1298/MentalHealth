import sys
import json
import os
from dotenv import load_dotenv
import re
import random
import time
import numpy as np
import pickle
from datetime import datetime, timedelta
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_session import Session
from systemprompt import PROMPT
from context_prompts import get_context_prompt, get_available_contexts
from context_generator import generate_user_context, analyze_risk_level, get_context_with_preferences
from crisis_detection import analyze_crisis_indicators, generate_therapist_context, get_crisis_resources
from care_agent import AICareAgent
import requests
import time
from datetime import datetime, timedelta
import traceback

# Load environment variables from multiple possible locations
load_dotenv()  # Load from current directory
load_dotenv(dotenv_path='../.env')  # Load from parent directory (global .env)

# Debug: Print environment variable status
print("=== Environment Variable Debug ===")
print(f"Current working directory: {os.getcwd()}")
print(f"GEMINI_API_KEY configured: {bool(os.environ.get('GEMINI_API_KEY'))}")
print(f"MURF_API_KEY configured: {bool(os.environ.get('MURF_API_KEY'))}")
if os.environ.get('MURF_API_KEY'):
    # Only show first 10 characters for security
    murf_key = os.environ.get('MURF_API_KEY', '')
    print(f"MURF_API_KEY value (first 10 chars): {murf_key[:10]}...")
else:
    print("MURF_API_KEY: Not found!")
print("==================================")

# Import TTS service after environment variables are loaded
try:
    from murf_tts_service import MurfTTSService
    MURF_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Murf TTS not available - {e}")
    print("Please install: pip install murf==2.1.0")
    MurfTTSService = None
    MURF_AVAILABLE = False

# Initialize environment

# Initialize environment
os.environ["GOOGLE_API_KEY"] = os.environ.get("GEMINI_API_KEY")
app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# Configure session management
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
Session(app)

# Configure global constants
ANALYSIS_CACHE_TIME = 300  # 5 minutes
CLEANUP_INTERVAL = 86400 * 7  # 7 days
RATE_LIMIT_INTERVAL = 2  # 2 seconds between messages (much more reasonable for chat)
SESSION_CHECK_INTERVAL = 3600  # 1 hour between session checks

# Custom middleware for session management and rate limiting
@app.before_request
def pre_request_middleware():
    """Pre-request middleware for session checks and rate limiting"""
    try:
        # Skip middleware for specific endpoints
        if request.endpoint in ['health', 'static']:
            return None
        
        # 1. Session Restoration
        current_time = time.time()
        
        # Clean up old data periodically
        if current_time % SESSION_CHECK_INTERVAL < 1:  # Run roughly every hour
            cleanup_old_data()
        
        # 2. Rate Limiting
        if request.endpoint == 'chat':
            try:
                data = request.get_json()
                user_id = data.get('userId', 'anonymous')
                
                if rate_limit_check(user_id):
                    return jsonify({
                        'error': 'Rate limit exceeded',
                        'message': 'Please wait a moment before sending another message',
                        'retry_after': RATE_LIMIT_INTERVAL,
                        'timestamp': current_time
                    }), 429
                    
            except Exception as e:
                print(f"Error in rate limiting: {e}")
                # Continue processing if rate limit check fails
                
        # 3. Database Session Check
        check_and_restore_database_session()
        
        return None
        
    except Exception as e:
        print(f"Error in pre-request middleware: {e}")
        # Continue processing even if middleware fails
        return None

def check_and_restore_database_session():
    """Check and restore database session if needed"""
    try:
        current_time = time.time()
        
        # Restore vector database if needed
        if not conversation_vectors:
            try:
                restore_conversation_vectors()
            except Exception as e:
                print(f"Could not restore conversation vectors: {e}")
        
        # Restore conversation context if needed
        if not user_conversation_context:
            try:
                restore_conversation_context()
            except Exception as e:
                print(f"Could not restore conversation context: {e}")
                
    except Exception as e:
        print(f"Error checking database session: {e}")

def restore_conversation_vectors():
    """Restore conversation vectors from disk if available"""
    global conversation_vectors, conversation_metadata
    
    try:
        if os.path.exists('conversation_vectors.pkl'):
            with open('conversation_vectors.pkl', 'rb') as f:
                conversation_vectors = pickle.load(f)
                
        if os.path.exists('conversation_metadata.pkl'):
            with open('conversation_metadata.pkl', 'rb') as f:
                conversation_metadata = pickle.load(f)
                
        print("✅ Restored conversation vectors and metadata")
        
    except Exception as e:
        print(f"Error restoring conversation data: {e}")
        conversation_vectors = {}
        conversation_metadata = {}

def restore_conversation_context():
    """Restore conversation context from disk if available"""
    global user_conversation_context
    
    try:
        if os.path.exists('conversation_context.pkl'):
            with open('conversation_context.pkl', 'rb') as f:
                user_conversation_context = pickle.load(f)
                
        print("✅ Restored conversation context")
        
    except Exception as e:
        print(f"Error restoring conversation context: {e}")
        user_conversation_context = {}

# Performance monitoring
@app.before_request
def start_timer():
    g.start = time.time()

@app.after_request
def log_request(response):
    if hasattr(g, 'start'):
        elapsed = time.time() - g.start
        endpoint = request.endpoint or 'unknown'
        print(f"⏱️ {endpoint} completed in {elapsed:.2f}s")
    return response

# Data management utilities
def cleanup_user_data(user_id):
    """Clean up old user data"""
    try:
        if user_id in user_conversations:
            del user_conversations[user_id]
        if user_id in user_conversation_context:
            del user_conversation_context[user_id]
        if user_id in user_emotional_states:
            del user_emotional_states[user_id]
        if user_id in conversation_vectors:
            del conversation_vectors[user_id]
        if user_id in conversation_metadata:
            del conversation_metadata[user_id]
        print(f"🧹 Cleaned up data for user {user_id}")
    except Exception as e:
        print(f"Error cleaning up user data: {e}")

def cleanup_old_data():
    """Cleanup old user data periodically"""
    try:
        current_time = time.time()
        cleaned = 0
        for user_id in list(user_conversations.keys()):
            last_interaction = user_conversation_context.get(user_id, {}).get('last_interaction', 0)
            if current_time - last_interaction > CLEANUP_INTERVAL:
                cleanup_user_data(user_id)
                cleaned += 1
        if cleaned > 0:
            print(f"🧹 Cleaned up data for {cleaned} inactive users")
    except Exception as e:
        print(f"Error in cleanup: {e}")

def validate_response_format(response_data):
    """Validate and normalize response format"""
    required_fields = {
        'response': None,
        'userId': 'anonymous',
        'timestamp': time.time(),
        'emotional_context': [],
        'avatar_emotion': 'neutral',
        'emotion_intensity': 3,
        'conversation_count': 0,
        'context': 'general'
    }
    
    for field, default in required_fields.items():
        if field not in response_data:
            response_data[field] = default
            
    return response_data

# Analysis caching
analysis_cache = {}
ANALYSIS_CACHE_TIME = 300  # 5 minutes
CLEANUP_INTERVAL = 86400 * 7  # 7 days
RATE_LIMIT_INTERVAL = 2  # 2 seconds between messages (reasonable for chat)

# Initialize AI components with simpler approach
geminiLlm = None
try:
    # Check if GEMINI_API_KEY is configured
    if os.environ.get("GEMINI_API_KEY"):
        geminiLlm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",  # Using stable model
            temperature=0.7,
            convert_system_message_to_human=False  # Disable deprecating feature
        )
        
        print("✅ Gemini LLM initialized successfully")
    else:
        print("⚠️ Warning: GEMINI_API_KEY not configured, LLM features will be limited")
except Exception as e:
    print(f"⚠️ Warning: Could not initialize Gemini LLM: {e}")
    geminiLlm = None

# Initialize embedding model for vector similarity
try:
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    
    try:
        care_agent = AICareAgent(llm=geminiLlm, embedding_model=embedding_model)
        print("✅ AI Care Agent initialized successfully")
    except Exception as e:
        print(f"⚠️ Warning: Could not initialize AI Care Agent: {e}")
        care_agent = None
    print("Embedding model initialized successfully")
except Exception as e:
    print(f"Warning: Could not initialize embedding model: {e}")
    embedding_model = None

# Initialize Murf TTS service
if MURF_AVAILABLE:
    try:
        murf_tts_service = MurfTTSService()
        print("Murf TTS service initialized successfully")
    except Exception as e:
        print(f"Warning: Could not initialize Murf TTS service: {e}")
        murf_tts_service = None
else:
    print("Murf TTS service not available - please install murf package")
    murf_tts_service = None

# Global conversation history per user (simplified approach)
user_conversations = {}

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
    if not embedding_model:
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
    if not embedding_model or user_id not in conversation_vectors:
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
    """Analyze emotional content of user message using Gemini AI and update emotional state"""
    try:
        # Use Gemini AI for sophisticated emotion detection
        if geminiLlm:
            emotion_prompt = f"""Analyze the emotional content of this message, returning a strict JSON response. Input: "{message_text}"

Return ONLY a single JSON object with EXACTLY this format:
{{"primary_emotion": "emotion_name", "secondary_emotions": ["emotion1", "emotion2"], "intensity": 3, "emotional_context": "brief description", "avatar_emotion": "neutral"}}

Primary/secondary emotions (use exactly): sadness, anxiety, anger, loneliness, joy, gratitude, confusion, hope, stress, fear, overwhelm, relief, pride, shame, guilt, love, excitement, calm, frustration, determination

Avatar_emotion field must be exactly one of: neutral, happy, sad, concerned, supportive, excited

Avatar emotion mapping:
- sadness/grief/despair → sad
- anxiety/stress/overwhelm → concerned  
- joy/gratitude/pride/love → happy
- hope/determination/relief → supportive
- excitement/enthusiasm → excited
- calm/peace/neutral → neutral

Analyze for: Indian youth cultural context, mental health support needs, subtle emotional cues
Response must be valid JSON - no explanation text, ONLY the JSON object."""

            try:
                import json  # Move import to top of function
                response = geminiLlm.invoke(emotion_prompt)
                emotion_content = response.content if hasattr(response, 'content') else str(response)
                
                # Parse JSON response
                emotion_data = json.loads(emotion_content.strip())
                
                detected_emotions = [emotion_data.get("primary_emotion", "neutral")]
                if emotion_data.get("secondary_emotions"):
                    detected_emotions.extend(emotion_data["secondary_emotions"][:2])  # Max 3 total
                
                # Store additional emotion analysis data
                emotion_analysis = {
                    'emotions': detected_emotions,
                    'intensity': emotion_data.get("intensity", 3),
                    'context': emotion_data.get("emotional_context", ""),
                    'avatar_emotion': emotion_data.get("avatar_emotion", "neutral"),
                    'timestamp': time.time(),
                    'message': message_text[:100]
                }
                
                print(f"🎭 Emotion Analysis for user {user_id}: {emotion_analysis}")
                
            except (json.JSONDecodeError, Exception) as e:
                print(f"Error parsing emotion analysis: {e}, falling back to keyword detection")
                detected_emotions = analyze_emotions_fallback(message_text)
                emotion_analysis = {
                    'emotions': detected_emotions,
                    'intensity': 3,
                    'context': 'fallback analysis',
                    'avatar_emotion': map_emotions_to_avatar(detected_emotions),
                    'timestamp': time.time(),
                    'message': message_text[:100]
                }
        else:
            # Fallback to keyword detection if Gemini not available
            detected_emotions = analyze_emotions_fallback(message_text)
            emotion_analysis = {
                'emotions': detected_emotions,
                'intensity': 3,
                'context': 'keyword-based fallback',
                'avatar_emotion': map_emotions_to_avatar(detected_emotions),
                'timestamp': time.time(),
                'message': message_text[:100]
            }
        
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
        state['current_analysis'] = emotion_analysis
        state['emotion_history'].append(emotion_analysis)
        state['last_updated'] = time.time()
        state['conversation_count'] += 1
        
        # Keep only last 10 emotional states
        if len(state['emotion_history']) > 10:
            state['emotion_history'] = state['emotion_history'][-10:]
        
        return detected_emotions
        
    except Exception as e:
        print(f"Error in emotion analysis: {e}")
        return ["neutral"]

def analyze_emotions_fallback(message_text):
    """Fallback keyword-based emotion detection"""
    message_lower = message_text.lower()
    detected_emotions = []
    
    # Detect emotions based on keywords
    for emotion, keywords in EMOTIONAL_PATTERNS.items():
        for keyword in keywords:
            if keyword in message_lower:
                detected_emotions.append(emotion)
                break
    
    return detected_emotions if detected_emotions else ["neutral"]

def map_emotions_to_avatar(emotions):
    """Map detected emotions to avatar animation states"""
    if not emotions:
        return "neutral"
    
    emotion_to_avatar = {
        'sadness': 'sad',
        'grief': 'sad', 
        'despair': 'sad',
        'anxiety': 'concerned',
        'stress': 'concerned',
        'overwhelm': 'concerned',
        'worry': 'concerned',
        'fear': 'concerned',
        'joy': 'happy',
        'gratitude': 'happy',
        'pride': 'happy',
        'love': 'happy',
        'excitement': 'excited',
        'enthusiasm': 'excited',
        'hope': 'supportive',
        'determination': 'supportive',
        'relief': 'supportive',
        'calm': 'neutral',
        'peace': 'neutral'
    }
    
    primary_emotion = emotions[0] if emotions else "neutral"
    return emotion_to_avatar.get(primary_emotion, "neutral")

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
            'needs_check_in': False,
            'support_context': 'general'
        }
        return 'first_time'
    
    context = user_conversation_context[user_id]
    # Ensure first_interaction exists
    if 'first_interaction' not in context:
        context['first_interaction'] = False
    
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
    """Create a conversation prompt with personalized context, history, emotional awareness"""
    from preference_mapping import get_style_modifiers, get_response_guidelines
    
    # Initialize user context if not exists
    if user_id not in user_conversation_context:
        user_conversation_context[user_id] = {
            'last_interaction': time.time(),
            'total_messages': 0,
            'support_context': context,
            'first_interaction': True,
            'needs_check_in': False
        }
    
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
    
    # Get personalized context if available or fallback to base context
    user_ctx = user_conversation_context.get(user_id, {})
    personalized_context = user_ctx.get('personalized_context')
    risk_level = user_ctx.get('risk_level', 'low')
    risk_factors = user_ctx.get('risk_factors', [])
    
    # Get style modifiers and response guidelines from preferences
    preferences = user_ctx.get('preferences', {})
    style_mods = get_style_modifiers(preferences)
    guidelines = get_response_guidelines(style_mods)
    
    if personalized_context:
        context_prompt = personalized_context
    else:
        context_prompt = get_context_prompt(context)
        
    # Add risk awareness if needed
    if risk_level != 'low':
        context_prompt += f"""
Risk Awareness Required:
- Current Risk Level: {risk_level}
- Risk Factors: {', '.join(risk_factors)}
- Maintain supportive, hope-focused dialogue
- Monitor for crisis signals
- Have support resources ready
"""
    
    # Build the conversation context with emotional intelligence and vector context
    conversation_text = f"System Instructions: {context_prompt}\n\n"
    
    # Add response guidelines based on preferences
    conversation_text += f"""
Response Guidelines:
- Tone: {guidelines['tone']}
- Emoji Usage: {'Use appropriately' if guidelines['use_emojis'] else 'Avoid'}
- Hindi Usage: {guidelines['hindi_usage']}
- Cultural Sensitivity: {guidelines['cultural_sensitivity']}
- Structure: {guidelines['structure_level']}
- Preferred Techniques: {', '.join(guidelines['preferred_techniques'])}

"""
    
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
    
    # Add empathetic response prefix if emotions detected and if style allows
    if detected_emotions and (guidelines['tone'] in ['warm and encouraging', 'friendly and conversational']):
        empathy_prefix = generate_empathetic_response_prefix(detected_emotions, user_id)
        if empathy_prefix:
            conversation_text += empathy_prefix
    
    return conversation_text

@app.route("/generate_user_context", methods=["POST"])
def create_user_context():
    """Generate personalized AI context from user's onboarding data"""
    try:
        data = request.get_json()
        user_id = data.get("userId", "anonymous")
        onboarding_data = data.get("onboardingData", {})
        
        if not onboarding_data:
            return jsonify({
                "success": False,
                "error": "Onboarding data is required"
            }), 400

        # Generate personalized context
        try:
            context = generate_user_context(onboarding_data)
            
            # Analyze risk level
            risk_analysis = analyze_risk_level(onboarding_data)
            
            # Store context and risk info
            user_conversation_context[user_id] = {
                'personalized_context': context,
                'risk_level': risk_analysis['level'],
                'risk_factors': risk_analysis['factors'],
                'requires_professional': risk_analysis['requiresProfessional'],
                'last_updated': time.time(),
                'first_interaction': True,
                'last_interaction': time.time(),
                'total_messages': 0,
                'needs_check_in': False,
                'support_context': onboarding_data.get('preferredSupportContext', 'general')
            }

            return jsonify({
                "success": True,
                "userId": user_id,
                "context": context,
                "riskAnalysis": risk_analysis,
                "timestamp": time.time()
            })

        except Exception as e:
            print(f"Error generating context: {e}")
            # Fallback to base context if generation fails
            fallback_context = get_context_with_preferences(onboarding_data)
            return jsonify({
                "success": True,
                "userId": user_id,
                "context": fallback_context,
                "fallback": True,
                "error": str(e),
                "timestamp": time.time()
            })

    except Exception as e:
        print(f"Error in generate_user_context endpoint: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy", 
        "service": "MindCare AI Service",
        "gemini_configured": bool(os.environ.get("GEMINI_API_KEY")),
        "timestamp": time.time()
    })

def rate_limit_check(user_id):
    """Check if user has exceeded rate limit"""
    if user_id not in user_conversation_context:
        return False
        
    last_interaction = user_conversation_context[user_id].get('last_interaction', 0)
    return (time.time() - last_interaction) < RATE_LIMIT_INTERVAL

def analyze_with_cache(message, user_id):
    """Analyze message with caching to improve performance"""
    cache_key = f"{user_id}_{message[:50]}"
    current_time = time.time()
    
    # Check cache first
    if cache_key in analysis_cache:
        cached_result = analysis_cache[cache_key]
        if current_time - cached_result['timestamp'] < ANALYSIS_CACHE_TIME:
            print(f"🎯 Cache hit for analysis of user {user_id}")
            return cached_result['result']
    
    # Perform analysis
    emotions = analyze_emotional_state(message, user_id)
    
    # Cache result
    analysis_cache[cache_key] = {
        'result': emotions,
        'timestamp': current_time
    }
    
    return emotions

@app.route("/chat", methods=["POST"])
def chat():
    """Enhanced chat endpoint with performance monitoring, rate limiting and error handling"""
    
    start_time = time.time()
    response_data = {
        'timestamp': start_time,
        'performance_metrics': {}
    }
    
    try:
        data = request.get_json()
        print("Received chat request:", data)
        
        message = data.get("message", "")
        user_id = data.get("userId", "anonymous")
        support_context = data.get("context", "general")  # New: support context
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        # Get conversation and emotion history
        conversation_history = get_conversation_history(user_id)
        emotional_state = user_emotional_states.get(user_id, {})
        emotion_history = emotional_state.get('emotion_history', [])
        
        # First check for crisis indicators using LLM
        print("🚨 Analyzing message for crisis indicators...")
        crisis_analysis = analyze_crisis_indicators(
            message=message,
            user_id=user_id,
            conversation_history=[
                {'content': msg.content, 'type': 'human' if isinstance(msg, HumanMessage) else 'ai'}
                for msg in conversation_history
            ],
            emotion_history=emotion_history,
            llm=geminiLlm  # Pass LLM instance
        )
        
        # If crisis detected, generate comprehensive therapist context
        if crisis_analysis['has_crisis_indicators']:
            print(f"⚠️ Crisis indicators detected for user {user_id}")
            print(f"Severity Level: {crisis_analysis['severity_level']}")
            
            therapist_context = generate_therapist_context(
                user_id=user_id,
                crisis_analysis=crisis_analysis,
                conversation_history=[
                    {'content': msg.content, 'type': 'human' if isinstance(msg, HumanMessage) else 'ai'}
                    for msg in conversation_history
                ],
                emotion_history=emotion_history,
                user_profile=user_conversation_context.get(user_id, {})
            )
            
            # Update conversation context with crisis information
            if user_id not in user_conversation_context:
                user_conversation_context[user_id] = {}
            
            # Update context with crisis information
            user_conversation_context[user_id].update({
                'last_interaction': time.time(),
                'total_messages': user_conversation_context.get(user_id, {}).get('total_messages', 0) + 1,
                'support_context': support_context,
                'crisis_analysis': crisis_analysis,
                'therapist_context': therapist_context,
                'crisis_resources': get_crisis_resources(crisis_analysis['severity_level']),
                'needs_professional_help': crisis_analysis['severity_level'] >= 3,
                'immediate_action_required': crisis_analysis['immediate_action_required']
            })
            
            # Run AI Care Agent analysis if available
            agent_analysis = None
            agent_intervention = None
            if care_agent:
                try:
                    # Get crisis history
                    crisis_history = [
                        ctx.get('crisis_analysis', {})
                        for ctx in user_conversation_context.get(user_id, {}).get('session_history', [])
                        if 'crisis_analysis' in ctx
                    ]
                    
                    # Analyze patterns
                    print("🤖 AI Care Agent analyzing patterns...")
                    agent_analysis = care_agent.analyze_user_patterns(
                        user_id=user_id,
                        conversation_history=[
                            {'content': msg.content, 'type': 'human' if isinstance(msg, HumanMessage) else 'ai'}
                            for msg in conversation_history
                        ],
                        emotion_history=emotion_history,
                        crisis_history=crisis_history
                    )
                    
                    # Track risk trends
                    risk_trends = care_agent.track_risk_trends(
                        user_id=user_id,
                        current_risk=crisis_analysis['severity_level']
                    )
                    
                    # Check if intervention needed
                    should_intervene, reason, urgency = care_agent.should_intervene(
                        user_id=user_id,
                        current_patterns=agent_analysis
                    )
                    
                    if should_intervene:
                        print(f"🤖 AI Care Agent generating intervention for {user_id}")
                        print(f"Reason: {reason}, Urgency: {urgency}")
                        
                        agent_intervention = care_agent.generate_intervention(
                            user_id=user_id,
                            intervention_reason=reason,
                            urgency_level=urgency,
                            context=support_context
                        )
                    
                    # Store in user context
                    user_conversation_context[user_id].update({
                        'agent_analysis': agent_analysis,
                        'risk_trends': risk_trends,
                        'agent_intervention': agent_intervention
                    })
                    
                except Exception as e:
                    print(f"Error in AI Care Agent analysis: {e}")
                    import traceback
                    traceback.print_exc()
        else:
            # Regular update without crisis
            if user_id not in user_conversation_context:
                user_conversation_context[user_id] = {
                    'total_messages': 1,
                    'support_context': support_context,
                    'first_interaction': True,
                    'last_interaction': time.time(),
                    'needs_check_in': False
                }
            else:
                user_conversation_context[user_id]['total_messages'] += 1
                user_conversation_context[user_id]['last_interaction'] = time.time()
        
        # Now analyze emotional state for ongoing emotional tracking
        detected_emotions = analyze_emotional_state(message, user_id)
        avatar_emotion = map_emotions_to_avatar(detected_emotions)
        
        # Validate context
        available_contexts = get_available_contexts()
        if support_context not in available_contexts:
            support_context = "general"
        
        # Check if GEMINI_API_KEY is configured
        if not os.environ.get("GEMINI_API_KEY") or not geminiLlm:
            print("Warning: GEMINI_API_KEY not configured or LLM not initialized, using fallback response")
            fallback_responses = {
                'general': [
                    "Everything will be okay. 🌟 I'm here to support you through whatever you're going through.",
                    "I hear you, and I want you to know that your feelings are valid. Take a deep breath with me. 💙",
                    "You're not alone in this. सब कुछ ठीक हो जाएगा (Everything will be fine). 🌈",
                    "Thank you for sharing with me. Your courage to reach out shows how strong you are. ✨"
                ],
                'academic': [
                    "Academic pressure can be overwhelming, but you're not alone in this journey. 📚💙",
                    "Your education is important, but so is your mental health. Take care of yourself. 🌟",
                    "Every student faces challenges. You have the strength to overcome this. पढ़ाई का stress होना normal है. ✨"
                ],
                'family': [
                    "Family relationships can be complex. Your feelings about this are completely valid. 🏠💙",
                    "I understand family dynamics can be challenging. You're doing your best. 🌸",
                    "Family matters touch our hearts deeply. Take time to process your emotions. 💕"
                ]
            }
            
            import random
            context_fallbacks = fallback_responses.get(support_context, fallback_responses['general'])
            return jsonify({
                "response": random.choice(context_fallbacks),
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
        
        # Get avatar emotion from emotional state
        user_state = user_emotional_states.get(user_id, {})
        current_analysis = user_state.get('current_analysis', {})
        avatar_emotion = current_analysis.get('avatar_emotion', 'neutral')
        emotion_intensity = current_analysis.get('intensity', 3)
        
        # Prepare crisis information for response if detected
        crisis_info = None
        if user_conversation_context.get(user_id, {}).get('crisis_analysis', {}).get('has_crisis_indicators', False):
            crisis_info = {
                'severity_level': crisis_analysis['severity_level'],
                'immediate_action_required': crisis_analysis['immediate_action_required'],
                'crisis_indicators': crisis_analysis['crisis_indicators'],
                'resources': user_conversation_context[user_id].get('crisis_resources', {}),
                'needs_professional_help': user_conversation_context[user_id].get('needs_professional_help', False)
            }

        return jsonify({
            "response": formatted_response,
            "userId": user_id,
            "timestamp": time.time(),
            "emotional_context": detected_emotions,
            "avatar_emotion": avatar_emotion,
            "emotion_intensity": emotion_intensity,
            "conversation_count": user_conversation_context.get(user_id, {}).get('total_messages', 0),
            "context": support_context,
            "crisis_info": crisis_info,  # Add crisis information if detected
            "has_crisis": bool(crisis_info),  # Flag for frontend to handle crisis UI
            
            # Add AI Care Agent information
            "agent_analysis": user_conversation_context.get(user_id, {}).get('agent_analysis'),
            "agent_intervention": user_conversation_context.get(user_id, {}).get('agent_intervention'),
            "risk_trends": user_conversation_context.get(user_id, {}).get('risk_trends'),
            "has_agent_intervention": bool(user_conversation_context.get(user_id, {}).get('agent_intervention'))
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        
        end_time = time.time()
        error_response = {
            "error": "AI service temporarily unavailable, using fallback response",
            "error_details": str(e),
            "timestamp": time.time(),
            "performance_metrics": {
                "total_time": end_time - start_time,
                "status": "error"
            }
        }
        
        try:
            # Attempt to get user_id from request data
            data = request.get_json()
            user_id = data.get("userId", "anonymous")
            message = data.get("message", "")
            support_context = data.get("context", "general")
            
            # Try to perform basic analysis even in error state
            detected_emotions = analyze_emotions_fallback(message)
            avatar_emotion = map_emotions_to_avatar(detected_emotions)
            
            # Get conversation count if context exists
            conv_count = user_conversation_context.get(user_id, {}).get('total_messages', 0)
            
            # Select appropriate fallback response based on support context
            fallback_responses = {
                'general': [
                    "Everything will be okay. 🌟 I'm here to support you through whatever you're going through.",
                    "I hear you, and I want you to know that your feelings are valid. Take a deep breath with me. 💙",
                    "You're not alone in this. Every challenge you face is making you stronger. सब कुछ ठीक हो जाएगा (Everything will be fine). 🌈"
                ],
                'academic': [
                    "I understand academic pressure can be overwhelming. Let's take this one step at a time. 📚💙",
                    "Your education matters, but your well-being matters more. We'll work through this together. 🌟",
                    "Every student faces challenges. You have the strength to overcome this. पढ़ाई का stress होना normal है. ✨"
                ],
                'family': [
                    "Family relationships can be complex. Your feelings about this are completely valid. 🏠💙",
                    "I understand family dynamics can be challenging. Take a moment to breathe. 🌸",
                    "Family matters touch our hearts deeply. You're not alone in navigating this. दिल की बात समझती हूँ। 💕"
                ]
            }
            
            context_responses = fallback_responses.get(support_context, fallback_responses['general'])
            import random
            response = random.choice(context_responses)
            
            error_response.update({
                "response": response,
                "userId": user_id,
                "emotional_context": detected_emotions,
                "avatar_emotion": avatar_emotion,
                "emotion_intensity": 3,  # Default intensity for fallback
                "conversation_count": conv_count,
                "context": support_context,
                
                # Always include agent-related fields
                "agent_analysis": None,
                "agent_intervention": None,
                "risk_trends": None,
                "has_agent_intervention": False,
                "has_crisis": False,
                "crisis_info": None
            })
            
        except Exception as inner_e:
            # If everything fails, return minimal error response
            print(f"Error in fallback handling: {inner_e}")
            error_response["response"] = "I'm here to support you. Let's try that again in a moment. 💙"
        
        # Always return 200 to avoid frontend errors
        return jsonify(error_response), 200

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
@app.route("/insight_report", methods=["GET"])
def get_insight_report():
    """Get weekly insight report for mental health professionals"""
    try:
        user_id = request.args.get("userId", "anonymous")
        
        if not care_agent:
            return jsonify({
                "error": "AI Care Agent not available",
                "userId": user_id,
                "timestamp": time.time()
            }), 200
            
        # Generate insight report
        insight_report = care_agent.generate_weekly_insight_report(user_id)
        
        if insight_report:
            return jsonify({
                "userId": user_id,
                "timestamp": time.time(),
                "report": insight_report,
                "success": True
            })
        else:
            return jsonify({
                "error": "Could not generate insight report",
                "userId": user_id,
                "timestamp": time.time(),
                "success": False
            }), 200
            
    except Exception as e:
        print(f"Error generating insight report: {e}")
        return jsonify({
            "error": str(e),
            "userId": user_id if 'user_id' in locals() else "anonymous",
            "timestamp": time.time(),
            "success": False
        }), 500

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

@app.route("/generate_speech", methods=["POST"])
def generate_speech():
    """Generate speech using Murf AI TTS service"""
    try:
        # Check if TTS service is available
        if not murf_tts_service or not murf_tts_service.client:
            error_msg = "Murf AI TTS service not available - API key not configured"
            print(f"❌ TTS Error: {error_msg}")
            return jsonify({
                "success": False,
                "audio_data": None,
                "audio_filename": None,
                "audio_url": None,
                "duration_seconds": 0,
                "voice_profile": "compassionate_female",
                "emotion_context": "supportive",
                "provider": "murf_ai",
                "error": error_msg,
                "fallback_message": "TTS service requires Murf API key configuration.",
                "userId": "anonymous",
                "timestamp": time.time()
            }), 200
        
        data = request.get_json()
        print("Received TTS request:", data)
        
        text = data.get("text", "")
        voice_profile = data.get("voice_profile", "compassionate_female")
        emotion_context = data.get("emotion_context")  # Optional, will auto-detect if not provided
        user_id = data.get("userId", "anonymous")
        
        if not text:
            return jsonify({"error": "Text is required for speech generation"}), 400
        
        # Limit text length to prevent long processing times
        if len(text) > 1000:
            text = text[:1000] + "..."
        
        print(f"Generating speech for user {user_id}: '{text[:50]}...' with voice profile: {voice_profile}")
        
        # Generate speech using Murf AI service
        result = murf_tts_service.generate_speech(
            text=text,
            voice_id="en-US-natalie"  # Default voice
        )
        
        # Add user ID and timestamp
        result['userId'] = user_id
        result['timestamp'] = time.time()
        result['text'] = text  # Include original text for reference
        
        # Add fields expected by frontend
        if result.get('success'):
            result['duration_seconds'] = result.get('audio_length', 0)
            result['voice_profile'] = voice_profile
            result['emotion_context'] = emotion_context or 'supportive'
            result['provider'] = 'murf_ai'
        
        # Log the result (without audio data for brevity)
        log_result = {k: v for k, v in result.items() if k != 'audio_data'}
        print(f"TTS result for user {user_id}:", log_result)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in generate_speech endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Return fallback response
        return jsonify({
            "success": False,
            "audio_data": None,
            "audio_filename": None,
            "audio_url": None,
            "duration_seconds": 0,
            "voice_profile": voice_profile if 'voice_profile' in locals() else 'compassionate_female',
            "emotion_context": "supportive",
            "provider": "murf_ai",
            "error": str(e),
            "fallback_message": "TTS service temporarily unavailable. Text response available.",
            "userId": user_id if 'user_id' in locals() else "anonymous",
            "timestamp": time.time()
        }), 200  # Return 200 to avoid breaking frontend

@app.route("/tts_status", methods=["GET"])
def tts_status():
    """Check TTS service status"""
    try:
        # Check if Murf TTS service is available
        if not murf_tts_service:
            return jsonify({
                "status": "error",
                "api_key_configured": False,
                "available_voices": [],
                "service": "Murf AI TTS",
                "error": "TTS service not initialized",
                "timestamp": time.time()
            })
        
        # Check if API key is configured (client will be None if no API key)
        api_key_configured = murf_tts_service.client is not None
        
        # Basic voice list (Murf supports many voices)
        voices = [
            {"id": "en-US-natalie", "name": "Natalie", "language": "en-US", "gender": "female"},
            {"id": "en-US-davis", "name": "Davis", "language": "en-US", "gender": "male"},
            {"id": "en-US-jenny", "name": "Jenny", "language": "en-US", "gender": "female"}
        ]
        
        return jsonify({
            "status": "healthy" if api_key_configured else "limited",
            "api_key_configured": api_key_configured,
            "available_voices": voices if api_key_configured else [],
            "service": "Murf AI TTS",
            "timestamp": time.time()
        })
        
    except Exception as e:
        print(f"Error in tts_status endpoint: {str(e)}")
        return jsonify({
            "status": "error",
            "api_key_configured": False,
            "error": str(e),
            "service": "Murf AI TTS",
            "timestamp": time.time()
        }), 500

if __name__ == "__main__":
    print("Starting MindCare AI Service with Intelligent Proactive Chat...")
    print(f"System Prompt configured: {bool(PROMPT)}")
    print(f"GEMINI_API_KEY configured: {bool(os.environ.get('GEMINI_API_KEY'))}")
    print(f"Embedding model initialized: {bool(embedding_model)}")
    
    if not os.environ.get("GEMINI_API_KEY"):
        print("⚠️  WARNING: GEMINI_API_KEY not found in environment variables!")
        print("   The service will work with fallback responses, but AI functionality will be limited.")
        print("   Please add GEMINI_API_KEY to your .env file for full functionality.")
    
    if not embedding_model:
        print("⚠️  WARNING: Embedding model not initialized!")
        print("   Vector similarity features will be disabled.")
        print("   Proactive messages will use fallback responses.")
    else:
        print("✅ Vector similarity search enabled for intelligent proactive conversations")
    
    print("\n🌟 Enhanced Features:")
    print("   - LLM-generated proactive messages based on conversation history")
    print("   - Vector similarity search for contextual responses") 
    print("   - Emotional pattern recognition and memory")
    print("   - Cultural sensitivity with Indian context integration")
    
    app.run(host='0.0.0.0', port=5010, debug=True)