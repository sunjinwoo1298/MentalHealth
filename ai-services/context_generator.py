"""Mental Health AI Platform - Context Generator
Generates personalized AI contexts based on user onboarding data.
"""

import os
import json
from typing import Dict, List, Optional, Union
from langchain_google_genai import ChatGoogleGenerativeAI
from context_prompts import CONTEXT_PROMPTS, get_context_prompt

# Initialize the LLM
geminiLlm = None
try:
    geminiLlm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0.7
    )
except Exception as e:
    print(f"Warning: Could not initialize Gemini LLM for context generation: {e}")

def analyze_risk_level(onboarding_data: Dict[str, Union[str, int, bool, List[str], Dict]]) -> Dict[str, Union[str, int, List[str], bool]]:
    """Analyze risk level from onboarding data for appropriate support level"""
    risk_score = 0
    risk_factors = []
    
    # Check direct risk flags
    if onboarding_data.get('suicidalIdeationFlag'):
        risk_score += 5
        risk_factors.append('Suicidal ideation')
    if onboarding_data.get('selfHarmRiskFlag'):
        risk_score += 4
        risk_factors.append('Self-harm risk')
    if onboarding_data.get('substanceUseFlag'):
        risk_score += 3
        risk_factors.append('Substance use')
        
    # Check additional risk indicators
    symptoms = onboarding_data.get('currentSymptoms', [])
    high_risk_symptoms = [
        'severe_depression',
        'panic_attacks',
        'hallucinations',
        'paranoia'
    ]
    
    for symptom in symptoms:
        if symptom in high_risk_symptoms:
            risk_score += 2
            risk_factors.append(f'High-risk symptom: {symptom}')
    
    # Determine risk level
    risk_level = 'low'
    if risk_score >= 5:
        risk_level = 'high'
    elif risk_score >= 3:
        risk_level = 'medium'
    
    return {
        'level': risk_level,
        'score': risk_score,
        'factors': risk_factors,
        'requiresProfessional': risk_score >= 4
    }

