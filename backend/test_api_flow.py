import requests
import json

BASE_URL = "http://localhost:5050"

def test_apis():
    print("--- Testing API Endpoints ---")
    
    # 1. Subject Analytics (Java)
    print("\n1. GET /api/analytics/class/Java?section=A")
    res = requests.get(f"{BASE_URL}/api/analytics/class/Java?section=A")
    print(f"Status: {res.status_code}")
    try:
        data = res.json()
        print(json.dumps(data, indent=2))
    except:
        print(f"Error: Not JSON. Content: {res.text[:200]}")
    
    # 2. Comprehensive Report (Teacher)
    print("\n2. POST /api/teacher/attendance-report")
    res = requests.post(f"{BASE_URL}/api/teacher/attendance-report", json={"facultyId": "faculty1"})
    print(f"Status: {res.status_code}")
    try:
        data = res.json()
        print(json.dumps(data, indent=2))
    except:
        print(f"Error: Not JSON. Content: {res.text[:200]}")
    
    # 3. HOD Dashboard
    print("\n3. GET /api/hod/dashboard-data")
    res = requests.get(f"{BASE_URL}/api/hod/dashboard-data")
    print(f"Status: {res.status_code}")
    try:
        data = res.json()
        print(json.dumps(data, indent=2))
    except:
        print(f"Error: Not JSON. Content: {res.text[:200]}")
    
    # 4. HOD History
    print("\n4. GET /api/hod/attendance-history")
    res = requests.get(f"{BASE_URL}/api/hod/attendance-history")
    print(f"Status: {res.status_code}")
    try:
        data = res.json()
        print(json.dumps(data, indent=2))
    except:
        print(f"Error: Not JSON. Content: {res.text[:200]}")

if __name__ == "__main__":
    test_apis()
