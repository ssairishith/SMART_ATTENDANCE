from flask import Blueprint, jsonify, request
from routes.jwt_middleware import token_required
from pymongo import MongoClient
import gridfs
import os
from dotenv import load_dotenv

load_dotenv()

attendance_store_excel_bp = Blueprint(
    "attendance_store_excel",
    __name__,
    url_prefix="/api/attendance"
)

client = MongoClient(os.getenv("MONGO_URI"))
db = client["AttendanceDB"]
fs = gridfs.GridFS(db)

@attendance_store_excel_bp.route("/store-excel", methods=["POST"])
@token_required
def store_excel():
    teacher = request.teacher

    if "file" not in request.files:
        return jsonify({"error": "Excel file missing"}), 400

    file = request.files["file"]

    fs.put(
        file,
        filename=file.filename,
        metadata={
            "teacher": teacher["email"],
            "course": request.form.get("course"),
            "class_name": request.form.get("class"),
            "hour": request.form.get("hour"),
            "type": request.form.get("type")
        }
    )

    return jsonify({
        "message": "Excel stored successfully",
        "filename": file.filename
    }), 200
