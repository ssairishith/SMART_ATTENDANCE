from flask import Blueprint, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta

load_dotenv()

# Blueprint
analytics_bp = Blueprint("analytics_bp", __name__, url_prefix="/api/analytics")

# Database
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["AttendanceDB"]
attendance_col = db["attendance"]
students_col = db["students"]


@analytics_bp.route("/student/<roll_no>", methods=["GET"])
def get_student_analytics(roll_no):
    """
    Get comprehensive attendance analytics for a specific student.
    Returns overall percentage, per-subject breakdown, and recent attendance.
    """
    try:
        # Get student info
        student = students_col.find_one({"rollNo": roll_no})
        if not student:
            return jsonify({"error": "Student not found"}), 404

        # Overall attendance
        total_records = attendance_col.count_documents({"rollNo": roll_no})
        attended_records = attendance_col.count_documents({
            "rollNo": roll_no,
            "status": "present"
        })
        
        overall_percentage = round((attended_records / total_records * 100), 1) if total_records > 0 else 0

        # Per-subject attendance using aggregation
        subject_pipeline = [
            {"$match": {"rollNo": roll_no}},
            {"$group": {
                "_id": "$subject",
                "total": {"$sum": 1},
                "attended": {
                    "$sum": {"$cond": [{"$eq": ["$status", "present"]}, 1, 0]}
                }
            }},
            {"$project": {
                "subject": "$_id",
                "total": 1,
                "attended": 1,
                "percentage": {
                    "$round": [{
                        "$multiply": [
                            {"$divide": ["$attended", "$total"]},
                            100
                        ]
                    }, 1]
                }
            }},
            {"$sort": {"subject": 1}}
        ]
        
        subject_stats = list(attendance_col.aggregate(subject_pipeline))
        
        # Format subject stats
        by_subject = []
        for stat in subject_stats:
            by_subject.append({
                "subject": stat["subject"],
                "totalClasses": stat["total"],
                "attended": stat["attended"],
                "percentage": stat["percentage"]
            })

        # Recent attendance (last 10 records)
        recent_records = list(attendance_col.find(
            {"rollNo": roll_no}
        ).sort("timestamp", -1).limit(10))
        
        recent_attendance = []
        for record in recent_records:
            recent_attendance.append({
                "date": record.get("date"),
                "subject": record.get("subject"),
                "status": record.get("status"),
                "time": record.get("time"),
                "time": record.get("time")
            })

        return jsonify({
            "rollNo": roll_no,
            "name": student.get("name"),
            "department": student.get("department"),
            "section": student.get("section"),
            "overall": {
                "totalClasses": total_records,
                "attended": attended_records,
                "percentage": overall_percentage
            },
            "bySubject": by_subject,
            "recentAttendance": recent_attendance
        }), 200

    except Exception as e:
        print(f"Error in get_student_analytics: {e}")
        return jsonify({"error": str(e)}), 500


# Hardcoded mapping from Display Name -> DB Code
NAME_TO_CODE_MAPPING = {
    "Design and Analysis of Algorithms": "daa122",
    "DAA": "daa122", # Handle short form
    "Computer Science": "cs101",
    "CS": "cs101",
    "Computer Science Lab": "cs102",
    "Discrete Math": "dm101",
    "DM": "dm101",
    # Add others as needed
}

