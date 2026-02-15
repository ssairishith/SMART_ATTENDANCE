
from datetime import datetime
today = datetime.now().strftime("%Y-%m-%d")
print(f"--- Records for {today} ---")
records = list(db.attendance.find({"date": today}))
print(f"Count: {len(records)}")
for r in records[:10]:
    r['_id'] = str(r['_id'])
    print(r)

# Also check for "present" records specifically
present_records = db.attendance.count_documents({"status": "present"})
print(f"Total present records in DB: {present_records}")

print("\n--- Checking 'manual_attendance' collection? ---")
if "manual_attendance" in db.list_collection_names():
    print("Found 'manual_attendance' collection. count:", db.manual_attendance.estimated_document_count())
    import json
    from bson import json_util
    
    # Just print the raw dict for now, or use json_util
    sample = db.manual_attendance.find_one()
    if sample:
        print("Sample:", json_util.dumps(sample, indent=2))
    else:
        print("Collection empty.")

print("\n--- Checking 'technical_training' collection? ---")
# Just guessing
for coll_name in db.list_collection_names():
    if "tech" in coll_name.lower():
        print(f"Found suspicious collection: {coll_name}")

print("\n--- Checking ANY collection with documents ---")
for coll_name in db.list_collection_names():
    count = db[coll_name].estimated_document_count()
    if count > 0:
        print(f"Collection '{coll_name}' has {count} docs")
        if coll_name in ['attendance', 'students', 'manual_override_logs']:
             # Print last doc
             last_doc = db[coll_name].find().sort('_id', -1).limit(1)
             for d in last_doc:
                 # scrub OID
                 d['_id'] = str(d['_id'])
                 import json
                 from bson import json_util
                 print(f"LAST DOC in {coll_name}:\n{json_util.dumps(d, indent=2)}")

# Check specifically for "group" attendance or similarly named collections
print("Searching for group attendance collections...")
