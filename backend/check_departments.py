from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["AttendanceDB"]
students = db["students"]

print("--- DEBUG START ---")
print("Distinct Departments:", students.distinct("department"))
print("Distinct Sections:", students.distinct("section"))

print("\nSample Student from 'AI & AIML':")
sample = students.find_one({"department": "AI & AIML"})
if sample:
    print(f"Name: {sample.get('name')}, Dept: {sample.get('department')}, Section: {sample.get('section')}")
else:
    print("No student match for 'AI & AIML'")

print("\nSample Student from 'AIML':")
sample2 = students.find_one({"department": "AIML"})
if sample2:
    print(f"Name: {sample2.get('name')}, Dept: {sample2.get('department')}, Section: {sample2.get('section')}")
else:
    print("No student match for 'AIML'")
print("--- DEBUG END ---")
