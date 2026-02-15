import cv2
import numpy as np
import os
from flask import Blueprint, request, jsonify
from numpy.linalg import norm
from dotenv import load_dotenv
from pymongo import MongoClient
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

# ---------------- MODEL ----------------
# Re-initializing model here might be expensive if not shared, 
# but for safety/isolation we do it. Ideally model should be a singleton in app.py
model = insightface.app.FaceAnalysis(name="buffalo_l")
# Increase detection size for group photos
# model.prepare(ctx_id=CTX_ID, det_size=(640, 640))
model.prepare(ctx_id=CTX_ID, det_size=(640, 640))

# ---------------- LOAD STUDENTS ----------------
# In production, this should be cached or loaded once globally
names = []      # List of names
rolls = []      # List of roll numbers
encodings = []  # Numpy array of shape (N, 512)

def load_encodings():
    global names, rolls, encodings
    temp_names, temp_rolls, temp_encodings = [], [], []
    for doc in students_col.find({"model": "arcface"}):
        temp_names.append(doc["name"])
        temp_rolls.append(str(doc["rollNo"]))
        # Assuming finding includes standard 512d embeddings
        emb = np.array(doc["face_encoding"], dtype=float)
        # Normalize immediately upon loading
        emb = emb / norm(emb)
        temp_encodings.append(emb)
    
    names = temp_names
    rolls = temp_rolls
    if temp_encodings:
        encodings = np.stack(temp_encodings) # Shape (N, 512)
    else:
        encodings = np.empty((0, 512))

load_encodings() # Load on startup



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

        if encodings.shape[0] == 0:
            load_encodings()

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
                sims = np.dot(emb, encodings.T)
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

