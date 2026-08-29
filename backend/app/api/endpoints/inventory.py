from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import (
    InventoryBatchModel,
    MarkdownCandidateModel,
    ProductModel,
    RetailMetricModel,
    ShelfModel,
    WasteRecordModel,
)
from app.services.broadcast import broadcast_change
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

router = APIRouter()

class ShelfUpdate(BaseModel):
    availability: Optional[float] = None
    visible_units: Optional[int] = None
    status: Optional[str] = None


class BatchExpiryUpdate(BaseModel):
    expires_at: datetime
    reason: str
    staff_id: str


class WasteCreate(BaseModel):
    store_id: str
    product_id: str
    product_sku: str
    product_name: str
    batch_id: Optional[str] = None
    batch_number: Optional[str] = None
    quantity: int
    reason: str
    recorded_by_staff_id: str
    recorded_by_staff_name: str
    location_id: str
    location_name: str
    unit_cost: Optional[float] = None
    notes: Optional[str] = None
    evidence_photo: Optional[str] = None

@router.get("/shelves")
def get_all_shelves(db: Session = Depends(get_db)):
    shelves = db.query(ShelfModel).all()
    return [
        {
            "id": s.id,
            "code": s.code,
            "name": s.name,
            "zoneId": s.zone_id,
            "zoneName": s.zone_name,
            "aisle": s.aisle,
            "sku": s.sku,
            "skuName": s.sku_name,
            "brand": s.brand,
            "category": s.category,
            "unitPrice": s.unit_price,
            "currentSkusCount": s.current_skus_count,
            "capacityCount": s.capacity_count,
            "complianceScore": s.compliance_score,
            "status": s.status,
            "availability": s.availability,
            "visibleUnits": s.visible_units,
            "backroomUnits": s.backroom_units,
            "depletionRatePerHour": s.depletion_rate_per_hour,
            "minutesUntilStockout": s.minutes_until_stockout,
            "cameraCode": s.camera_code,
            "confidenceScore": s.confidence_score,
            "isMisplaced": s.is_misplaced,
        }
        for s in shelves
    ]

@router.get("/shelves/{shelf_code}")
def get_shelf_by_code(shelf_code: str, db: Session = Depends(get_db)):
    shelf = db.query(ShelfModel).filter(ShelfModel.code == shelf_code).first()
    if not shelf:
        raise HTTPException(status_code=404, detail="Shelf not found")
    return {
        "id": shelf.id,
        "code": shelf.code,
        "name": shelf.name,
        "zoneId": shelf.zone_id,
        "zoneName": shelf.zone_name,
        "aisle": shelf.aisle,
        "skuName": shelf.sku_name,
        "currentSkusCount": shelf.current_skus_count,
        "capacityCount": shelf.capacity_count,
        "complianceScore": shelf.compliance_score,
        "status": shelf.status,
        "availability": shelf.availability,
        "visibleUnits": shelf.visible_units
    }

@router.patch("/shelves/{shelf_code}")
def update_shelf(shelf_code: str, payload: ShelfUpdate, db: Session = Depends(get_db)):
    shelf = db.query(ShelfModel).filter(ShelfModel.code == shelf_code).first()
    if not shelf:
        raise HTTPException(status_code=404, detail="Shelf not found")
    
    if payload.availability is not None:
        shelf.availability = payload.availability
    if payload.visible_units is not None:
        shelf.visible_units = payload.visible_units
    if payload.status is not None:
        shelf.status = payload.status
    
    db.commit()
    db.refresh(shelf)
    broadcast_change("shelves", shelf_code=shelf.code)
    return {"status": "success", "shelf": shelf.code, "availability": shelf.availability}


