import requests
import json
import base64
from PIL import Image
import os
import re
import google.generativeai as genai

CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

async def parse_receipt(image_path: str) -> dict:
    """Parse receipt using Cerebras Vision API with OpenAI fallback"""
    
    # Convert image to base64
    with open(image_path, "rb") as img_file:
        img_base64 = base64.b64encode(img_file.read()).decode()
    
    # Try Cerebras first (for the track award!)
    try:
        return await parse_with_cerebras(img_base64)
    except Exception as e:
        print(f"Cerebras failed: {e}, falling back to Gemini")
        return await parse_with_gemini(image_path)

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
        json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))
        raise Exception("Could not parse JSON from response")

async def parse_with_gemini(image_path: str) -> dict:
    """Fallback to Google Gemini Vision API"""
    if not GEMINI_API_KEY:
        raise Exception("Gemini API key not provided. Please set GEMINI_API_KEY environment variable.")
    
    # Configure Gemini
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
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
    
    try:
        # Load and process image
        image = Image.open(image_path)
        
        # Generate content using Gemini
        response = model.generate_content([prompt, image])
        content = response.text
        
        # Parse JSON from response
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            # Extract JSON from markdown if needed
            json_match = re.search(r'```json\n(.*?)\n```', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(1))
            raise Exception("Could not parse JSON from response")
            
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")
