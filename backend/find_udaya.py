
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pathlib import Path
from bson import json_util

# Load .env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI")
AUTH_MONGO_URI = os.getenv("AUTH_MONGO_URI") or MONGO_URI

client = MongoClient(MONGO_URI)
client_auth = MongoClient(AUTH_MONGO_URI)

db_auth = client_auth["AuthDB"]
profiles = db_auth["teachers_profiles"]

# Find Udaya Kumar
prof = profiles.find_one({"name": {"$regex": "Udaya", "$options": "i"}})
if prof:
    fid = prof.get("facultyId")
    print(f"Found Profile: {prof.get('name')}, FacultyId: {fid}")
    
    # Now check records in AttendanceDB
    db_att = client["AttendanceDB"]
    print(f"\n--- Records for FacultyId: {fid} ---")
    recs = list(db_att.attendance.find({"facultyId": fid}).sort("timestamp", -1).limit(10))
    print(f"Count: {len(recs)}")
    for r in recs:
        print(f"Date: {r.get('date')}, Subject: {r.get('subject')}, Section: {r.get('section')}, Status: {r.get('status')}")
else:
    print("Udaya Kumar profile not found.")
    # List a few profiles
    print("Profiles in DB:")
    for p in profiles.find().limit(5):
        print(p.get("name"), p.get("facultyId"))

# Check all subjects in AttendanceDB
print("\n--- All Distinct Subjects in AttendanceDB ---")
print(client["AttendanceDB"].attendance.distinct("subject"))
