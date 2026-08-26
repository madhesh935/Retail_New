from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import ProductModel, StaffTaskModel, StaffModel
from pydantic import BaseModel
from typing import Optional, List
import uuid

router = APIRouter()

class CustomerAssistRequest(BaseModel):
    request_type: str
    urgency: Optional[str] = "NORMAL"
    customer_name: Optional[str] = "Shopper"
    location_zone: str
    shelf_code: Optional[str] = None
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    customer_notes: Optional[str] = None

@router.get("/catalog")
def get_customer_catalog(db: Session = Depends(get_db)):
    products = db.query(ProductModel).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "brand": p.brand,
            "category": p.category,
            "price": p.price,
            "priceNum": p.price_num,
            "aisle": p.aisle,
            "shelf": p.shelf,
            "stockCount": p.stock_count,
            "isAvailable": p.is_available,
            "isLowStock": p.is_low_stock,
            "backroomStock": p.backroom_stock,
            "mapCoord": {"x": p.map_x, "y": p.map_y},
            "alternatives": p.alternatives or []
        }
        for p in products
    ]

@router.post("/assist")
def submit_customer_assist(payload: CustomerAssistRequest, db: Session = Depends(get_db)):
    task_id = f"assist-{uuid.uuid4().hex[:6]}"
    
    # Select available staff in area if possible
    available_staff = db.query(StaffModel).filter(StaffModel.status == "AVAILABLE").first()
    assigned_id = available_staff.id if available_staff else None
    assigned_name = available_staff.name if available_staff else None
    
    if available_staff:
        available_staff.status = "BUSY"
        available_staff.active_task_id = task_id

    priority = "HIGH" if payload.urgency == "URGENT" else "MEDIUM"
    title = f"Customer Assist: {payload.request_type.replace('_', ' ').title()}"
    if payload.product_name:
        title += f" ({payload.product_name})"

    task = StaffTaskModel(
        id=task_id,
        title=title,
        type="CUSTOMER_ASSIST",
        priority=priority,
        status="IN_PROGRESS" if assigned_id else "PENDING",
        assigned_staff_id=assigned_id,
        assigned_staff_name=assigned_name,
        target_location=f"{payload.location_zone} · {payload.shelf_code or 'General'}",
        description=payload.customer_notes or f"Customer requested help with {payload.request_type}",
        customer_request_data=payload.dict()
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return {
        "status": "success",
        "request_id": task.id,
        "assigned_staff_name": assigned_name or "Store Floor Associate",
        "estimated_arrival_minutes": 2 if assigned_id else 4
    }
