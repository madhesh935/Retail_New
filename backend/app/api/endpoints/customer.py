from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import ProductModel, StaffTaskModel
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
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


class CustomerAssistMessagePayload(BaseModel):
    sender: str
    text: str


class CustomerAssistDetailsPayload(BaseModel):
    backroom_item_found: Optional[bool] = None


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
            "alternatives": p.alternatives or [],
        }
        for p in products
    ]


@router.post("/assist")
def submit_customer_assist(payload: CustomerAssistRequest, db: Session = Depends(get_db)):
    task_id = f"assist-{uuid.uuid4().hex[:6]}"
    priority = "HIGH" if payload.urgency == "URGENT" else "MEDIUM"
    title = f"Customer Assist: {payload.request_type.replace('_', ' ').title()}"
    if payload.product_name:
        title += f" ({payload.product_name})"

    request_data = payload.model_dump()
    request_data["messages"] = []
    task = StaffTaskModel(
        id=task_id,
        title=title,
        type="CUSTOMER_ASSIST",
        priority=priority,
        status="PENDING",
        assigned_staff_id=None,
        assigned_staff_name=None,
        target_location=f"{payload.location_zone} · {payload.shelf_code or 'General'}",
        description=payload.customer_notes or f"Customer requested help with {payload.request_type}",
        customer_request_data=request_data,
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return {
        "status": "success",
        "request_id": task.id,
        "assigned_staff_name": None,
        "estimated_arrival_minutes": 3,
    }


@router.get("/assist/{request_id}")
def get_customer_assist_status(request_id: str, db: Session = Depends(get_db)):
    task = db.query(StaffTaskModel).filter(StaffTaskModel.id == request_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Assist request not found")
    return {
        "request_id": task.id,
        "status": task.status,
        "assigned_staff_id": task.assigned_staff_id,
        "assigned_staff_name": task.assigned_staff_name,
        "target_location": task.target_location,
        "title": task.title,
        "customer_request_data": task.customer_request_data or {},
        "created_at": task.created_at.isoformat() if task.created_at else None,
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
    }


@router.post("/assist/{request_id}/messages")
def add_customer_assist_message(
    request_id: str,
    payload: CustomerAssistMessagePayload,
    db: Session = Depends(get_db),
):
    task = db.query(StaffTaskModel).filter(StaffTaskModel.id == request_id).first()
    if not task or task.type not in ("CUSTOMER_ASSIST", "CUSTOMER_ASSISTANCE"):
        raise HTTPException(status_code=404, detail="Assist request not found")

    sender = payload.sender.strip().upper()
    if sender not in ("CUSTOMER", "ASSOCIATE"):
        raise HTTPException(status_code=422, detail="sender must be CUSTOMER or ASSOCIATE")
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="Message cannot be empty")

    data = dict(task.customer_request_data or {})
    messages = list(data.get("messages") or [])
    message = {
        "id": f"msg-{uuid.uuid4().hex[:10]}",
        "sender": sender,
        "text": text,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    messages.append(message)
    data["messages"] = messages[-100:]
    task.customer_request_data = data
    db.commit()
    return message


@router.patch("/assist/{request_id}/details")
def update_customer_assist_details(
    request_id: str,
    payload: CustomerAssistDetailsPayload,
    db: Session = Depends(get_db),
):
    task = db.query(StaffTaskModel).filter(StaffTaskModel.id == request_id).first()
    if not task or task.type not in ("CUSTOMER_ASSIST", "CUSTOMER_ASSISTANCE"):
        raise HTTPException(status_code=404, detail="Assist request not found")

    data = dict(task.customer_request_data or {})
    updates = payload.model_dump(exclude_none=True)
    data.update(updates)
    task.customer_request_data = data
    db.commit()
    return {"status": "success", "request_id": request_id, "details": updates}
