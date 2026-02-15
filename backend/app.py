from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from routes.student_routes import student_bp
from routes.teacher_auth import teacher_bp
from routes.attendance_live import live_attendance_bp
from routes.attendance_group import group_attendance_bp
from routes.attendance_store_excel import attendance_store_excel_bp
from routes.attendance_download import download_bp
from routes.attendance_analytics import analytics_bp

print(">>> THIS IS THE CORRECT APP.PY <<<")

# ==================================================
# LOAD ENVIRONMENT VARIABLES
# ==================================================
load_dotenv()

# ==================================================
# APP INITIALIZATION
# ==================================================
app = Flask(__name__)
# Allow all origins for now to prevent CORS issues on mobile/web deployment
CORS(app, resources={r"/*": {"origins": "*"}})

# ==================================================
# IMPORT & REGISTER BLUEPRINTS
# ==================================================
# NOTE: app.py should ONLY create app and register routes
# NO database logic, NO face recognition logic here



app.register_blueprint(student_bp)
app.register_blueprint(teacher_bp)
app.register_blueprint(live_attendance_bp)
app.register_blueprint(group_attendance_bp)
app.register_blueprint(attendance_store_excel_bp)
app.register_blueprint(download_bp)
app.register_blueprint(analytics_bp) # Register analytics blueprint
from routes.recognition_routes import recognition_bp
app.register_blueprint(recognition_bp)
from routes.hod_auth import hod_bp
app.register_blueprint(hod_bp)
from routes.manual_attendance import manual_attendance_bp
app.register_blueprint(manual_attendance_bp)

# ==================================================
# PRE-WARM SERVICE (Load model & data once)
# ==================================================
from utils.model_loader import get_model
from utils.student_data import get_student_data
with app.app_context():
    print("Pre-warming AI Service...")
    get_model()
    get_student_data()
    print("Pre-warm complete.")

# ==================================================
# DEBUG: SHOW ALL REGISTERED ROUTES
# ==================================================
print("=== REGISTERED ROUTES ===")
print(app.url_map)

# ==================================================
# RUN SERVER
# ==================================================
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5050,
        debug=False
    )
