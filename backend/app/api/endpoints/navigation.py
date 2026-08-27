from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.navigation import NavigationError, build_optimized_route, get_store_layout


router = APIRouter()


class NavigationDestinationRequest(BaseModel):
    product_id: Optional[str] = None
    shelf_code: Optional[str] = None
    label: Optional[str] = None


class OptimizeNavigationRequest(BaseModel):
    store_id: str = "store-01"
    start_node_id: Optional[str] = None
    destinations: list[NavigationDestinationRequest] = Field(default_factory=list)
    include_checkout: bool = True
    checkout_lane_code: Optional[str] = "C2"
    avoid_congestion: bool = True
    accessible_only: bool = False


@router.get("/layout")
def read_store_layout(
    store_id: str = Query(default="store-01"),
    db: Session = Depends(get_db),
):
    try:
        return get_store_layout(db, store_id)
    except NavigationError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/route")
def read_route_from_entrance(
    product_id: Optional[str] = None,
    shelf_code: Optional[str] = None,
    store_id: str = "store-01",
    start_node_id: Optional[str] = None,
    include_checkout: bool = False,
    checkout_lane_code: Optional[str] = "C2",
    avoid_congestion: bool = True,
    accessible_only: bool = False,
    db: Session = Depends(get_db),
):
    if not product_id and not shelf_code:
        raise HTTPException(
            status_code=422,
            detail="Provide product_id or shelf_code as the destination.",
        )
    try:
        result = build_optimized_route(
            db,
            store_id=store_id,
            start_node_id=start_node_id,
            destinations=[{"product_id": product_id, "shelf_code": shelf_code}],
            include_checkout=include_checkout,
            checkout_lane_code=checkout_lane_code,
            avoid_congestion=avoid_congestion,
            accessible_only=accessible_only,
        )
    except NavigationError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    if result["unresolvedDestinations"] and len(result["stops"]) == 1:
        raise HTTPException(status_code=404, detail=result["unresolvedDestinations"][0]["reason"])
    return result


@router.post("/route/optimize")
def optimize_route(payload: OptimizeNavigationRequest, db: Session = Depends(get_db)):
    try:
        return build_optimized_route(
            db,
            store_id=payload.store_id,
            start_node_id=payload.start_node_id,
            destinations=[destination.model_dump() for destination in payload.destinations],
            include_checkout=payload.include_checkout,
            checkout_lane_code=payload.checkout_lane_code,
            avoid_congestion=payload.avoid_congestion,
            accessible_only=payload.accessible_only,
        )
    except NavigationError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
