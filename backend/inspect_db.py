from pymongo import MongoClient
import os
from dotenv import load_dotenv
import json

load_dotenv()

mongo_uri = os.getenv("AUTH_MONGO_URI")
client = MongoClient(mongo_uri)

print("Checking AuthDB collections...")
db_auth = client["AuthDB"]
profiles_coll = db_auth["teachers_profiles"]
timetables_coll = db_auth["teachers_timetables"]

print("\nProfiles (limit 1):")
for doc in profiles_coll.find().limit(1):
    doc['_id'] = str(doc['_id'])
    print(json.dumps(doc, indent=2))

print("\nTimetables (limit 1):")
for doc in timetables_coll.find().limit(1):
    doc['_id'] = str(doc['_id'])
    print(json.dumps(doc, indent=2))

print("\nChecking TeacherAuthDB collections...")
db_teacher = client["TeacherAuthDB"]
teachers_coll = db_teacher["teachers"]

print("\nTeachers (limit 1):")
for doc in teachers_coll.find().limit(1):
    doc['_id'] = str(doc['_id'])
    print(json.dumps(doc, indent=2))