def generate_user_context(onboarding_data: Dict[str, Union[str, int, bool, List[str], Dict]]) -> str:
    """
    Generate a personalized AI context based on user's onboarding data
    
    Args:
        onboarding_data: Dict containing the onboarding form data
        
    Returns:
        Personalized context string for the AI
    """
    
    # Extract key data points
    symptoms = onboarding_data.get('currentSymptoms', [])
    severity = onboarding_data.get('symptomSeverity', 5)
    duration = onboarding_data.get('symptomDuration', '')
    has_risk = any([
        onboarding_data.get('suicidalIdeationFlag', False),
        onboarding_data.get('selfHarmRiskFlag', False),
        onboarding_data.get('substanceUseFlag', False)
    ])
    goals = onboarding_data.get('therapyGoals', [])
    
    # Get therapy style preferences
    preferred_style = onboarding_data.get('communicationStyle', 'casual')
    therapy_style = onboarding_data.get('preferredTherapyStyle', [])
    
    # Build personalized context
    context = f"""
You are a culturally sensitive AI mental health companion supporting a user with the following profile:

CURRENT MENTAL HEALTH STATE:
- Primary Symptoms: {', '.join(symptoms)}
- Severity Level: {severity}/10
- Duration: {duration}
- Risk Level: {"High (requires careful monitoring)" if has_risk else "Standard"}
- Key Goals: {', '.join(goals)}

COMMUNICATION PREFERENCES:
- Style: {preferred_style}
- Preferred Approaches: {', '.join(therapy_style) if therapy_style else 'Not specified'}
- Language: {onboarding_data.get('preferredTherapistLanguage', 'en')}

YOUR APPROACH:
1. CORE FOCUS:
   - Help them work through their identified symptoms: {', '.join(symptoms)}
   - Keep their goals in mind: {', '.join(goals)}
   - Use their preferred communication style: {preferred_style}

2. RISK AWARENESS:
   {"- Monitor closely for self-harm/crisis signals   - Have crisis resources ready   - Maintain supportive, hope-focused dialogue" if has_risk else "- Standard supportive monitoring   - Focus on prevention and wellness"}

3. CULTURAL CONTEXT:
   - Consider their cultural background notes: {onboarding_data.get('culturalBackgroundNotes', 'Not provided')}
   - Be mindful of family dynamics and cultural expectations
   - Use culturally appropriate metaphors and references

4. THERAPY ALIGNMENT:
   - Draw from their preferred therapy approaches: {', '.join(therapy_style) if therapy_style else 'Use general therapeutic techniques'}
   - Consider their previous therapy experiences: {onboarding_data.get('previousTherapyExperienceNotes', 'Not provided')}

5. COMMUNICATION GUIDELINES:
   - Primary Language: {onboarding_data.get('preferredTherapistLanguage', 'en')}
   - Style: {preferred_style.capitalize()} approach as preferred
   - Topics they're comfortable with: {', '.join(onboarding_data.get('preferredTopics', []))}

6. PROACTIVE SUPPORT:
   - Check notification preferences: {json.dumps(onboarding_data.get('notificationPreferences', {}))}
   - Send reminders and check-ins according to their settings
   - Monitor progress and celebrate small wins

7. KEY CONSIDERATIONS:
   - Initial mood score: {onboarding_data.get('initialMoodScore', 5)}/10
   - Stress level: {onboarding_data.get('stressLevel', 5)}/10
   - Primary concerns: {', '.join(onboarding_data.get('primaryConcerns', []))}

Remember: This user's safety and well-being are top priority. Always maintain appropriate boundaries while being supportive and encouraging. If risk levels escalate, follow crisis protocols immediately.
"""

    # Add risk-specific context if needed
    if has_risk:
        context += """
CRITICAL SAFETY PROTOCOLS:
- Actively monitor for signs of crisis or escalation
- Have Indian crisis hotline numbers ready: 9152987821 (National Mental Health Helpline)
- Focus on immediate safety and support
- Be direct about checking current safety status
- Encourage professional help and support network involvement
"""

    return context.strip()

def get_context_with_preferences(onboarding_data: Dict[str, Union[str, List[str], Dict]], base_context: str = None) -> str:
    """Get base context template with added cultural/preference info"""
    from preference_mapping import get_style_modifiers, apply_style_to_prompt
    
    # Get base context for the user's preferred support type
    support_context = onboarding_data.get('preferredSupportContext', 'general')
    if not base_context:
        base_context = get_context_prompt(support_context)
    
    # Add user preferences
    preferences = {
        'communicationStyle': onboarding_data.get('communicationStyle', 'balanced'),
        'therapyExperience': onboarding_data.get('previousTherapyExperienceNotes', 'none'),
        'preferredTherapistLanguage': onboarding_data.get('preferredTherapistLanguage', 'english'),
        'culturalBackgroundNotes': onboarding_data.get('culturalBackgroundNotes', 'indian'),
        'preferredTopics': onboarding_data.get('preferredTopics', []),
        'primaryConcerns': onboarding_data.get('primaryConcerns', []),
        'therapyGoals': onboarding_data.get('therapyGoals', []),
        'preferredTherapyStyle': onboarding_data.get('preferredTherapyStyle', ['supportive'])
    }
    
    # Get style modifiers based on preferences
    style_mods = get_style_modifiers(preferences)
    
    # Apply style preferences to prompt
    enhanced_prompt = apply_style_to_prompt(base_context, style_mods)
    
    # Add additional preference context
    preference_context = f"""
User Profile:
- Previous Therapy: {preferences['therapyExperience']}
- Cultural Background: {preferences['culturalBackgroundNotes']}
- Preferred Topics: {', '.join(preferences['preferredTopics'])}
- Primary Concerns: {', '.join(preferences['primaryConcerns'])}
- Therapy Goals: {', '.join(preferences['therapyGoals'])}
"""
    
    return enhanced_prompt + "\n" + preference_context.strip()