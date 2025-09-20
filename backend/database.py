import sqlite3
import json
from typing import Dict, Optional

DATABASE_FILE = "bills.db"

def init_db():
    """Initialize the SQLite database"""
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bills (
            bill_id TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            image_path TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    conn.close()

def save_bill(bill_id: str, data: Dict, image_path: str):
    """Save bill data to database"""
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT OR REPLACE INTO bills (bill_id, data, image_path)
        VALUES (?, ?, ?)
    """, (bill_id, json.dumps(data), image_path))
    
    conn.commit()
    conn.close()

def get_bill(bill_id: str) -> Optional[Dict]:
    """Retrieve bill data from database"""
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute("SELECT data FROM bills WHERE bill_id = ?", (bill_id,))
    result = cursor.fetchone()
    
    conn.close()
    
    if result:
        return json.loads(result[0])
    return None

def update_bill_splits(bill_id: str, splits: Dict):
    """Update bill with calculated splits"""
    bill = get_bill(bill_id)
    if bill:
        bill['splits'] = splits
        save_bill(bill_id, bill, bill.get('image_path', ''))
