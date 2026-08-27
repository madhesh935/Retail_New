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
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class ShelfUpdate(BaseModel):
    availability: Optional[float] = None
    visible_units: Optional[int] = None
    status: Optional[str] = None

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
