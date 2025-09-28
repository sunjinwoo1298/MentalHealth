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
from flask import Flask, request, jsonify
from flask_cors import CORS
from systemprompt import PROMPT
from context_prompts import get_context_prompt, get_available_contexts
import requests
import time

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

# Initialize AI components with simpler approach
try:
    geminiLlm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash", 
        temperature=0.7
    )
except Exception as e:
    print(f"Warning: Could not initialize Gemini LLM: {e}")
    geminiLlm = None

# Initialize embedding model for vector similarity
try:
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
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
    """Simple chat endpoint for real-time conversations with context support"""
    try:
        data = request.get_json()
        print("Received chat request:", data)
        
        message = data.get("message", "")
        user_id = data.get("userId", "anonymous")
        support_context = data.get("context", "general")  # New: support context
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
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
        
        return jsonify({
            "response": formatted_response,
            "userId": user_id,
            "timestamp": time.time(),
            "emotional_context": detected_emotions,
            "conversation_count": user_conversation_context.get(user_id, {}).get('total_messages', 0),
            "context": support_context
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
        return jsonify({
            "response": random.choice(fallback_responses),
            "userId": user_id,
            "timestamp": time.time(),
            "error": "AI service temporarily unavailable, using fallback response"
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