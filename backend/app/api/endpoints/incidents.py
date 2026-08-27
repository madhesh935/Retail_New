from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import IncidentModel
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

@router.post("/{incident_id}/resolve")
def resolve_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    inc.status = "RESOLVED"
    db.commit()
    return {"status": "success", "incident_id": inc.id, "status": "RESOLVED"}

@router.post("/{incident_id}/execute")
def execute_incident_action(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    inc.recommendation_state = "EXECUTED"
    inc.status = "RESOLVED"
    db.commit()
    return {"status": "success", "incident_id": inc.id, "recommendation_state": "EXECUTED"}
