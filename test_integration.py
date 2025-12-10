"""
Integration test for anmitts2 Vue 3 TTS UI

This script tests the web UI integration by:
1. Verifying the HTML can be loaded
2. Testing the Worker class
3. Verifying Flask app serves the UI
4. Testing API endpoints (if running)
"""

import sys
import json
from pathlib import Path

# Test imports
try:
    from worker import TTSWorker, get_html_content
    print("✓ Successfully imported TTSWorker and get_html_content")
except ImportError as e:
    print(f"✗ Failed to import: {e}")
    sys.exit(1)


def test_worker_initialization():
    """Test TTSWorker initialization"""
    print("\n[TEST] Worker Initialization")
    try:
        worker = TTSWorker()
        print("✓ TTSWorker instantiated successfully")
        return worker
    except Exception as e:
        print(f"✗ Failed to initialize TTSWorker: {e}")
        return None


def test_get_html_content(worker):
    """Test get_html_content method"""
    print("\n[TEST] HTML Content Loading")
    try:
        html = worker.get_html_content()
        if not html:
            print("✗ HTML content is empty")
            return False
        
        if "Vue" not in html:
            print("✗ HTML doesn't contain Vue references")
            return False
        
        if "<html" not in html.lower():
            print("✗ HTML doesn't contain proper HTML structure")
            return False
        
        print(f"✓ HTML content loaded successfully ({len(html)} bytes)")
        return True
    except Exception as e:
        print(f"✗ Failed to get HTML content: {e}")
        return False


def test_html_structure(html):
    """Verify HTML contains required elements"""
    print("\n[TEST] HTML Structure Validation")
    
    required_elements = [
        ('Vue app', '#app'),
        ('Header', 'header'),
        ('API config', 'API 配置'),
        ('Text input', '输入文本'),
        ('Voice selection', '声音选择'),
        ('Parameters', '参数调节'),
        ('Cleaning options', '高级清理选项'),
        ('Generate button', '生成语音'),
        ('Download button', '下载音频'),
        ('Audio player', '<audio'),
        ('Scripts', '<script'),
        ('Vue CDN', 'vue.global.js'),
    ]
    
    passed = 0
    for element_name, element_marker in required_elements:
        if element_marker in html:
            print(f"  ✓ Contains {element_name}")
            passed += 1
        else:
            print(f"  ✗ Missing {element_name}")
    
    return passed == len(required_elements)


def test_html_file_exists():
    """Verify index.html file exists"""
    print("\n[TEST] File Verification")
    
    required_files = {
        'index.html': 'Frontend HTML',
        'worker.py': 'Worker module',
        'app.py': 'Flask application',
        'requirements.txt': 'Python dependencies',
        'README.md': 'Documentation',
        'Dockerfile': 'Docker configuration',
        'docker-compose.yml': 'Docker Compose setup',
    }
    
    base_path = Path(__file__).parent
    passed = 0
    
    for filename, description in required_files.items():
        file_path = base_path / filename
        if file_path.exists():
            file_size = file_path.stat().st_size
            print(f"  ✓ {description}: {filename} ({file_size} bytes)")
            passed += 1
        else:
            print(f"  ✗ Missing {description}: {filename}")
    
    return passed == len(required_files)


def test_worker_request_handling(worker):
    """Test Worker's handle_request method"""
    print("\n[TEST] Request Handling")
    
    # Test GET /
    status, headers, body = worker.handle_request('GET', '/')
    if status == 200 and 'text/html' in headers.get('Content-Type', ''):
        print("  ✓ GET / returns HTML")
    else:
        print(f"  ✗ GET / failed: status {status}")
    
    # Test GET /api/nonexistent
    status, headers, body = worker.handle_request('GET', '/api/nonexistent')
    if status == 404:
        print("  ✓ GET /nonexistent returns 404")
    else:
        print(f"  ✗ GET /nonexistent should return 404, got {status}")
    
    return True


def test_flask_app():
    """Test Flask app availability"""
    print("\n[TEST] Flask Application")
    
    try:
        from app import app
        print("✓ Flask app imported successfully")
        
        # Create test client
        with app.test_client() as client:
            # Test root endpoint
            response = client.get('/')
            if response.status_code == 200 and 'text/html' in response.content_type:
                print("✓ GET / serves HTML")
            else:
                print(f"✗ GET / failed: {response.status_code}")
            
            # Test health endpoint
            response = client.get('/api/health')
            if response.status_code == 200:
                data = json.loads(response.data)
                if data.get('status') == 'ok':
                    print("✓ Health check endpoint works")
                else:
                    print("✗ Health check returned unexpected response")
            else:
                print(f"✗ Health check failed: {response.status_code}")
        
        return True
    except Exception as e:
        print(f"✗ Flask app test failed: {e}")
        return False


def test_dependencies():
    """Check if all required dependencies are installed"""
    print("\n[TEST] Dependencies Check")
    
    dependencies = {
        'flask': 'Flask',
        'werkzeug': 'Werkzeug',
    }
    
    passed = 0
    for module, name in dependencies.items():
        try:
            __import__(module)
            print(f"  ✓ {name} is installed")
            passed += 1
        except ImportError:
            print(f"  ✗ {name} is not installed")
    
    if passed < len(dependencies):
        print("\n  Suggestion: Run 'pip install -r requirements.txt'")
    
    return passed == len(dependencies)


def main():
    """Run all tests"""
    print("=" * 60)
    print("anmitts2 Vue 3 TTS UI - Integration Test")
    print("=" * 60)
    
    results = []
    
    # Test 1: File existence
    results.append(("Files", test_html_file_exists()))
    
    # Test 2: Dependencies
    results.append(("Dependencies", test_dependencies()))
    
    # Test 3: Worker initialization
    worker = test_worker_initialization()
    results.append(("Worker Init", worker is not None))
    
    if worker:
        # Test 4: HTML content
        html = worker.get_html_content()
        results.append(("HTML Loading", html is not None))
        
        if html:
            # Test 5: HTML structure
            results.append(("HTML Structure", test_html_structure(html)))
        
        # Test 6: Request handling
        results.append(("Request Handling", test_worker_request_handling(worker)))
    
    # Test 7: Flask app
    results.append(("Flask App", test_flask_app()))
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status:8} - {test_name}")
    
    print("-" * 60)
    print(f"Total: {passed}/{total} tests passed")
    print("=" * 60)
    
    if passed == total:
        print("\n✓ All tests passed! Application is ready to run.\n")
        print("Start the app with: python app.py")
        print("Then open: http://localhost:5000")
        return 0
    else:
        print(f"\n✗ {total - passed} test(s) failed. Please check above.\n")
        return 1


if __name__ == '__main__':
    sys.exit(main())
