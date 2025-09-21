from pydantic import BaseModel
from typing import List, Dict, Optional


class SplitDetail(BaseModel):
    item_total: float
    tax_share: float
    tip_share: float
    total_due: float
    paid: bool = False


class BillItem(BaseModel):
    name: str
    price: float


class BillResponse(BaseModel):
    bill_id: str
    items: List[BillItem]
    subtotal: float
    tax: float
    tip: Optional[float] = 0.0
    total: float
    restaurant_name: str


class ItemAssignment(BaseModel):
    item_id: int
    assigned_to: List[str]  # List of people assigned to this item


class AssignmentRequest(BaseModel):
    assignments: List[ItemAssignment]
    people: List[str]  # List of all people involved
    tip: Optional[float] = None


class AssignResponse(BaseModel):
    splits: Dict[str, SplitDetail]


class TogglePaidRequest(BaseModel):
    person: str


class PaymentLink(BaseModel):
    person: str
    amount: float
    venmo_link: str
    qr_code: str
    paid: bool


class PaymentLinksResponse(BaseModel):
    payment_links: List[PaymentLink]
    outstanding_amount: float
    my_total: float
