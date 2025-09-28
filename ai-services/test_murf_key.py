#!/usr/bin/env python3
"""
Test script to verify Murf API key is properly loaded
Run this from the ai-services directory: python test_murf_key.py
"""

import os
from dotenv import load_dotenv

print("=== Murf API Key Test ===")
print(f"Current working directory: {os.getcwd()}")

# Try loading environment variables from multiple locations
print("\n1. Loading from current directory (.env)...")
load_dotenv()
murf_key_1 = os.environ.get("MURF_API_KEY")
print(f"Result: {'✅ FOUND' if murf_key_1 else '❌ NOT FOUND'}")
if murf_key_1:
    print(f"Preview: {murf_key_1[:15]}...")

print("\n2. Loading from parent directory (../.env)...")
load_dotenv(dotenv_path='../.env')
murf_key_2 = os.environ.get("MURF_API_KEY")
print(f"Result: {'✅ FOUND' if murf_key_2 else '❌ NOT FOUND'}")
if murf_key_2:
    print(f"Preview: {murf_key_2[:15]}...")

print("\n3. Final environment variable check...")
final_key = os.environ.get("MURF_API_KEY")
print(f"MURF_API_KEY in environment: {'✅ YES' if final_key else '❌ NO'}")
if final_key:
    print(f"Key length: {len(final_key)} characters")
    print(f"Key preview: {final_key[:15]}...")
    print(f"Valid format: {'✅ YES' if final_key.startswith('ap2_') else '❌ NO (should start with ap2_)'}")

print("\n4. Testing MurfTTSService import...")
try:
    from murf_tts_service import MurfTTSService
    service = MurfTTSService()
    print(f"Service initialized: ✅ YES")
    print(f"API key accessible: {'✅ YES' if service.api_key else '❌ NO'}")
    print(f"API key valid: {'✅ YES' if service.validate_api_key() else '❌ NO'}")
except Exception as e:
    print(f"Import failed: ❌ {e}")

print("\n=== Test Complete ===")