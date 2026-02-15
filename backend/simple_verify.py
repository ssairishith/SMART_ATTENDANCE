import requests
import urllib.parse
import sys

BASE_URL = "http://127.0.0.1:5050"
SUBJECT = "Java Programming"
SECTION = "AIML-B"

print(f"Testing {SUBJECT} for section {SECTION}...")
encoded_subject = urllib.parse.quote(SUBJECT)
encoded_section = urllib.parse.quote(SECTION)
url = f"{BASE_URL}/api/analytics/class/{encoded_subject}?section={encoded_section}"

try:
    resp = requests.get(url, timeout=5)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"Found {data['totalStudents']} students.")
        print(f"Class Average: {data['classAverage']}%")
        
        # Check for specific student
        target = "24EG107B01"
        found = False
        for s in data['students']:
            if s['rollNo'] == target:
                print(f"Student {target}: {s['attended']}/{s['totalClasses']} ({s['overallPercentage']}%)")
                found = True
                break
        if not found:
            print(f"Student {target} NOT FOUND in list.")
    else:
        print(f"Error: {resp.text}")
except Exception as e:
    print(f"Exception: {e}")
