"""
Map user preferences to specific AI behavior modifications using database values
"""

import os
import psycopg2
from typing import Dict, List, Union
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'mentalhealth'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )

def get_user_preferences(user_id: str) -> Dict:
    """Fetch user preferences from database with fallback"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        communication_style,
                        preferred_therapy_style,
                        preferred_therapist_language,
                        cultural_background_notes,
                        preferred_topics,
                        primary_concerns,
                        therapy_goals,
                        previous_therapy_experience_notes,
                        wellness_preferences,
                        notification_preferences,
                        condition_description,
                        preferred_support_context
                    FROM user_profiles
                    WHERE user_id = %s
                """, (user_id,))
                result = cur.fetchone()
                
                if result:
                    return {
                        'communication_style': result[0],
                        'therapy_style': result[1],
                        'language': result[2],
                        'cultural_background': result[3],
                        'topics': result[4],
                        'concerns': result[5],
                        'goals': result[6],
                        'therapy_experience': result[7],
                        'wellness_prefs': result[8],
                        'notification_prefs': result[9],
                        'condition_description': result[10],
                        'preferred_support_context': result[11]
                    }
    except Exception as e:
        print(f"Database connection failed: {e}, using default preferences")
        return None
    return None

def get_communication_style(style: str) -> Dict:
    """Map communication style from database to AI behavior"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Query a hypothetical styles table or use basic mapping
            base_styles = {
                'formal': {
                    'tone': 'professional and structured',
                    'language': 'formal but warm',
                    'emojis': False,
                    'hindi_usage': 'minimal',
                    'metaphors': 'professional',
                },
                'casual': {
                    'tone': 'friendly and conversational',
                    'language': 'simple and relatable',
                    'emojis': True,
                    'hindi_usage': 'moderate',
                    'metaphors': 'everyday life',
                },
                'supportive': {
                    'tone': 'warm and encouraging',
                    'language': 'nurturing and validating',
                    'emojis': True,
                    'hindi_usage': 'frequent',
                    'metaphors': 'comforting',
                },
                'balanced': {
                    'tone': 'professional yet warm',
                    'language': 'balanced and adaptable',
                    'emojis': True,
                    'hindi_usage': 'selective',
                    'metaphors': 'balanced',
                }
            }
            return base_styles.get(style, base_styles['balanced'])

def get_therapy_style(styles: List[str]) -> Dict:
    """Map therapy styles from database to AI behavior"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            style_mapping = {
                'cbt': {
                    'focus': 'thoughts and behaviors',
                    'techniques': ['thought challenging', 'behavioral activation', 'cognitive restructuring'],
                    'question_style': 'socratic',
                    'structure': 'goal-oriented'
                },
                'mindfulness': {
                    'focus': 'present moment awareness',
                    'techniques': ['meditation', 'grounding', 'breath awareness'],
                    'question_style': 'exploratory',
                    'structure': 'flexible'
                },
                'solution_focused': {
                    'focus': 'future goals and solutions',
                    'techniques': ['miracle question', 'scaling', 'exception finding'],
                    'question_style': 'goal-directed',
                    'structure': 'progress-oriented'
                },
                'supportive': {
                    'focus': 'emotional validation',
                    'techniques': ['active listening', 'reflection', 'validation'],
                    'question_style': 'empathetic',
                    'structure': 'client-led'
                }
            }
            
            combined_style = {
                'techniques': [],
                'question_styles': [],
                'structure': 'balanced'
            }
            
            for style in styles:
                if style in style_mapping:
                    style_info = style_mapping[style]
                    combined_style['techniques'].extend(style_info['techniques'])
                    combined_style['question_styles'].append(style_info['question_style'])
                    if style_info['structure'] == 'goal-oriented':
                        combined_style['structure'] = 'goal-oriented'
            
            return combined_style

