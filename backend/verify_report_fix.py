
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime

# Load .env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["AttendanceDB"]

# 1. Create a dummy student in a section NOT in timetable
print("Creating dummy student and attendance...")
dummy_roll = "TEST999"
dummy_sec = "EXTRA-SEC"
dummy_subj = "Technical Training"

db.students.update_one(
    {"rollNo": dummy_roll},
    {"$set": {
        "name": "Test Student",
        "rollNo": dummy_roll,
        "section": dummy_sec,
        "department": "TEST",
        "model": "arcface"
    }},
    upsert=True
)

# 2. Add attendance record for a dummy faculty
dummy_fid = "T-999"
db.attendance.update_one(
    {"rollNo": dummy_roll, "subject": dummy_subj, "date": "2026-02-10"},
    {"$set": {
        "rollNo": dummy_roll,
        "name": "Test Student",
        "date": "2026-02-10",
        "subject": dummy_subj,
        "status": "present",
        "facultyId": dummy_fid,
        "section": dummy_sec
    }},
    upsert=True
)

# 3. Simulate calling the report logic manually (from teacher_auth.py but for dummy)
# (Since I can't easily call the API without a real token/login, I'll simulate the logic)

def test_report(fid):
    # This imitates the logic in teacher_auth.py
    # We assume timetable is empty for this dummy fid
    raw_sections = set()
    
    # Logic from my fix:
    history_sections = db.attendance.distinct("section", {"facultyId": fid})
    for h_sec in history_sections:
        if h_sec: raw_sections.add(h_sec)
    
    print(f"Found sections for {fid}: {raw_sections}")
    
    query_or_list = []
    for raw_sec in raw_sections:
        query_or_list.append({"section": raw_sec})
    
    all_students = list(db.students.find({"$or": query_or_list}))
    print(f"Students found: {len(all_students)}")
    
    report = {}
    known_subjects = set()
    subject_types = {} # empty initially
    
    for s in all_students:
        roll = str(s.get("rollNo"))
        report[roll] = {
            "name": s.get("name"),
            "rollNo": roll,
            "section": s.get("section"),
            "totalScore": 0,
            "subjects": {}
        }
        
    attendance_records = db.attendance.find({"facultyId": fid, "status": "present"})
    for record in attendance_records:
        roll = str(record.get("rollNo"))
        subj = record.get("subject")
        
        if roll not in report: continue
        
        if subj not in subject_types:
            subject_types[subj] = "Theory"
            
        sType = subject_types[subj]
        multiplier = 3 if sType == "Lab" else 2
        
        if subj not in report[roll]["subjects"]:
            report[roll]["subjects"][subj] = 0
            known_subjects.add(subj)
            
        report[roll]["subjects"][subj] += multiplier
        report[roll]["totalScore"] += multiplier
        
    return report

print("\n--- Running Logic Simulation ---")
result = test_report(dummy_fid)
if dummy_roll in result:
    print(f"SUCCESS: Dummy student found in report!")
    print(f"Data: {result[dummy_roll]}")
else:
    print("FAILURE: Dummy student NOT found in report.")

# Cleanup
# db.students.delete_one({"rollNo": dummy_roll})
# db.attendance.delete_many({"rollNo": dummy_roll})
