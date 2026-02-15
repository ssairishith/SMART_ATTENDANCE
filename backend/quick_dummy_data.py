from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pathlib import Path
import random
from datetime import datetime

# Load .env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI")
AUTH_MONGO_URI = os.getenv("AUTH_MONGO_URI") or MONGO_URI

client = MongoClient(MONGO_URI)
client_auth = MongoClient(AUTH_MONGO_URI)

db = client["AttendanceDB"]
db_auth = client_auth["AuthDB"]

# Get a faculty ID
timetables = db_auth["teachers_timetables"]
tt = timetables.find_one()

if not tt:
    print("No timetable found!")
    exit()

faculty_id = tt.get("facultyId")
print(f"Faculty ID: {faculty_id}")

# Get subjects
subjects = []
for day in tt.get("timetables", []):
    for slot in day.get("slots", []):
        subj = slot.get("subjectName")
        if subj and subj not in subjects:
            subjects.append(subj)

print(f"Subjects: {subjects}")

# Get students
students = list(db.students.find().limit(50))  # Limit to 50 for speed
print(f"Students: {len(students)}")

# Create attendance records
today = datetime.now().strftime("%Y-%m-%d")
records = []

for student in students:
    for subject in subjects:
        # Create 5-10 random attendance records per subject
        for _ in range(random.randint(5, 10)):
            records.append({
                "rollNo": str(student.get("rollNo")),
                "name": student.get("name"),
                "date": today,
                "subject": subject,
                "className": f"Section-{student.get('section')}",
                "section": student.get("section"),
                "status": "present",
                "facultyId": faculty_id,
                "timestamp": datetime.utcnow()
            })

print(f"Inserting {len(records)} records...")

# Bulk insert
if records:
    db.attendance.insert_many(records)
    print(f"✓ Done! Created {len(records)} attendance records")
else:
    print("No records to insert")
