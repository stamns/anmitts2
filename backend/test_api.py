"""
Simple test script for TTS API endpoints
Run with: python test_api.py
"""

import json
import sys
from app.services.tts_service import NanoAITTS
from app.routes.tts import init_tts_service


def test_tts_service():
    """Test TTS service initialization and voice loading"""
    print("=" * 60)
    print("Testing TTS Service")
    print("=" * 60)
    
    # Test service initialization
    print("\n1. Testing TTS Service Initialization...")
    try:
        init_tts_service()
        print("   ✓ TTS service initialized successfully")
    except Exception as e:
        print(f"   ✗ Failed to initialize TTS service: {e}")
        return False
    
    # Test voice loading
    print("\n2. Testing Voice List Loading...")
    try:
        tts = NanoAITTS()
        voices = tts.voices
        if not voices:
            print("   ✗ No voices loaded")
            return False
        print(f"   ✓ Loaded {len(voices)} voices")
        for voice_id, info in voices.items():
            print(f"     - {voice_id}: {info['name']}")
    except Exception as e:
        print(f"   ✗ Failed to load voices: {e}")
        return False
    
    # Test voice availability
    print("\n3. Testing Voice Availability...")
    try:
        if "DeepSeek" not in voices:
            print("   ⚠ Default voice 'DeepSeek' not found, but other voices available")
        else:
            print("   ✓ Default voice 'DeepSeek' is available")
    except Exception as e:
        print(f"   ✗ Error checking voice availability: {e}")
        return False
    
    # Test hash generation
    print("\n4. Testing Hash Generation...")
    try:
        tts = NanoAITTS()
        unique_hash = tts.generate_unique_hash()
        mid = tts.generate_mid()
        print(f"   ✓ Generated unique hash: {unique_hash}")
        print(f"   ✓ Generated MID: {mid}")
    except Exception as e:
        print(f"   ✗ Failed to generate hashes: {e}")
        return False
    
    # Test header generation
    print("\n5. Testing Header Generation...")
    try:
        tts = NanoAITTS()
        headers = tts.get_headers()
        required_headers = ["device-platform", "timestamp", "access-token", "zm-token"]
        for header in required_headers:
            if header not in headers:
                print(f"   ✗ Missing header: {header}")
                return False
        print(f"   ✓ All required headers generated")
        print(f"     Headers: {list(headers.keys())}")
    except Exception as e:
        print(f"   ✗ Failed to generate headers: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("All TTS Service Tests Passed! ✓")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = test_tts_service()
    sys.exit(0 if success else 1)
