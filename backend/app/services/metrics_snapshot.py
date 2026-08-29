import asyncio
import logging
import uuid
from datetime import datetime, timedelta

from app.db.database import SessionLocal
from app.db.models import QueueModel, RetailMetricModel, ShelfModel, StaffTaskModel, StoreModel

logger = logging.getLogger(__name__)

SNAPSHOT_INTERVAL_SECONDS = 300  # 5 minutes
DISPATCH_RESPONSE_WINDOW_HOURS = 6

STORE_ID = "store-01"


def _record(db, metric_type: str, value: float, unit: str, dimensions: dict | None = None) -> None:
    now = datetime.utcnow()
    db.add(
        RetailMetricModel(
            id=f"metric-{metric_type.lower()}-{uuid.uuid4().hex[:10]}",
            store_id=STORE_ID,
            metric_type=metric_type,
            label=now.strftime("%H:%M"),
            value=value,
            unit=unit,
            dimensions=dimensions,
            recorded_at=now,
        )
    )


def take_snapshot() -> None:
    """Record one real point-in-time reading per tracked metric.

    Called on a recurring interval so charts that need a genuine trend line
    (footfall, shelf health, checkout wait, staff dispatch speed) fill in
    with real history over time instead of a fabricated one-time seed.
    """
    db = SessionLocal()
    try:
        store = db.query(StoreModel).first()
        if store:
            _record(db, "FOOTFALL", float(store.todays_total_footfall or 0), "shoppers")
            _record(db, "OCCUPANCY", float(store.current_occupancy or 0), "shoppers")

        shelves = db.query(ShelfModel).all()
        if shelves:
            healthy = sum(1 for s in shelves if s.status == "OPTIMAL")
            pct = round((healthy / len(shelves)) * 100, 1)
            _record(db, "SHELF_AVAILABILITY", pct, "%")

        lanes = db.query(QueueModel).filter(QueueModel.status.in_(["ACTIVE", "CONGESTED"])).all()
        if lanes:
            avg_wait = sum(l.wait_time_seconds for l in lanes) / len(lanes)
            _record(db, "CHECKOUT_WAIT", round(avg_wait, 1), "seconds")

        cutoff = datetime.utcnow() - timedelta(hours=DISPATCH_RESPONSE_WINDOW_HOURS)
        recent_assigned = (
            db.query(StaffTaskModel)
            .filter(StaffTaskModel.assigned_at.isnot(None))
            .filter(StaffTaskModel.assigned_at >= cutoff)
            .all()
        )
        deltas = [
            (t.assigned_at - t.created_at).total_seconds()
            for t in recent_assigned
            if t.created_at and t.assigned_at and t.assigned_at >= t.created_at
        ]
        if deltas:
            _record(db, "DISPATCH_RESPONSE", round(sum(deltas) / len(deltas), 1), "seconds")

        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Metric snapshot failed")
    finally:
        db.close()


async def snapshot_loop() -> None:
    while True:
        take_snapshot()
        await asyncio.sleep(SNAPSHOT_INTERVAL_SECONDS)
