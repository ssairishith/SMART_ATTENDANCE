
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

today = datetime.now().strftime("%Y-%m-%d")
print(f"--- Records for {today} ---")
records = list(db.attendance.find({"date": today}))
print(f"Count: {len(records)}")
for r in records[:5]:
    r['_id'] = str(r['_id'])
    print(f"Subject: {r.get('subject')}, Section: {r.get('section')}, Roll: {r.get('rollNo')}, Status: {r.get('status')}")

# Check for Technical Training in all history
print("\n--- Checking for 'Technical' in all dates ---")
regex = {"$regex": "tech", "$options": "i"}
tech_count = db.attendance.count_documents({"subject": regex})
print(f"Technical records count: {tech_count}")
if tech_count > 0:
    sample = db.attendance.find_one({"subject": regex})
    sample['_id'] = str(sample['_id'])
    print("Sample:", sample)

# Check faculty profiles to see if specialized departments exist
db_auth = client["AuthDB"]
print("\n--- AuthDB Collections ---")
print(db_auth.list_collection_names())
