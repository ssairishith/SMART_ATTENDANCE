from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
import jwt
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

hod_bp = Blueprint(
    "hod_bp",
    __name__,
    url_prefix="/api/hod"
)

bcrypt = Bcrypt()

# MongoDB Connection
try:
    mongo_uri = os.getenv("AUTH_MONGO_URI")
    print(f"Connecting to HOD DB: {mongo_uri}")
    client = MongoClient(mongo_uri)
    client.admin.command('ping')
    print("HOD DB connection successful")
    
    # HOD collection in AuthDB
    db = client["AuthDB"]
    hods = db["hods"]
    
    # Student DB for attendance data
    student_mongo_uri = os.getenv("MONGO_URI")
    student_client = MongoClient(student_mongo_uri)
    student_db = student_client["AttendanceDB"]
    students_collection = student_db["students"]
    attendance_collection = student_db["attendance"]
    
except Exception as e:
    print(f"HOD DB connection failed: {e}")
    raise e

JWT_SECRET = os.getenv("JWT_SECRET_KEY")

# Branch configuration
BRANCHES = [
    {"id": "ai_aiml", "name": "AIML", "sections": ["A", "B"]},
    {"id": "cse", "name": "CSE", "sections": ["A", "B", "C"]},
    {"id": "cs", "name": "CS", "sections": ["A", "B"]},
    {"id": "ece", "name": "ECE", "sections": ["A", "B", "C"]},
    {"id": "eee", "name": "EEE", "sections": ["A", "B"]},
    {"id": "mechanical", "name": "Mechanical", "sections": ["A", "B"]},
    {"id": "bba", "name": "BBA", "sections": ["A", "B", "C"]}
]


# --------------------------------------------------
# HOD REGISTRATION
# --------------------------------------------------
@hod_bp.route("/register", methods=["POST"])
def register_hod():
    data = request.json
    
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    hodId = data.get("hodId")
    department = data.get("department")
    
    missing_fields = [field for field in ["name", "email", "password", "hodId", "department"] if not data.get(field)]
    if missing_fields:
        print(f"HOD Registration failed: Missing fields {missing_fields}")
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    if hods.find_one({"email": email}):
        return jsonify({"error": "HOD already registered"}), 409
    
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    
    result = hods.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password,
        "hodId": hodId,
        "department": department,
        "role": "hod",
        "createdAt": datetime.datetime.utcnow()
    })
    
    print(f"HOD registered with ID: {result.inserted_id}")
    return jsonify({"message": "HOD registered successfully"}), 201


