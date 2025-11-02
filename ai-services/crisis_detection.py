"""Crisis detection and therapist referral system"""

import time
from typing import Dict, List, Tuple, Optional
import json
from datetime import datetime, timedelta

# Crisis keywords and patterns with severity levels
CRISIS_PATTERNS = {
    'suicidal_ideation': {
        'severity': 5,  # Highest severity
        'keywords': [
            'suicide', 'kill myself', 'end it all', 'want to die', 
            'better off dead', 'no reason to live', 'cant go on',
            'आत्महत्या', 'मरना चाहता', 'जीने का मन नहीं'
        ],
        'require_immediate_action': True
    },
    'self_harm': {
        'severity': 4,
        'keywords': [
            'cut myself', 'hurt myself', 'self harm', 'self-harm',
            'harm myself', 'punish myself', 'खुद को नुकसान'
        ],
        'require_immediate_action': True
    },
    'severe_depression': {
        'severity': 4,
        'keywords': [
            'completely hopeless', 'cant cope anymore', 'given up',
            'too much pain', 'trapped', 'no way out', 'worthless',
            'बहुत निराश', 'कोई उम्मीद नहीं'
        ],
        'require_immediate_action': False
    },
    'substance_abuse': {
        'severity': 3,
        'keywords': [
            'overdose', 'drunk all day', 'using drugs', 'cant stop drinking',
            'addiction', 'substance abuse', 'नशा', 'शराब'
        ],
        'require_immediate_action': False
    },
    'eating_disorder': {
        'severity': 3,
        'keywords': [
            'starving myself', 'purging', 'anorexia', 'bulimia',
            'binge eating', 'cant eat', 'hate eating'
        ],
        'require_immediate_action': False
    },
    'panic_attack': {
        'severity': 3,
        'keywords': [
            'cant breathe', 'heart racing', 'panic attack', 'anxiety attack',
            'feeling faint', 'दिल तेज धड़क रहा', 'सांस नहीं आ रही'
        ],
        'require_immediate_action': False
    }
}

# Immediate response templates for different crisis levels
CRISIS_RESPONSES = {
    5: {  # Severe Crisis (Suicidal ideation)
        'user_message': """I hear you're in intense pain right now. Your life has value, and help is available 24/7.

🚨 IMMEDIATE SUPPORT AVAILABLE:
- India Crisis Helpline: 9152987821 (KIRAN Mental Health)
- Emergency: Dial 112
- Snehi Helpline: +91-9582208181

Would you be willing to speak with a counselor? I can help connect you right now.""",
        'action_required': 'immediate_intervention'
    },
    4: {  # High Risk
        'user_message': """I'm very concerned about what you're sharing. While I'm here to listen, I believe speaking with a professional would be really helpful right now.

Would you be open to exploring professional support? I can help you find someone who specializes in this area.""",
        'action_required': 'urgent_referral'
    },
    3: {  # Moderate Risk
        'user_message': """What you're going through sounds really challenging. While I'm here to support you, I think speaking with a mental health professional could provide you with better strategies and support.

Would you like to learn more about professional counseling options?""",
        'action_required': 'recommend_professional'
    }
}

import json

