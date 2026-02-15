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

# Check total attendance records
total = db.attendance.count_documents({})
print(f"Total attendance records in DB: {total}")

# Check records by faculty
faculty_counts = {}
for record in db.attendance.find({}, {"facultyId": 1}):
    fid = record.get("facultyId", "Unknown")
    faculty_counts[fid] = faculty_counts.get(fid, 0) + 1

print("\nRecords by Faculty:")
for fid, count in faculty_counts.items():
    print(f"  {fid}: {count} records")

# Check subjects
subjects = db.attendance.distinct("subject")
print(f"\nSubjects in DB ({len(subjects)}):")
for subj in subjects[:10]:  # Show first 10
    print(f"  - {subj}")

# Sample records
print("\nSample Records:")
for record in db.attendance.find().limit(3):
    print(f"  Roll: {record.get('rollNo')}, Subject: {record.get('subject')}, Status: {record.get('status')}")

print("\n✓ Data verification complete!")
print("Now refresh the Student List page to see the attendance data!")
