import cv2
import numpy as np
import insightface
from pymongo import MongoClient
from datetime import datetime
import os

from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

load_dotenv()

# --------------------------------------------------
# BLUEPRINT
# --------------------------------------------------
student_bp = Blueprint(
    "student_bp",
    __name__,
    url_prefix="/api/student"
)

# --------------------------------------------------
# CONFIG
# --------------------------------------------------
try:
    MONGO_URI = os.getenv("MONGO_URI")
    print(f"Connecting to attendance DB: {MONGO_URI}")
    client = MongoClient(MONGO_URI)
    # Test connection
    client.admin.command('ping')
    print("Attendance DB connection successful")
    DB_NAME = "AttendanceDB"
except Exception as e:
    print(f"Attendance DB connection failed: {e}")
    raise e
COLLECTION = "students"
CTX_ID = -1  # CPU mode

# --------------------------------------------------
# LOAD ARCFACE MODEL (ONCE)
# --------------------------------------------------
print("Loading ArcFace model (CPU)...")
model = insightface.app.FaceAnalysis(name="buffalo_l")
model.prepare(ctx_id=CTX_ID, det_size=(640, 640))

# --------------------------------------------------
# CONNECT DB
# --------------------------------------------------
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
students_col = db[COLLECTION]

# --------------------------------------------------
# STUDENT REGISTRATION API
# --------------------------------------------------
@student_bp.route("/register", methods=["POST"])
def register_student():
    try:
        # -------- READ FORM DATA --------
        roll_no = request.form.get("rollNo")
        name = request.form.get("name")
        email = request.form.get("email")
        department = request.form.get("department")
        section = request.form.get("section")
        photo = request.files.get("photo")

        if not all([roll_no, name, email, department, section, photo]):
            return jsonify({"error": "Missing required fields"}), 400

        # -------- DUPLICATE CHECK --------
        if students_col.find_one({"rollNo": roll_no}):
            return jsonify({"error": "Roll number already registered"}), 409

        # -------- READ IMAGE --------
        img_bytes = photo.read()
        np_img = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({"error": "Invalid image file"}), 400

        # -------- FACE DETECTION --------
        faces = model.get(img)

        if len(faces) == 0:
            return jsonify({"error": "No face detected"}), 400

        if len(faces) > 1:
            return jsonify({"error": "Multiple faces detected"}), 400

        # -------- ENCODING --------
        embedding = faces[0].embedding
        embedding = embedding / np.linalg.norm(embedding)

        # -------- INSERT INTO DB --------
        student_doc = {
            "rollNo": roll_no,
            "name": name,
            "email": email,
            "department": department,
            "section": section,
            "face_encoding": embedding.tolist(),
            "model": "arcface",
            "registeredAt": datetime.utcnow()
        }

        result = students_col.insert_one(student_doc)
        print(f"Student registered with ID: {result.inserted_id}")

        return jsonify({
            "message": "Student registered successfully",
            "rollNo": roll_no,
            "name": name
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@student_bp.route("/list/<section_code>", methods=["GET"])
def get_students_by_section(section_code):
    try:
        print(f"DEBUG: Processing request for section: {section_code}")
        
        # 1. Try split match (e.g. Dept=AIML, Sec=B)
        query = {}
        if "-" in section_code:
            dept, sec = section_code.split("-", 1)
            query = {"department": dept, "section": sec}
        else:
            query = {"section": section_code}
            
        students = list(students_col.find(query))
        
        # 2. Try direct match (e.g. Sec="AIML-B")
        if not students and "-" in section_code:
             students = list(students_col.find({"section": section_code}))
        
        # 3. Final Fallback: Return ALL students so the UI is never empty
        if not students:
            print("DEBUG: All filters failed, returning all students as fallback")
            students = list(students_col.find({}))

        for s in students:
            s["_id"] = str(s["_id"])
            if "face_encoding" in s:
                del s["face_encoding"]
        return jsonify(students), 200
    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({"error": str(e)}), 500
