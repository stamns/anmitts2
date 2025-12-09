#!/usr/bin/env python3
"""
NanoAITTS Worker - Python Test Examples

This script demonstrates how to use the NanoAITTS Worker from Python
with various HTTP libraries.

Requirements:
    pip install requests

Usage:
    python3 tests/test_python.py [base_url]
    
Example:
    python3 tests/test_python.py http://localhost:8787
    python3 tests/test_python.py https://your-worker.workers.dev
"""

import sys
import requests
import json
from typing import Optional, Dict, Any
import time

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8787"


class NanoAITTSClient:
    """Client for NanoAITTS Worker API"""

    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "NanoAITTS-Python-Client/1.0"
        })

    def health_check(self) -> Dict[str, Any]:
        """Check if the service is healthy"""
        response = self.session.get(f"{self.base_url}/api/health")
        response.raise_for_status()
        return response.json()

    def get_models(self) -> Dict[str, Any]:
        """Get available TTS models"""
        response = self.session.get(f"{self.base_url}/v1/models")
        response.raise_for_status()
        return response.json()

    def get_voices(self) -> Dict[str, Any]:
        """Get available voices"""
        response = self.session.get(f"{self.base_url}/v1/voices")
        response.raise_for_status()
        return response.json()

    def synthesize(
        self,
        text: str,
        voice: str = "DeepSeek",
        speed: float = 1.0,
        pitch: float = 1.0,
        stream: bool = False,
    ) -> bytes:
        """
        Convert text to speech

        Args:
            text: Text to convert
            voice: Voice ID (default: DeepSeek)
            speed: Playback speed 0.5-2.0 (default: 1.0)
            pitch: Pitch adjustment 0.5-2.0 (default: 1.0)
            stream: Enable streaming (default: False)

        Returns:
            Audio data (MP3 bytes)
        """
        data = {
            "input": text,
            "voice": voice,
            "speed": speed,
            "pitch": pitch,
            "stream": stream,
        }

        response = self.session.post(
            f"{self.base_url}/v1/audio/speech",
            json=data,
        )
        response.raise_for_status()
        return response.content

    def refresh_voices(self, api_key: Optional[str] = None) -> Dict[str, Any]:
        """Refresh voice cache"""
        headers = {}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        response = self.session.post(
            f"{self.base_url}/v1/voices/refresh",
            headers=headers,
        )
        response.raise_for_status()
        return response.json()

    def save_audio(self, text: str, filename: str, voice: str = "DeepSeek"):
        """Save synthesized speech to file"""
        audio = self.synthesize(text, voice=voice)
        with open(filename, "wb") as f:
            f.write(audio)
        print(f"✅ Audio saved to {filename} ({len(audio)} bytes)")


def print_section(title: str):
    """Print a section header"""
    print(f"\n{'=' * 50}")
    print(f"  {title}")
    print(f"{'=' * 50}\n")


def test_health():
    """Test health check endpoint"""
    print_section("Health Check")
    client = NanoAITTSClient()
    result = client.health_check()
    print(f"Status: {result['status']}")
    print(f"Service: {result['service']}")
    print(f"Voices Available: {result['voicesAvailable']}")
    print(f"Timestamp: {result['timestamp']}")


def test_models():
    """Test models endpoint"""
    print_section("Available Models")
    client = NanoAITTSClient()
    result = client.get_models()
    for model in result["data"]:
        print(f"  - {model['id']}: {model['owned_by']}")


def test_voices():
    """Test voices endpoint"""
    print_section("Available Voices")
    client = NanoAITTSClient()
    result = client.get_voices()
    for voice in result["data"]:
        print(f"  - {voice['id']}: {voice['name']}")


def test_simple_synthesis():
    """Test simple speech synthesis"""
    print_section("Simple Speech Synthesis")
    client = NanoAITTSClient()

    texts = [
        "Hello, world!",
        "你好，世界",
        "こんにちは、世界",
    ]

    for text in texts:
        print(f"Synthesizing: '{text}'")
        start = time.time()
        audio = client.synthesize(text)
        elapsed = time.time() - start
        print(f"  ✅ Generated {len(audio)} bytes in {elapsed:.2f}s\n")


