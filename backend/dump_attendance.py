from pymongo import MongoClient
import os
from dotenv import load_dotenv
import json
from datetime import datetime

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["AttendanceDB"]
attendance_col = db["attendance"]

roll_no = "24EG107B01"

data = {
    "roll_no": roll_no,
    "records": []
}

records = list(attendance_col.find({
    "rollNo": roll_no
}).limit(20))

def serialize_mongo(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    return str(obj)

for r in records:
    # Recursively serialize
    serialized_r = {}
    for k, v in r.items():
        if isinstance(v, datetime):
            serialized_r[k] = v.isoformat()
        elif k == "_id":
            serialized_r[k] = str(v)
        elif isinstance(v, dict):
            serialized_dict = {}
            for sub_k, sub_v in v.items():
                if isinstance(sub_v, datetime):
                    serialized_dict[sub_k] = sub_v.isoformat()
                else:
                    serialized_dict[sub_k] = sub_v
            serialized_r[k] = serialized_dict
        else:
            serialized_r[k] = v
    data["records"].append(serialized_r)

with open("debug_attendance.json", "w") as f:
    json.dump(data, f, indent=2)

print(f"Dumped {len(records)} records to debug_attendance.json")
