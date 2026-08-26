from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from app.db.database import Base

class StoreModel(Base):
    __tablename__ = "store_info"

    id = Column(String, primary_key=True, default="store-blr-01")
    name = Column(String, default="FreshMart Flagship — Koramangala, BLR")
    address = Column(String, default="100 Feet Rd, Koramangala 4th Block, Bengaluru, KA 560034")
    current_occupancy = Column(Integer, default=142)
    max_capacity = Column(Integer, default=350)
    todays_total_footfall = Column(Integer, default=1840)
    peak_occupancy_today = Column(Integer, default=288)
    occupancy_rate = Column(Float, default=40.6)
    average_dwell_time_minutes = Column(Integer, default=24)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class ZoneModel(Base):
    __tablename__ = "store_zones"

    id = Column(String, primary_key=True)
    name = Column(String)
    code = Column(String)
    current_occupancy = Column(Integer, default=0)
    max_capacity = Column(Integer, default=60)
    congestion_level = Column(String, default="LOW")

class ShelfModel(Base):
    __tablename__ = "shelves"

    id = Column(String, primary_key=True)
    code = Column(String, unique=True, index=True)
    name = Column(String)
    zone_id = Column(String)
    zone_name = Column(String)
    aisle = Column(String)
    sku_name = Column(String, nullable=True)
    current_skus_count = Column(Integer, default=0)
    capacity_count = Column(Integer, default=20)
    compliance_score = Column(Float, default=90.0)
    status = Column(String, default="OPTIMAL")
    availability = Column(Float, default=100.0)
    visible_units = Column(Integer, default=15)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class ProductModel(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True)
    name = Column(String, index=True)
    brand = Column(String)
    category = Column(String, index=True)
    price = Column(String)
    price_num = Column(Float)
    aisle = Column(String)
    shelf = Column(String)
    stock_count = Column(Integer, default=10)
    is_available = Column(Boolean, default=True)
    is_low_stock = Column(Boolean, default=False)
    backroom_stock = Column(Integer, default=20)
    map_x = Column(Float, default=100.0)
    map_y = Column(Float, default=100.0)
    alternatives = Column(JSON, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class QueueModel(Base):
    __tablename__ = "queues"

    lane_code = Column(String, primary_key=True)
    lane_number = Column(Integer)
    name = Column(String)
    type = Column(String, default="ASSISTED")
    status = Column(String, default="ACTIVE")
    queue_length = Column(Integer, default=0)
    wait_time_seconds = Column(Integer, default=0)
    cashier_name = Column(String, nullable=True)
    is_express = Column(Boolean, default=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class StaffModel(Base):
    __tablename__ = "staff"

    id = Column(String, primary_key=True)
    name = Column(String)
    role = Column(String)
    zone = Column(String)
    status = Column(String, default="AVAILABLE")
    active_task_id = Column(String, nullable=True)
    performance_score = Column(Float, default=95.0)
    tasks_completed_today = Column(Integer, default=0)
    shift_start = Column(String, default="08:00")
    shift_end = Column(String, default="16:00")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class StaffTaskModel(Base):
    __tablename__ = "staff_tasks"

    id = Column(String, primary_key=True)
    title = Column(String)
    type = Column(String)
    priority = Column(String, default="MEDIUM")
    status = Column(String, default="PENDING")
    assigned_staff_id = Column(String, nullable=True)
    assigned_staff_name = Column(String, nullable=True)
    target_location = Column(String)
    description = Column(String, nullable=True)
    customer_request_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

class IncidentModel(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True)
    title = Column(String)
    severity = Column(String, default="MEDIUM")
    type = Column(String)
    zone = Column(String)
    status = Column(String, default="ACTIVE")
    recommendation_title = Column(String, nullable=True)
    recommendation_action = Column(String, nullable=True)
    recommendation_state = Column(String, default="PENDING")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    price = Column(Integer)
    is_synced = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    lane_code = Column(String, unique=True, index=True)
    stream_url = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

