import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
AUTH_MONGO_URI = os.getenv("AUTH_MONGO_URI")

print(f"Connecting to AttendanceDB: {MONGO_URI}")
client_att = MongoClient(MONGO_URI)
db_att = client_att["AttendanceDB"]
students_collection = db_att["students"]
attendance_collection = db_att["attendance"]

print(f"Connecting to TeacherAuthDB: {AUTH_MONGO_URI}")
client_auth = MongoClient(AUTH_MONGO_URI)
db_auth = client_auth["AuthDB"]
timetables = db_auth["teachers_timetables"]
profiles = db_auth["teachers_profiles"]

# Try to find a valid facultyId
timetable = timetables.find_one()
if not timetable:
    print("No timetable found to test with.")
    exit()

faculty_id = timetable.get("facultyId")
print(f"Testing with Faculty ID: {faculty_id}")

try:
    with open("debug_log.txt", "w", encoding="utf-8") as f:
        def log(msg):
            print(msg)
            f.write(str(msg) + "\n")

        # 1. Get Teacher's Timetable
        timetable_doc = timetables.find_one({"facultyId": faculty_id})
        if not timetable_doc:
            log("Timetable not found")
            exit()

        subject_types = {}
        sections = set()
        
        for day in timetable_doc.get("timetables", []):
            for slot in day.get("slots", []):
                subj = slot.get("subjectName")
                sType = slot.get("type", "Theory")
                sec = slot.get("section")
                
                if subj:
                    is_lab = "Lab" in sType or "Lab" in subj
                    subject_types[subj] = "Lab" if is_lab else "Theory"
                
                if sec:
                    if "(" in sec:
                        import re
                        match = re.search(r'\((.*?)\)', sec)
                        if match:
                            sections.add(match.group(1))
                        else:
                            sections.add(sec)
                    else:
                        sections.add(sec)
        
        log(f"Found Sections from Timetable: {sections}")
        log(f"Found Subjects: {subject_types}")

        # 2. Build Query for Students (Handle "AIML-B" -> Dept="AIML", Sec="B")
        query_or_list = []
        for raw_sec in sections:
            log(f"Processing section from timetable: {raw_sec}")
            # Add exact match
            query_or_list.append({"section": raw_sec})
            
            # Try to split by hyphen
            if "-" in raw_sec:
                parts = raw_sec.split("-")
                if len(parts) >= 2:
                    dept = parts[0].strip()
                    sec = parts[1].strip()
                    query_or_list.append({"department": dept, "section": sec})
                    log(f"  -> Added alternative query: department='{dept}', section='{sec}'")
        
        log(f"Final Student Query $or list: {query_or_list}")

        # Check what sections are actually in students collection
        unique_sections_in_db = students_collection.distinct("section")
        log(f"All sections in DB: {unique_sections_in_db}")

        # Print one sample student to see fields
        sample_student = students_collection.find_one()
        log(f"Sample Student Record: {sample_student}")
        
        all_students = list(students_collection.find({"$or": query_or_list}))
        log(f"Found {len(all_students)} students matching sections")
        
        if len(all_students) == 0:
            log("MISMATCH DETECTED: Timetable sections do not match any student sections.")
            log(f"Timetable sections: {section_list}")
            log(f"DB sections: {unique_sections_in_db}")

        # 3. Report
        report = {}
        unique_subjects = sorted(list(subject_types.keys()))
        
        for s in all_students:
            roll = str(s.get("rollNo"))
            report[roll] = {
                "name": s.get("name"),
                "rollNo": roll,
                "section": s.get("section"),
                "totalScore": 0,
                "subjects": {subj: 0 for subj in unique_subjects}
            }

        # 4. Attendance
        attendance_records = list(attendance_collection.find({
            "facultyId": faculty_id,
            "status": "present"
        }))
        log(f"Found {len(attendance_records)} attendance records for this faculty")

        for record in attendance_records:
            roll = str(record.get("rollNo"))
            subj = record.get("subject")
            
            sType = subject_types.get(subj, "Theory")
            multiplier = 3 if sType == "Lab" else 2
            
            if roll in report:
                if subj in report[roll]["subjects"]:
                     report[roll]["subjects"][subj] += multiplier
                else:
                    report[roll]["subjects"][subj] = multiplier

                report[roll]["totalScore"] += multiplier

        report_list = list(report.values())
        log(f"Report generated with {len(report_list)} students")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
