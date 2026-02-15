from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

def update_academic_year():
    try:
        mongo_uri = os.getenv("AUTH_MONGO_URI")
        client = MongoClient(mongo_uri)
        db_auth = client["AuthDB"]
        profiles_coll = db_auth["teachers_profiles"]

        result = profiles_coll.update_many({}, {"$set": {"academicYear": "2025-2026 "}})
        print(f"Successfully updated {result.modified_count} profiles to academicYear: 2025-2026")
        client.close()
    except Exception as e:
        print(f"Error updating academic year: {e}")

if __name__ == "__main__":
    update_academic_year()
