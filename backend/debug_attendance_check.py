
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import pprint
from pathlib import Path
from datetime import datetime

# Load .env from backend directory
env_path = Path(__file__).parent / '.env'
print(f"Loading .env from: {env_path}")
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["AttendanceDB"]
attendance_col = db["attendance"]

today = datetime.now().strftime("%Y-%m-%d")
print(f"Checking for records created TODAY: {today} or recent dates...")

# Find records with date matching today
recent_records = list(attendance_col.find({"date": today}).limit(10))

if recent_records:
    print(f"Found {len(recent_records)} records for TODAY ({today}):")
    for rec in recent_records:
        print(f"Subject: '{rec.get('subject')}'")
        print(f"Section: '{rec.get('section')}'")
        print(f"RollNo: '{rec.get('rollNo')}'")
        print(f"FacultyId: '{rec.get('facultyId')}'")
        print(f"Status: '{rec.get('status')}'")
        print("-" * 20)
else:
    print(f"No records found for date {today}. Checking all dates for 'Technical'...")
    regex = {"$regex": "technical", "$options": "i"}
    tech_records = list(attendance_col.find({"subject": regex}).sort("timestamp", -1).limit(5))
    for rec in tech_records:
        print(f"Subject: '{rec.get('subject')}'")
        print(f"Date: '{rec.get('date')}'")
        print(f"RollNo: '{rec.get('rollNo')}'")
        print(f"FacultyId: '{rec.get('facultyId')}'")
        print("-" * 20)
