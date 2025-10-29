"""Integration tests for MindCare AI Services"""

import requests
import json
import time
from typing import Dict, List
import unittest

BASE_URL = "http://localhost:5010"

class TestMindCareIntegration(unittest.TestCase):
    def setUp(self):
        """Initialize test session"""
        self.session = requests.Session()
        self.user_id = f"test_user_{int(time.time())}"
    
    def test_health_check(self):
        """Test basic health check endpoint"""
        response = self.session.get(f"{BASE_URL}/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["gemini_configured"])
        print("✅ Health check passed")

    def test_chat_flow(self):
        """Test complete chat flow with all components"""
        test_messages = [
            # Test general support
            {
                "message": "I've been feeling really down lately",
                "context": "general",
                "expected_components": ["emotional_context", "avatar_emotion"]
            },
            # Test academic support with stress indicators
            {
                "message": "I'm so stressed about my exams, I can't sleep and my grades are dropping",
                "context": "academic",
                "expected_components": ["emotional_context", "avatar_emotion", "agent_analysis"]
            },
            # Test family support
            {
                "message": "My parents don't understand me, we keep fighting about my career choice",
                "context": "family",
                "expected_components": ["emotional_context", "avatar_emotion", "agent_analysis"]
            },
            # Test crisis detection
            {
                "message": "Sometimes I feel like giving up, nothing seems worth it anymore",
                "context": "general",
                "expected_components": ["emotional_context", "avatar_emotion", "crisis_info", "agent_intervention"]
            }
        ]

        for idx, test_case in enumerate(test_messages, 1):
            print(f"\n🔄 Testing message {idx}: {test_case['message'][:30]}...")
            
            # Send chat request
            response = self.session.post(
                f"{BASE_URL}/chat",
                json={
                    "message": test_case["message"],
                    "userId": self.user_id,
                    "context": test_case["context"]
                }
            )
            
            self.assertEqual(response.status_code, 200)
            data = response.json()
            
            # Verify response structure
            self.assertIsNotNone(data["response"])
            self.assertEqual(data["userId"], self.user_id)
            self.assertIsNotNone(data["timestamp"])
            
            # Check expected components
            for component in test_case["expected_components"]:
                self.assertIn(component, data)
                self.assertIsNotNone(data[component])
            
            # Verify emotional analysis
            self.assertIsInstance(data["emotional_context"], list)
            self.assertIsInstance(data["emotion_intensity"], (int, float))
            
            # If crisis detected, verify crisis info
            if "crisis_info" in data and data["crisis_info"]:
                self.assertIn("severity_level", data["crisis_info"])
                self.assertIn("immediate_action_required", data["crisis_info"])
                self.assertIn("resources", data["crisis_info"])
            
            # If agent intervention exists, verify structure
            if "agent_intervention" in data and data["agent_intervention"]:
                self.assertIn("intervention_type", data["agent_intervention"])
                self.assertIn("message", data["agent_intervention"])
                self.assertIn("suggested_actions", data["agent_intervention"])
            
            print(f"✅ Message {idx} test passed")
            # Wait briefly between requests
            time.sleep(1)

    def test_proactive_chat(self):
        """Test proactive chat functionality"""
        response = self.session.post(
            f"{BASE_URL}/proactive_chat",
            json={
                "userId": self.user_id,
                "context": "general"
            }
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        if data.get("proactive_message"):
            self.assertIsInstance(data["proactive_message"], str)
            self.assertTrue(len(data["proactive_message"]) > 0)
        
        print("✅ Proactive chat test passed")

    def test_emotional_status(self):
        """Test emotional status tracking"""
        # First send a chat message to generate emotional state
        self.session.post(
            f"{BASE_URL}/chat",
            json={
                "message": "I'm feeling anxious about everything",
                "userId": self.user_id,
                "context": "general"
            }
        )
        
        # Then check emotional status
        response = self.session.get(
            f"{BASE_URL}/emotional_status",
            params={"userId": self.user_id}
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIn("emotional_state", data)
        self.assertIsInstance(data["emotional_state"], dict)
        
        print("✅ Emotional status test passed")

    def test_insight_report(self):
        """Test insight report generation"""
        response = self.session.get(
            f"{BASE_URL}/insight_report",
            params={"userId": self.user_id}
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        if data.get("success"):
            self.assertIn("report", data)
            report = data["report"]
            self.assertIn("summary", report)
            self.assertIn("detailed_analysis", report)
            self.assertIn("recommendations", report)
        
        print("✅ Insight report test passed")

    def test_contexts(self):
        """Test context information endpoint"""
        response = self.session.get(f"{BASE_URL}/contexts")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertIn("contexts", data)
        self.assertIn("context_info", data)
        self.assertGreater(len(data["contexts"]), 0)
        
        print("✅ Contexts test passed")

def run_tests():
    """Run all integration tests"""
    print("\n🚀 Starting MindCare AI Services Integration Tests\n")
    unittest.main(argv=[''], verbosity=2, exit=False)

if __name__ == "__main__":
    run_tests()