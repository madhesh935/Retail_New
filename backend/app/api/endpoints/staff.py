from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import StaffModel, StaffTaskModel
from pydantic import BaseModel
from typing import Optional
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
    assigned_staff_id: Optional[str] = None
    blocker_reason: Optional[str] = None
    blocker_note: Optional[str] = None
    blocker_photo: Optional[str] = None


class UpdateTaskDetailsPayload(BaseModel):
    details: dict


@router.get("/members")
def get_staff_members(db: Session = Depends(get_db)):
    members = db.query(StaffModel).all()
    return [
        {
            "id": m.id,
            "employeeId": m.employee_id,
            "name": m.name,
            "role": m.role,
            "department": m.department,
            "skills": m.skills or [],
            "currentZoneId": m.current_zone_id,
            "zone": m.zone,
            "status": m.status,
            "activeTaskId": m.active_task_id,
            "currentTaskDescription": m.current_task_description,
            "performanceScore": m.performance_score,
            "tasksCompletedToday": m.tasks_completed_today,
            "shift": f"{m.shift_start} - {m.shift_end}",
            "shiftStatus": m.shift_status,
            "contactChannel": m.contact_channel,
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
            "details": t.details or {},
            "createdAt": t.created_at.isoformat() if t.created_at else None,
            "completedAt": t.completed_at.isoformat() if t.completed_at else None
        }
        for t in tasks
    ]


@router.get("/tasks/{task_id}")
def get_staff_task(task_id: str, db: Session = Depends(get_db)):
    task = db.query(StaffTaskModel).filter(StaffTaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {
        "id": task.id,
        "title": task.title,
        "type": task.type,
        "priority": task.priority,
        "status": task.status,
        "assignedStaffId": task.assigned_staff_id,
        "assignedStaffName": task.assigned_staff_name,
        "targetLocation": task.target_location,
        "description": task.description,
        "customerRequestData": task.customer_request_data,
        "details": task.details or {},
        "createdAt": task.created_at.isoformat() if task.created_at else None,
        "completedAt": task.completed_at.isoformat() if task.completed_at else None,
    }


@router.patch("/tasks/{task_id}/details")
def update_staff_task_details(
    task_id: str,
    payload: UpdateTaskDetailsPayload,
    db: Session = Depends(get_db),
):
    task = db.query(StaffTaskModel).filter(StaffTaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    details = dict(task.details or {})
    details.update(payload.details)
    task.details = details
    db.commit()
    return {"status": "success", "task_id": task.id, "details": details}

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

    if payload.assigned_staff_id:
        staff = db.query(StaffModel).filter(StaffModel.id == payload.assigned_staff_id).first()
        if staff:
            task.assigned_staff_id = staff.id
            task.assigned_staff_name = staff.name
            staff.status = "BUSY"
            staff.active_task_id = task_id

    task.status = payload.status
    if payload.blocker_reason or payload.blocker_note or payload.blocker_photo:
        details = dict(task.details or {})
        if payload.blocker_reason:
            details["blocker_reason"] = payload.blocker_reason
        if payload.blocker_note:
            details["blocker_note"] = payload.blocker_note
        if payload.blocker_photo:
            details["blocker_photo"] = payload.blocker_photo
        task.details = details
    if payload.status == "COMPLETED":
        from datetime import datetime, timezone
        task.completed_at = datetime.now(timezone.utc)
        if task.assigned_staff_id:
            staff = db.query(StaffModel).filter(StaffModel.id == task.assigned_staff_id).first()
            if staff:
                staff.status = "AVAILABLE"
                staff.active_task_id = None
                staff.tasks_completed_today = (staff.tasks_completed_today or 0) + 1
    elif payload.status in ("CANCELLED", "BLOCKED"):
        if task.assigned_staff_id:
            staff = db.query(StaffModel).filter(StaffModel.id == task.assigned_staff_id).first()
            if staff and staff.active_task_id == task_id:
                staff.status = "AVAILABLE"
                staff.active_task_id = None
    elif payload.status in ("IN_PROGRESS", "ASSISTING") and task.assigned_staff_id:
        staff = db.query(StaffModel).filter(StaffModel.id == task.assigned_staff_id).first()
        if staff:
            staff.status = "BUSY"
            staff.active_task_id = task_id
        task.completed_at = None

    db.commit()
    db.refresh(task)
    return {
        "status": "success",
        "task_id": task.id,
        "new_status": task.status,
        "assigned_staff_id": task.assigned_staff_id,
        "assigned_staff_name": task.assigned_staff_name,
    }