def analyze_crisis_indicators(
    message: str,
    user_id: str,
    conversation_history: List[Dict],
    emotion_history: List[Dict],
    llm=None  # Will be passed from main.py
) -> Dict:
    """
    Analyze message and history for crisis indicators using LLM
    
    Args:
        message: Current user message
        user_id: User identifier
        conversation_history: Recent conversation history
        emotion_history: Recent emotional states
        llm: LangChain LLM instance for analysis
    
    Returns:
        Crisis analysis results
    """
    if not llm:
        # Fallback to pattern matching if LLM not available
        return analyze_crisis_indicators_fallback(message, user_id, conversation_history, emotion_history)

    # Prepare conversation context for LLM analysis
    recent_messages = conversation_history[-5:] if conversation_history else []
    recent_emotions = emotion_history[-3:] if emotion_history else []
    
    # Define the expected JSON structure template
    json_template = '''{
    "crisis_indicators": [
        {
            "type": "string",
            "severity": 5,
            "evidence": "string",
            "confidence": 0.9,
            "timestamp": 1635588000
        }
    ],
    "severity_level": 5,
    "immediate_action_required": true,
    "reasoning": "string",
    "timestamp": 1635588000
}'''

    # Build context for LLM with strict JSON formatting
    analysis_prompt = f"""You are a mental health crisis assessment expert. Your task is to analyze this conversation for crisis indicators and return ONLY a valid JSON response.

Recent conversation context:
{chr(10).join([f"{'User' if msg['type']=='human' else 'AI'}: {msg['content']}" for msg in recent_messages])}

Current message: {message}

Recent emotional states:
{chr(10).join([f"- {', '.join(state.get('emotions', ['unknown']))}" for state in recent_emotions])}

CRITICAL: Return ONLY a JSON object matching this exact schema. Do not include any other text or explanation:

{json_template}

Rules for JSON response:
1. Must be valid JSON - no trailing commas, proper quotes
2. "type" must be one of: "suicidal_ideation", "self_harm", "severe_depression", "substance_abuse", "eating_disorder", "panic_attack"
3. "severity" must be a number between 1 and 5
4. "confidence" must be a number between 0.1 and 1.0
5. "immediate_action_required" must be true or false
6. "reasoning" must be a brief explanation string

DO NOT include any text before or after the JSON object. Return ONLY the JSON."""

    
    try:
        # Get LLM analysis
        response = llm.invoke(analysis_prompt)
        response_text = response.content if hasattr(response, 'content') else str(response)
        
        # Clean up the response text to ensure valid JSON
        response_text = response_text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        try:
            result = json.loads(response_text)
            
            # Validate required fields
            required_fields = {
                'crisis_indicators': list,
                'severity_level': int,
                'immediate_action_required': bool,
                'reasoning': str
            }
            
            for field, field_type in required_fields.items():
                if field not in result:
                    print(f"Missing required field: {field}")
                    raise ValueError(f"Missing required field: {field}")
                if not isinstance(result[field], field_type):
                    print(f"Invalid type for field {field}: expected {field_type}, got {type(result[field])}")
                    raise ValueError(f"Invalid type for field {field}")
            
            # Add metadata and timestamps
            current_time = time.time()
            result['timestamp'] = current_time
            result['user_id'] = user_id
            result['has_crisis_indicators'] = bool(result.get('crisis_indicators', []))
            
            # Add timestamps to crisis indicators if they don't have them
            for indicator in result.get('crisis_indicators', []):
                if 'timestamp' not in indicator:
                    indicator['timestamp'] = current_time
            
            # Log analysis
            print(f"🚨 Crisis Analysis for {user_id}:", json.dumps(result, indent=2))
            
            return result
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Response text: {response_text}")
            return analyze_crisis_indicators_fallback(message, user_id, conversation_history, emotion_history)
        except ValueError as e:
            print(f"Validation error: {e}")
            return analyze_crisis_indicators_fallback(message, user_id, conversation_history, emotion_history)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return analyze_crisis_indicators_fallback(message, user_id, conversation_history, emotion_history)
        
    except Exception as e:
        print(f"Error in LLM crisis analysis: {e}")
        # Fallback to pattern matching
        return analyze_crisis_indicators_fallback(message, user_id, conversation_history, emotion_history)

