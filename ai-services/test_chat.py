"""Test core chat functionality"""

import requests
import json
import time

def test_chat():
    """Test core chat functionality with all components"""
    
    BASE_URL = "http://localhost:5010"
    user_id = f"test_user_{int(time.time())}"
    
    def make_request(message, context="general"):
        """Make a chat request and analyze response"""
        try:
            response = requests.post(
                f"{BASE_URL}/chat",
                json={
                    "message": message,
                    "userId": user_id,
                    "context": context
                }
            )
            
            if response.status_code != 200:
                print(f"❌ Error: Status code {response.status_code}")
                return None
                
            return response.json()
            
        except Exception as e:
            print(f"❌ Error making request: {e}")
            return None
    
    def verify_response(data, test_name, expected_components=None):
        """Verify response contains expected components"""
        if not data:
            print(f"❌ {test_name} failed: No response data")
            return False
            
        # Check basic response structure
        required_fields = ["response", "userId", "timestamp", "emotional_context", "avatar_emotion"]
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            print(f"❌ {test_name} failed: Missing fields {missing_fields}")
            return False
            
        # Check expected components if specified
        if expected_components:
            missing_components = [comp for comp in expected_components if comp not in data]
            if missing_components:
                print(f"❌ {test_name} failed: Missing components {missing_components}")
                return False
        
        print(f"✅ {test_name} passed")
        print(f"Response: {data['response'][:100]}...")
        if "emotional_context" in data:
            print(f"Emotions: {data['emotional_context']}")
        if "crisis_info" in data and data["crisis_info"]:
            print(f"Crisis Level: {data['crisis_info']['severity_level']}")
        if "agent_intervention" in data and data["agent_intervention"]:
            print(f"Agent Intervention: {data['agent_intervention']['intervention_type']}")
        print("-" * 80)
        return True
    
    # Test 1: Basic Emotional Response
    print("\n🧪 Test 1: Basic Emotional Response")
    data = make_request("I'm feeling a bit sad today")
    verify_response(data, "Basic Emotional Response", ["emotional_context"])
    
    # Test 2: Academic Context
    print("\n🧪 Test 2: Academic Context")
    data = make_request(
        "I'm really stressed about my exams and can't focus on studying",
        context="academic"
    )
    verify_response(data, "Academic Context", ["emotional_context", "agent_analysis"])
    
    # Test 3: Family Context
    print("\n🧪 Test 3: Family Context")
    data = make_request(
        "My parents and I keep fighting about my career choices",
        context="family"
    )
    verify_response(data, "Family Context", ["emotional_context", "agent_analysis"])
    
    # Test 4: Crisis Detection
    print("\n🧪 Test 4: Crisis Detection")
    data = make_request(
        "I feel so hopeless, sometimes I think about ending it all"
    )
    verify_response(data, "Crisis Detection", ["crisis_info", "agent_intervention"])
    
    # Test 5: Agent Intervention
    print("\n🧪 Test 5: Agent Intervention")
    data = make_request(
        "I've been feeling really down for weeks and nothing helps"
    )
    verify_response(data, "Agent Intervention", ["agent_analysis", "agent_intervention"])
    
    # Test 6: Mixed Language
    print("\n🧪 Test 6: Mixed Language")
    data = make_request(
        "Mera dil bahut udaas hai aur mujhe samajh nahi aa raha what to do"
    )
    verify_response(data, "Mixed Language", ["emotional_context"])
    
    # Test 7: Cultural Context
    print("\n🧪 Test 7: Cultural Context")
    data = make_request(
        "My relatives keep comparing me to my cousins who are doctors"
    )
    verify_response(data, "Cultural Context", ["emotional_context", "agent_analysis"])

if __name__ == "__main__":
    print("🚀 Starting Chat Functionality Tests\n")
    test_chat()