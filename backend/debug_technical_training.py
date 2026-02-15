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

# Find Udaya Kumar's faculty ID
profiles = db_auth["teachers_profiles"]
prof = profiles.find_one({"name": {"$regex": "Udaya", "$options": "i"}})

if not prof:
    # Try finding by any profile
    prof = profiles.find_one()
    
if prof:
    fid = prof.get("facultyId")
    print(f"Faculty: {prof.get('name')}, FacultyId: {fid}")
else:
    print("No faculty profile found. Checking attendance for any facultyId...")
    # Get a sample attendance record
    sample = db.attendance.find_one({"subject": {"$regex": "technical", "$options": "i"}})
    if sample:
        fid = sample.get("facultyId")
        print(f"Found Technical Training record with FacultyId: {fid}")
    else:
        print("No Technical Training records found at all!")
        exit()

# Check attendance records for this faculty
print(f"\n--- Attendance Records for {fid} ---")
records = list(db.attendance.find({"facultyId": fid, "subject": {"$regex": "technical", "$options": "i"}}).limit(5))
print(f"Found {len(records)} Technical Training records")

if records:
    for r in records:
        print(f"\nRoll: {r.get('rollNo')}")
        print(f"  Name: {r.get('name')}")
        print(f"  Subject: '{r.get('subject')}'")
        print(f"  Section: '{r.get('section')}'")
        print(f"  ClassName: '{r.get('className')}'")
        print(f"  Status: {r.get('status')}")
        print(f"  Date: {r.get('date')}")
        
        # Check if this student exists
        student = db.students.find_one({"rollNo": r.get('rollNo')})
        if student:
            print(f"  Student Found: section='{student.get('section')}', dept='{student.get('department')}'")
        else:
            print(f"  WARNING: Student NOT found in students collection!")
else:
    print("No Technical Training records found!")
    
# Check what the report logic would find
print(f"\n--- Simulating Report Logic ---")
history_sections = db.attendance.distinct("section", {"facultyId": fid})
print(f"Sections from attendance history: {history_sections}")

# Check timetable
timetables = db_auth["teachers_timetables"]
tt = timetables.find_one({"facultyId": fid})
if tt:
    tt_sections = set()
    for day in tt.get("timetables", []):
        for slot in day.get("slots", []):
            sec = slot.get("section")
            if sec:
                tt_sections.add(sec)
    print(f"Sections from timetable: {tt_sections}")
