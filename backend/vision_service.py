import json
from PIL import Image
import os
import re
import google.generativeai as genai
from dotenv import load_dotenv
import logging

load_dotenv()
logging.basicConfig(level=logging.DEBUG)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def configure_gemini():
    """Configures the Gemini API key."""
    if not GEMINI_API_KEY:
        raise Exception(
            "Gemini API key not provided. Please set GEMINI_API_KEY environment variable.")
    genai.configure(api_key=GEMINI_API_KEY)


async def parse_receipt(image_path: str) -> dict:
    """Parse receipt using Google Gemini Vision API"""

    model = genai.GenerativeModel('gemini-2.5-flash-lite')
    prompt = f"""
    Parse the receipt image and extract the following information.
    Be precise and follow the JSON format exactly.

    1.  **Restaurant Name**: The name of the establishment.
    2.  **Items**: A list of all individual items. If an item appears with a quantity greater than one (e.g., "2 x Item Name"), expand it into separate items in the list (e.g., two "Item Name" entries).
    3.  **Subtotal**: The total cost of items before tax and tip. If there are separate subtotals (e.g., for food and drinks), sum them into a single value.
    4.  **Tax**: The tax amount.
    5.  **Tip**: The tip amount. Look for both printed and handwritten tips. If no tip is found, this value must be 0.0.
    6.  **Total**: The final amount paid.
    
    Return ONLY a valid JSON object in the following format, with no extra text or markdown formatting:
    {{
        "restaurant_name": "The Example Cafe",
        "items": [{{"name": "Espresso", "price": 3.50}}, {{"name": "Latte", "price": 4.50}}],
        "subtotal": 8.00,
        "tax": 0.71,
        "tip": 1.50,
        "total": 10.21
    }}
    """

    try:
        # Load and process image
        image = Image.open(image_path)

        # Generate content using Gemini
        print("HELLO 2.5")
        response = await model.generate_content_async([prompt, image])
        print(response.text)
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
