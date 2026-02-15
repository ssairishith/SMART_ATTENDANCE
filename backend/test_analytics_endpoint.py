import requests
import json

# Test the analytics endpoint
url = "http://localhost:5050/api/analytics/class/AIML-B"

try:
    print(f"Testing endpoint: {url}")
    response = requests.get(url, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response:")
    print(json.dumps(response.json(), indent=2))
except requests.exceptions.ConnectionError as e:
    print(f"Connection Error: Backend server is not running on port 5000")
    print(f"Error details: {e}")
except requests.exceptions.Timeout:
    print("Request timed out")
except Exception as e:
    print(f"Error: {e}")
