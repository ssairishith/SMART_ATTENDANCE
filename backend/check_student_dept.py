from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["AttendanceDB"]
students_col = db["students"]

roll_no = "24EG107B01"
student = students_col.find_one({"rollNo": roll_no})

print(f"--- Student {roll_no} ---")
if student:
    print(f"Name: {student.get('name')}")
    print(f"Department: '{student.get('department')}'")
    print(f"Section: '{student.get('section')}'")
else:
    print("Student not found")

# Also check what unique departments exist
print("\n--- All Departments ---")
print(students_col.distinct("department"))
