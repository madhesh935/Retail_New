from __future__ import annotations

from datetime import date, datetime, time, timezone
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import Base, get_db
# Importing the model module ensures every mapped table is registered in metadata.
from app.db import models as _models  # noqa: F401


router = APIRouter()


def _json_safe(value: Any) -> Any:
    if isinstance(value, (datetime, date, time)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    if isinstance(value, dict):
        return {str(key): _json_safe(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_json_safe(item) for item in value]
    return value


@router.get("/all")
def get_all_database_data(db: Session = Depends(get_db)):
    """Return all application tables and records as a browser-friendly JSON payload."""
    table_data: dict[str, list[dict[str, Any]]] = {}
    table_counts: dict[str, int] = {}

    for table in sorted(Base.metadata.tables.values(), key=lambda item: item.name):
        rows = db.execute(select(table)).mappings().all()
        serialized_rows = [
            {column: _json_safe(value) for column, value in row.items()}
            for row in rows
        ]
        table_data[table.name] = serialized_rows
        table_counts[table.name] = len(serialized_rows)

    return {
        "database": db.get_bind().dialect.name,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "tableCount": len(table_data),
            "totalRowCount": sum(table_counts.values()),
            "rowCountByTable": table_counts,
        },
        "data": table_data,
    }
