"""
Test script for attendance analytics API
Run this to verify the analytics endpoints work correctly
"""
import requests
import json

BASE_URL = "http://localhost:5050"

def test_student_analytics(roll_no="24EG107848"):
    """Test student analytics endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing Student Analytics for {roll_no}")
    print('='*60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/analytics/student/{roll_no}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Student: {data.get('name')}")
            print(f"✓ Overall Attendance: {data['overall']['percentage']}%")
            print(f"✓ Total Classes: {data['overall']['totalClasses']}")
            print(f"✓ Attended: {data['overall']['attended']}")
            print(f"\nSubject-wise breakdown:")
            for subject in data.get('bySubject', []):
                print(f"  - {subject['subject']}: {subject['percentage']}% ({subject['attended']}/{subject['totalClasses']})")
        else:
            print(f"✗ Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"✗ Exception: {e}")

def test_class_analytics(class_name="AIML-B"):
    """Test class analytics endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing Class Analytics for {class_name}")
    print('='*60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/analytics/class/{class_name}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Class: {data.get('className')}")
            print(f"✓ Total Students: {data.get('totalStudents')}")
            print(f"✓ Students with Records: {data.get('studentsWithRecords')}")
            print(f"✓ Class Average: {data.get('classAverage')}%")
            print(f"\nTop 5 students:")
            for student in data.get('students', [])[:5]:
                print(f"  - {student['name']} ({student['rollNo']}): {student['overallPercentage']}%")
        else:
            print(f"✗ Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"✗ Exception: {e}")

def test_subject_analytics(subject="DAA", class_name="AIML-B"):
    """Test subject analytics endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing Subject Analytics for {subject} in {class_name}")
    print('='*60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/analytics/subject/{subject}/{class_name}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Subject: {data.get('subject')}")
            print(f"✓ Class: {data.get('className')}")
            print(f"✓ Subject Average: {data.get('subjectAverage')}%")
            print(f"\nTop 5 students:")
            for student in data.get('students', [])[:5]:
                print(f"  - {student['name']} ({student['rollNo']}): {student['percentage']}%")
        else:
            print(f"✗ Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"✗ Exception: {e}")

def test_dashboard_analytics(class_name="AIML-B"):
    """Test dashboard analytics endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing Dashboard Analytics for {class_name}")
    print('='*60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/analytics/dashboard/{class_name}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Class: {data.get('className')}")
            print(f"✓ Students with Records: {data['overview']['totalStudentsWithRecords']}")
            print(f"✓ Total Classes Conducted: {data['overview']['totalClassesConducted']}")
            print(f"\nSubject Stats:")
            for subject in data.get('subjectStats', []):
                print(f"  - {subject['subject']}: {subject['averageAttendance']}% avg")
            print(f"\nLow Attendance Alerts ({len(data.get('lowAttendanceAlerts', []))}):")
            for student in data.get('lowAttendanceAlerts', [])[:5]:
                print(f"  ⚠ {student['name']} ({student['rollNo']}): {student['percentage']:.1f}%")
        else:
            print(f"✗ Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"✗ Exception: {e}")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("ATTENDANCE ANALYTICS API TEST SUITE")
    print("="*60)
    print("\nMake sure the backend server is running on port 5050")
    print("Press Ctrl+C to exit\n")
    
    # Run all tests
    test_student_analytics()
    test_class_analytics()
    test_subject_analytics()
    test_dashboard_analytics()
    
    print("\n" + "="*60)
    print("TEST SUITE COMPLETE")
    print("="*60 + "\n")
