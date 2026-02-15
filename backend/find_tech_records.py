from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["AttendanceDB"]

# Get today's date
from datetime import datetime
today = datetime.now().strftime("%Y-%m-%d")

print(f"Checking attendance for date: {today}")
print("\n--- All Technical Training Records (any date) ---")

tech_records = list(db.attendance.find({"subject": {"$regex": "technical", "$options": "i"}}).sort("timestamp", -1).limit(10))

if tech_records:
    print(f"Found {len(tech_records)} records")
    for i, r in enumerate(tech_records, 1):
        print(f"\n{i}. Roll: {r.get('rollNo')}, Name: {r.get('name')}")
        print(f"   Subject: '{r.get('subject')}'")
        print(f"   FacultyId: '{r.get('facultyId')}'")
        print(f"   Section: '{r.get('section')}'")
        print(f"   Status: {r.get('status')}")
        print(f"   Date: {r.get('date')}")
else:
    print("NO Technical Training records found in database!")
    print("\nChecking all subjects in DB:")
    all_subjects = db.attendance.distinct("subject")
    for subj in all_subjects:
        print(f"  - '{subj}'")
