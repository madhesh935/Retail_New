from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.database import get_db
from app.db.models import IncidentModel
from app.services.broadcast import broadcast_change
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

@router.get("/")
def get_all_incidents(db: Session = Depends(get_db)):
    incidents = db.query(IncidentModel).order_by(IncidentModel.created_at.desc()).all()
    return [
        {
            "id": inc.id,
            "title": inc.title,
            "description": inc.description,
            "severity": inc.severity,
            "type": inc.type,
            "zone": inc.zone,
            "zoneId": inc.zone_id,
            "status": inc.status,
            "cameraCode": inc.camera_code,
            "assignedStaffId": inc.assigned_staff_id,
            "assignedStaffName": inc.assigned_staff_name,
            "details": inc.details or {},
            "aiRecommendation": {
                "title": inc.recommendation_title,
                "action": inc.recommendation_action,
                "state": inc.recommendation_state
            } if inc.recommendation_title else None,
            "createdAt": inc.created_at.isoformat() if inc.created_at else None,
            "resolvedAt": inc.resolved_at.isoformat() if inc.resolved_at else None,
        }
        for inc in incidents
    ]

class AssignIncidentRequest(BaseModel):
    staff_id: str
    staff_name: str

@router.post("/{incident_id}/assign")
def assign_incident(incident_id: str, payload: AssignIncidentRequest, db: Session = Depends(get_db)):
    inc = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    inc.assigned_staff_id = payload.staff_id
    inc.assigned_staff_name = payload.staff_name
    if inc.status not in ("RESOLVED", "IN_PROGRESS"):
        inc.status = "ASSIGNED"
    db.commit()
    broadcast_change("incidents", incident_id=inc.id)
    return {
        "status": "success",
        "incident_id": inc.id,
        "assignedStaffId": inc.assigned_staff_id,
        "assignedStaffName": inc.assigned_staff_name,
    }

@router.post("/{incident_id}/resolve")
def resolve_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    inc.status = "RESOLVED"
    inc.resolved_at = datetime.utcnow()
    db.commit()
    broadcast_change("incidents", incident_id=inc.id)
    return {"status": "success", "incident_id": inc.id, "status": "RESOLVED"}

@router.post("/{incident_id}/execute")
def execute_incident_action(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    inc.recommendation_state = "EXECUTED"
    inc.status = "RESOLVED"
    inc.resolved_at = datetime.utcnow()
    db.commit()
    broadcast_change("incidents", incident_id=inc.id)
    return {"status": "success", "incident_id": inc.id, "recommendation_state": "EXECUTED"}
