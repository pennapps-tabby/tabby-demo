import qrcode
import io
import base64
from typing import Dict, List
from .models import ItemAssignment


def calculate_splits(bill_data: Dict, assignments: List[ItemAssignment], people: List[str]) -> Dict[str, Dict]:
    """Calculate how much each person owes based on item assignments"""
    splits = {
        person: {
            "item_total": 0.0,
            "tax_share": 0.0,
            "tip_share": 0.0,
            "paid": False
        } for person in people
    }

    # Calculate proportional splits for each item
    for assignment in assignments:
        item_id = assignment.item_id
        assigned_people = assignment.assigned_to

        if item_id < len(bill_data['items']):
            item = bill_data['items'][item_id]
            item_price = item['price']

            # Split item equally among assigned people
            if assigned_people:
                per_person = item_price / len(assigned_people)
                for person in assigned_people:
                    splits[person]["item_total"] += per_person

    # Add proportional tax and tip
    subtotal_from_items = sum(p["item_total"] for p in splits.values())
    if subtotal_from_items > 0:
        tax_amount = bill_data.get('tax', 0.0)
        tip_amount = bill_data.get('tip', 0.0)
        for person in people:
            item_total = splits[person]["item_total"]
            if item_total > 0:
                proportion = item_total / subtotal_from_items
                splits[person]["tax_share"] = proportion * tax_amount
                splits[person]["tip_share"] = proportion * tip_amount

    for person in people:
        details = splits[person]
        details["total_due"] = details["item_total"] + \
            details["tax_share"] + details["tip_share"]

    return splits


def generate_qr_code(data: str) -> str:
    """Generate QR code as base64 string"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()

    return f"data:image/png;base64,{img_str}"


def generate_payment_page_link(base_url: str, recipient: str, amount: float, note: str) -> str:
    """Generate a universal payment page link for our app."""
    from urllib.parse import urlencode
    params = urlencode(
        {"recipient": recipient, "amount": f"{amount:.2f}", "note": note})
    return f"{base_url}/pay?{params}"