@analytics_bp.route("/class/<path:class_name>", methods=["GET"])
def get_class_analytics(class_name):
    """
    Get attendance summary for a specific subject/class.
    class_name is the SUBJECT NAME (e.g., "Java Programming") from frontend.
    We need to resolve it to the SUBJECT CODE (e.g., "Ja101") used in DB.
    """
    from flask import request
    try:
        subject_name_input = class_name
        section_param = request.args.get("section", "")

        # ---------------------------------------------------------
        # 1. RESOLVE SUBJECT NAME TO CODE
        # ---------------------------------------------------------
        subject_code = subject_name_input
        
        # Check hardcoded mapping first
        if subject_name_input in NAME_TO_CODE_MAPPING:
            subject_code = NAME_TO_CODE_MAPPING[subject_name_input]
        
        # Check if any record has this as a subject directly (Secondary check)
        elif not attendance_col.find_one({"subject": subject_code}):
            # Fuzzy match: Is DB subject a substring of input? (e.g. DB="Java", Input="Java Programming")
            db_subjects = attendance_col.distinct("subject")
            match_found = False
            
            # Case insensitive check
            input_lower = subject_name_input.lower()
            
            for db_s in db_subjects:
                if db_s and db_s.lower() in input_lower:
                    subject_code = db_s
                    match_found = True
                    break
            
            if not match_found:
                # Try regex match just in case
                found_subject = attendance_col.find_one({"subject": {"$regex": f"^{subject_name_input}$", "$options": "i"}})
                if found_subject:
                    subject_code = found_subject["subject"]

        # ---------------------------------------------------------

        # 1. Get List of Students
        students = []
        # Support splitting section (e.g. "AIML-B" -> dept="AIML", sec="B")
        dept, sec = "", ""
        if section_param and "-" in section_param:
             parts = section_param.split("-", 1)
             dept = parts[0]
             sec = parts[1]
        elif section_param:
             sec = section_param

        if dept and sec:
            students = list(students_col.find({"department": dept, "section": sec}))
            if not students:
                 students = list(students_col.find({"department": {"$regex": f"^{dept}", "$options": "i"}, "section": sec}))
        elif sec:
            students = list(students_col.find({"section": sec}))
        
        # Fallback: Who has attended?
        if not students:
            roll_nos = attendance_col.distinct("rollNo", {
                "subject": subject_code,
                "className": {"$regex": section_param, "$options": "i"} if section_param else {"$exists": True}
            })
            if roll_nos:
                students = list(students_col.find({"rollNo": {"$in": roll_nos}}))

        # 2. Get TOTAL CLASSES conducted
        # Count unique dates for this subject & section
        unique_dates_query = {"subject": subject_code}
        if section_param:
            # className should contain section (e.g. "AIML-B")
            unique_dates_query["className"] = {"$regex": section_param, "$options": "i"}
            
        total_conducted_classes = len(attendance_col.distinct("date", unique_dates_query))
        
        student_analytics = []
        total_percentage_sum = 0
        students_with_records = 0

        for student in students:
            roll_no = str(student.get("rollNo"))
            
            attended = attendance_col.count_documents({
                "rollNo": roll_no,
                "subject": subject_code,
                "status": "present"
            })
            
            denominator = total_conducted_classes if total_conducted_classes > 0 else 1
            percentage = round((attended / denominator * 100), 1)
            if total_conducted_classes == 0:
                percentage = 0.0
            
            attended_display = f"{attended} / {total_conducted_classes}"

            student_analytics.append({
                "rollNo": roll_no,
                "name": student.get("name"),
                "department": student.get("department"),
                "section": student.get("section"),
                "overallPercentage": percentage,
                "totalClasses": total_conducted_classes,
                "attended": attended,
                "attendedDisplay": attended_display
            })
            
            if total_conducted_classes > 0: # Only count towards class average if classes exist
                students_with_records += 1
                total_percentage_sum += percentage

        class_average = round(total_percentage_sum / students_with_records, 1) if students_with_records > 0 else 0
        student_analytics.sort(key=lambda x: str(x["rollNo"]))

        return jsonify({
            "className": subject_name_input,
            "section": section_param,
            "totalStudents": len(student_analytics),
            "studentsWithRecords": students_with_records, 
            "classAverage": class_average,
            "students": student_analytics,
            "debug": {
                "subjectCodeUsed": subject_code,
                "totalConducted": total_conducted_classes
            }
        }), 200

    except Exception as e:
        print(f"Error in get_class_analytics: {e}")
        return jsonify({"error": str(e)}), 500



