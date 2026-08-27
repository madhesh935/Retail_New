from __future__ import annotations

from dataclasses import dataclass
from heapq import heappop, heappush
from math import ceil
from typing import Any

from sqlalchemy.orm import Session

from app.db.models import (
    NavigationEdgeModel,
    NavigationNodeModel,
    ProductModel,
    StoreAreaModel,
    StoreLayoutModel,
)


class NavigationError(ValueError):
    """Raised when a requested store route cannot be produced."""


@dataclass
class PathResult:
    node_ids: list[str]
    edges: list[NavigationEdgeModel]
    routing_cost: float


@dataclass
class ResolvedDestination:
    input_index: int
    node: NavigationNodeModel
    product_id: str | None
    shelf_code: str | None
    label: str


def _active_layout(db: Session, store_id: str) -> StoreLayoutModel:
    layout = (
        db.query(StoreLayoutModel)
        .filter(
            StoreLayoutModel.store_id == store_id,
            StoreLayoutModel.is_active.is_(True),
        )
        .order_by(StoreLayoutModel.floor_number, StoreLayoutModel.id)
        .first()
    )
    if layout is None:
        raise NavigationError(f"No active store layout exists for {store_id}.")
    return layout


def _node_payload(node: NavigationNodeModel) -> dict[str, Any]:
    return {
        "id": node.id,
        "code": node.code,
        "label": node.label,
        "type": node.node_type,
        "x": node.x,
        "y": node.y,
        "zoneId": node.zone_id,
        "shelfCode": node.shelf_code,
        "productId": node.product_id,
        "laneCode": node.lane_code,
        "accessible": node.accessible,
        "customerAccessible": node.customer_accessible,
        "details": node.details or {},
    }


def get_store_layout(db: Session, store_id: str = "store-01") -> dict[str, Any]:
    layout = _active_layout(db, store_id)
    areas = (
        db.query(StoreAreaModel)
        .filter(StoreAreaModel.layout_id == layout.id)
        .order_by(StoreAreaModel.sort_order, StoreAreaModel.id)
        .all()
    )
    nodes = (
        db.query(NavigationNodeModel)
        .filter(NavigationNodeModel.layout_id == layout.id)
        .order_by(NavigationNodeModel.node_type, NavigationNodeModel.code)
        .all()
    )
    edges = (
        db.query(NavigationEdgeModel)
        .filter(NavigationEdgeModel.layout_id == layout.id)
        .order_by(NavigationEdgeModel.id)
        .all()
    )
    return {
        "id": layout.id,
        "storeId": layout.store_id,
        "name": layout.name,
        "floorNumber": layout.floor_number,
        "width": layout.width,
        "height": layout.height,
        "coordinateUnit": layout.coordinate_unit,
        "metersPerUnit": layout.meters_per_unit,
        "entranceNodeId": layout.entrance_node_id,
        "defaultCheckoutNodeId": layout.default_checkout_node_id,
        "version": layout.version,
        "details": layout.details or {},
        "areas": [
            {
                "id": area.id,
                "zoneId": area.zone_id,
                "code": area.code,
                "name": area.name,
                "type": area.area_type,
                "x": area.x,
                "y": area.y,
                "width": area.width,
                "height": area.height,
                "fillColor": area.fill_color,
                "customerAccessible": area.customer_accessible,
                "details": area.details or {},
            }
            for area in areas
        ],
        "nodes": [_node_payload(node) for node in nodes],
        "edges": [
            {
                "id": edge.id,
                "fromNodeId": edge.from_node_id,
                "toNodeId": edge.to_node_id,
                "distanceMeters": edge.distance_meters,
                "estimatedSeconds": edge.estimated_seconds,
                "bidirectional": edge.bidirectional,
                "accessible": edge.accessible,
                "status": edge.status,
                "instructions": edge.instructions,
            }
            for edge in edges
        ],
    }


def _load_graph(
    db: Session, layout_id: str
) -> tuple[dict[str, NavigationNodeModel], list[NavigationEdgeModel]]:
    nodes = {
        node.id: node
        for node in db.query(NavigationNodeModel)
        .filter(
            NavigationNodeModel.layout_id == layout_id,
            NavigationNodeModel.customer_accessible.is_(True),
        )
        .all()
    }
    edges = (
        db.query(NavigationEdgeModel)
        .filter(NavigationEdgeModel.layout_id == layout_id)
        .all()
    )
    return nodes, edges


