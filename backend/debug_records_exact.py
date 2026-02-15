from pymongo import MongoClient
import os
from dotenv import load_dotenv
import json

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["AttendanceDB"]
attendance_col = db["attendance"]

roll_no = "24EG101B01" # Let's check a few from the screenshot
# The screenshot showed 24EG107B01 as 0/3. Let's use that.
roll_no = "24EG107B01"
section_pattern = "AIML-B"

print(f"Searching for records for {roll_no} matching {section_pattern}")

matches = list(attendance_col.find({
    "rollNo": roll_no,
    "className": {"$regex": section_pattern, "$options": "i"}
}))

for i, m in enumerate(matches):
    print(f"Match {i+1}: subject='{m.get('subject')}', status='{m.get('status')}', className='{m.get('className')}', date='{m.get('date')}'")

print("\n--- Searching for 'Java' records specifically ---")
java_records = list(attendance_col.find({
    "rollNo": roll_no,
    "subject": {"$regex": "Java", "$options": "i"}
}))

for i, m in enumerate(java_records):
    print(f"Java Record {i+1}: status='{m.get('status')}', className='{m.get('className')}', date='{m.get('date')}'")
