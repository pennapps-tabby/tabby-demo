# Bill Splitter App - PennApps 2025
Provisional name: tabby

## Project Setup

# Create project structure
```
mkdir bill-splitter-app
cd bill-splitter-app
```

# Backend setup
```
mkdir backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn python-multipart pillow sqlite3 requests python-jose cryptography
touch main.py models.py database.py vision_service.py utils.py
```

# Frontend setup
```
cd ..
npm create vite@latest frontend -- --template react
cd frontend
npm install axios react-router-dom @headlessui/react @heroicons/react tailwindcss
```

# Project structure:
```
bill-splitter-app/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── models.py            # Data models
│   ├── database.py          # SQLite setup
│   ├── vision_service.py    # Cerebras/OpenAI vision
│   ├── utils.py             # Helper functions
│   ├── uploads/             # Temp image storage
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BillUpload.jsx
│   │   │   ├── BillPreview.jsx
│   │   │   ├── ItemAssignment.jsx
│   │   │   ├── PaymentSummary.jsx
│   │   │   └── QRGenerator.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Upload.jsx
│   │   │   ├── Review.jsx
│   │   │   ├── Assign.jsx
│   │   │   └── Pay.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Key Files to Start With

### backend/main.py
```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from vision_service import parse_receipt
from models import BillResponse, AssignmentRequest
from database import init_db, save_bill, get_bill
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
            "total": parsed_data["total"]
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
    splits = calculate_splits(bill, assignment.assignments)
    
    return {"splits": splits}

@app.get("/api/bills/{bill_id}/payment-links")
async def generate_payment_links(bill_id: str):
    bill = get_bill(bill_id)
    splits = bill["splits"]  # Assuming splits are saved
    
    links = []
    for person, amount in splits.items():
        venmo_link = f"venmo://paycharge?txn=pay&recipients={bill['organizer_venmo']}&amount={amount:.2f}&note=Bill from {bill['restaurant_name']}"
        links.append({
            "person": person,
            "amount": amount,
            "venmo_link": venmo_link,
            "qr_code": generate_qr_code(venmo_link)
        })
    
    return {"payment_links": links}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

### backend/vision_service.py
```python
import requests
import json
import base64
from PIL import Image
import os

CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

async def parse_receipt(image_path: str) -> dict:
    """Parse receipt using Cerebras Vision API with OpenAI fallback"""
    
    # Convert image to base64
    with open(image_path, "rb") as img_file:
        img_base64 = base64.b64encode(img_file.read()).decode()
    
    # Try Cerebras first (for the track award!)
    try:
        return await parse_with_cerebras(img_base64)
    except Exception as e:
        print(f"Cerebras failed: {e}, falling back to OpenAI")
        return await parse_with_openai(img_base64)

async def parse_with_cerebras(img_base64: str) -> dict:
    """Use Cerebras Inference API for receipt parsing"""
    
    prompt = """
    Parse this receipt image and extract:
    1. All individual items with prices
    2. Subtotal
    3. Tax amount
    4. Total amount
    5. Restaurant name
    
    Return as JSON:
    {
        "items": [{"name": "Item Name", "price": 12.99}],
        "subtotal": 45.67,
        "tax": 3.89,
        "total": 49.56,
        "restaurant_name": "Restaurant Name"
    }
    """
    
    headers = {
        "Authorization": f"Bearer {CEREBRAS_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama3.1-8b",  # Adjust based on Cerebras available models
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"}
                    }
                ]
            }
        ],
        "max_tokens": 1000
    }
    
    response = requests.post(
        "https://api.cerebras.ai/v1/chat/completions",  # Check actual endpoint
        headers=headers,
        json=payload
    )
    
    if response.status_code != 200:
        raise Exception(f"Cerebras API error: {response.text}")
    
    result = response.json()
    content = result["choices"][0]["message"]["content"]
    
    # Parse JSON from response
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # Extract JSON from markdown if needed
        import re
        json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))
        raise Exception("Could not parse JSON from response")

async def parse_with_openai(img_base64: str) -> dict:
    """Fallback to OpenAI Vision API"""
    # Similar implementation with OpenAI API
    # ... (implement as backup)
    pass
```

### frontend/src/App.jsx
```jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Review from './pages/Review'
import Assign from './pages/Assign'
import Pay from './pages/Pay'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">💸 SplitSmart</h1>
          </div>
        </nav>
        
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/review/:billId" element={<Review />} />
            <Route path="/assign/:billId" element={<Assign />} />
            <Route path="/pay/:billId" element={<Pay />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
```

### frontend/src/components/BillUpload.jsx
```jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function BillUpload() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/upload-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      navigate(`/review/${response.data.bill_id}`)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload receipt. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Receipt</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="text-gray-500">
              📸 Click to upload receipt photo
            </div>
          </label>
          
          {file && (
            <div className="mt-2 text-sm text-gray-600">
              Selected: {file.name}
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Processing...' : 'Upload & Parse Receipt'}
        </button>
      </div>
    </div>
  )
}

export default BillUpload
```

## Quick Start Commands

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Environment variables
echo "CEREBRAS_API_KEY=your_key_here" > backend/.env
echo "OPENAI_API_KEY=backup_key" >> backend/.env
```

## Next Steps for Hackathon

1. **Set up Cerebras API** - Get API key and test vision endpoint
2. **Build basic UI flow** - Upload → Review → Assign → Pay
3. **Implement Venmo deeplinks** - Test on mobile devices
4. **Add QR code generation** - Use libraries like `qrcode`
5. **Polish the assignment UI** - Drag & drop, item grouping
6. **Demo preparation** - Load with test receipts, smooth flow

This gives you a solid foundation that's hackathon-ready! The structure is modular so you can divide work among team members effectively.