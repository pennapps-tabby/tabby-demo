import json
import os
from pymongo import MongoClient
from pymongo.collection import Collection
import certifi


# MongoDB client and collection, will be initialized on startup
client: MongoClient = None
bills_collection: Collection = None

def get_collection() -> Collection:
    """Gets the MongoDB collection, initializing the client if needed."""
    global client, bills_collection
    if bills_collection is not None:
        return bills_collection

    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        raise Exception("MONGO_URI environment variable not set.")

    client = MongoClient(mongo_uri, tlsCAFile=certifi.where())
    # Explicitly get the database by name. This is more robust than relying
    # on the default from the URI, which can cause errors if not set.
    db = client["splitsmart"]
    bills_collection = db["bills"]
    print("MongoDB connection initialized.")
    return bills_collection


def init_db():
    """Initializes the database connection to MongoDB."""
    get_collection()


def save_bill(bill_id: str, data: dict, image_path: str):
    """Saves a new bill to MongoDB."""
    collection = get_collection()
    document = {
        "_id": bill_id,
        "image_path": image_path,
        **data
    }
    collection.insert_one(document)


def get_bill(bill_id: str) -> dict | None:
    """Retrieves a bill from MongoDB."""
    collection = get_collection()
    return collection.find_one({"_id": bill_id})


def update_bill(bill_id: str, data: dict):
    """Updates an existing bill in MongoDB."""
    collection = get_collection()
    collection.replace_one({"_id": bill_id}, data)
