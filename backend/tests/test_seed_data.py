import unittest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base
from app.db.init_db import seed_database
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
    ShelfModel,
    StaffModel,
    StaffTaskModel,
    StoreAreaModel,
    StoreLayoutModel,
    StoreModel,
    WasteRecordModel,
    ZoneModel,
)
from app.services.navigation import build_optimized_route, get_store_layout


class RetailSeedTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        self.factory = sessionmaker(bind=self.engine)

    def tearDown(self):
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def test_seed_populates_every_platform_domain(self):
        result = seed_database(self.engine, self.factory)
        session = self.factory()
        try:
            self.assertEqual(result["status"], "seeded")
            expected_counts = {
                StoreModel: 1,
                Item: 54,
                ZoneModel: 8,
                ShelfModel: 26,
                ProductModel: 54,
                StoreLayoutModel: 1,
                StoreAreaModel: 11,
                NavigationNodeModel: 49,
                NavigationEdgeModel: 56,
                QueueModel: 5,
                StaffModel: 12,
                StaffTaskModel: 9,
                IncidentModel: 10,
                Camera: 6,
                InventoryBatchModel: 12,
                MarkdownCandidateModel: 3,
                WasteRecordModel: 3,
                RetailMetricModel: 22,
            }
            for model, expected in expected_counts.items():
                self.assertEqual(session.query(model).count(), expected, model.__name__)

            self.assertEqual(
                session.query(IncidentModel)
                .filter(IncidentModel.status == "ACTIVE")
                .count(),
                7,
            )
            self.assertEqual(
                session.query(Camera).filter(Camera.status == "DEGRADED").count(),
                1,
            )
        finally:
            session.close()

    def test_seed_is_idempotent_and_preserves_runtime_changes(self):
        seed_database(self.engine, self.factory)
        session = self.factory()
        try:
            store = session.get(StoreModel, "store-01")
            store.current_occupancy = 155
            session.commit()
        finally:
            session.close()

        result = seed_database(self.engine, self.factory)
        session = self.factory()
        try:
            self.assertEqual(result["status"], "current")
            self.assertEqual(session.get(StoreModel, "store-01").current_occupancy, 155)
            self.assertEqual(session.query(StaffModel).count(), 12)
        finally:
            session.close()

    def test_seeded_relationship_identifiers_are_coherent(self):
        seed_database(self.engine, self.factory)
        session = self.factory()
        try:
            zone_ids = {row.id for row in session.query(ZoneModel).all()}
            shelf_codes = {row.code for row in session.query(ShelfModel).all()}
            staff_ids = {row.id for row in session.query(StaffModel).all()}
            product_ids = {row.id for row in session.query(ProductModel).all()}
            navigation_node_ids = {
                row.id for row in session.query(NavigationNodeModel).all()
            }

            self.assertTrue(
                all(row.zone_id in zone_ids for row in session.query(ShelfModel).all())
            )
            self.assertTrue(
                all(row.shelf.removeprefix("Shelf ") in shelf_codes for row in session.query(ProductModel).all())
            )
            self.assertTrue(
                all(
                    row.assigned_staff_id is None or row.assigned_staff_id in staff_ids
                    for row in session.query(StaffTaskModel).all()
                )
            )
            self.assertTrue(
                all(
                    row.product_id in product_ids
                    for row in session.query(InventoryBatchModel).all()
                )
            )
            frontend_catalog_ids = {
                "prod-milk", "prod-aavin-milk", "prod-amul-taaza", "prod-bread",
                "prod-amul-butter", "prod-amul-100", "prod-tea", "prod-biscuits",
                "prod-marie-gold", "prod-parle-g", "prod-lays", "prod-haldirams",
                "prod-juice", "prod-dove", "prod-sunsilk", "prod-pantene",
                "prod-pasta", "prod-pasta-sauce", "prod-cheese",
            }
            self.assertTrue(frontend_catalog_ids.issubset(product_ids))
            self.assertTrue(
                all(
                    row.from_node_id in navigation_node_ids
                    and row.to_node_id in navigation_node_ids
                    for row in session.query(NavigationEdgeModel).all()
                )
            )
        finally:
            session.close()

    def test_customer_route_starts_at_entry_and_reaches_products_and_checkout(self):
        seed_database(self.engine, self.factory)
        session = self.factory()
        try:
            layout = get_store_layout(session)
            self.assertEqual(layout["entranceNodeId"], "nav-entry-main")
            self.assertEqual(len(layout["areas"]), 11)

            route = build_optimized_route(
                session,
                destinations=[
                    {"product_id": "prod-milk"},
                    {"product_id": "prod-bread"},
                    {"product_id": "legacy-biscuits", "shelf_code": "Shelf B2"},
                ],
                checkout_lane_code="C2",
                avoid_congestion=True,
            )
            self.assertEqual(route["startNodeId"], "nav-entry-main")
            self.assertEqual(route["stops"][0]["kind"], "ENTRANCE")
            self.assertEqual(route["stops"][-1]["laneCode"], "C2")
            self.assertEqual(
                {stop["productId"] for stop in route["stops"] if stop["kind"] == "PRODUCT"},
                {"prod-milk", "prod-bread", "legacy-biscuits"},
            )
            self.assertGreater(route["totalDistanceMeters"], 0)
            self.assertFalse(route["unresolvedDestinations"])
            self.assertTrue(all(leg["svgPath"].startswith("M ") for leg in route["legs"]))
        finally:
            session.close()


if __name__ == "__main__":
    unittest.main()
