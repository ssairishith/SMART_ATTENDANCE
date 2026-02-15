from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

manual_attendance_bp = Blueprint(
    "manual_attendance_bp",
    __name__,
    url_prefix="/api/attendance"
)

# MongoDB Connection
try:
    mongo_uri = os.getenv("MONGO_URI")
    client = MongoClient(mongo_uri)
    db = client["AttendanceDB"]
    
    # Collections
    attendance_collection = db["attendance"]
    manual_override_logs = db["manual_override_logs"]
    students_collection = db["students"]
    
    print("Manual Attendance DB connection successful")
except Exception as e:
    print(f"Manual Attendance DB connection failed: {e}")
    raise e


# --------------------------------------------------
# SUBMIT MANUAL OVERRIDE
# --------------------------------------------------
@manual_attendance_bp.route("/manual-override", methods=["POST"])
def submit_manual_override():
    """
    Submit manual attendance override for students not detected by face recognition.
    Only faculty can use this feature. All overrides are logged for audit.
    """
    data = request.json
    
    # Required fields
    students = data.get("students", [])  # List of {rollNo, name}
    reason = data.get("reason", "")
    faculty_id = data.get("facultyId")
    faculty_name = data.get("facultyName")
    subject = data.get("subject", "")
    period = data.get("period", "")
    class_name = data.get("className", "")
    date = data.get("date", datetime.datetime.now().strftime("%Y-%m-%d"))
    
    # Validation
    if not students or len(students) == 0:
        return jsonify({"error": "No students selected for override"}), 400
    
    if not reason or len(reason.strip()) < 20:
        return jsonify({"error": "Reason must be at least 20 characters"}), 400
    
    if not faculty_id:
        return jsonify({"error": "Faculty ID is required"}), 400
    
    # Create audit log entries for each student
    audit_logs = []
    timestamp = datetime.datetime.utcnow()
    
    for student in students:
        log_entry = {
            "studentName": student.get("name", "Unknown"),
            "rollNo": student.get("rollNo", ""),
            "facultyName": faculty_name or "Unknown",
            "facultyId": faculty_id,
            "subject": subject,
            "period": period,
            "className": class_name,
            "date": date,
            "originalStatus": "absent",
            "updatedStatus": "present",
            "reason": reason.strip(),
            "timestamp": timestamp,
            "isManualOverride": True
        }
        audit_logs.append(log_entry)
        
        # Update attendance record to mark as present with manual flag
        attendance_collection.update_one(
            {
                "rollNo": student.get("rollNo"),
                "date": date,
                "className": class_name
            },
            {
                "$set": {
                    "status": "present",
                    "isManualOverride": True,
                    "manualOverrideReason": reason.strip(),
                    "manualOverrideBy": faculty_name,
                    "manualOverrideFacultyId": faculty_id,
                    "manualOverrideTimestamp": timestamp
                }
            },
            upsert=True
        )
    
    # Insert all audit logs
    if audit_logs:
        manual_override_logs.insert_many(audit_logs)
    
    print(f"Manual override submitted: {len(students)} students by {faculty_name}")
    
    return jsonify({
        "message": f"Successfully marked {len(students)} student(s) as present",
        "overrideCount": len(students),
        "timestamp": timestamp.isoformat()
    }), 200


# --------------------------------------------------
# GET MANUAL OVERRIDE LOGS (Faculty View)
# --------------------------------------------------
@manual_attendance_bp.route("/manual-logs", methods=["GET"])
def get_manual_logs():
    """Get manual override logs for a specific faculty or class."""
    faculty_id = request.args.get("facultyId")
    date = request.args.get("date")
    class_name = request.args.get("className")
    
    query = {}
    
    if faculty_id:
        query["facultyId"] = faculty_id
    if date:
        query["date"] = date
    if class_name:
        query["className"] = class_name
    
    logs = list(manual_override_logs.find(query).sort("timestamp", -1).limit(100))
    
    # Convert ObjectId to string for JSON serialization
    for log in logs:
        log["_id"] = str(log["_id"])
        if "timestamp" in log:
            log["timestamp"] = log["timestamp"].isoformat()
    
    return jsonify({"logs": logs, "count": len(logs)}), 200


# --------------------------------------------------
# GET MANUAL OVERRIDE LOGS (HOD View - All Department)
# --------------------------------------------------
@manual_attendance_bp.route("/manual-logs/hod", methods=["GET"])
def get_manual_logs_hod():
    """Get all manual override logs for HOD view. Read-only access."""
    department = request.args.get("department")
    date_from = request.args.get("dateFrom")
    date_to = request.args.get("dateTo")
    
    query = {}
    
    if department:
        query["department"] = department
    
    # Date range filter
    if date_from and date_to:
        query["date"] = {"$gte": date_from, "$lte": date_to}
    elif date_from:
        query["date"] = {"$gte": date_from}
    elif date_to:
        query["date"] = {"$lte": date_to}
    
    logs = list(manual_override_logs.find(query).sort("timestamp", -1).limit(500))
    
    # Convert ObjectId to string for JSON serialization
    for log in logs:
        log["_id"] = str(log["_id"])
        if "timestamp" in log:
            log["timestamp"] = log["timestamp"].isoformat()
    
    # Summary statistics
    faculty_counts = {}
    for log in logs:
        fid = log.get("facultyId", "Unknown")
        faculty_counts[fid] = faculty_counts.get(fid, 0) + 1
    
    return jsonify({
        "logs": logs,
        "count": len(logs),
        "byFaculty": faculty_counts
    }), 200


# --------------------------------------------------
# GET ATTENDANCE WITH MANUAL OVERRIDE INFO
# --------------------------------------------------
@manual_attendance_bp.route("/with-manual-info", methods=["GET"])
def get_attendance_with_manual_info():
    """Get attendance records with manual override information for reports."""
    date = request.args.get("date")
    class_name = request.args.get("className")
    
    if not date or not class_name:
        return jsonify({"error": "Date and className are required"}), 400
    
    # Get attendance records
    attendance_records = list(attendance_collection.find({
        "date": date,
        "className": class_name
    }))
    
    result = []
    for record in attendance_records:
        entry = {
            "rollNo": record.get("rollNo"),
            "name": record.get("name", "Unknown"),
            "status": record.get("status"),
            "isManualOverride": record.get("isManualOverride", False),
            "manualOverrideReason": record.get("manualOverrideReason"),
            "manualOverrideBy": record.get("manualOverrideBy"),
            "manualOverrideTimestamp": record.get("manualOverrideTimestamp").isoformat() if record.get("manualOverrideTimestamp") else None
        }
        result.append(entry)
    
    manual_count = sum(1 for r in result if r.get("isManualOverride"))
    auto_count = len(result) - manual_count
    
    return jsonify({
        "attendance": result,
        "total": len(result),
        "manualOverrideCount": manual_count,
        "autoDetectedCount": auto_count
    }), 200
