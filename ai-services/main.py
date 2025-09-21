import sys
import json
import os
from dotenv import load_dotenv
import re
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage
from flask import Flask, request, jsonify
from flask_cors import CORS
from systemprompt import PROMPT
import requests
import time

load_dotenv()

# Initialize environment
os.environ["GOOGLE_API_KEY"] = os.environ.get("GEMINI_API_KEY", "")
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

# Global conversation history per user (simplified approach)
user_conversations = {}

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
    """Simple chat endpoint for real-time conversations"""
    try:
        data = request.get_json()
        print("Received chat request:", data)
        
        message = data.get("message", "")
        user_id = data.get("userId", "anonymous")
        
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
            return jsonify({
                "response": random.choice(fallback_responses),
                "userId": user_id,
                "timestamp": time.time(),
                "fallback": True
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
        
        return jsonify({
            "response": formatted_response,
            "userId": user_id,
            "timestamp": time.time()
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

if __name__ == "__main__":
    print("Starting MindCare AI Service...")
    print(f"System Prompt configured: {bool(PROMPT)}")
    print(f"GEMINI_API_KEY configured: {bool(os.environ.get('GEMINI_API_KEY'))}")
    
    if not os.environ.get("GEMINI_API_KEY"):
        print("⚠️  WARNING: GEMINI_API_KEY not found in environment variables!")
        print("   The service will work with fallback responses, but AI functionality will be limited.")
        print("   Please add GEMINI_API_KEY to your .env file for full functionality.")
    
    app.run(host='0.0.0.0', port=5010, debug=True)