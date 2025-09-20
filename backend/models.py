from pydantic import BaseModel
from typing import List, Dict, Optional

class BillItem(BaseModel):
    name: str
    price: float

class BillResponse(BaseModel):
    bill_id: str
    items: List[BillItem]
    subtotal: float
    tax: float
    total: float
    restaurant_name: str

class ItemAssignment(BaseModel):
    item_id: int
    assigned_to: List[str]  # List of people assigned to this item

class AssignmentRequest(BaseModel):
    assignments: List[ItemAssignment]
    people: List[str]  # List of all people involved

class PaymentLink(BaseModel):
    person: str
    amount: float
    venmo_link: str
    qr_code: str

class PaymentLinksResponse(BaseModel):
    payment_links: List[PaymentLink]