def test_with_parameters():
    """Test synthesis with custom parameters"""
    print_section("Synthesis with Custom Parameters")
    client = NanoAITTSClient()

    test_cases = [
        ("Test with normal speed", {"speed": 1.0}),
        ("Test with faster speed", {"speed": 1.5}),
        ("Test with slower speed", {"speed": 0.8}),
        ("Test with higher pitch", {"pitch": 1.3}),
        ("Test with lower pitch", {"pitch": 0.8}),
    ]

    for text, params in test_cases:
        print(f"Synthesizing: '{text}'")
        print(f"  Parameters: {params}")
        try:
            audio = client.synthesize(text, **params)
            print(f"  ✅ Generated {len(audio)} bytes\n")
        except Exception as e:
            print(f"  ❌ Error: {e}\n")


def test_long_text():
    """Test synthesis with long text (auto-chunking)"""
    print_section("Long Text Synthesis (Auto-Chunking)")
    client = NanoAITTSClient()

    # Create a long text
    long_text = "这是一个长文本测试。" * 30  # ~480 characters
    print(f"Text length: {len(long_text)} characters")
    print(f"Text preview: {long_text[:100]}...")

    try:
        audio = client.synthesize(long_text)
        print(f"\n✅ Generated {len(audio)} bytes")
    except Exception as e:
        print(f"\n❌ Error: {e}")


def test_error_handling():
    """Test error handling"""
    print_section("Error Handling")
    client = NanoAITTSClient()

    test_cases = [
        ("Empty text", {"input": "", "voice": "DeepSeek"}),
        ("Missing text", {"voice": "DeepSeek"}),
        ("Invalid voice", {"input": "test", "voice": "InvalidVoice"}),
        ("Invalid speed", {"input": "test", "voice": "DeepSeek", "speed": 5.0}),
    ]

    for test_name, data in test_cases:
        print(f"Testing: {test_name}")
        try:
            response = requests.post(
                f"{BASE_URL}/v1/audio/speech",
                json=data,
            )
            if response.status_code >= 400:
                error = response.json()
                print(f"  ✅ Correctly rejected: {error['error']['message']}\n")
            else:
                print(f"  ❌ Should have failed\n")
        except Exception as e:
            print(f"  ❌ Unexpected error: {e}\n")


def test_file_save():
    """Test saving audio to file"""
    print_section("Saving Audio to File")
    client = NanoAITTSClient()

    texts = [
        ("hello_en.mp3", "Hello, this is a test."),
        ("hello_zh.mp3", "这是一个测试。"),
    ]

    for filename, text in texts:
        try:
            client.save_audio(text, filename)
        except Exception as e:
            print(f"❌ Error saving {filename}: {e}")


def test_with_openai_client():
    """Test using OpenAI client library as drop-in replacement"""
    print_section("OpenAI Client Compatibility")

    try:
        from openai import OpenAI

        # Configure to use NanoAITTS Worker as base URL
        client = OpenAI(
            api_key="not-used",  # API key not required for public endpoints
            base_url=BASE_URL,
        )

        print("Using OpenAI client library with NanoAITTS Worker...")
        response = client.audio.speech.create(
            model="DeepSeek",
            input="Hello from OpenAI client!",
            voice="DeepSeek",
        )

        # Save to file
        response.stream_to_file("openai_test.mp3")
        print("✅ Successfully created audio using OpenAI client")

    except ImportError:
        print("ℹ️  OpenAI library not installed. Install with: pip install openai")
    except Exception as e:
        print(f"❌ Error: {e}")


def main():
    """Run all tests"""
    print("🚀 NanoAITTS Worker - Python Test Suite")
    print(f"📍 Base URL: {BASE_URL}")

    try:
        test_health()
        test_models()
        test_voices()
        test_simple_synthesis()
        test_with_parameters()
        test_long_text()
        test_error_handling()
        test_file_save()
        test_with_openai_client()

        print("\n" + "=" * 50)
        print("✅ All tests completed!")
        print("=" * 50)

    except requests.ConnectionError:
        print(f"❌ Cannot connect to {BASE_URL}")
        print("Make sure the worker is running: npm run dev")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test error: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
