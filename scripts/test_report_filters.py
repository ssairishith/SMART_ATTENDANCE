import requests
import json
import os
from datetime import datetime

# Use localhost for internal testing
API_BASE = "http://localhost:5050"
FACULTY_ID = "F001" # Valid faculty ID found in DB

def test_report(filters):
    print(f"\nTesting report with filters: {filters}")
    url = f"{API_BASE}/api/teacher/attendance-report"
    payload = {"facultyId": FACULTY_ID, **filters}
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"Success! Found {len(data['students'])} students and {len(data['subjects'])} subjects.")
            if data['students']:
                sample = [s for s in data['students'] if any(v > 0 for v in s['subjects'].values())]
                if not sample: sample = [data['students'][0]]
                s = sample[0]
                print(f"Sample Student: {s['rollNo']} ({s['name']})")
                print(f"Total Score: {s['totalScore']}%")
                print(f"Subjects: {s['subjects']}")
        else:
            print(f"Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Failed to connect: {e}")

if __name__ == "__main__":
    # 1. Full report
    test_report({})
    
    # 2. Roll number filter
    # We'll use a roll number that likely has attendance
    test_report({"rollNo": "24EG107B01"})
    
    # 3. Date range filter (Wide range to catch data)
    test_report({"startDate": "2026-02-01", "endDate": "2026-02-15"})
    
    # 4. Out of range filter
    test_report({"startDate": "2020-01-01", "endDate": "2020-01-02"})