@router.get("/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(ProductModel).order_by(ProductModel.category, ProductModel.name).all()
    return [
        {
            "id": product.id,
            "sku": product.sku,
            "name": product.name,
            "description": product.description,
            "brand": product.brand,
            "category": product.category,
            "price": product.price_num,
            "aisle": product.aisle,
            "shelf": product.shelf,
            "stockCount": product.stock_count,
            "backroomStock": product.backroom_stock,
            "isAvailable": product.is_available,
            "isLowStock": product.is_low_stock,
            "alternatives": product.alternatives or [],
        }
        for product in products
    ]


@router.get("/batches")
def get_inventory_batches(db: Session = Depends(get_db)):
    batches = db.query(InventoryBatchModel).order_by(InventoryBatchModel.expires_at).all()
    return [
        {
            "id": batch.id,
            "storeId": batch.store_id,
            "productId": batch.product_id,
            "productSku": batch.product_sku,
            "productName": batch.product_name,
            "category": batch.category,
            "batchNumber": batch.batch_number,
            "quantity": batch.quantity,
            "shelfQuantity": batch.shelf_quantity,
            "backroomQuantity": batch.backroom_quantity,
            "receivedAt": batch.received_at.isoformat() if batch.received_at else None,
            "expiresAt": batch.expires_at.isoformat() if batch.expires_at else None,
            "storageLocationId": batch.storage_location_id,
            "shelfId": batch.shelf_id,
            "shelfCode": batch.shelf_code,
            "unitCost": batch.unit_cost,
            "unitPrice": batch.unit_price,
            "status": batch.status,
            "source": batch.source,
        }
        for batch in batches
    ]


@router.get("/markdown-candidates")
def get_markdown_candidates(db: Session = Depends(get_db)):
    candidates = db.query(MarkdownCandidateModel).order_by(MarkdownCandidateModel.expires_at).all()
    return [
        {
            "id": candidate.id,
            "batchId": candidate.batch_id,
            "productId": candidate.product_id,
            "productSku": candidate.product_sku,
            "productName": candidate.product_name,
            "category": candidate.category,
            "shelfCode": candidate.shelf_code,
            "currentPrice": candidate.current_price,
            "suggestedDiscountPercent": candidate.suggested_discount_percent,
            "suggestedNewPrice": candidate.suggested_new_price,
            "remainingQuantity": candidate.remaining_quantity,
            "atRiskQuantity": candidate.at_risk_quantity,
            "expiresAt": candidate.expires_at.isoformat() if candidate.expires_at else None,
            "reason": candidate.reason,
            "status": candidate.status,
        }
        for candidate in candidates
    ]


@router.patch("/batches/{batch_id}/expiry")
def update_batch_expiry(
    batch_id: str,
    payload: BatchExpiryUpdate,
    db: Session = Depends(get_db),
):
    batch = db.query(InventoryBatchModel).filter(InventoryBatchModel.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Inventory batch not found")
    batch.expires_at = payload.expires_at
    batch.source = "MANUAL_ENTRY"
    db.commit()
    db.refresh(batch)
    broadcast_change("inventory_batches", batch_id=batch.id)
    return {
        "status": "success",
        "batch_id": batch.id,
        "expires_at": batch.expires_at.isoformat() if batch.expires_at else None,
        "reason": payload.reason,
        "staff_id": payload.staff_id,
    }


@router.post("/waste")
def create_waste_record(payload: WasteCreate, db: Session = Depends(get_db)):
    if payload.quantity <= 0:
        raise HTTPException(status_code=422, detail="Waste quantity must be greater than zero")

    batch = None
    if payload.batch_id:
        batch = db.query(InventoryBatchModel).filter(InventoryBatchModel.id == payload.batch_id).first()
    if batch is None:
        batch = (
            db.query(InventoryBatchModel)
            .filter(InventoryBatchModel.product_sku == payload.product_sku)
            .order_by(InventoryBatchModel.expires_at)
            .first()
        )
    if not batch:
        raise HTTPException(status_code=404, detail="Inventory batch not found")
    if payload.quantity > batch.quantity:
        raise HTTPException(status_code=409, detail="Waste quantity exceeds batch quantity")

    batch.quantity = max(0, batch.quantity - payload.quantity)
    shelf_deduction = min(batch.shelf_quantity, payload.quantity)
    batch.shelf_quantity = max(0, batch.shelf_quantity - shelf_deduction)
    if batch.quantity == 0:
        batch.status = "WASTE_RECORDED"

    shelf = db.query(ShelfModel).filter(ShelfModel.code == (batch.shelf_code or payload.location_id)).first()
    if shelf:
        shelf.current_skus_count = max(0, (shelf.current_skus_count or 0) - shelf_deduction)
        shelf.visible_units = max(0, (shelf.visible_units or 0) - shelf_deduction)
        capacity = max(1, shelf.capacity_count or 1)
        shelf.availability = round((shelf.visible_units / capacity) * 100, 1)
        shelf.status = (
            "OUT_OF_STOCK"
            if shelf.visible_units == 0
            else "LOW"
            if shelf.availability < 35
            else "OPTIMAL"
        )

    product = (
        db.query(ProductModel)
        .filter((ProductModel.id == payload.product_id) | (ProductModel.sku == payload.product_sku))
        .first()
    )
    if product:
        product.stock_count = max(0, (product.stock_count or 0) - shelf_deduction)
        product.is_available = product.stock_count > 0
        product.is_low_stock = 0 < product.stock_count <= 5

    unit_cost = payload.unit_cost or batch.unit_cost or 0
    record = WasteRecordModel(
        id=f"waste-{uuid.uuid4().hex[:10]}",
        store_id=payload.store_id,
        product_id=batch.product_id or payload.product_id,
        product_sku=payload.product_sku,
        product_name=payload.product_name,
        batch_id=batch.id,
        batch_number=batch.batch_number or payload.batch_number,
        quantity=payload.quantity,
        reason=payload.reason,
        recorded_by_staff_id=payload.recorded_by_staff_id,
        recorded_by_staff_name=payload.recorded_by_staff_name,
        location_id=payload.location_id,
        location_name=payload.location_name,
        unit_cost=unit_cost,
        total_loss_cost=unit_cost * payload.quantity,
        notes=payload.notes,
        evidence_photo=payload.evidence_photo,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    broadcast_change("waste_records", waste_id=record.id)
    broadcast_change("shelves", shelf_code=batch.shelf_code)
    broadcast_change("inventory_batches", batch_id=batch.id)
    return {
        "status": "success",
        "waste_id": record.id,
        "batch_id": batch.id,
        "remaining_quantity": batch.quantity,
        "remaining_shelf_quantity": batch.shelf_quantity,
    }


@router.get("/waste")
def get_waste_records(db: Session = Depends(get_db)):
    records = db.query(WasteRecordModel).order_by(WasteRecordModel.recorded_at.desc()).all()
    return [
        {
            "id": record.id,
            "productId": record.product_id,
            "productSku": record.product_sku,
            "productName": record.product_name,
            "batchId": record.batch_id,
            "batchNumber": record.batch_number,
            "quantity": record.quantity,
            "reason": record.reason,
            "recordedByStaffId": record.recorded_by_staff_id,
            "recordedByStaffName": record.recorded_by_staff_name,
            "locationName": record.location_name,
            "recordedAt": record.recorded_at.isoformat() if record.recorded_at else None,
            "unitCost": record.unit_cost,
            "totalLossCost": record.total_loss_cost,
            "notes": record.notes,
        }
        for record in records
    ]


@router.get("/metrics")
def get_inventory_metrics(metric_type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(RetailMetricModel)
    if metric_type:
        query = query.filter(RetailMetricModel.metric_type == metric_type)
    return [
        {
            "id": metric.id,
            "type": metric.metric_type,
            "label": metric.label,
            "value": metric.value,
            "unit": metric.unit,
            "dimensions": metric.dimensions or {},
            "recordedAt": metric.recorded_at.isoformat() if metric.recorded_at else None,
        }
        for metric in query.order_by(RetailMetricModel.recorded_at).all()
    ]
