from pymongo import MongoClient
import os
import datetime
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["AttendanceDB"]

def verify_flow():
    print("--- Starting Verification Flow ---")
    
    # 1. Reset
    db["attendance"].delete_many({})
    db["students"].delete_many({})
    print("Cleared attendance and students collections.")

    # 2. Insert Test Students
    students = [
        {"rollNo": "101", "name": "Student A", "department": "CSE", "section": "A"},
        {"rollNo": "102", "name": "Student B", "department": "CSE", "section": "A"}
    ]
    db["students"].insert_many(students)
    print("Inserted 2 students (Roll 101, 102).")

    # 3. Simulate Day 1 Attendance (Two subjects)
    day1 = "2026-02-11"
    
    # Subject: Java - Both Present
    # Subject: DBMS - 101 Present, 102 Absent
    records = [
        {"rollNo": "101", "subject": "Java", "date": day1, "status": "present", "className": "Java (CSE-A)", "section": "A", "facultyId": "faculty1"},
        {"rollNo": "102", "subject": "Java", "date": day1, "status": "present", "className": "Java (CSE-A)", "section": "A", "facultyId": "faculty1"},
        {"rollNo": "101", "subject": "DBMS", "date": day1, "status": "present", "className": "DBMS (CSE-A)", "section": "A", "facultyId": "faculty2"},
        {"rollNo": "102", "subject": "DBMS", "date": day1, "status": "absent", "className": "DBMS (CSE-A)", "section": "A", "facultyId": "faculty2"}
    ]
    db["attendance"].insert_many(records)
    print(f"Inserted Day 1 ({day1}) records.")

    # 4. Simulate Day 2 Attendance (Today)
    day2 = datetime.datetime.now().strftime("%Y-%m-%d")
    
    # Subject: Java - 101 Absent, 102 Present
    records = [
        {"rollNo": "101", "subject": "Java", "date": day2, "status": "absent", "className": "Java (CSE-A)", "section": "A", "facultyId": "faculty1"},
        {"rollNo": "102", "subject": "Java", "date": day2, "status": "present", "className": "Java (CSE-A)", "section": "A", "facultyId": "faculty1"}
    ]
    db["attendance"].insert_many(records)
    print(f"Inserted Day 2 (Today: {day2}) records.")

    print("\n--- Data Population Complete ---")
    print("Expected Results:")
    print("1. Subject Analytics (Java): 2 classes total. 101 (50%), 102 (100%).")
    print("2. Subject Analytics (DBMS): 1 class total. 101 (100%), 102 (0%).")
    print("3. Comprehensive Report (Avg):")
    print("   101: Avg(50%, 100%) = 75%")
    print("   102: Avg(100%, 0%) = 50%")
    print("4. HOD Dashboard (Today): Present: 1 (Roll 102), Absent: 1 (Roll 101). Total %: 50%")
    print("\nRun the app and verify manually or check API endpoints.")

if __name__ == "__main__":
    verify_flow()
