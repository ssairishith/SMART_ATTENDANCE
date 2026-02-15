from flask import Blueprint, send_file, jsonify, request
from pymongo import MongoClient
import gridfs
import os
from dotenv import load_dotenv
from routes.jwt_middleware import token_required
import io

load_dotenv()

# --------------------------------------------------
# BLUEPRINT (NAME MATCHES app.py)
# --------------------------------------------------
download_bp = Blueprint(
    "download_bp",
    __name__,
    url_prefix="/api/attendance"
)

# --------------------------------------------------
# DB CONNECTION
# --------------------------------------------------
client = MongoClient(os.getenv("MONGO_URI"))
db = client["AttendanceDB"]
fs = gridfs.GridFS(db)  # Use default collection (matches attendance processing)

# --------------------------------------------------
# DOWNLOAD EXCEL API
# --------------------------------------------------
@download_bp.route("/download/<filename>", methods=["GET"])
@token_required
def download_excel(filename):
    teacher = request.teacher
    try:
        print(f"Attempting to download file: {filename}")
        file = fs.find_one({"filename": filename})

        if not file:
            print(f"File not found: {filename}")
            # List all files in GridFS for debugging
            files = list(fs.find())
            print(f"Available files: {[f.filename for f in files]}")
            return jsonify({"error": "File not found"}), 404

        print(f"File found, size: {file.length}")
        return send_file(
            io.BytesIO(file.read()),
            download_name=filename,
            as_attachment=True,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    except Exception as e:
        print(f"Download error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# --------------------------------------------------
# LIST STORED EXCEL FILES API
# --------------------------------------------------
@download_bp.route("/list-files", methods=["GET"])
@token_required
def list_excel_files():
    teacher = request.teacher
    try:
        print("Listing Excel files from GridFS...")
        
        # Filter Logic:
        # 1. Created by this teacher (metadata.teacher == email)
        # 2. OR Belongs to one of the teacher's assigned classes (metadata.class_name in classes)
        
        email = teacher.get("email")
        classes = teacher.get("classes", [])
        
        # Ensure classes is a list
        if isinstance(classes, str):
            classes = [c.strip() for c in classes.split(',')]
            
        query = {
            "$or": [
                {"metadata.teacher": email},
                {"metadata.class_name": {"$in": classes}}
            ]
        }
        
        print(f"Querying files for {email} with classes {classes}")
        files = list(fs.find(query))
        print(f"GridFS find() returned {len(files)} files")

        file_list = []
        for file in files:
            try:
                file_info = {
                    "filename": file.filename,
                    "upload_date": file.upload_date.isoformat() if file.upload_date else None,
                    "length": file.length,
                    "metadata": file.metadata
                }
                file_list.append(file_info)
                print(f"Processed file: {file.filename}")
            except Exception as file_error:
                print(f"Error processing file {file.filename}: {str(file_error)}")
                continue

        print(f"Successfully processed {len(file_list)} Excel files")
        return jsonify({
            "files": file_list,
            "count": len(file_list)
        }), 200

    except Exception as e:
        print(f"List files error: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

# --------------------------------------------------
# DELETE EXCEL FILE API
# --------------------------------------------------
@download_bp.route("/delete/<filename>", methods=["DELETE"])
@token_required
def delete_excel(filename):
    teacher = request.teacher
    try:
        print(f"Attempting to delete file: {filename}")
        
        file = fs.find_one({"filename": filename})

        if not file:
             return jsonify({"error": "File not found"}), 404
        
        fs.delete(file._id)
        print(f"File deleted successfully: {filename}")
        
        return jsonify({"message": "File deleted successfully"}), 200

    except Exception as e:
        print(f"Delete error: {str(e)}")
        return jsonify({"error": str(e)}), 500
