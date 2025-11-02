"""AI Care Agent - Proactive Mental Health Monitoring and Support System"""

import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import json
import numpy as np
from sentence_transformers import SentenceTransformer

class AICareAgent:
    def __init__(self, llm, embedding_model):
        self.llm = llm
        self.embedding_model = embedding_model
        self.user_patterns = {}  # Store user behavior patterns
        self.intervention_history = {}  # Track past interventions
        self.risk_trends = {}  # Track risk level trends
        
    def analyze_user_patterns(self, user_id: str, 
                            conversation_history: List[Dict],
                            emotion_history: List[Dict],
                            crisis_history: List[Dict]) -> Dict:
        """Analyze user patterns and identify potential intervention needs"""
        
        # Generate pattern analysis prompt
        # Create the JSON template separately
        json_template = '''{
    "identified_patterns": [
        {
            "pattern_type": "emotional|behavioral|crisis|engagement",
            "description": "Description of pattern",
            "confidence": 0-1,
            "suggested_intervention": "intervention type",
            "urgency_level": 1-5
        }
    ],
    "recommended_actions": [
        {
            "action_type": "check_in|resource|activity|professional",
            "description": "What should be done",
            "timing": "immediate|next_session|scheduled",
            "priority": 1-5
        }
    ],
    "wellness_trends": {
        "emotional_trajectory": "improving|stable|declining",
        "engagement_quality": "high|moderate|low",
        "risk_trajectory": "decreasing|stable|increasing"
    }
}'''

        # Now create the analysis prompt with proper f-string handling
        analysis_prompt = f"""You are an AI mental health care agent analyzing user patterns.

Recent Conversations:
{chr(10).join([f"- {msg['content'][:100]}..." for msg in conversation_history[-5:]])}

Emotional History:
{chr(10).join([f"- {', '.join(state.get('emotions', []))}" for state in emotion_history[-5:]])}

Crisis History:
{chr(10).join([f"- Level {crisis['severity_level']}: {crisis.get('reasoning', 'No reasoning provided')}"
               for crisis in crisis_history[-3:]])}

Analyze patterns and return a JSON object with this exact structure:

{json_template}"""

        try:
            # Get response from LLM
            response = self.llm.invoke(analysis_prompt)
            response_text = response.content if hasattr(response, 'content') else str(response)
            
            # Clean up response text
            response_text = response_text.strip()
            # Remove markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            # Parse JSON with validation
            try:
                pattern_analysis = json.loads(response_text)
                
                # Validate required fields and types
                required_fields = {
                    'identified_patterns': list,
                    'recommended_actions': list,
                    'wellness_trends': dict
                }
                
                for field, expected_type in required_fields.items():
                    if field not in pattern_analysis:
                        raise ValueError(f"Missing required field: {field}")
                    if not isinstance(pattern_analysis[field], expected_type):
                        raise ValueError(f"Invalid type for {field}: expected {expected_type}")
                
                # Validate wellness_trends fields
                required_trends = ['emotional_trajectory', 'engagement_quality', 'risk_trajectory']
                for trend in required_trends:
                    if trend not in pattern_analysis['wellness_trends']:
                        raise ValueError(f"Missing required trend: {trend}")
                
                # Store in user patterns
                self.user_patterns[user_id] = {
                    'last_analysis': time.time(),
                    'patterns': pattern_analysis
                }
                
                print(f"✅ Successfully analyzed patterns for user {user_id}")
                return pattern_analysis
                
            except json.JSONDecodeError as je:
                print(f"JSON parsing error: {je}")
                print(f"Response text was: {response_text[:200]}...")
                raise
                
        except Exception as e:
            print(f"Error in pattern analysis: {e}")
            fallback_response = {
                'identified_patterns': [],
                'recommended_actions': [],
                'wellness_trends': {
                    'emotional_trajectory': 'stable',
                    'engagement_quality': 'moderate',
                    'risk_trajectory': 'stable'
                }
            }
            
            # Store fallback in user patterns
            self.user_patterns[user_id] = {
                'last_analysis': time.time(),
                'patterns': fallback_response,
                'is_fallback': True
            }
            
            return fallback_response
    
    def generate_wellness_activity(self, user_id: str, context: str = 'general') -> Dict:
        """Generate personalized wellness activity based on user patterns"""
        
        user_patterns = self.user_patterns.get(user_id, {})
        activity_prompt = f"""Generate a personalized wellness activity for a user.

Context: {context} support mode
User Patterns: {json.dumps(user_patterns.get('patterns', {}), indent=2)}

The activity should:
1. Be culturally appropriate for Indian youth
2. Consider the user's current emotional state and patterns
3. Be specific, actionable, and engaging
4. Include both immediate and long-term benefits
5. Have clear instructions and expected outcomes

Return a JSON activity plan:
{{
    "activity_name": "Name of activity",
    "description": "Detailed description",
    "duration": "Expected duration",
    "difficulty": "easy|moderate|challenging",
    "benefits": ["list", "of", "benefits"],
    "steps": ["step1", "step2", "..."],
    "cultural_elements": ["relevant", "cultural", "aspects"],
    "progress_tracking": {{
        "metrics": ["what", "to", "track"],
        "milestones": ["achievement", "points"]
    }}
}}"""

        try:
            response = self.llm.invoke(activity_prompt)
            return json.loads(response.content if hasattr(response, 'content') else response)
        except Exception as e:
            print(f"Error generating wellness activity: {e}")
            return None
    
    def should_intervene(self, user_id: str, current_patterns: Dict) -> Tuple[bool, str, int]:
        """Determine if and how the agent should intervene"""
        
        # Check intervention history
        last_intervention = self.intervention_history.get(user_id, {}).get('last_time', 0)
        intervention_count = self.intervention_history.get(user_id, {}).get('count', 0)
        
        # Don't intervene too frequently
        if time.time() - last_intervention < 3600:  # 1 hour minimum between interventions
            return False, "too_recent", 0
            
        # Analyze urgency from patterns
        max_urgency = 0
        urgent_pattern = None
        
        for pattern in current_patterns.get('identified_patterns', []):
            if pattern['urgency_level'] > max_urgency:
                max_urgency = pattern['urgency_level']
                urgent_pattern = pattern
                
        # Determine intervention threshold
        should_intervene = False
        reason = "no_intervention_needed"
        
        if max_urgency >= 4:  # High urgency
            should_intervene = True
            reason = "high_urgency"
        elif max_urgency >= 3 and intervention_count < 3:  # Moderate urgency, limited previous interventions
            should_intervene = True
            reason = "moderate_urgency"
        elif current_patterns.get('wellness_trends', {}).get('risk_trajectory') == 'increasing':
            should_intervene = True
            reason = "increasing_risk"
            
        return should_intervene, reason, max_urgency
    
    def generate_intervention(self, user_id: str, 
                            intervention_reason: str,
                            urgency_level: int,
                            context: str = 'general') -> Dict:
        """Generate an appropriate intervention based on user patterns and context"""
        
        user_patterns = self.user_patterns.get(user_id, {})
        
        intervention_prompt = f"""Generate an AI care agent intervention for a user.

Context: {context} support mode
Intervention Reason: {intervention_reason}
Urgency Level: {urgency_level}
User Patterns: {json.dumps(user_patterns.get('patterns', {}), indent=2)}

Design an intervention that:
1. Addresses the specific reason for intervention
2. Is appropriate for the urgency level
3. Considers cultural context and preferences
4. Provides clear, actionable support
5. Includes follow-up steps

Return a JSON intervention plan:
{{
    "intervention_type": "check_in|activity|resource|professional",
    "urgency_level": 1-5,
    "message": "Intervention message to user",
    "suggested_actions": ["action1", "action2"],
    "resources": ["resource1", "resource2"],
    "follow_up": {{
        "timing": "when to follow up",
        "type": "how to follow up",
        "metrics": ["what", "to", "check"]
    }}
}}"""

        try:
            response = self.llm.invoke(intervention_prompt)
            intervention_plan = json.loads(response.content if hasattr(response, 'content') else response)
            
            # Update intervention history
            if user_id not in self.intervention_history:
                self.intervention_history[user_id] = {
                    'count': 0,
                    'history': []
                }
            
            self.intervention_history[user_id]['count'] += 1
            self.intervention_history[user_id]['last_time'] = time.time()
            self.intervention_history[user_id]['history'].append({
                'timestamp': time.time(),
                'reason': intervention_reason,
                'urgency': urgency_level,
                'plan': intervention_plan
            })
            
            return intervention_plan
            
        except Exception as e:
            print(f"Error generating intervention: {e}")
            return None
            
    def track_risk_trends(self, user_id: str, current_risk: float) -> Dict:
        """Track and analyze risk level trends over time"""
        
        if user_id not in self.risk_trends:
            self.risk_trends[user_id] = {
                'history': [],
                'last_updated': None
            }
            
        # Add new risk assessment
        self.risk_trends[user_id]['history'].append({
            'risk_level': current_risk,
            'timestamp': time.time()
        })
        
        # Keep last 10 assessments
        if len(self.risk_trends[user_id]['history']) > 10:
            self.risk_trends[user_id]['history'] = self.risk_trends[user_id]['history'][-10:]
            
        # Calculate trend
        risk_levels = [entry['risk_level'] for entry in self.risk_trends[user_id]['history']]
        
        if len(risk_levels) >= 3:
            recent_avg = np.mean(risk_levels[-3:])
            older_avg = np.mean(risk_levels[:-3])
            
            if recent_avg > older_avg + 0.5:
                trend = "increasing"
            elif recent_avg < older_avg - 0.5:
                trend = "decreasing"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
            
        return {
            'current_risk': current_risk,
            'trend': trend,
            'history': self.risk_trends[user_id]['history'],
            'requires_attention': trend == "increasing" and current_risk >= 3
        }
    
    def generate_weekly_insight_report(self, user_id: str) -> Dict:
        """Generate a comprehensive weekly insight report for therapists or mental health professionals"""
        
        patterns = self.user_patterns.get(user_id, {})
        interventions = self.intervention_history.get(user_id, {})
        risk_data = self.risk_trends.get(user_id, {})
        
        report_prompt = f"""Generate a weekly mental health insight report for healthcare professionals.

User Patterns: {json.dumps(patterns.get('patterns', {}), indent=2)}
Recent Interventions: {json.dumps(interventions.get('history', [])[-3:], indent=2)}
Risk Trends: {json.dumps(risk_data, indent=2)}

Generate a comprehensive report in JSON format:
{{
    "summary": {{
        "overall_status": "status description",
        "key_concerns": ["concern1", "concern2"],
        "progress_indicators": ["indicator1", "indicator2"]
    }},
    "detailed_analysis": {{
        "behavioral_patterns": ["pattern1", "pattern2"],
        "risk_assessment": {{
            "current_level": 1-5,
            "trend": "trend description",
            "contributing_factors": ["factor1", "factor2"]
        }},
        "intervention_effectiveness": {{
            "successful_strategies": ["strategy1", "strategy2"],
            "areas_for_adjustment": ["area1", "area2"]
        }}
    }},
    "recommendations": {{
        "immediate_actions": ["action1", "action2"],
        "long_term_strategies": ["strategy1", "strategy2"],
        "suggested_resources": ["resource1", "resource2"]
    }},
    "next_steps": {{
        "priorities": ["priority1", "priority2"],
        "monitoring_focus": ["focus1", "focus2"],
        "follow_up_timing": "when to follow up"
    }}
}}"""

        try:
            response = self.llm.invoke(report_prompt)
            return json.loads(response.content if hasattr(response, 'content') else response)
        except Exception as e:
            print(f"Error generating insight report: {e}")
            return None