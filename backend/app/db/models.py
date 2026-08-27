from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from app.db.database import Base

class StoreModel(Base):
    __tablename__ = "store_info"

    code = Column(String, default="STORE-01-CHN")
    is_open = Column(Boolean, default=True)
    edge_ai_status = Column(String, default="ACTIVE")
    id = Column(String, primary_key=True, default="store-01")
    name = Column(String, default="FreshMart Flagship — Chennai Central")
    address = Column(String, default="Anna Salai, Thousand Lights, Chennai, Tamil Nadu 600006")
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
    category = Column(String, nullable=True)
    current_occupancy = Column(Integer, default=0)
    max_capacity = Column(Integer, default=60)
    congestion_level = Column(String, default="LOW")
    avg_dwell_time_seconds = Column(Integer, default=0)
    alert_count = Column(Integer, default=0)
    coordinates = Column(JSON, nullable=True)

class ShelfModel(Base):
    __tablename__ = "shelves"

    id = Column(String, primary_key=True)
    code = Column(String, unique=True, index=True)
    name = Column(String)
    zone_id = Column(String)
    zone_name = Column(String)
    aisle = Column(String)
    sku = Column(String, nullable=True, index=True)
    sku_name = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    category = Column(String, nullable=True)
    unit_price = Column(Float, nullable=True)
    current_skus_count = Column(Integer, default=0)
    capacity_count = Column(Integer, default=20)
    compliance_score = Column(Float, default=90.0)
    status = Column(String, default="OPTIMAL")
    availability = Column(Float, default=100.0)
    visible_units = Column(Integer, default=15)
    facing_capacity = Column(Integer, default=3)
    current_facings = Column(Integer, default=0)
    is_misplaced = Column(Boolean, default=False)
    confidence_score = Column(Float, default=0.95)
    camera_code = Column(String, nullable=True)
    backroom_units = Column(Integer, default=0)
    depletion_rate_per_hour = Column(Float, default=0.0)
    minutes_until_stockout = Column(Integer, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class ProductModel(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True)
    sku = Column(String, unique=True, nullable=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
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


class StoreLayoutModel(Base):
    __tablename__ = "store_layouts"

    id = Column(String, primary_key=True)
    store_id = Column(String, index=True)
    name = Column(String)
    floor_number = Column(Integer, default=0)
    width = Column(Float)
    height = Column(Float)
    coordinate_unit = Column(String, default="svg_unit")
    meters_per_unit = Column(Float, default=0.25)
    entrance_node_id = Column(String)
    default_checkout_node_id = Column(String)
    version = Column(String)
    is_active = Column(Boolean, default=True)
    details = Column(JSON, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())


class StoreAreaModel(Base):
    __tablename__ = "store_areas"

    id = Column(String, primary_key=True)
    layout_id = Column(String, index=True)
    zone_id = Column(String, nullable=True, index=True)
    code = Column(String, index=True)
    name = Column(String)
    area_type = Column(String, index=True)
    x = Column(Float)
    y = Column(Float)
    width = Column(Float)
    height = Column(Float)
    fill_color = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)
    customer_accessible = Column(Boolean, default=True)
    details = Column(JSON, nullable=True)


class NavigationNodeModel(Base):
    __tablename__ = "navigation_nodes"

    id = Column(String, primary_key=True)
    layout_id = Column(String, index=True)
    code = Column(String, index=True)
    label = Column(String)
    node_type = Column(String, index=True)
    x = Column(Float)
    y = Column(Float)
    zone_id = Column(String, nullable=True, index=True)
    shelf_code = Column(String, nullable=True, index=True)
    product_id = Column(String, nullable=True, index=True)
    lane_code = Column(String, nullable=True, index=True)
    accessible = Column(Boolean, default=True)
    customer_accessible = Column(Boolean, default=True)
    details = Column(JSON, nullable=True)


class NavigationEdgeModel(Base):
    __tablename__ = "navigation_edges"

    id = Column(String, primary_key=True)
    layout_id = Column(String, index=True)
    from_node_id = Column(String, index=True)
    to_node_id = Column(String, index=True)
    distance_meters = Column(Float)
    estimated_seconds = Column(Integer)
    bidirectional = Column(Boolean, default=True)
    accessible = Column(Boolean, default=True)
    status = Column(String, default="OPEN", index=True)
    instructions = Column(String, nullable=True)
    details = Column(JSON, nullable=True)

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
    assigned_staff_id = Column(String, nullable=True)
    is_express = Column(Boolean, default=False)
    processing_rate_items_per_minute = Column(Float, default=0.0)
    predicted_queue_in_10_min = Column(Integer, default=0)
    predicted_wait_in_10_min_seconds = Column(Integer, default=0)
    camera_code = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class StaffModel(Base):
    __tablename__ = "staff"

    id = Column(String, primary_key=True)
    employee_id = Column(String, unique=True, nullable=True, index=True)
    name = Column(String)
    role = Column(String)
    department = Column(String, nullable=True)
    skills = Column(JSON, nullable=True)
    current_zone_id = Column(String, nullable=True)
    zone = Column(String)
    status = Column(String, default="AVAILABLE")
    active_task_id = Column(String, nullable=True)
    current_task_description = Column(String, nullable=True)
    performance_score = Column(Float, default=95.0)
    tasks_completed_today = Column(Integer, default=0)
    shift_start = Column(String, default="08:00")
    shift_end = Column(String, default="16:00")
    shift_status = Column(String, default="ON_SHIFT")
    contact_channel = Column(String, nullable=True)
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
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

class IncidentModel(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True)
    title = Column(String)
    description = Column(String, nullable=True)
    severity = Column(String, default="MEDIUM")
    type = Column(String)
    zone = Column(String)
    zone_id = Column(String, nullable=True)
    status = Column(String, default="ACTIVE")
    camera_code = Column(String, nullable=True)
    assigned_staff_id = Column(String, nullable=True)
    assigned_staff_name = Column(String, nullable=True)
    recommendation_title = Column(String, nullable=True)
    recommendation_action = Column(String, nullable=True)
    recommendation_state = Column(String, default="PENDING")
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

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
    name = Column(String, nullable=True)
    code = Column(String, unique=True, nullable=True, index=True)
    zone_id = Column(String, nullable=True)
    zone_name = Column(String, nullable=True)
    status = Column(String, default="ONLINE")
    resolution = Column(String, default="1920x1080")
    fps = Column(Float, default=30.0)
    target_fps = Column(Float, default=30.0)
    inference_latency_ms = Column(Float, default=0.0)
    model_loaded = Column(String, nullable=True)
    ai_tasks = Column(JSON, nullable=True)
    uptime_percent = Column(Float, default=100.0)
    active_detections_count = Column(Integer, default=0)
    lens_fov = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    mac_address = Column(String, nullable=True)
    last_heartbeat = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())


