import json
import os
from pymongo import MongoClient
from pymongo.collection import Collection


# MongoDB client and collection, will be initialized on startup
client: MongoClient = None
bills_collection: Collection = None

def init_db():
    """Initializes the database connection to MongoDB."""
    global client, bills_collection
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise Exception("MONGO_URI environment variable not set.")
    
    client = MongoClient(mongo_uri)
    # The database name is part of the URI, so we can get it directly.
    db = client.get_database()
    bills_collection = db["bills"]
    print("MongoDB connection initialized.")


def save_bill(bill_id: str, data: dict, image_path: str):
    """Saves a new bill to MongoDB."""
    if not bills_collection:
        raise Exception("Database not initialized. Call init_db() first.")
    
    document = {
        "_id": bill_id,
        "image_path": image_path,
        **data
    }
    bills_collection.insert_one(document)


def get_bill(bill_id: str) -> dict | None:
    """Retrieves a bill from MongoDB."""
    if not bills_collection:
        raise Exception("Database not initialized. Call init_db() first.")
    return bills_collection.find_one({"_id": bill_id})


def update_bill(bill_id: str, data: dict):
    """Updates an existing bill in MongoDB."""
    if not bills_collection:
        raise Exception("Database not initialized. Call init_db() first.")
    bills_collection.replace_one({"_id": bill_id}, data)
