"""Utility script to verify AI service environment setup"""

import os
import sys
from dotenv import load_dotenv
import time
from sentence_transformers import SentenceTransformer
from langchain_google_genai import ChatGoogleGenerativeAI

def verify_environment():
    """Verify all required components for AI service"""
    print("\n🔍 Checking AI Service Environment...")
    
    # Load environment variables
    load_dotenv()
    load_dotenv(dotenv_path='../.env')
    
    issues = []
    
    # Check Python version
    print(f"\n1. Python Version: {sys.version.split()[0]}")
    if sys.version_info < (3, 9):
        issues.append("⚠️ Python version should be 3.9 or higher")
    
    # Check Gemini API key
    gemini_key = os.environ.get("GEMINI_API_KEY")
    print("\n2. Gemini API Configuration:")
    if not gemini_key:
        issues.append("⚠️ GEMINI_API_KEY not found in environment")
        print("   ❌ GEMINI_API_KEY: Not configured")
    else:
        print("   ✅ GEMINI_API_KEY: Configured")
        
        # Test Gemini connection
        try:
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                temperature=0.7
            )
            response = llm.invoke("Test message")
            print("   ✅ Gemini Connection: Successful")
        except Exception as e:
            issues.append(f"⚠️ Gemini connection failed: {str(e)}")
            print(f"   ❌ Gemini Connection: Failed - {str(e)}")
    
    # Check Murf TTS
    murf_key = os.environ.get("MURF_API_KEY")
    print("\n3. Murf TTS Configuration:")
    if not murf_key:
        print("   ℹ️ MURF_API_KEY: Not configured (optional)")
    else:
        print("   ✅ MURF_API_KEY: Configured")
    
    # Check Embedding Model
    print("\n4. Embedding Model:")
    try:
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("   ✅ Embedding Model: Initialized successfully")
    except Exception as e:
        issues.append(f"⚠️ Embedding model initialization failed: {str(e)}")
        print(f"   ❌ Embedding Model: Failed - {str(e)}")
    
    # Database Configuration
    print("\n5. Database Configuration:")
    db_vars = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"]
    missing_db_vars = [var for var in db_vars if not os.environ.get(var)]
    
    if missing_db_vars:
        issues.append(f"⚠️ Missing database variables: {', '.join(missing_db_vars)}")
        print("   ❌ Database Config: Incomplete")
        for var in missing_db_vars:
            print(f"   - Missing: {var}")
    else:
        print("   ✅ Database Config: Complete")
    
    # Summary
    print("\n=== Environment Check Summary ===")
    if issues:
        print("\n⚠️ Issues Found:")
        for issue in issues:
            print(f"- {issue}")
        print("\nℹ️ Resolution Steps:")
        print("1. Create/update .env file with missing variables")
        print("2. Install required packages: pip install -r requirements.txt")
        print("3. Verify API keys are valid")
        print("4. Check database connection details")
    else:
        print("\n✅ All checks passed! Environment is properly configured.")

if __name__ == "__main__":
    verify_environment()