class InventoryBatchModel(Base):
    __tablename__ = "inventory_batches"

    id = Column(String, primary_key=True)
    store_id = Column(String, index=True)
    product_id = Column(String, index=True)
    product_sku = Column(String, index=True)
    product_name = Column(String)
    category = Column(String, index=True)
    batch_number = Column(String, index=True)
    quantity = Column(Integer, default=0)
    shelf_quantity = Column(Integer, default=0)
    backroom_quantity = Column(Integer, default=0)
    received_at = Column(DateTime(timezone=True))
    manufactured_at = Column(DateTime(timezone=True), nullable=True)
    best_before_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), index=True)
    storage_location_id = Column(String)
    shelf_id = Column(String, nullable=True)
    shelf_code = Column(String, nullable=True)
    unit_cost = Column(Float, default=0.0)
    unit_price = Column(Float, default=0.0)
    status = Column(String, default="ACTIVE")
    source = Column(String, default="ERP")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())


class MarkdownCandidateModel(Base):
    __tablename__ = "markdown_candidates"

    id = Column(String, primary_key=True)
    batch_id = Column(String, index=True)
    product_id = Column(String, index=True)
    product_sku = Column(String)
    product_name = Column(String)
    category = Column(String)
    shelf_code = Column(String)
    current_price = Column(Float)
    suggested_discount_percent = Column(Float)
    suggested_new_price = Column(Float)
    remaining_quantity = Column(Integer)
    at_risk_quantity = Column(Integer)
    expires_at = Column(DateTime(timezone=True))
    reason = Column(String)
    status = Column(String, default="RECOMMENDED")
    approved_by = Column(String, nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    applied_at = Column(DateTime(timezone=True), nullable=True)


class WasteRecordModel(Base):
    __tablename__ = "waste_records"

    id = Column(String, primary_key=True)
    store_id = Column(String, index=True)
    product_id = Column(String, index=True)
    product_sku = Column(String, nullable=True)
    product_name = Column(String)
    batch_id = Column(String, nullable=True)
    batch_number = Column(String, nullable=True)
    quantity = Column(Integer)
    reason = Column(String)
    recorded_by_staff_id = Column(String)
    recorded_by_staff_name = Column(String)
    location_id = Column(String)
    location_name = Column(String)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    unit_cost = Column(Float, nullable=True)
    total_loss_cost = Column(Float, nullable=True)
    notes = Column(String, nullable=True)


class RetailMetricModel(Base):
    __tablename__ = "retail_metrics"

    id = Column(String, primary_key=True)
    store_id = Column(String, index=True)
    metric_type = Column(String, index=True)
    label = Column(String)
    value = Column(Float)
    unit = Column(String)
    dimensions = Column(JSON, nullable=True)
    recorded_at = Column(DateTime(timezone=True), index=True)


class SeedMetadataModel(Base):
    __tablename__ = "seed_metadata"

    key = Column(String, primary_key=True)
    value = Column(String)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
