from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import StoreModel, ZoneModel
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class OccupancyUpdate(BaseModel):
    current_occupancy: int
    entry_delta: Optional[int] = 0
    exit_delta: Optional[int] = 0

@router.get("/status")
def get_store_status(db: Session = Depends(get_db)):
    store = db.query(StoreModel).first()
    if not store:
        store = StoreModel()
        db.add(store)
        db.commit()
        db.refresh(store)
    
    zones = db.query(ZoneModel).all()
    return {
        "store_id": store.id,
        "name": store.name,
        "address": store.address,
        "current_occupancy": store.current_occupancy,
        "max_capacity": store.max_capacity,
        "todays_total_footfall": store.todays_total_footfall,
        "peak_occupancy_today": store.peak_occupancy_today,
        "occupancy_rate": store.occupancy_rate,
        "average_dwell_time_minutes": store.average_dwell_time_minutes,
        "zones": [
            {
                "id": z.id,
                "name": z.name,
                "code": z.code,
                "current_occupancy": z.current_occupancy,
                "max_capacity": z.max_capacity,
                "congestion_level": z.congestion_level
            }
            for z in zones
        ]
    }

@router.post("/occupancy")
def update_store_occupancy(payload: OccupancyUpdate, db: Session = Depends(get_db)):
    store = db.query(StoreModel).first()
    if not store:
        store = StoreModel()
        db.add(store)
    
    store.current_occupancy = payload.current_occupancy
    store.occupancy_rate = round((payload.current_occupancy / store.max_capacity) * 100, 1)
    if payload.entry_delta and payload.entry_delta > 0:
        store.todays_total_footfall += payload.entry_delta
    if payload.current_occupancy > store.peak_occupancy_today:
        store.peak_occupancy_today = payload.current_occupancy
    
    db.commit()
    db.refresh(store)
    return {"status": "success", "current_occupancy": store.current_occupancy, "occupancy_rate": store.occupancy_rate}
