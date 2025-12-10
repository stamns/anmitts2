/**
 * Test script for NanoAITTS Worker
 * 
 * This script contains test examples for all API endpoints.
 * You can run these with curl or use them as reference for your own tests.
 * 
 * Usage:
 *   npm run dev  # Start local server
 *   ./tests/run-tests.sh  # Run all tests (create this file)
 */

const BASE_URL = 'http://localhost:8787';

/**
 * Test utilities
 */
async function test(name, fn) {
  try {
    console.log(`\n📝 Testing: ${name}`);
    await fn();
    console.log(`✅ ${name} passed`);
  } catch (error) {
    console.error(`❌ ${name} failed:`, error.message);
  }
}

async function request(method, path, body = null, headers = {}) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = response.status === 200 || response.status === 201 
    ? response.headers.get('content-type')?.includes('application/json')
      ? await response.json()
      : await response.text()
    : await response.json();

  return {
    status: response.status,
    data,
    headers: response.headers,
  };
}

/**
 * Test cases
 */

async function testHealthCheck() {
  const { status, data } = await request('GET', '/api/health');
  if (status !== 200) throw new Error(`Expected 200, got ${status}`);
  if (!data.status || data.status !== 'healthy') throw new Error('Health check failed');
  if (!data.voicesAvailable) throw new Error('No voices available');
  console.log(`  ✓ Service is healthy with ${data.voicesAvailable} voices`);
}

async function testModels() {
  const { status, data } = await request('GET', '/v1/models');
  if (status !== 200) throw new Error(`Expected 200, got ${status}`);
  if (!Array.isArray(data.data)) throw new Error('Expected data array');
  if (data.data.length === 0) throw new Error('No models available');
  console.log(`  ✓ Found ${data.data.length} models`);
  console.log(`  ✓ Available models: ${data.data.map(m => m.id).join(', ')}`);
}

async function testVoices() {
  const { status, data } = await request('GET', '/v1/voices');
  if (status !== 200) throw new Error(`Expected 200, got ${status}`);
  if (!Array.isArray(data.data)) throw new Error('Expected data array');
  if (data.data.length === 0) throw new Error('No voices available');
  console.log(`  ✓ Found ${data.data.length} voices`);
  data.data.forEach(voice => {
    console.log(`    - ${voice.id}: ${voice.name}`);
  });
  return data.data[0].id; // Return first voice ID for speech test
}

async function testSpeech(voiceId) {
  const { status, data } = await request('POST', '/v1/audio/speech', {
    input: 'Hello, this is a test. 你好，这是一个测试。',
    voice: voiceId,
    speed: 1.0,
    pitch: 1.0,
  });

  if (status !== 200) throw new Error(`Expected 200, got ${status}`);
  if (typeof data !== 'string' && !data) throw new Error('No audio data received');
  console.log(`  ✓ Generated audio with voice: ${voiceId}`);
  console.log(`  ✓ Response size: ${JSON.stringify(data).length} bytes`);
}

async function testSpeechWithChunking() {
  const longText = '这是一个比较长的文本测试。'.repeat(50); // Generate long text
  const { status, data } = await request('POST', '/v1/audio/speech', {
    input: longText,
    voice: 'DeepSeek',
  });

  if (status !== 200) throw new Error(`Expected 200, got ${status}`);
  console.log(`  ✓ Generated audio for long text (${longText.length} chars)`);
}

async function testValidation() {
  // Test missing input
  const { status, data } = await request('POST', '/v1/audio/speech', {
    voice: 'DeepSeek',
  });

  if (status === 200) throw new Error('Should reject missing input');
  if (!data.error) throw new Error('Should return error object');
  console.log(`  ✓ Correctly rejected missing input: ${data.error.message}`);

  // Test invalid voice
  const { status: status2, data: data2 } = await request('POST', '/v1/audio/speech', {
    input: 'Test',
    voice: 'NonExistentVoice',
  });

  if (status2 === 200) throw new Error('Should reject invalid voice');
  if (!data2.error) throw new Error('Should return error object');
  console.log(`  ✓ Correctly rejected invalid voice: ${data2.error.message}`);

  // Test empty input
  const { status: status3, data: data3 } = await request('POST', '/v1/audio/speech', {
    input: '',
    voice: 'DeepSeek',
  });

  if (status3 === 200) throw new Error('Should reject empty input');
  console.log(`  ✓ Correctly rejected empty input`);
}

async function testCORS() {
  const options = {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://example.com',
    },
  };

  const response = await fetch(`${BASE_URL}/v1/audio/speech`, options);
  const corsHeader = response.headers.get('access-control-allow-origin');
  
  if (!corsHeader) throw new Error('No CORS header');
  console.log(`  ✓ CORS header present: ${corsHeader}`);
}

async function testNotFound() {
  const { status, data } = await request('GET', '/v1/nonexistent');
  if (status !== 404) throw new Error(`Expected 404, got ${status}`);
  if (!data.error) throw new Error('Should return error object');
  console.log(`  ✓ Correctly returned 404 for nonexistent endpoint`);
}

async function testRefreshVoices() {
  const { status, data } = await request('POST', '/v1/voices/refresh');
  // Without API key, may fail if configured
  if (status === 401) {
    console.log(`  ℹ Voice refresh protected with API key (expected in production)`);
  } else if (status === 200) {
    if (data.voicesCount) {
      console.log(`  ✓ Refreshed voices: ${data.voicesCount} available`);
    }
  } else {
    console.log(`  ℹ Unexpected status: ${status}`);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting NanoAITTS Worker Tests');
  console.log(`📍 Base URL: ${BASE_URL}\n`);

  try {
    await test('Health Check', testHealthCheck);
    await test('Get Models', testModels);
    
    let voiceId = 'DeepSeek';
    await test('Get Voices', async () => {
      voiceId = await testVoices();
    });

    await test('Speech Synthesis', () => testSpeech(voiceId));
    await test('Speech Synthesis with Chunking', testSpeechWithChunking);
    await test('Input Validation', testValidation);
    await test('CORS Support', testCORS);
    await test('Not Found Error', testNotFound);
    await test('Refresh Voices', testRefreshVoices);

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
    process.exit(1);
  }
}

// Run tests if this is the main module
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}

export { test, request };
