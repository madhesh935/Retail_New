"""Push-based live-update channel.

Any REST endpoint that mutates store data calls `broadcast_change(resource)`
right after it commits. That schedules an async broadcast onto the running
event loop (safe to call from FastAPI's sync/threadpool request handlers) and
every browser tab connected to `/api/v1/live/updates` receives a small
"this resource changed" message immediately — no polling interval involved.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()
        self.loop: asyncio.AbstractEventLoop | None = None

    def bind_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        self.loop = loop

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self._connections.discard(websocket)

    async def broadcast(self, message: dict[str, Any]) -> None:
        dead: list[WebSocket] = []
        for connection in list(self._connections):
            try:
                await connection.send_json(message)
            except Exception:
                dead.append(connection)
        for connection in dead:
            self._connections.discard(connection)


manager = ConnectionManager()


def broadcast_change(resource: str, store_id: str = "store-01", **extra: Any) -> None:
    """Fire-and-forget notification, safe to call from sync endpoint code.

    `resource` names what changed (e.g. "incidents", "staff_tasks", "shelves")
    so the frontend can refetch just that slice in reaction to the push.
    """
    message = {
        "event": "DATA_CHANGED",
        "storeId": store_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "payload": {"resource": resource, **extra},
    }

    loop = manager.loop
    if loop is None or loop.is_closed():
        return
    try:
        asyncio.run_coroutine_threadsafe(manager.broadcast(message), loop)
    except Exception:
        logger.exception("Failed to schedule broadcast for resource=%s", resource)
