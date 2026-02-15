import requests
import json
import urllib.parse

# Configuration
BASE_URL = "http://localhost:5050"
SUBJECT = "Java Programming"
SECTION = "AIML-B" # This should match what the dashboard sends

def test_subject_analytics():
    encoded_subject = urllib.parse.quote(SUBJECT)
    encoded_section = urllib.parse.quote(SECTION)
    
    url = f"{BASE_URL}/api/analytics/class/{encoded_subject}?section={encoded_section}"
    
    print(f"Testing URL: {url}")
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n--- Analytics Summary ---")
            print(f"Subject: {data.get('className')}")
            print(f"Section Filter: {data.get('section')}")
            print(f"Total Students: {data.get('totalStudents')}")
            print(f"Class Average: {data.get('classAverage')}%")
            
            print("\n--- Student Samples (Top 5) ---")
            students = data.get('students', [])
            for i, s in enumerate(students[:5]):
                print(f"{i+1}. {s.get('name')} ({s.get('rollNo')})")
                print(f"   Attendance: {s.get('attended')}/{s.get('totalClasses')} ({s.get('overallPercentage')}%)")
                
            # Check specifically for the student who had 0/3 before
            target_roll = "24EG107B01"
            target = next((s for s in students if s['rollNo'] == target_roll), None)
            if target:
                print(f"\n--- Target Student ({target_roll}) ---")
                print(f"   Name: {target.get('name')}")
                print(f"   Attendance: {target.get('attended')}/{target.get('totalClasses')}")
                print(f"   Percentage: {target.get('overallPercentage')}%")
            else:
                print(f"\nTarget student {target_roll} not found in response.")
                
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_subject_analytics()
