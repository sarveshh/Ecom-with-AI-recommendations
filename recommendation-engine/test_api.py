"""
Test script for the AI Recommendation Engine
Run this after starting the Flask app to test the API endpoints
"""

import json
import sys

import requests

# Configuration
BASE_URL = "http://localhost:5000"
TIMEOUT = 10


def test_health_endpoint():
    """Test the health check endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False

    except requests.ConnectionError:
        print("❌ Connection failed. Make sure the Flask app is running on port 5000")
        return False
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        return False


def test_recommendations_endpoint():
    """Test the recommendations endpoint"""
    print("\n🔍 Testing recommendations endpoint...")

    test_data = {
        "userId": "test_user_123",
        "purchaseHistory": ["672a1b2c3d4e5f6789012345", "672a1b2c3d4e5f6789012346"],
        "numRecommendations": 3,
    }

    try:
        response = requests.post(
            f"{BASE_URL}/recommendations",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT,
        )

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Recommendations received: {json.dumps(data, indent=2)}")

            # Validate response structure
            if all(key in data for key in ["success", "recommendations", "userId"]):
                print("✅ Response structure is valid")
                return True
            else:
                print("❌ Response structure is invalid")
                return False
        else:
            print(f"❌ Recommendations failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Recommendations error: {str(e)}")
        return False


def test_error_handling():
    """Test error handling with invalid requests"""
    print("\n🔍 Testing error handling...")

    # Test missing userId
    test_data_missing_user = {
        "purchaseHistory": ["672a1b2c3d4e5f6789012345"],
        "numRecommendations": 3,
    }

    try:
        response = requests.post(
            f"{BASE_URL}/recommendations",
            json=test_data_missing_user,
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT,
        )

        if response.status_code == 400:
            data = response.json()
            print(f"✅ Error handling works: {data.get('message', 'No message')}")
            return True
        else:
            print(f"❌ Expected 400 error, got {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Error handling test failed: {str(e)}")
        return False


def main():
    """Run all tests"""
    print("🤖 AI Recommendation Engine Test Suite")
    print("=" * 50)

    tests_passed = 0
    total_tests = 3

    # Run tests
    if test_health_endpoint():
        tests_passed += 1

    if test_recommendations_endpoint():
        tests_passed += 1

    if test_error_handling():
        tests_passed += 1

    # Summary
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tests_passed}/{total_tests} tests passed")

    if tests_passed == total_tests:
        print("🎉 All tests passed! The recommendation engine is working correctly.")
        sys.exit(0)
    else:
        print("❌ Some tests failed. Please check the output above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
