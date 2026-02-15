from pymongo import MongoClient
import os
from dotenv import load_dotenv
import json

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["AttendanceDB"]
attendance_col = db["attendance"]

# Test for a specific student seen in the screenshot
roll_no = "24EG107B01" # This one showed 0/3
section_code = "AIML-B"

print(f"--- Records for {roll_no} in section {section_code} ---")
records = list(attendance_col.find({
    "rollNo": roll_no,
    "className": {"$regex": section_code, "$options": "i"}
}))

print(f"Total records found: {len(records)}")
for i, r in enumerate(records):
    # Remove ObjectId for printing
    r["_id"] = str(r["_id"])
    print(f"Record {i+1}: status='{r.get('status')}', subject='{r.get('subject')}', className='{r.get('className')}'")

# Check if any "present" records exist for this student AT ALL
all_presents = list(attendance_col.find({
    "rollNo": roll_no,
    "status": "present"
}))
print(f"\nTotal 'present' records for student anywhere: {len(all_presents)}")

# Case-insensitive check for status
case_insensitive_presents = list(attendance_col.find({
    "rollNo": roll_no,
    "status": {"$regex": "^present$", "$options": "i"}
}))
print(f"Total 'present' (case-insensitive) records: {len(case_insensitive_presents)}")
