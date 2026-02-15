from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pathlib import Path
import random
from datetime import datetime, timedelta

# Load .env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI")
AUTH_MONGO_URI = os.getenv("AUTH_MONGO_URI") or MONGO_URI

client = MongoClient(MONGO_URI)
client_auth = MongoClient(AUTH_MONGO_URI)

db = client["AttendanceDB"]
db_auth = client_auth["AuthDB"]

# Get a faculty ID (use first available)
timetables = db_auth["teachers_timetables"]
tt = timetables.find_one()

if not tt:
    print("No timetable found. Please create a teacher profile first.")
    exit()

faculty_id = tt.get("facultyId")
print(f"Using Faculty ID: {faculty_id}")

# Get all subjects from timetable
subjects = []
for day in tt.get("timetables", []):
    for slot in day.get("slots", []):
        subj = slot.get("subjectName")
        if subj and subj not in subjects:
            subjects.append(subj)

print(f"Found subjects: {subjects}")

# Get all students
students = list(db.students.find())
print(f"Found {len(students)} students")

if len(students) == 0:
    print("No students found. Please register students first.")
    exit()

# Generate random attendance for past 30 days
print("\nGenerating dummy attendance data...")
count = 0

for student in students:
    roll = str(student.get("rollNo"))
    name = student.get("name")
    section = student.get("section")
    
    # For each subject, create random attendance records
    for subject in subjects:
        # Random number of attendance sessions (5-15)
        num_sessions = random.randint(5, 15)
        
        for i in range(num_sessions):
            # Random date in past 30 days
            days_ago = random.randint(0, 30)
            date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
            
            # 80% chance of being present
            status = "present" if random.random() < 0.8 else "absent"
            
            record = {
                "rollNo": roll,
                "name": name,
                "date": date,
                "subject": subject,
                "className": f"Section-{section}",
                "section": section,
                "status": status,
                "time": f"{random.randint(9, 16)}:{random.randint(0, 59):02d}:00",
                "type": "dummy",
                "facultyId": faculty_id,
                "facultyName": "Demo Teacher",
                "timestamp": datetime.utcnow()
            }
            
            # Upsert to avoid duplicates
            db.attendance.update_one(
                {
                    "rollNo": roll,
                    "date": date,
                    "subject": subject
                },
                {"$set": record},
                upsert=True
            )
            count += 1

print(f"\n✓ Created {count} dummy attendance records!")
print(f"✓ Data generated for {len(students)} students across {len(subjects)} subjects")
print("\nNow refresh the Student List page to see the data!")
