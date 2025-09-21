import json
import os

DB_DIR = "/tmp/db"


def init_db():
    """Initializes the database by creating the db directory."""
    os.makedirs(DB_DIR, exist_ok=True)


def _get_bill_path(bill_id: str) -> str:
    """Constructs the file path for a given bill ID."""
    return os.path.join(DB_DIR, f"{bill_id}.json")


def save_bill(bill_id: str, data: dict, image_path: str):
    """Saves a new bill to a JSON file."""
    data['image_path'] = image_path
    file_path = _get_bill_path(bill_id)
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)


def get_bill(bill_id: str) -> dict | None:
    """Retrieves a bill from a JSON file."""
    file_path = _get_bill_path(bill_id)
    if not os.path.exists(file_path):
        return None
    with open(file_path, 'r') as f:
        return json.load(f)


def update_bill(bill_id: str, data: dict):
    """Updates an existing bill file with new data."""
    file_path = _get_bill_path(bill_id)
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)
