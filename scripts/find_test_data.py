from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='e:/SA/smartattendance/backend/.env')
db = MongoClient(os.getenv('MONGO_URI'))['AttendanceDB']

print("Teachers:")
for t in db.teachers.find().limit(2):
    print(f"  Name: {t.get('name')}, ID: {t.get('facultyId')}")

print("\nTimetables:")
for tt in db.timetables.find().limit(2):
    print(f"  Faculty ID: {tt.get('facultyId')}")

print("\nAttendance (facultyId field):")
print(db.attendance.distinct("facultyId"))
