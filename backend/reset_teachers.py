#!/usr/bin/env python3
"""
Script to reset/clear teacher registration data from the database.
Run this script to remove all registered teachers.
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def reset_teachers():
    try:
        # Connect to teacher database
        mongo_uri = os.getenv("AUTH_MONGO_URI")
        if not mongo_uri:
            print("ERROR: AUTH_MONGO_URI not found in environment variables")
            return

        client = MongoClient(mongo_uri)
        db = client["TeacherAuthDB"]
        teachers_collection = db["teachers"]

        # Count teachers before deletion
        count_before = teachers_collection.count_documents({})

        # Delete all teachers
        result = teachers_collection.delete_many({})

        print("SUCCESS: Teacher data reset successful!")
        print(f"   Deleted {result.deleted_count} teachers")
        print(f"   Previously had {count_before} teachers")

        # Close connection
        client.close()

    except Exception as e:
        print(f"ERROR: Error resetting teacher data: {str(e)}")

if __name__ == "__main__":
    print("Resetting teacher registration data...")
    reset_teachers()
    print("Done!")