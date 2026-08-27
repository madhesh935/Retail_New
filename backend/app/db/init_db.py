from __future__ import annotations

from typing import Any

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.db.database import Base, SessionLocal, engine
from app.db.models import (
    Camera,
    IncidentModel,
    InventoryBatchModel,
    Item,
    MarkdownCandidateModel,
    NavigationEdgeModel,
    NavigationNodeModel,
    ProductModel,
    QueueModel,
    RetailMetricModel,
    SeedMetadataModel,
    ShelfModel,
    StaffModel,
    StaffTaskModel,
    StoreAreaModel,
    StoreLayoutModel,
    StoreModel,
    WasteRecordModel,
    ZoneModel,
)
from app.db.seed_data import SEED_VERSION, build_seed_data


SEED_VERSION_KEY = "retail_platform_seed_version"

# create_all does not add columns to an existing SQLite table. These additive,
# nullable migrations let older local databases receive the richer platform seed.
SQLITE_COLUMN_MIGRATIONS: dict[str, dict[str, str]] = {
    "store_info": {
        "code": "VARCHAR",
        "is_open": "BOOLEAN",
        "edge_ai_status": "VARCHAR",
    },
    "store_zones": {
        "category": "VARCHAR",
        "avg_dwell_time_seconds": "INTEGER",
        "alert_count": "INTEGER",
        "coordinates": "JSON",
    },
    "shelves": {
        "sku": "VARCHAR",
        "brand": "VARCHAR",
        "category": "VARCHAR",
        "unit_price": "FLOAT",
        "facing_capacity": "INTEGER",
        "current_facings": "INTEGER",
        "is_misplaced": "BOOLEAN",
        "confidence_score": "FLOAT",
        "camera_code": "VARCHAR",
        "backroom_units": "INTEGER",
        "depletion_rate_per_hour": "FLOAT",
        "minutes_until_stockout": "INTEGER",
    },
    "products": {
        "sku": "VARCHAR",
        "description": "VARCHAR",
    },
    "queues": {
        "assigned_staff_id": "VARCHAR",
        "processing_rate_items_per_minute": "FLOAT",
        "predicted_queue_in_10_min": "INTEGER",
        "predicted_wait_in_10_min_seconds": "INTEGER",
        "camera_code": "VARCHAR",
    },
    "staff": {
        "employee_id": "VARCHAR",
        "department": "VARCHAR",
        "skills": "JSON",
        "current_zone_id": "VARCHAR",
        "current_task_description": "VARCHAR",
        "shift_status": "VARCHAR",
        "contact_channel": "VARCHAR",
    },
    "staff_tasks": {"details": "JSON"},
    "waste_records": {"evidence_photo": "VARCHAR"},
    "incidents": {
        "description": "VARCHAR",
        "zone_id": "VARCHAR",
        "camera_code": "VARCHAR",
        "assigned_staff_id": "VARCHAR",
        "assigned_staff_name": "VARCHAR",
        "details": "JSON",
        "resolved_at": "DATETIME",
    },
    "cameras": {
        "name": "VARCHAR",
        "code": "VARCHAR",
        "zone_id": "VARCHAR",
        "zone_name": "VARCHAR",
        "status": "VARCHAR",
        "resolution": "VARCHAR",
        "fps": "FLOAT",
        "target_fps": "FLOAT",
        "inference_latency_ms": "FLOAT",
        "model_loaded": "VARCHAR",
        "ai_tasks": "JSON",
        "uptime_percent": "FLOAT",
        "active_detections_count": "INTEGER",
        "lens_fov": "VARCHAR",
        "ip_address": "VARCHAR",
        "mac_address": "VARCHAR",
        "last_heartbeat": "DATETIME",
    },
}


def _ensure_sqlite_columns(database_engine: Engine) -> list[str]:
    if database_engine.dialect.name != "sqlite":
        return []

    added: list[str] = []
    schema = inspect(database_engine)
    table_names = set(schema.get_table_names())
    with database_engine.begin() as connection:
        for table_name, required_columns in SQLITE_COLUMN_MIGRATIONS.items():
            if table_name not in table_names:
                continue
            existing = {
                column["name"] for column in inspect(database_engine).get_columns(table_name)
            }
            for column_name, column_type in required_columns.items():
                if column_name in existing:
                    continue
                connection.execute(
                    text(
                        f'ALTER TABLE "{table_name}" '
                        f'ADD COLUMN "{column_name}" {column_type}'
                    )
                )
                added.append(f"{table_name}.{column_name}")
    return added


