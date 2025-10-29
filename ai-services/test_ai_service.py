"""Test script for AI service functionality"""

import os
import json
import time
import unittest
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Service configuration
BASE_URL = "http://localhost:5010"

class TestAIService(unittest.TestCase):
    """Test cases for AI service endpoints"""

    def setUp(self):
        """Set up test case"""
        self.user_id = "test_user_" + str(int(time.time()))
        self.headers = {'Content-Type': 'application/json'}

    def test_1_health_check(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'healthy')
        print("✅ Health check passed")

    def test_2_context_generation(self):
        """Test user context generation"""
        onboarding_data = {
            "currentSymptoms": ["stress", "anxiety"],
            "symptomSeverity": 6,
            "symptomDuration": "1_month",
            "suicidalIdeationFlag": False,
            "selfHarmRiskFlag": False,
            "substanceUseFlag": False,
            "therapyGoals": ["manage_stress", "improve_sleep"],
            "communicationStyle": "casual",
            "preferredTherapyStyle": ["mindfulness"],
            "preferredTherapistLanguage": "en",
            "culturalBackgroundNotes": "Indian family background",
            "preferredTopics": ["academic", "family"],
            "notificationPreferences": {"checkIns": True}
        }
        
        response = requests.post(
            f"{BASE_URL}/generate_user_context",
            json={"userId": self.user_id, "onboardingData": onboarding_data},
            headers=self.headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertIn('context', data)
        print("✅ Context generation passed")

    def test_3_chat_functionality(self):
        """Test chat endpoint"""
        # Test general context
        message = "I've been feeling stressed about my exams lately."
        response = requests.post(
            f"{BASE_URL}/chat",
            json={
                "userId": self.user_id,
                "message": message,
                "context": "academic"
            },
            headers=self.headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('response', data)
        self.assertIn('emotional_context', data)
        print("✅ Chat functionality passed")

    def test_4_proactive_chat(self):
        """Test proactive chat generation"""
        response = requests.post(
            f"{BASE_URL}/proactive_chat",
            json={"userId": self.user_id, "context": "academic"},
            headers=self.headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('proactive_message', data)
        print("✅ Proactive chat passed")

    def test_5_emotional_status(self):
        """Test emotional status endpoint"""
        response = requests.get(
            f"{BASE_URL}/emotional_status",
            params={"userId": self.user_id}
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('emotional_state', data)
        print("✅ Emotional status check passed")

    def test_6_get_contexts(self):
        """Test available contexts endpoint"""
        response = requests.get(f"{BASE_URL}/contexts")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('contexts', data)
        self.assertIn('context_info', data)
        print("✅ Contexts retrieval passed")

    def test_7_conversation_context(self):
        """Test conversation context retrieval"""
        response = requests.get(
            f"{BASE_URL}/conversation_context",
            params={
                "userId": self.user_id,
                "query": "exam stress"
            }
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('conversation_count', data)
        print("✅ Conversation context retrieval passed")

    def test_8_memory_clear(self):
        """Test memory clearing functionality"""
        response = requests.post(
            f"{BASE_URL}/clear_memory",
            json={"userId": self.user_id},
            headers=self.headers
        )
        
        self.assertEqual(response.status_code, 200)
        print("✅ Memory clearing passed")

    def test_9_tts_status(self):
        """Test TTS service status check"""
        response = requests.get(f"{BASE_URL}/tts_status")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('status', data)
        self.assertIn('api_key_configured', data)
        print("✅ TTS status check passed")

    def test_10_generate_speech(self):
        """Test speech generation"""
        text = "Hello! How are you feeling today?"
        response = requests.post(
            f"{BASE_URL}/generate_speech",
            json={
                "text": text,
                "userId": self.user_id,
                "voice_profile": "compassionate_female"
            },
            headers=self.headers
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        # Even if TTS fails, it should return 200 with fallback
        self.assertIn('success', data)
        print("✅ Speech generation check passed")

if __name__ == '__main__':
    print("\n🔍 Starting AI Service Tests...")
    print(f"Testing service at {BASE_URL}")
    print("\nMake sure the AI service is running before starting tests!")
    print("==================================")
    unittest.main(verbosity=2)