@analytics_bp.route("/subject/<subject>/<class_name>", methods=["GET"])
def get_subject_analytics(subject, class_name):
    """
    Get subject-specific attendance for a class.
    """
    try:
        # Parse class name
        section_code = class_name
        if "(" in class_name and ")" in class_name:
            import re
            match = re.search(r'\((.*?)\)', class_name)
            section_code = match.group(1) if match else class_name

        # Get all students in this class
        query = {}
        if "-" in section_code:
            dept, sec = section_code.split("-", 1)
            query = {"department": dept, "section": sec}
        else:
            query = {"section": section_code}
        
        students = list(students_col.find(query))
        
        if not students:
            students = list(students_col.find({"section": section_code}))

        subject_analytics = []
        total_percentage_sum = 0
        students_with_records = 0

        for student in students:
            roll_no = student["rollNo"]
            
            # Calculate attendance for this subject
            total_classes = attendance_col.count_documents({
                "rollNo": roll_no,
                "subject": subject
            })
            
            attended = attendance_col.count_documents({
                "rollNo": roll_no,
                "subject": subject,
                "status": "present"
            })
            
            percentage = round((attended / total_classes * 100), 1) if total_classes > 0 else 0
            
            subject_analytics.append({
                "rollNo": roll_no,
                "name": student.get("name"),
                "totalClasses": total_classes,
                "attended": attended,
                "percentage": percentage
            })
            
            if total_classes > 0:
                total_percentage_sum += percentage
                students_with_records += 1

        # Calculate subject average
        subject_average = round(total_percentage_sum / students_with_records, 1) if students_with_records > 0 else 0

        # Sort by percentage descending
        subject_analytics.sort(key=lambda x: x["percentage"], reverse=True)

        return jsonify({
            "subject": subject,
            "className": class_name,
            "sectionCode": section_code,
            "totalStudents": len(subject_analytics),
            "studentsWithRecords": students_with_records,
            "subjectAverage": subject_average,
            "students": subject_analytics
        }), 200

    except Exception as e:
        print(f"Error in get_subject_analytics: {e}")
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/dashboard/<path:class_name>", methods=["GET"])
def get_dashboard_analytics(class_name):
    """
    Get comprehensive analytics for dashboard display.
    Includes overall stats, subject-wise breakdown, and low attendance alerts.
    """
    try:
        # Parse class name
        section_code = class_name
        if "(" in class_name and ")" in class_name:
            import re
            match = re.search(r'\((.*?)\)', class_name)
            section_code = match.group(1) if match else class_name

        # Get total unique students who have attendance records
        pipeline = [
            {"$match": {"className": {"$regex": section_code, "$options": "i"}}},
            {"$group": {"_id": "$rollNo"}},
            {"$count": "total"}
        ]
        
        result = list(attendance_col.aggregate(pipeline))
        total_students_with_records = result[0]["total"] if result else 0

        # Get total classes conducted
        total_classes_pipeline = [
            {"$match": {"className": {"$regex": section_code, "$options": "i"}}},
            {"$group": {
                "_id": {
                    "date": "$date",
                    "subject": "$subject"
                }
            }},
            {"$count": "total"}
        ]
        
        classes_result = list(attendance_col.aggregate(total_classes_pipeline))
        total_classes_conducted = classes_result[0]["total"] if classes_result else 0

        # Get subject-wise stats
        subject_stats_pipeline = [
            {"$match": {"className": {"$regex": section_code, "$options": "i"}}},
            {"$group": {
                "_id": "$subject",
                "totalClasses": {"$sum": 1},
                "presentCount": {
                    "$sum": {"$cond": [{"$eq": ["$status", "present"]}, 1, 0]}
                }
            }},
            {"$project": {
                "subject": "$_id",
                "totalClasses": 1,
                "presentCount": 1,
                "averageAttendance": {
                    "$round": [{
                        "$multiply": [
                            {"$divide": ["$presentCount", "$totalClasses"]},
                            100
                        ]
                    }, 1]
                }
            }},
            {"$sort": {"subject": 1}}
        ]
        
        subject_stats = list(attendance_col.aggregate(subject_stats_pipeline))

        # Get low attendance students (< 75%)
        low_attendance_pipeline = [
            {"$match": {"className": {"$regex": section_code, "$options": "i"}}},
            {"$group": {
                "_id": "$rollNo",
                "name": {"$first": "$name"},
                "total": {"$sum": 1},
                "attended": {
                    "$sum": {"$cond": [{"$eq": ["$status", "present"]}, 1, 0]}
                }
            }},
            {"$project": {
                "rollNo": "$_id",
                "name": 1,
                "total": 1,
                "attended": 1,
                "percentage": {
                    "$multiply": [
                        {"$divide": ["$attended", "$total"]},
                        100
                    ]
                }
            }},
            {"$match": {"percentage": {"$lt": 75}}},
            {"$sort": {"percentage": 1}},
            {"$limit": 10}
        ]
        
        low_attendance_students = list(attendance_col.aggregate(low_attendance_pipeline))

        return jsonify({
            "className": class_name,
            "sectionCode": section_code,
            "overview": {
                "totalStudentsWithRecords": total_students_with_records,
                "totalClassesConducted": total_classes_conducted
            },
            "subjectStats": subject_stats,
            "lowAttendanceAlerts": low_attendance_students
        }), 200

    except Exception as e:
        print(f"Error in get_dashboard_analytics: {e}")
        return jsonify({"error": str(e)}), 500