# --------------------------------------------------
# HOD LOGIN
# --------------------------------------------------
@hod_bp.route("/login", methods=["POST"])
def login_hod():
    data = request.json
    
    email = data.get("email")
    password = data.get("password")
    
    hod = hods.find_one({"email": email})
    if not hod:
        return jsonify({"error": "Invalid email or password"}), 401
    
    if not bcrypt.check_password_hash(hod["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401
    
    token = jwt.encode({
        "hod_id": str(hod["_id"]),
        "email": hod["email"],
        "role": "hod",
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }, JWT_SECRET, algorithm="HS256")
    
    return jsonify({
        "message": "Login successful",
        "token": token,
        "hod": {
            "name": hod["name"],
            "email": hod["email"],
            "hodId": hod.get("hodId"),
            "department": hod.get("department")
        }
    }), 200


# --------------------------------------------------
# GET BRANCHES
# --------------------------------------------------
@hod_bp.route("/branches", methods=["GET"])
def get_branches():
    return jsonify({"branches": BRANCHES}), 200


# --------------------------------------------------
# GET DASHBOARD DATA (Overview Stats)
# --------------------------------------------------
@hod_bp.route("/dashboard-data", methods=["GET"])
def get_dashboard_data():
    try:
        # Get total students count
        total_students = students_collection.count_documents({})
        
        # Get today's date
        today = datetime.datetime.now().strftime("%Y-%m-%d")
        
        # Get today's attendance records
        today_attendance = list(attendance_collection.find({"date": today}))
        
        unique_present = set(a["rollNo"] for a in today_attendance if a.get("status") == "present")
        present_count = len(unique_present)
        absent_count = total_students - present_count
        if absent_count < 0: absent_count = 0
        
        attendance_percentage = round((present_count / total_students * 100), 1) if total_students > 0 else 0
        
        # Get branch-wise stats
        branch_stats = []
        for branch in BRANCHES:
            # Get all students of this branch
            b_students_cursor = students_collection.find({"department": branch["name"]}, {"rollNo": 1})
            b_rolls = [str(s["rollNo"]) for s in b_students_cursor]
            branch_students_count = len(b_rolls)
            
            branch_present = len(set(b_rolls).intersection(unique_present)) if b_rolls else 0

            branch_stats.append({
                "id": branch["id"],
                "name": branch["name"],
                "totalStudents": branch_students_count,
                "present": branch_present,
                "absent": branch_students_count - branch_present,
                "percentage": round((branch_present / branch_students_count * 100), 1) if branch_students_count > 0 else 0
            })
        
        return jsonify({
            "totalStudents": total_students,
            "presentCount": present_count,
            "absentCount": absent_count,
            "attendancePercentage": attendance_percentage,
            "branchStats": branch_stats,
            "date": today
        }), 200
        
    except Exception as e:
        print(f"Error fetching HOD dashboard data: {e}")
        return jsonify({"error": str(e)}), 500


@hod_bp.route("/attendance-history", methods=["GET"])
def get_attendance_history():
    """
    Returns the attendance percentage for the last 30 days.
    """
    try:
        days = 30
        end_date = datetime.datetime.now()
        history = []
        
        total_students = students_collection.count_documents({})
        if total_students == 0:
            return jsonify({"history": []}), 200

        for i in range(days):
            d = end_date - datetime.timedelta(days=i)
            date_str = d.strftime("%Y-%m-%d")
            
            # Count unique present for that date
            present_rolls = attendance_collection.distinct("rollNo", {
                "date": date_str,
                "status": "present"
            })
            present_count = len(present_rolls)
            
            percentage = round((present_count / total_students * 100), 1)
            
            history.append({
                "date": date_str,
                "percentage": percentage,
                "present": present_count,
                "total": total_students
            })
            
        history.sort(key=lambda x: x["date"])
        
        return jsonify({"history": history}), 200

    except Exception as e:
        print(f"Error fetching attendance history: {e}")
        return jsonify({"error": str(e)}), 500


# --------------------------------------------------
# GET BRANCH ATTENDANCE
# --------------------------------------------------
@hod_bp.route("/branch/<branch_id>/attendance", methods=["GET"])
def get_branch_attendance(branch_id):
    try:
        # Find branch config
        branch = next((b for b in BRANCHES if b["id"] == branch_id), None)
        if not branch:
            return jsonify({"error": "Branch not found"}), 404
        
        today = datetime.datetime.now().strftime("%Y-%m-%d")
        
        # Get students in this branch
        branch_students = list(students_collection.find({"department": branch["name"]}))
        
        section_stats = []
        for section in branch["sections"]:
            section_students = [s for s in branch_students if s.get("section") == section]
            total = len(section_students)
            # Real data logic
            section_students = [s for s in branch_students if s.get("section") == section]
            section_rolls = [str(s["rollNo"]) for s in section_students]
            
            total = len(section_students)
            
            if total > 0:
                present = len(attendance_collection.distinct("rollNo", {
                    "date": today,
                    "status": "present",
                    "rollNo": {"$in": section_rolls}
                }))
            else:
                present = 0
                
            absent = total - present
            
            section_stats.append({
                "section": section,
                "totalStudents": total,
                "present": present,
                "absent": absent,
                "percentage": round((present / total * 100), 1) if total > 0 else 0
            })
        
        return jsonify({
            "branch": branch,
            "sectionStats": section_stats,
            "date": today
        }), 200
        
    except Exception as e:
        print(f"Error fetching branch attendance: {e}")
        return jsonify({"error": str(e)}), 500


# --------------------------------------------------
# GET SECTION STUDENTS (Present/Absent List)
# --------------------------------------------------
@hod_bp.route("/branch/<branch_id>/section/<section>/students", methods=["GET"])
def get_section_students(branch_id, section):
    try:
        # Find branch config
        branch = next((b for b in BRANCHES if b["id"] == branch_id), None)
        if not branch:
            return jsonify({"error": "Branch not found"}), 404
        
        today = datetime.datetime.now().strftime("%Y-%m-%d")
        
        # Get students in this section
        section_students = list(students_collection.find({
            "department": branch["name"],
            "section": section
        }))
        
        # Get attendance records for these students today
        section_rolls = [str(s.get("rollNo")) for s in section_students]
        
        attendance_records = list(attendance_collection.find({
            "date": today,
            "rollNo": {"$in": section_rolls}
        }))
        
        # Create a map for quick access: rollNo -> status
        status_map = {}
        for ar in attendance_records:
            r = ar["rollNo"]
            if ar.get("status") == "present":
                status_map[r] = "present"
            elif r not in status_map:
                 status_map[r] = "absent"

        student_list = []
        for idx, student in enumerate(section_students):
            roll = str(student.get("rollNo"))
            status = status_map.get(roll, "absent") 
            
            student_list.append({
                "id": str(student["_id"]),
                "name": student.get("name", "Unknown"),
                "rollNo": student.get("rollNo", "N/A"),
                "section": section,
                "status": status,
                "date": today
            })
        
        # Separate present and absent
        present_students = [s for s in student_list if s["status"] == "present"]
        absent_students = [s for s in student_list if s["status"] == "absent"]
        
        return jsonify({
            "branch": branch["name"],
            "section": section,
            "presentStudents": present_students,
            "absentStudents": absent_students,
            "totalPresent": len(present_students),
            "totalAbsent": len(absent_students),
            "date": today
        }), 200
        
    except Exception as e:
        print(f"Error fetching section students: {e}")
        return jsonify({"error": str(e)}), 500
