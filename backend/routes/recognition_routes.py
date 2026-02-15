import cv2
import numpy as np
import os
from flask import Blueprint, request, jsonify
from numpy.linalg import norm
from dotenv import load_dotenv
from pymongo import MongoClient
import os
import insightface

# ---------------- Blueprint ----------------
recognition_bp = Blueprint("recognition_bp", __name__, url_prefix="/api/recognition")

# ---------------- ENV ----------------
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
ARC_THRESHOLD = 0.38
CTX_ID = -1

# ---------------- DB ----------------
client = MongoClient(MONGO_URI)
db = client["AttendanceDB"]
students_col = db["students"]

from utils.model_loader import get_model
from utils.student_data import get_student_data

model = get_model()

def get_current_data():
    return get_student_data()



@recognition_bp.route("/frame", methods=["POST"])
def recognize_frame():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400

        file = request.files['image']
        img_bytes = file.read()
        np_img = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({"error": "Invalid image format or corrupted file"}), 400

        data = get_current_data()
        names = data["names"]
        rolls = data["rolls"]
        encodings = data["encodings"]

        faces = model.get(frame)
        
        debug_info = {
            "faces_detected": len(faces),
            "known_encodings": encodings.shape[0]
        }

        if not faces:
            return jsonify({"matches": [], "debug": debug_info}), 200

        all_face_results = []
        
        for face in faces:
            # Match identification
            emb = face.embedding
            emb = emb / norm(emb)
            
            match_info = {"name": "Unknown", "roll": "Unknown", "confidence": 0}
            
            if encodings.shape[0] > 0:
                # Use dot product for normalized vectors (equivalent to cosine similarity)
                sims = np.dot(emb, encodings)
                best_idx = np.argmax(sims)
                max_sim = sims[best_idx]
                
                if max_sim >= ARC_THRESHOLD:
                    match_info = {
                        "name": names[best_idx],
                        "roll": rolls[best_idx],
                        "confidence": float(max_sim)
                    }

            bbox = face.bbox.astype(int).tolist()
            all_face_results.append({
                **match_info,
                "bbox": bbox
            })

        return jsonify({"matches": all_face_results, "debug": debug_info}), 200
    
    except Exception as e:
        print(f"!!! CRASH IN RECOGNIZE_FRAME: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": "Internal Server Error during recognition",
            "details": str(e)
        }), 500

