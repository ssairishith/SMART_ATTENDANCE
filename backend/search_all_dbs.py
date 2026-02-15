
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

# Scan all databases
dbs = client.list_database_names()
print("Databases:", dbs)

for db_name in dbs:
    if db_name in ['admin', 'local', 'config']: continue
    db = client[db_name]
    for coll_name in db.list_collection_names():
        coll = db[coll_name]
        # Search for Technical
        regex = {"$regex": "tech", "$options": "i"}
        # Check all fields for simplicity by checking 'subject'
        count = coll.find({"subject": regex}).count() if hasattr(coll.find({"subject": regex}), 'count') else db.command("count", coll_name, query={"subject": regex})['n']
        
        if count > 0:
            print(f"FOUND {count} records in {db_name}.{coll_name}")
            sample = coll.find_one({"subject": regex})
            print("Sample:", sample)
        
        # Also check for date today
        from datetime import datetime
        today = datetime.now().strftime("%Y-%m-%d")
        today_count = coll.find({"date": today}).count() if hasattr(coll.find({"date": today}), 'count') else db.command("count", coll_name, query={"date": today})['n']
        if today_count > 0:
             print(f"FOUND {today_count} records for today in {db_name}.{coll_name}")
             sample = coll.find_one({"date": today})
             print("Sample (Today):", sample)

