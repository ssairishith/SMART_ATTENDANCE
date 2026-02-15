from pymongo import MongoClient
import os
from dotenv import load_dotenv
import numpy as np

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("ERROR: MONGO_URI not found in .env")
    exit(1)

try:
    client = MongoClient(MONGO_URI)
    db = client["AttendanceDB"]
    students_col = db["students"]

    total_count = students_col.count_documents({})
    arcface_count = students_col.count_documents({"model": "arcface"})

    print(f"Total Students: {total_count}")
    print(f"Students with model='arcface': {arcface_count}")

    if arcface_count > 0:
        sample = students_col.find_one({"model": "arcface"})
        print("\nSample Student:")
        print(f"  Name: {sample.get('name')}")
        print(f"  Roll: {sample.get('rollNo')}")
        
        encoding = sample.get('face_encoding')
        if encoding:
            print(f"  Encoding Type: {type(encoding)}")
            if isinstance(encoding, list):
                print(f"  Encoding Length: {len(encoding)}")
                print(f"  First 5 values: {encoding[:5]}")
            else:
                print(f"  Encoding is not a list!")
        else:
            print("  No 'face_encoding' field found!")
    else:
        print("\nWARNING: No students have 'model': 'arcface'. Recognition will fail.")
        # Check if there are students with other models
        other_models = students_col.distinct("model")
        print(f"Available models in DB: {other_models}")

except Exception as e:
    print(f"Connection Error: {e}")
