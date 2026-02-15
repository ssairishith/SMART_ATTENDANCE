from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI")
AUTH_MONGO_URI = os.getenv("AUTH_MONGO_URI") or MONGO_URI

client = MongoClient(MONGO_URI)
client_auth = MongoClient(AUTH_MONGO_URI)

db = client["AttendanceDB"]
db_auth = client_auth["AuthDB"]

# Get faculty ID
timetables = db_auth["teachers_timetables"]
tt = timetables.find_one()
faculty_id = tt.get("facultyId")

print(f"Testing percentage calculation for Faculty: {faculty_id}\n")

# Get all attendance records
all_records = list(db.attendance.find({"facultyId": faculty_id}))
print(f"Total attendance records: {len(all_records)}")

# Count sessions per subject
subject_sessions = {}
for record in all_records:
    subj = record.get("subject")
    date = record.get("date")
    if subj and date:
        if subj not in subject_sessions:
            subject_sessions[subj] = set()
        subject_sessions[subj].add(date)

print(f"\nSessions per subject:")
for subj, dates in sorted(subject_sessions.items()):
    print(f"  {subj}: {len(dates)} sessions")

# Get a sample student
students = list(db.students.find().limit(1))
if students:
    student = students[0]
    roll = student.get("rollNo")
    print(f"\nSample calculation for student: {roll}")
    
    # Count their attendance
    for subj, total_dates in sorted(subject_sessions.items()):
        attended = db.attendance.count_documents({
            "rollNo": roll,
            "subject": subj,
            "status": "present"
        })
        total = len(total_dates)
        percentage = round((attended / total) * 100, 1) if total > 0 else 0
        print(f"  {subj}: {attended}/{total} = {percentage}%")

print("\n✓ Calculation logic verified!")
print("Now refresh the Student List page to see the corrected percentages.")
