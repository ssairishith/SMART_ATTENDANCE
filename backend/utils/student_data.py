import numpy as np
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from numpy.linalg import norm

load_dotenv()

_student_data = None

def get_student_data():
    """
    Returns a singleton dictionary containing names, rolls, and normalized encodings.
    Loading once saves memory and prevents redundant DB queries on startup.
    """
    global _student_data
    if _student_data is None:
        print(">>> Loading Student Data (Singleton) <<<")
        MONGO_URI = os.getenv("MONGO_URI")
        client = MongoClient(MONGO_URI)
        db = client["AttendanceDB"]
        students_col = db["students"]

        names, rolls, encodings = [], [], []
        for doc in students_col.find({"model": "arcface"}):
            names.append(doc["name"])
            rolls.append(str(doc["rollNo"]))
            emb = np.array(doc["face_encoding"], dtype=float)
            # Normalize immediately
            emb = emb / norm(emb)
            encodings.append(emb)
        
        _student_data = {
            "names": names,
            "rolls": rolls,
            "encodings": np.stack(encodings) if encodings else np.empty((0, 512))
        }
    return _student_data

def reload_student_data():
    """Force refresh the student data cache."""
    global _student_data
    _student_data = None
    return get_student_data()