def _shortest_path(
    nodes: dict[str, NavigationNodeModel],
    edges: list[NavigationEdgeModel],
    start_node_id: str,
    destination_node_id: str,
    *,
    avoid_congestion: bool,
    accessible_only: bool,
) -> PathResult | None:
    if start_node_id not in nodes or destination_node_id not in nodes:
        return None
    if start_node_id == destination_node_id:
        return PathResult([start_node_id], [], 0.0)

    adjacency: dict[str, list[tuple[str, NavigationEdgeModel, float]]] = {
        node_id: [] for node_id in nodes
    }
    for edge in edges:
        if edge.status == "CLOSED" or (accessible_only and not edge.accessible):
            continue
        if edge.from_node_id not in nodes or edge.to_node_id not in nodes:
            continue
        multiplier = 4.0 if avoid_congestion and edge.status == "CONGESTED" else 1.0
        cost = edge.distance_meters * multiplier
        adjacency[edge.from_node_id].append((edge.to_node_id, edge, cost))
        if edge.bidirectional:
            adjacency[edge.to_node_id].append((edge.from_node_id, edge, cost))

    distances = {start_node_id: 0.0}
    previous: dict[str, tuple[str, NavigationEdgeModel]] = {}
    queue: list[tuple[float, str]] = [(0.0, start_node_id)]

    while queue:
        current_cost, current = heappop(queue)
        if current == destination_node_id:
            break
        if current_cost > distances.get(current, float("inf")):
            continue
        for neighbor, edge, edge_cost in adjacency[current]:
            new_cost = current_cost + edge_cost
            if new_cost >= distances.get(neighbor, float("inf")):
                continue
            distances[neighbor] = new_cost
            previous[neighbor] = (current, edge)
            heappush(queue, (new_cost, neighbor))

    if destination_node_id not in distances:
        return None

    node_ids = [destination_node_id]
    path_edges: list[NavigationEdgeModel] = []
    current = destination_node_id
    while current != start_node_id:
        previous_node, edge = previous[current]
        node_ids.append(previous_node)
        path_edges.append(edge)
        current = previous_node
    node_ids.reverse()
    path_edges.reverse()
    return PathResult(node_ids, path_edges, distances[destination_node_id])


def _normalize_shelf_code(value: str | None) -> str | None:
    if not value:
        return None
    return value.strip().upper().removeprefix("SHELF ").strip()


def _resolve_destination(
    db: Session,
    layout_id: str,
    destination: dict[str, Any],
    input_index: int,
) -> ResolvedDestination | None:
    product_id = destination.get("product_id")
    shelf_code = _normalize_shelf_code(destination.get("shelf_code"))
    label = destination.get("label")
    product = db.get(ProductModel, product_id) if product_id else None
    if product:
        shelf_code = _normalize_shelf_code(product.shelf)
        label = label or product.name

    query = db.query(NavigationNodeModel).filter(
        NavigationNodeModel.layout_id == layout_id,
        NavigationNodeModel.customer_accessible.is_(True),
    )
    node = None
    if product_id:
        node = query.filter(NavigationNodeModel.product_id == product_id).first()
    if node is None and shelf_code:
        node = query.filter(NavigationNodeModel.shelf_code == shelf_code).first()
    if node is None:
        return None
    return ResolvedDestination(
        input_index=input_index,
        node=node,
        product_id=product_id or (product.id if product else None),
        shelf_code=shelf_code,
        label=label or (product.name if product else node.label),
    )


def _direction(from_node: NavigationNodeModel, to_node: NavigationNodeModel) -> str:
    dx = to_node.x - from_node.x
    dy = to_node.y - from_node.y
    if abs(dx) >= abs(dy):
        return "east" if dx >= 0 else "west"
    return "south" if dy >= 0 else "north"


def _leg_payload(
    leg_index: int,
    path: PathResult,
    nodes: dict[str, NavigationNodeModel],
    destination_label: str,
) -> dict[str, Any]:
    path_nodes = [nodes[node_id] for node_id in path.node_ids]
    distance = round(sum(edge.distance_meters for edge in path.edges), 1)
    seconds = sum(edge.estimated_seconds for edge in path.edges)
    segments = []
    for index, edge in enumerate(path.edges):
        from_node = path_nodes[index]
        to_node = path_nodes[index + 1]
        direction = _direction(from_node, to_node)
        prefix = "Head" if index == 0 else "Continue"
        segments.append(
            {
                "edgeId": edge.id,
                "fromNodeId": from_node.id,
                "toNodeId": to_node.id,
                "direction": direction,
                "distanceMeters": edge.distance_meters,
                "estimatedSeconds": edge.estimated_seconds,
                "status": edge.status,
                "instruction": f"{prefix} {direction} toward {to_node.label}.",
            }
        )
    points = " ".join(
        f"{'M' if index == 0 else 'L'} {node.x:g} {node.y:g}"
        for index, node in enumerate(path_nodes)
    )
    return {
        "id": f"route-leg-{leg_index}",
        "legIndex": leg_index,
        "fromNodeId": path.node_ids[0],
        "toNodeId": path.node_ids[-1],
        "destinationLabel": destination_label,
        "distanceMeters": distance,
        "estimatedSeconds": seconds,
        "svgPath": points,
        "nodeIds": path.node_ids,
        "nodes": [_node_payload(node) for node in path_nodes],
        "segments": segments,
        "arrivalInstruction": f"Arrive at {destination_label}.",
    }