def analyze_crisis_indicators_fallback(
    message: str,
    user_id: str,
    conversation_history: List[Dict],
    emotion_history: List[Dict]
) -> Dict:
    """Fallback pattern-based crisis detection"""
    message_lower = message.lower()
    crisis_indicators = []
    max_severity = 0
    immediate_action = False
    
    # Check current message for crisis keywords
    for crisis_type, data in CRISIS_PATTERNS.items():
        for keyword in data['keywords']:
            if keyword.lower() in message_lower:
                crisis_indicators.append({
                    'type': crisis_type,
                    'severity': data['severity'],
                    'evidence': f"Matched keyword: {keyword}",
                    'confidence': 0.7,  # Lower confidence for pattern matching
                    'timestamp': time.time()
                })
                max_severity = max(max_severity, data['severity'])
                if data['require_immediate_action']:
                    immediate_action = True
    
    # Analyze emotion history for patterns
    if emotion_history:
        recent_emotions = [e.get('emotions', []) for e in emotion_history[-5:]]
        concerning_emotions = ['sadness', 'despair', 'hopelessness', 'anxiety']
        emotion_count = sum(
            1 for emotions in recent_emotions
            for emotion in emotions
            if emotion in concerning_emotions
        )
        if emotion_count >= 4:  # High frequency of concerning emotions
            crisis_indicators.append({
                'type': 'persistent_negative_emotions',
                'severity': 3,
                'evidence': f'Found {emotion_count} concerning emotions in recent history',
                'confidence': 0.6,
                'timestamp': time.time()
            })
            max_severity = max(max_severity, 3)
    
    return {
        'has_crisis_indicators': bool(crisis_indicators),
        'crisis_indicators': crisis_indicators,
        'severity_level': max_severity,
        'immediate_action_required': immediate_action,
        'timestamp': time.time(),
        'user_id': user_id,
        'reasoning': 'Analysis based on pattern matching (LLM fallback mode)'
    }

def generate_therapist_context(
    user_id: str,
    crisis_analysis: Dict,
    conversation_history: List[Dict],
    emotion_history: List[Dict],
    user_profile: Optional[Dict] = None
) -> Dict:
    """
    Generate comprehensive context for therapist referral
    
    Args:
        user_id: User identifier
        crisis_analysis: Results from crisis analysis
        conversation_history: Recent conversations
        emotion_history: Emotional state history
        user_profile: Optional user profile data
    
    Returns:
        Structured context for therapist
    """
    # Compile crisis incidents
    crisis_incidents = []
    current_time = time.time()  # Get current timestamp
    for indicator in crisis_analysis.get('crisis_indicators', []):
        incident = {
            'type': indicator['type'],
            'severity': indicator['severity'],
            'detected_at': datetime.fromtimestamp(current_time).strftime('%Y-%m-%d %H:%M:%S'),
            'evidence': indicator.get('keyword_matched', indicator.get('evidence', 'Pattern detected'))
        }
        crisis_incidents.append(incident)
    
    # Analyze emotional patterns
    emotion_patterns = {}
    if emotion_history:
        all_emotions = [e for state in emotion_history for e in state.get('emotions', [])]
        for emotion in set(all_emotions):
            frequency = all_emotions.count(emotion)
            emotion_patterns[emotion] = frequency
    
    # Extract key conversation themes
    conversation_themes = []
    if conversation_history:
        # Look for mentions of specific topics
        themes = {
            'family': ['family', 'parents', 'siblings', 'परिवार'],
            'academic': ['study', 'exam', 'school', 'college', 'पढ़ाई'],
            'social': ['friends', 'relationship', 'social', 'दोस्त'],
            'career': ['job', 'career', 'future', 'नौकरी'],
            'mental_health': ['anxiety', 'depression', 'stress', 'तनाव']
        }
        
        for theme, keywords in themes.items():
            for msg in conversation_history:
                if any(keyword in msg.get('content', '').lower() for keyword in keywords):
                    if theme not in conversation_themes:
                        conversation_themes.append(theme)
    
    # Compile therapist context
    therapist_context = {
        'summary': {
            'crisis_level': crisis_analysis['severity_level'],
            'immediate_action_needed': crisis_analysis['immediate_action_required'],
            'primary_concerns': conversation_themes,
            'dominant_emotions': sorted(emotion_patterns.items(), key=lambda x: x[1], reverse=True)[:3]
        },
        'crisis_incidents': crisis_incidents,
        'emotional_analysis': {
            'patterns': emotion_patterns,
            'recent_states': emotion_history[-5:] if emotion_history else []
        },
        'conversation_analysis': {
            'themes': conversation_themes,
            'engagement_level': len(conversation_history),
            'recent_conversations': conversation_history[-5:] if conversation_history else []
        },
        'user_profile': user_profile or {},
        'generated_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'ai_notes': generate_ai_notes(crisis_analysis, emotion_patterns, conversation_themes)
    }
    
    return therapist_context

