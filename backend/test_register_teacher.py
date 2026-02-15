#!/usr/bin/env python3
"""
Test script to register a teacher using the API.
Run this to test teacher registration functionality.
"""

import requests
import json

# Backend URL
BASE_URL = "http://localhost:5050"

def test_register_teacher():
    """Test teacher registration API"""

    # Test data
    teacher_data = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "password": "password123",
        "facultyId": "FAC001"
    }

    try:
        print("Testing teacher registration API...")
        print(f"POST {BASE_URL}/api/teacher/register")
        print(f"Data: {json.dumps(teacher_data, indent=2)}")

        # Make API request
        response = requests.post(
            f"{BASE_URL}/api/teacher/register",
            json=teacher_data,
            headers={"Content-Type": "application/json"}
        )

        print(f"\nResponse Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 201:
            print("\nSUCCESS: Teacher registration successful!")

            # Test login with the registered teacher
            print("\nTesting login with registered teacher...")
            login_data = {
                "email": teacher_data["email"],
                "password": teacher_data["password"]
            }

            login_response = requests.post(
                f"{BASE_URL}/api/teacher/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )

            print(f"Login Response Status: {login_response.status_code}")
            print(f"Login Response: {json.dumps(login_response.json(), indent=2)}")

            if login_response.status_code == 200:
                print("\nSUCCESS: Teacher login successful!")
                print("Teacher registration and login working perfectly!")
            else:
                print("\nERROR: Teacher login failed!")
        else:
            print("\nERROR: Teacher registration failed!")

    except requests.exceptions.ConnectionError:
        print("ERROR: Connection Error: Make sure the Flask backend is running on port 5050")
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    test_register_teacher()