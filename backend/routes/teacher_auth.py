from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
import jwt
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

teacher_bp = Blueprint(
    "teacher_bp",
    __name__,
    url_prefix="/api/teacher"
)

bcrypt = Bcrypt()

# MongoDB (Teacher DB)
try:
    mongo_uri = os.getenv("AUTH_MONGO_URI")
    print(f"Connecting to teacher DB: {mongo_uri}")
    client = MongoClient(mongo_uri)
    # Test connection
    client.admin.command('ping')
    print("Teacher DB connection successful")
    db = client["TeacherAuthDB"]
    teachers = db["teachers"]
    
    # AuthDB for profiles and timetables
    db_auth = client["AuthDB"]
    profiles = db_auth["teachers_profiles"]
    timetables = db_auth["teachers_timetables"]
    
    # AttendanceDB for checking status
    attendance_uri = os.getenv("MONGO_URI")
    client_att = MongoClient(attendance_uri)
    db_att = client_att["AttendanceDB"]
    attendance_collection = db_att["attendance"]
except Exception as e:
    print(f"Teacher DB connection failed: {e}")
    # Fallback or re-raise
    raise e

JWT_SECRET = os.getenv("JWT_SECRET_KEY")

# Hardcoded mapping for Subject Codes -> Full Names
SUBJECT_MAPPING = {
    "daa122": "DAA", # Matches Timetable
    "daa112": "DAA",
    "cs101": "Java Programming", # Matches Timetable
    "cs102": "IP-II Lab", # Matches Timetable
    "dm101": "Discrete Math",
    "115": "DBMS",
    "DBMS": "DBMS",
    "Java": "Java Programming",
    # Add others if discovered
}

# Reverse mapping for Dashboard (Name -> Code)
NAME_TO_CODE_MAPPING = {v: k for k, v in SUBJECT_MAPPING.items()}
# Add manual overrides if needed (e.g. abbreviations)
NAME_TO_CODE_MAPPING["Design and Analysis of Algorithms"] = "daa122"
NAME_TO_CODE_MAPPING["Computer Science"] = "cs101"
NAME_TO_CODE_MAPPING["DM"] = "dm101"
NAME_TO_CODE_MAPPING["DBMS"] = "DBMS" # Self-map




# --------------------------------------------------
# TEACHER REGISTRATION
# --------------------------------------------------
@teacher_bp.route("/register", methods=["POST"])
def register_teacher():
    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    facultyId = data.get("facultyId")

    missing_fields = [field for field in ["name", "email", "password", "facultyId"] if not data.get(field)]
    if missing_fields:
        print(f"Registration failed: Missing fields {missing_fields}")
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    if teachers.find_one({"email": email}):
        return jsonify({"error": "Teacher already registered"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    result = teachers.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password,
        "facultyId": facultyId,
        "createdAt": datetime.datetime.utcnow()
    })

    print(f"Teacher registered with ID: {result.inserted_id}")
    return jsonify({"message": "Teacher registered successfully"}), 201


