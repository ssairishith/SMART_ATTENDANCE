from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

def inspect():
    MONGO_URIs = [os.getenv("MONGO_URI"), os.getenv("AUTH_MONGO_URI")]
    
    for uri in set(MONGO_URIs):
        if not uri: continue
        print(f"\n--- Database: {uri} ---")
        client = MongoClient(uri)
        for db_name in client.list_database_names():
            if db_name in ["admin", "local", "config"]: continue
            db = client[db_name]
            print(f"  DB: {db_name}")
            for coll in db.list_collection_names():
                count = db[coll].count_documents({})
                print(f"    Collection: {coll} ({count} docs)")

if __name__ == "__main__":
    inspect()