def build_optimized_route(
    db: Session,
    *,
    store_id: str = "store-01",
    start_node_id: str | None = None,
    destinations: list[dict[str, Any]],
    include_checkout: bool = True,
    checkout_lane_code: str | None = "C2",
    avoid_congestion: bool = True,
    accessible_only: bool = False,
) -> dict[str, Any]:
    layout = _active_layout(db, store_id)
    nodes, edges = _load_graph(db, layout.id)
    start_id = start_node_id or layout.entrance_node_id
    if start_id not in nodes:
        raise NavigationError(f"Start node {start_id} does not exist in the active layout.")

    unresolved: list[dict[str, Any]] = []
    remaining: list[ResolvedDestination] = []
    for index, destination in enumerate(destinations):
        resolved = _resolve_destination(db, layout.id, destination, index)
        if resolved is None:
            unresolved.append(
                {
                    "inputIndex": index,
                    "productId": destination.get("product_id"),
                    "shelfCode": _normalize_shelf_code(destination.get("shelf_code")),
                    "label": destination.get("label"),
                    "reason": "No customer-accessible destination node is mapped.",
                }
            )
        else:
            remaining.append(resolved)

    start_node = nodes[start_id]
    stops = [
        {
            "sequence": 0,
            "kind": "ENTRANCE",
            "label": start_node.label,
            "productId": None,
            "shelfCode": None,
            "laneCode": None,
            "node": _node_payload(start_node),
        }
    ]
    legs: list[dict[str, Any]] = []
    current_id = start_id

    while remaining:
        candidates: list[tuple[float, int, ResolvedDestination, PathResult]] = []
        for destination in remaining:
            path = _shortest_path(
                nodes,
                edges,
                current_id,
                destination.node.id,
                avoid_congestion=avoid_congestion,
                accessible_only=accessible_only,
            )
            if path is not None:
                candidates.append(
                    (path.routing_cost, destination.input_index, destination, path)
                )
        if not candidates:
            unresolved.extend(
                {
                    "inputIndex": destination.input_index,
                    "productId": destination.product_id,
                    "shelfCode": destination.shelf_code,
                    "label": destination.label,
                    "reason": "No open route reaches this destination.",
                }
                for destination in remaining
            )
            break
        _, _, destination, path = min(candidates, key=lambda candidate: (candidate[0], candidate[1]))
        remaining.remove(destination)
        legs.append(_leg_payload(len(legs) + 1, path, nodes, destination.label))
        stops.append(
            {
                "sequence": len(stops),
                "kind": "PRODUCT",
                "label": destination.label,
                "productId": destination.product_id,
                "shelfCode": destination.shelf_code,
                "laneCode": None,
                "node": _node_payload(destination.node),
            }
        )
        current_id = destination.node.id

    if include_checkout:
        checkout_query = db.query(NavigationNodeModel).filter(
            NavigationNodeModel.layout_id == layout.id,
            NavigationNodeModel.node_type == "CHECKOUT",
            NavigationNodeModel.customer_accessible.is_(True),
        )
        checkout = None
        if checkout_lane_code:
            checkout = checkout_query.filter(
                NavigationNodeModel.lane_code == checkout_lane_code.upper()
            ).first()
        if checkout is None:
            checkout = nodes.get(layout.default_checkout_node_id)
        if checkout is not None:
            path = _shortest_path(
                nodes,
                edges,
                current_id,
                checkout.id,
                avoid_congestion=avoid_congestion,
                accessible_only=accessible_only,
            )
            if path is not None:
                legs.append(_leg_payload(len(legs) + 1, path, nodes, checkout.label))
                stops.append(
                    {
                        "sequence": len(stops),
                        "kind": "CHECKOUT",
                        "label": checkout.label,
                        "productId": None,
                        "shelfCode": None,
                        "laneCode": checkout.lane_code,
                        "node": _node_payload(checkout),
                    }
                )

    total_distance = round(sum(leg["distanceMeters"] for leg in legs), 1)
    total_seconds = sum(leg["estimatedSeconds"] for leg in legs)
    return {
        "layoutId": layout.id,
        "layoutVersion": layout.version,
        "storeId": store_id,
        "startNodeId": start_id,
        "avoidCongestion": avoid_congestion,
        "accessibleOnly": accessible_only,
        "totalDistanceMeters": total_distance,
        "estimatedSeconds": total_seconds,
        "estimatedMinutes": max(1, ceil(total_seconds / 60)) if legs else 0,
        "stops": stops,
        "legs": legs,
        "unresolvedDestinations": unresolved,
    }