def generate_ai_notes(
    crisis_analysis: Dict,
    emotion_patterns: Dict,
    themes: List[str]
) -> str:
    """Generate AI notes for therapist based on analysis"""
    
    notes = []
    
    # Crisis severity notes
    if crisis_analysis['severity_level'] >= 4:
        notes.append("⚠️ HIGH RISK: Immediate attention recommended")
    elif crisis_analysis['severity_level'] == 3:
        notes.append("⚠️ MODERATE RISK: Early intervention suggested")
    
    # Emotional pattern notes
    if emotion_patterns:
        dominant_emotion = max(emotion_patterns.items(), key=lambda x: x[1])[0]
        notes.append(f"Primary emotional theme: {dominant_emotion}")
    
    # Theme-based notes
    if 'family' in themes and 'academic' in themes:
        notes.append("Shows concurrent family and academic stressors")
    if 'mental_health' in themes:
        notes.append("Demonstrates awareness of mental health challenges")
    
    # Compile notes
    return " | ".join(notes)

def get_crisis_resources(severity_level: int) -> Dict:
    """Get appropriate crisis resources based on severity - formatted for frontend"""
    
    # Immediate help resources (24/7 crisis lines)
    immediate_help = [
        {
            'name': 'KIRAN Mental Health Helpline (India)',
            'phone': '1800-599-0019',
            'available': '24/7',
            'language': 'Hindi, English, and 13 regional languages'
        },
        {
            'name': 'AASRA Suicide Prevention',
            'phone': '+91-9820466726',
            'available': '24/7',
            'language': 'English, Hindi'
        },
        {
            'name': 'Snehi Foundation',
            'phone': '+91-9582208181',
            'available': '10 AM - 10 PM',
            'language': 'Hindi, English'
        },
        {
            'name': 'Emergency Services',
            'phone': '112',
            'available': '24/7',
            'language': 'All languages'
        }
    ]
    
    # General support resources
    general_support = [
        {
            'name': 'Vandrevala Foundation',
            'phone': '1860-266-2345',
            'available': '24/7',
            'language': 'Multiple languages'
        },
        {
            'name': 'iCall - TISS',
            'phone': '+91-22-25521111',
            'available': 'Mon-Sat 8 AM - 10 PM',
            'language': 'English, Hindi, Marathi'
        },
        {
            'name': 'Fortis Stress Helpline',
            'phone': '+91-8376804102',
            'available': '24/7',
            'language': 'English, Hindi'
        }
    ]
    
    # Online resources
    online_resources = [
        {
            'name': 'National Mental Health Portal',
            'url': 'https://www.nhp.gov.in/national-mental-health-programme_pg',
            'type': 'Government mental health resources'
        },
        {
            'name': 'Mpower 1on1',
            'url': 'https://mpowerminds.com',
            'type': 'Online counseling and support'
        },
        {
            'name': 'YourDOST',
            'url': 'https://yourdost.com',
            'type': 'Online mental health platform'
        }
    ]
    
    # Build response based on severity
    resources = {
        'immediate_help': immediate_help if severity_level >= 3 else [],
        'general_support': general_support,
        'online_resources': online_resources
    }
    
    return resources