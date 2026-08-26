from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import ShelfModel, ProductModel
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
            "skuName": s.sku_name,
            "currentSkusCount": s.current_skus_count,
            "capacityCount": s.capacity_count,
            "complianceScore": s.compliance_score,
            "status": s.status,
            "availability": s.availability,
            "visibleUnits": s.visible_units
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
