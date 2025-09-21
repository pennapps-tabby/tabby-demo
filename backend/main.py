from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from .vision_service import configure_gemini, parse_receipt
from .models import (AssignmentRequest, BillResponse, PaymentLinksResponse,
                     TogglePaidRequest)
from .database import get_bill, init_db, save_bill, update_bill
from .utils import (calculate_splits, generate_payment_page_link,
                    generate_qr_code)
import uuid
import os
import aiofiles
import time
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown (if needed)

app = FastAPI(title="Bill Splitter API", root_path="/api", lifespan=lifespan)

# Debugging Middleware: Log every request path and response status
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    print(f"--> Request received for path: {request.url.path}")
    response = await call_next(request)
    process_time = time.time() - start_time
    print(f"<-- Responded with status: {response.status_code} in {process_time:.4f}s")
    return response
# CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_URL = "http://localhost:5173"

# Use the /tmp directory for file storage in a serverless environment
UPLOADS_DIR = "/tmp/uploads"
os.makedirs(UPLOADS_DIR, exist_ok=True)



@app.post("/upload-receipt")
async def upload_receipt(file: UploadFile = File(...)):
    print("HELLO")
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")

    # Save uploaded file
    bill_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOADS_DIR, f"{bill_id}_{file.filename}")

    async with aiofiles.open(file_path, "wb") as buffer:
        content = await file.read()
        await buffer.write(content)

    # Parse with vision AI
    try:
        print("HELLO 2")
        parsed_data = await parse_receipt(file_path)
        print("HELLO 3")

        # Save to database
        save_bill(bill_id, parsed_data, file_path)

        return {
            "bill_id": bill_id,
            "items": parsed_data["items"],
            "subtotal": parsed_data["subtotal"],
            "tax": parsed_data["tax"],
            "tip": parsed_data.get("tip", 0.0),
            "total": parsed_data["total"],
            "restaurant_name": parsed_data["restaurant_name"]
        }
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(500, f"Failed to parse receipt: {str(e)}")


@app.post("/bills/{bill_id}/assign")
async def assign_items(bill_id: str, assignment: AssignmentRequest):
    # Process item assignments and calculate splits
    bill = get_bill(bill_id)
    if not bill:
        raise HTTPException(404, "Bill not found")

    # If a new tip is provided in the request, update it in the bill data for calculation
    if assignment.tip is not None:
        bill['tip'] = assignment.tip
        bill['total'] = bill['subtotal'] + bill['tax'] + bill['tip']

    # Calculate per-person totals
    splits = calculate_splits(bill, assignment.assignments, assignment.people)

    # Update the bill object in memory
    bill['splits'] = splits
    bill['assignments_detail'] = [a.dict() for a in assignment.assignments]

    # Save the entire updated bill object
    update_bill(bill_id, bill)
    return splits


@app.get("/bills/{bill_id}")
async def get_bill_data(bill_id: str):
    """Get bill data by ID"""
    bill = get_bill(bill_id)
    if not bill:
        raise HTTPException(404, "Bill not found")
    return bill


@app.post("/bills/{bill_id}/toggle-paid")
async def toggle_paid_status(bill_id: str, request: TogglePaidRequest):
    """Toggle the paid status for a person."""
    bill = get_bill(bill_id)
    if not bill:
        raise HTTPException(404, "Bill not found")

    splits = bill.get("splits", {})
    if request.person not in splits:
        raise HTTPException(
            404, f"Person '{request.person}' not found in this bill's splits.")

    # Toggle the 'paid' status
    splits[request.person]['paid'] = not splits[request.person].get(
        'paid', False)
    update_bill(bill_id, bill)

    return splits


@app.get("/bills/{bill_id}/payment-links")
async def generate_payment_links(request: Request, bill_id: str, organizer_venmo: str, organizer_name: str = "Me"):
    """Generate payment links for each person"""
    bill = get_bill(bill_id)
    if not bill:
        raise HTTPException(404, "Bill not found")

    splits = bill.get("splits", {})
    if not splits:
        raise HTTPException(400, "Bill has not been assigned yet")

    # Dynamically determine the frontend URL from the request referer header.
    # This allows preview deployments on Vercel to generate correct links.
    from urllib.parse import urlparse
    referer = request.headers.get("referer")
    if referer:
        parsed_referer = urlparse(referer)
        base_url = f"{parsed_referer.scheme}://{parsed_referer.netloc}"
    else:
        base_url = FRONTEND_URL

    outstanding_amount = 0.0
    my_total = 0.0
    links = []
    for person, details in splits.items():
        amount_due = details.get('total_due', 0)
        is_paid = details.get('paid', False)

        if person == organizer_name:
            my_total = amount_due
        else:
            if not is_paid and amount_due > 0:
                outstanding_amount += amount_due

            if amount_due > 0:  # Only generate links for people who owe money
                note = f"Bill from {bill.get('restaurant_name', 'Restaurant')}"
                payment_page_link = generate_payment_page_link(
                    base_url, organizer_venmo, amount_due, note)
                qr_code = generate_qr_code(payment_page_link)

                links.append({
                    "person": person,
                    "amount": amount_due,
                    "item_total": details.get("item_total", 0.0),
                    "tax_share": details.get("tax_share", 0.0),
                    "tip_share": details.get("tip_share", 0.0),
                    "payment_page_link": payment_page_link,
                    "qr_code": qr_code,
                    "paid": is_paid
                })

    return {"payment_links": links, "outstanding_amount": outstanding_amount, "my_total": my_total}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
