import json
from PIL import Image
import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def configure_gemini():
    """Configures the Gemini API key."""
    if not GEMINI_API_KEY:
        raise Exception("Gemini API key not provided. Please set GEMINI_API_KEY environment variable.")
    genai.configure(api_key=GEMINI_API_KEY)

async def parse_receipt(image_path: str) -> dict:
    """Parse receipt using Google Gemini Vision API"""
    
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
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
        response = await model.generate_content_async([prompt, image])
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
