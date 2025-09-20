import qrcode
import io
import base64
from typing import Dict, List
from models import ItemAssignment

def calculate_splits(bill_data: Dict, assignments: List[ItemAssignment], people: List[str]) -> Dict[str, float]:
    """Calculate how much each person owes based on item assignments"""
    splits = {person: 0.0 for person in people}
    
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
                    splits[person] += per_person
    
    # Add proportional tax and tip
    total_items = sum(splits.values())
    if total_items > 0:
        tax_amount = bill_data.get('tax', 0)
        for person in people:
            if splits[person] > 0:
                tax_ratio = splits[person] / total_items
                splits[person] += tax_ratio * tax_amount
    
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

def generate_venmo_link(recipient: str, amount: float, note: str) -> str:
    """Generate Venmo deep link"""
    return f"venmo://paycharge?txn=pay&recipients={recipient}&amount={amount:.2f}&note={note}"