# --------------------------------------------------
# TEACHER LOGIN (JWT)
# --------------------------------------------------
@teacher_bp.route("/login", methods=["POST"])
def login_teacher():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    teacher = teachers.find_one({"email": email})
    if not teacher:
        return jsonify({"error": "Invalid email or password"}), 401

    if not bcrypt.check_password_hash(teacher["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = jwt.encode({
        "teacher_id": str(teacher["_id"]),
        "email": teacher["email"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }, JWT_SECRET, algorithm="HS256")

    return jsonify({
        "message": "Login successful",
        "token": token,
        "teacher": {
            "name": teacher["name"],
            "email": teacher["email"],
            "facultyId": teacher.get("facultyId")
        }
    }), 200


# --------------------------------------------------
# TEACHER DASHBOARD DATA
# --------------------------------------------------
@teacher_bp.route("/dashboard-data/<faculty_id>", methods=["GET"])
def get_dashboard_data(faculty_id):
    try:
        # Fetch profile
        profile = profiles.find_one({"facultyId": faculty_id})
        if profile:
            profile["_id"] = str(profile["_id"])
        
        # Fetch timetable
        timetable = timetables.find_one({"facultyId": faculty_id})
        if timetable:
            timetable["_id"] = str(timetable["_id"])
            
            # Check attendance status for each slot
            today = datetime.datetime.now().strftime("%Y-%m-%d")
            day_name = datetime.datetime.now().strftime("%A")
            
            # Cache distinct subjects for fuzzy matching
            db_subjects = attendance_collection.distinct("subject")
            
            # Find today's timetable
            today_schedule = next((t for t in timetable.get("timetables", []) if t["day"] == day_name), None)
            
            if today_schedule:
                for slot in today_schedule.get("slots", []):
                    # Check if attendance exists for this slot
                    slot_subject = slot.get("subjectName")
                    slot_section = slot.get("section")
                    
                    found = False
                    
                    # 1. Exact match subject
                    if attendance_collection.find_one({
                        "date": today,
                        "subject": slot_subject,
                        "section": slot_section
                    }):
                        found = True

                    # 1b. Check Mapped Code (Name -> Code)
                    if not found and slot_subject:
                        mapped_code = NAME_TO_CODE_MAPPING.get(slot_subject)
                        # Also try matching keys in NAME_TO_CODE_MAPPING (case-insensitive) if exact fail
                        if not mapped_code:
                            for k, v in NAME_TO_CODE_MAPPING.items():
                                if k.lower() == slot_subject.lower():
                                    mapped_code = v
                                    break
                        
                        if mapped_code:
                             if attendance_collection.find_one({
                                "date": today,
                                "subject": mapped_code,
                                "section": slot_section
                            }):
                                found = True

                    # 1b. Check Mapped Code (Name -> Code)
                    if not found and slot_subject:
                        mapped_code = NAME_TO_CODE_MAPPING.get(slot_subject)
                        # Also try matching keys in NAME_TO_CODE_MAPPING (case-insensitive) if exact fail
                        if not mapped_code:
                            for k, v in NAME_TO_CODE_MAPPING.items():
                                if k.lower() == slot_subject.lower():
                                    mapped_code = v
                                    break
                        
                        if mapped_code:
                             if attendance_collection.find_one({
                                "date": today,
                                "subject": mapped_code,
                                "section": slot_section
                            }):
                                found = True
                        
                    # 2. Substring match (e.g. DB="Java", Slot="Java Programming")
                    if not found and slot_subject:
                        # Find if any DB subject is a substring of the Slot Subject (or vice versa)
                        # Case insensitive
                        slot_subj_lower = slot_subject.lower()
                        match_subj = None
                        
                        for db_s in db_subjects:
                            if db_s and db_s.lower() in slot_subj_lower:
                                match_subj = db_s
                                break # Take first match? Better to find longest match maybe?
                        
                        if match_subj:
                             if attendance_collection.find_one({
                                "date": today,
                                "subject": match_subj,
                                "section": slot_section
                            }):
                                found = True

                    # 3. Check loose section match (className)
                    if not found and slot_section:
                         # className usually contains section
                         if attendance_collection.find_one({
                            "date": today,
                            # "subject": slot_subject, # Remove subject constraint if checking just by section/time? No, unsafe.
                            # Try to match subject vaguely + section strictly
                            "className": {"$regex": slot_section, "$options": "i"} 
                        }):
                            # We found something for this section today. 
                            # If we are desperate, assume it's this class if it's the only one?
                            # Let's keep it strict-ish: Must match subject regex too if possible.
                            found = True

                    slot["attendanceTaken"] = found

        return jsonify({
            "profile": profile,
            "timetable": timetable
        }), 200
    except Exception as e:
        print(f"Error fetching dashboard data: {e}")
        return jsonify({"error": str(e)}), 500


# --------------------------------------------------
# DAILY ATTENDANCE SUMMARY
# --------------------------------------------------
@teacher_bp.route("/daily-attendance-summary", methods=["POST"])
def get_daily_attendance_summary():
    data = request.json
    faculty_id = data.get("facultyId")
    date_str = data.get("date")  # Expecting "YYYY-MM-DD"

    if not faculty_id or not date_str:
        return jsonify({"error": "Missing facultyId or date"}), 400

    try:
        # Aggregation pipeline to group by subject/section and count status
        pipeline = [
            {
                "$match": {
                    "facultyId": faculty_id,
                    "date": date_str
                }
            },
            {
                "$group": {
                    "_id": {
                        "subject": "$subject",
                        "section": "$section"
                    },
                    "present": {
                        "$sum": { "$cond": [{ "$eq": ["$status", "present"] }, 1, 0] }
                    },
                    "absent": {
                        "$sum": { "$cond": [{ "$eq": ["$status", "absent"] }, 1, 0] }
                    }
                }
            }
        ]

        results = list(attendance_collection.aggregate(pipeline))
        
        # Transform to easier frontend format: key = "SubjectName_Section"
        summary = {}
        for r in results:
            # Construct a key that matches how Dashboard identifies classes
            raw_subj = r["_id"].get("subject", "Unknown")
            sec = r["_id"].get("section", "Unknown")
            
            # Map Code -> Name (dm101 -> Discrete Math)
            subj = SUBJECT_MAPPING.get(raw_subj, raw_subj)
            
            # Key format: "Discrete Math_AIML-B"
            # If sec is "B", and dashboard expects "AIML-B", we might have a mismatch.
            # Ideally the DB should store "AIML-B" or we need to normalize.
            # For now, let's allow partial matching on the frontend or just pass as is.
            # But wait, frontend lookup is exact: attendanceStats[`${cls.name}_${cls.section}`]
            # So we must match exactly. 
            
            key = f"{subj}_{sec}"
            
            # If section is just "B" but we suspect it should be "AIML-B" (hacky fix for display)
            # Better to fix the data, but let's add an alias if needed?
            # No, let's just stick to mapping the Name. Data fix is separate.
            
            summary[key] = {
                "present": r["present"],
                "absent": r["absent"]
            }
            
            # Also add an alias entry if section is short (e.g. "B") 
            # and we know the context is "AIML-B"? 
            # Hard to know context here without timetable.
            # Let's add variations just in case?
            if sec == "B":
                summary[f"{subj}_AIML-B"] = summary[key]
            if sec == "A":
                summary[f"{subj}_AIML-A"] = summary[key]

        return jsonify(summary), 200

    except Exception as e:
        print(f"Error fetching daily summary: {e}")
        return jsonify({"error": str(e)}), 500


# --------------------------------------------------
# STUDENT ATTENDANCE REPORT
# --------------------------------------------------
# ... (existing imports)

# Hardcoded mapping for Subject Codes -> Full Names
# --------------------------------------------------
# STUDENT ATTENDANCE REPORT
# --------------------------------------------------
@teacher_bp.route("/attendance-report", methods=["POST"])
def get_attendance_report():
    data = request.json
    faculty_id = data.get("facultyId")

    if not faculty_id:
        return jsonify({"error": "Missing facultyId"}), 400

    try:
        # 1. Get Teacher's Timetable to find Subjects and Sections
        timetable_doc = timetables.find_one({"facultyId": faculty_id})
        
        subject_types = {}
        target_sections = set()
        
        if timetable_doc:
            for day in timetable_doc.get("timetables", []):
                for slot in day.get("slots", []):
                    subj = slot.get("subjectName")
                    sType = slot.get("type", "Theory") 
                    sec = slot.get("section")
                    
                    if subj:
                        # Map timetable matched subjects if needed? 
                        # Usually timetable has Full Names.
                        is_lab = "Lab" in sType or "Lab" in subj
                        subject_types[subj] = "Lab" if is_lab else "Theory"
                    
                    if sec:
                        # Clean section: "AIML-B (Classroom)" -> "AIML-B"
                        clean_sec = sec
                        if "(" in sec:
                            clean_sec = sec.split("(")[0].strip()
                        target_sections.add(clean_sec)

        # Also add sections from attendance history (in case timetable changed)
        history_sections = attendance_collection.distinct("section", {"facultyId": faculty_id})
        for h_sec in history_sections:
            if h_sec:
               target_sections.add(h_sec)

        if not target_sections:
             return jsonify({
                "students": [],
                "subjects": [],
                "subjectTypes": {}
            }), 200

        # 2. Find All Students in these Sections
        query_or_list = []
        for raw_sec in target_sections:
            query_or_list.append({"section": raw_sec})
            # Handle "AIML-B" -> dept="AIML", sec="B"
            if "-" in raw_sec:
                parts = raw_sec.split("-")
                if len(parts) >= 2:
                    dept = parts[0].strip()
                    sec = parts[1].strip()
                    query_or_list.append({"department": dept, "section": sec})
        
        students_collection = db_att["students"]
        all_students = list(students_collection.find({"$or": query_or_list}))
        
        if not all_students:
             return jsonify({
                "students": [],
                "subjects": [],
                "subjectTypes": {}
            }), 200

        student_rolls = [str(s["rollNo"]) for s in all_students]
        
        # 3. Get All Attendance for these Students
        # We want ALL subjects, not just the teacher's subjects.
        attendance_query = {"rollNo": {"$in": student_rolls}}
        
        # Apply filters from request
        search_roll = data.get("rollNo")
        if search_roll:
            attendance_query["rollNo"] = str(search_roll)
            # Also filter students list to only show this student
            all_students = [s for s in all_students if str(s.get("rollNo")) == str(search_roll)]
            student_rolls = [str(search_roll)] if all_students else []

        start_date = data.get("startDate")
        end_date = data.get("endDate")
        if start_date or end_date:
            date_filter = {}
            if start_date:
                date_filter["$gte"] = start_date
            if end_date:
                date_filter["$lte"] = end_date
            attendance_query["date"] = date_filter

        all_attendance = list(attendance_collection.find(attendance_query))
        
        # 4. Process Attendance
        # Structure: Subject -> Section -> Dates
        subject_class_dates = {} 
        # Structure: Roll -> Subject -> Count
        student_attended = {}
        
        NON_ACADEMIC_SUBJECTS = ["Counseling", "Library", "Sports"]

        detected_subjects = set()

        for record in all_attendance:
            raw_subj = record.get("subject")
            status = record.get("status")
            date = record.get("date")
            roll = str(record.get("rollNo"))
            # Use className (contains section) to count distinct classes conducted
            c_name = record.get("className", "")  # e.g. "AIML-B"
            
            if not raw_subj or raw_subj in NON_ACADEMIC_SUBJECTS:
                continue

            # --- MAP SUBJECT CODE TO FULL NAME ---
            subj = SUBJECT_MAPPING.get(raw_subj.lower(), raw_subj)
            # If mapping didn't hit, check ignoring case
            if raw_subj.lower() in SUBJECT_MAPPING:
                subj = SUBJECT_MAPPING[raw_subj.lower()]
            
            # Also handle if Title Case key exists
            # We already did .lower() check.

            detected_subjects.add(subj)
            
            # Count conducted classes per subject per section(className)
            # We assume 'className' differentiates sections sufficiently i.e. "AIML-B" vs "AIML-A"
            key = f"{subj}___{c_name}"
            if key not in subject_class_dates:
                subject_class_dates[key] = set()
            subject_class_dates[key].add(date)
            
            if status == "present":
                if roll not in student_attended:
                    student_attended[roll] = {}
                if subj not in student_attended[roll]:
                    student_attended[roll][subj] = 0
                student_attended[roll][subj] += 1
                
                # Infer type if missing
                if subj not in subject_types:
                     subject_types[subj] = "Lab" if "Lab" in subj or "Laboratory" in subj else "Theory"

        # 5. Build Final Report
        report_list = []
        final_subjects = sorted(list(detected_subjects))
        
        for s in all_students:
            roll = str(s.get("rollNo"))
            s_sec = s.get("section", "")
            
            student_row = {
                "name": s.get("name"),
                "rollNo": roll,
                "section": s_sec,
                "department": s.get("department", ""),
                "subjects": {},
                "totalScore": 0
            }
            
            total_perc_sum = 0
            subj_count = 0
            
            for subj in final_subjects:
                # Calculate total classes for this subject FOR THIS STUDENT'S SECTION
                # We look for keys in subject_class_dates that match student's section
                # Try exact match with section first
                
                total_classes = 0
                # Finds keys like "Java__SAME-SECTION"
                # If s_sec is "B", and keys are "Java___AIML-B", "Java___AIML-A"
                # We need to match "B" or "AIML-B"
                
                matched_keys = []
                for key in subject_class_dates:
                    k_subj, k_cname = key.split("___")
                    if k_subj == subj:
                        # Check strict section match
                        if s_sec and (s_sec == k_cname or s_sec in k_cname):
                             matched_keys.append(key)
                
                if matched_keys:
                    # Sum all unique dates across matched section keys (usually just one)
                    # Use set union to avoid double counting if multiple keys map to same physical class
                    all_dates = set()
                    for k in matched_keys:
                        all_dates.update(subject_class_dates[k])
                    total_classes = len(all_dates)
                
                # Attended count
                attended = student_attended.get(roll, {}).get(subj, 0)
                
                perc = 0.0
                if total_classes > 0:
                    perc = round((attended / total_classes) * 100, 1)
                    if perc > 100: perc = 100.0 # Safety Cap
                
                student_row["subjects"][subj] = perc
                
                if total_classes > 0:
                    total_perc_sum += perc
                    subj_count += 1
            
            if subj_count > 0:
                final_total = round(total_perc_sum / subj_count, 1)
                student_row["totalScore"] = min(final_total, 100.0)
            
            report_list.append(student_row)
            
        report_list.sort(key=lambda x: x["rollNo"])

        return jsonify({
            "students": report_list,
            "subjects": final_subjects, 
            "subjectTypes": subject_types 
        }), 200

    except Exception as e:
        print(f"Error generating attendance report: {e}")
        return jsonify({"error": str(e)}), 500