def _move_primary_key(
    db: Session,
    model,
    old_id: str,
    new_id: str,
    *,
    reference_updates: list[tuple[Any, Any]] | None = None,
) -> None:
    old_record = db.get(model, old_id)
    if not old_record:
        return

    for reference_column, replacement in reference_updates or []:
        db.query(reference_column.class_).filter(reference_column == old_id).update(
            {reference_column.key: replacement}, synchronize_session=False
        )

    target = db.get(model, new_id)
    if target:
        db.delete(old_record)
    else:
        primary_key_name = inspect(model).primary_key[0].key
        setattr(old_record, primary_key_name, new_id)
    db.flush()


def _migrate_legacy_seed_ids(db: Session) -> None:
    _move_primary_key(db, StoreModel, "store-blr-01", "store-01")

    staff_id_map = {
        "staff-1": "staff-s01",
        "staff-2": "staff-s02",
        "staff-3": "staff-s06",
        "staff-4": "staff-s05",
        "staff-5": "staff-s10",
    }
    for old_id, new_id in staff_id_map.items():
        _move_primary_key(
            db,
            StaffModel,
            old_id,
            new_id,
            reference_updates=[
                (StaffTaskModel.assigned_staff_id, new_id),
                (IncidentModel.assigned_staff_id, new_id),
                (QueueModel.assigned_staff_id, new_id),
            ],
        )

    _move_primary_key(db, IncidentModel, "inc-001", "inc-01")
    _move_primary_key(db, IncidentModel, "inc-002", "inc-03")


def _upsert_rows(
    db: Session,
    model,
    rows: list[dict[str, Any]],
) -> dict[str, int]:
    primary_keys = inspect(model).primary_key
    if len(primary_keys) != 1:
        raise ValueError(f"Seed upsert expects one primary key for {model.__name__}")
    primary_key = primary_keys[0].key
    inserted = 0
    updated = 0

    for values in rows:
        record = db.get(model, values[primary_key])
        if record is None:
            db.add(model(**values))
            inserted += 1
            continue
        for key, value in values.items():
            setattr(record, key, value)
        updated += 1
    db.flush()
    return {"inserted": inserted, "updated": updated}


def seed_database(
    database_engine: Engine = engine,
    session_factory=None,
    *,
    force: bool = False,
) -> dict[str, Any]:
    """Create, migrate, and seed the local retail database exactly once per version."""
    Base.metadata.create_all(bind=database_engine)
    added_columns = _ensure_sqlite_columns(database_engine)
    factory = session_factory or (
        SessionLocal if database_engine is engine else sessionmaker(bind=database_engine)
    )
    db: Session = factory()

    try:
        current_version = db.get(SeedMetadataModel, SEED_VERSION_KEY)
        if current_version and current_version.value == SEED_VERSION and not force:
            return {
                "seed_version": SEED_VERSION,
                "status": "current",
                "added_columns": added_columns,
            }

        _migrate_legacy_seed_ids(db)
        seed = build_seed_data()
        model_rows = [
            ("stores", StoreModel),
            ("items", Item),
            ("zones", ZoneModel),
            ("shelves", ShelfModel),
            ("products", ProductModel),
            ("layouts", StoreLayoutModel),
            ("areas", StoreAreaModel),
            ("navigation_nodes", NavigationNodeModel),
            ("navigation_edges", NavigationEdgeModel),
            ("queues", QueueModel),
            ("staff", StaffModel),
            ("tasks", StaffTaskModel),
            ("incidents", IncidentModel),
            ("cameras", Camera),
            ("batches", InventoryBatchModel),
            ("markdown_candidates", MarkdownCandidateModel),
            ("waste_records", WasteRecordModel),
            ("metrics", RetailMetricModel),
        ]
        changes = {
            name: _upsert_rows(db, model, seed[name])
            for name, model in model_rows
        }

        if current_version is None:
            current_version = SeedMetadataModel(
                key=SEED_VERSION_KEY,
                value=SEED_VERSION,
            )
            db.add(current_version)
        else:
            current_version.value = SEED_VERSION

        db.commit()
        summary = {
            "seed_version": SEED_VERSION,
            "status": "seeded",
            "added_columns": added_columns,
            "changes": changes,
        }
        print("Database initialized with the complete Retail Edge OS seed dataset.")
        return summary
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
