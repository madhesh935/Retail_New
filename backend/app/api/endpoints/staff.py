from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import StaffModel, StaffTaskModel
from pydantic import BaseModel
from typing import Optional, List
import uuid

router = APIRouter()

class CreateTaskPayload(BaseModel):
    title: str
    type: str
    priority: Optional[str] = "MEDIUM"
    target_location: str
    description: Optional[str] = None
    assigned_staff_id: Optional[str] = None
    customer_request_data: Optional[dict] = None

class UpdateTaskStatusPayload(BaseModel):
    status: str

@router.get("/members")
def get_staff_members(db: Session = Depends(get_db)):
    members = db.query(StaffModel).all()
    return [
        {
            "id": m.id,
            "name": m.name,
            "role": m.role,
            "zone": m.zone,
            "status": m.status,
            "activeTaskId": m.active_task_id,
            "performanceScore": m.performance_score,
            "tasksCompletedToday": m.tasks_completed_today,
            "shift": f"{m.shift_start} - {m.shift_end}"
        }
        for m in members
    ]

@router.get("/tasks")
def get_staff_tasks(db: Session = Depends(get_db)):
    tasks = db.query(StaffTaskModel).order_by(StaffTaskModel.created_at.desc()).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "type": t.type,
            "priority": t.priority,
            "status": t.status,
            "assignedStaffId": t.assigned_staff_id,
            "assignedStaffName": t.assigned_staff_name,
            "targetLocation": t.target_location,
            "description": t.description,
            "customerRequestData": t.customer_request_data,
            "createdAt": t.created_at.isoformat() if t.created_at else None,
            "completedAt": t.completed_at.isoformat() if t.completed_at else None
        }
        for t in tasks
    ]

@router.post("/tasks")
def create_staff_task(payload: CreateTaskPayload, db: Session = Depends(get_db)):
    task_id = f"task-{uuid.uuid4().hex[:8]}"
    assigned_name = None
    if payload.assigned_staff_id:
        staff = db.query(StaffModel).filter(StaffModel.id == payload.assigned_staff_id).first()
        if staff:
            assigned_name = staff.name
            staff.status = "BUSY"
            staff.active_task_id = task_id
    
    new_task = StaffTaskModel(
        id=task_id,
        title=payload.title,
        type=payload.type,
        priority=payload.priority or "MEDIUM",
        status="PENDING" if not payload.assigned_staff_id else "IN_PROGRESS",
        assigned_staff_id=payload.assigned_staff_id,
        assigned_staff_name=assigned_name,
        target_location=payload.target_location,
        description=payload.description,
        customer_request_data=payload.customer_request_data
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {"status": "success", "task_id": new_task.id, "title": new_task.title}

@router.patch("/tasks/{task_id}/status")
def update_task_status(task_id: str, payload: UpdateTaskStatusPayload, db: Session = Depends(get_db)):
    task = db.query(StaffTaskModel).filter(StaffTaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.status = payload.status
    if payload.status == "COMPLETED":
        if task.assigned_staff_id:
            staff = db.query(StaffModel).filter(StaffModel.id == task.assigned_staff_id).first()
            if staff:
                staff.status = "AVAILABLE"
                staff.active_task_id = None
                staff.tasks_completed_today += 1
    
    db.commit()
    db.refresh(task)
    return {"status": "success", "task_id": task.id, "new_status": task.status}
