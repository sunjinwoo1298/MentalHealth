"""
Quick test to see what parameters the Murf SDK actually supports
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

try:
    from murf import Murf
    
    # Initialize client
    client = Murf(api_key=os.getenv('MURF_API_KEY'))
    
    # Test with minimal parameters
    print("🧪 Testing Murf API with minimal parameters...")
    
    response = client.text_to_speech.generate(
        text="Hello, this is a test.",
        voice_id="en-US-natalie"
    )
    
    print("✅ Success! Response attributes:")
    for attr in dir(response):
        if not attr.startswith('_'):
            try:
                value = getattr(response, attr)
                print(f"  {attr}: {type(value)} = {str(value)[:100]}")
            except Exception as e:
                print(f"  {attr}: Error getting value - {e}")
                
except Exception as e:
    print(f"❌ Error: {e}")
    print("Make sure MURF_API_KEY is set and murf package is installed")