def get_language_preferences(lang: str) -> Dict:
    """Map language preferences from database to AI behavior"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            base_preferences = {
                'english': {
                    'hindi_usage': False,
                    'transliteration': False,
                    'cultural_references': 'minimal'
                },
                'hindi': {
                    'hindi_usage': True,
                    'transliteration': True,
                    'cultural_references': 'frequent'
                },
                'balanced': {
                    'hindi_usage': True,
                    'transliteration': True,
                    'cultural_references': 'moderate'
                }
            }
            return base_preferences.get(lang, base_preferences['balanced'])

def get_style_modifiers(user_id: str) -> Dict:
    """
    Get AI behavior modifiers based on user preferences from database
    
    Args:
        user_id: UUID of the user
        
    Returns:
        Dict of behavior modifiers for the AI
    """
    # Get user preferences from database
    preferences = get_user_preferences(user_id)
    if not preferences:
        return get_default_style_modifiers()
    
    # Get base communication style
    comm_style = preferences['communication_style'] or 'balanced'
    style_mods = get_communication_style(comm_style)
    
    # Add language preferences
    lang_pref = preferences['language'] or 'balanced'
    lang_mods = get_language_preferences(lang_pref)
    style_mods.update(lang_mods)
    
    # Add therapy style preferences
    therapy_styles = preferences['therapy_style'] or ['supportive']
    therapy_mods = get_therapy_style(therapy_styles)
    style_mods['therapy'] = therapy_mods
    
    # Add cultural sensitivity level
    cultural_bg = preferences['cultural_background']
    style_mods['cultural_sensitivity'] = 'high' if cultural_bg else 'moderate'
    
    # Add user-specific context
    style_mods['user_context'] = {
        'topics': preferences['topics'],
        'concerns': preferences['concerns'],
        'goals': preferences['goals'],
        'therapy_experience': preferences['therapy_experience'],
        'wellness_preferences': preferences['wellness_prefs'],
        'notification_preferences': preferences['notification_prefs']
    }
    
    return style_mods

def get_default_style_modifiers() -> Dict:
    """Get default style modifiers when no preferences are found"""
    return {
        'tone': 'professional yet warm',
        'language': 'balanced and adaptable',
        'emojis': True,
        'hindi_usage': 'selective',
        'metaphors': 'balanced',
        'therapy': {
            'techniques': ['active listening', 'reflection', 'validation'],
            'question_styles': ['empathetic'],
            'structure': 'balanced'
        },
        'cultural_sensitivity': 'moderate',
        'user_context': {
            'topics': [],
            'concerns': [],
            'goals': [],
            'therapy_experience': None,
            'wellness_preferences': {},
            'notification_preferences': {}
        }
    }

def apply_style_to_prompt(base_prompt: str, style_mods: Dict) -> str:
    """
    Modify a prompt based on style preferences from database
    
    Args:
        base_prompt: Original system prompt
        style_mods: Style modifiers from get_style_modifiers()
        
    Returns:
        Modified prompt with style preferences applied
    """
    # Add style-specific instructions
    style_instructions = f"""
Additional Style Instructions:
- Communication Tone: {style_mods['tone']}
- Language Style: {style_mods['language']}
- Emoji Usage: {'Use sparingly' if style_mods['emojis'] else 'Avoid'}
- Hindi Usage: {style_mods['hindi_usage']}
- Metaphor Style: {style_mods['metaphors']}
- Cultural Sensitivity: {style_mods['cultural_sensitivity']}

Therapeutic Approach:
- Structure: {style_mods['therapy']['structure']}
- Preferred Techniques: {', '.join(style_mods['therapy']['techniques'])}
- Question Styles: {', '.join(style_mods['therapy']['question_styles'])}

User Context:
- Preferred Topics: {', '.join(style_mods['user_context']['topics']) if style_mods['user_context']['topics'] else 'Not specified'}
- Primary Concerns: {', '.join(style_mods['user_context']['concerns']) if style_mods['user_context']['concerns'] else 'Not specified'}
- Therapy Goals: {', '.join(style_mods['user_context']['goals']) if style_mods['user_context']['goals'] else 'Not specified'}
"""
    
    return base_prompt + "\n" + style_instructions.strip()

def get_response_guidelines(style_mods: Dict) -> Dict:
    """
    Get specific response formatting guidelines based on style from database
    
    Args:
        style_mods: Style modifiers from get_style_modifiers()
        
    Returns:
        Dict of response formatting guidelines
    """
    return {
        'use_emojis': style_mods['emojis'],
        'hindi_usage': style_mods['hindi_usage'],
        'tone': style_mods['tone'],
        'preferred_techniques': style_mods['therapy']['techniques'],
        'structure_level': style_mods['therapy']['structure'],
        'cultural_sensitivity': style_mods['cultural_sensitivity'],
        'user_context': style_mods['user_context']
    }