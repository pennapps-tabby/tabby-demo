from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from vision_service import parse_receipt
from models import BillResponse, AssignmentRequest, PaymentLinksResponse
from database import init_db, save_bill, get_bill, update_bill_splits
from utils import calculate_splits, generate_qr_code, generate_venmo_link
import uuid
import os

app = FastAPI(title="Bill Splitter API")

# CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup():
    init_db()

@app.post("/api/upload-receipt")
async def upload_receipt(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")
    
    # Save uploaded file
    bill_id = str(uuid.uuid4())
    file_path = f"uploads/{bill_id}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Parse with vision AI
    try:
        parsed_data = await parse_receipt(file_path)
        
        # Save to database
        save_bill(bill_id, parsed_data, file_path)
        
        return {
            "bill_id": bill_id,
            "items": parsed_data["items"],
            "subtotal": parsed_data["subtotal"],
            "tax": parsed_data["tax"],
            "total": parsed_data["total"],
            "restaurant_name": parsed_data["restaurant_name"]
        }
    except Exception as e:
        raise HTTPException(500, f"Failed to parse receipt: {str(e)}")

@app.post("/api/bills/{bill_id}/assign")
async def assign_items(bill_id: str, assignment: AssignmentRequest):
    # Process item assignments and calculate splits
    bill = get_bill(bill_id)
    if not bill:
        raise HTTPException(404, "Bill not found")
    
    # Calculate per-person totals
    splits = calculate_splits(bill, assignment.assignments, assignment.people)
    
    # Save splits to database
    update_bill_splits(bill_id, splits)
    
    return {"splits": splits}

@app.get("/api/bills/{bill_id}")
async def get_bill_data(bill_id: str):
    """Get bill data by ID"""
    bill = get_bill(bill_id)
    if not bill:
        raise HTTPException(404, "Bill not found")
    return bill

@app.get("/api/bills/{bill_id}/payment-links")
async def generate_payment_links(bill_id: str, organizer_venmo: str):
    """Generate payment links for each person"""
    bill = get_bill(bill_id)
    if not bill:
        raise HTTPException(404, "Bill not found")
    
    splits = bill.get("splits", {})
    if not splits:
        raise HTTPException(400, "Bill has not been assigned yet")
    
    links = []
    for person, amount in splits.items():
        if amount > 0:  # Only generate links for people who owe money
            note = f"Bill from {bill.get('restaurant_name', 'Restaurant')}"
            venmo_link = generate_venmo_link(organizer_venmo, amount, note)
            qr_code = generate_qr_code(venmo_link)
            
            links.append({
                "person": person,
                "amount": amount,
                "venmo_link": venmo_link,
                "qr_code": qr_code
            })
    
    return {"payment_links": links}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
