import unittest
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.endpoints import customer, inventory, staff
from app.db.database import Base, get_db
from app.db.models import (
    InventoryBatchModel,
    ProductModel,
    ShelfModel,
    StaffModel,
    StaffTaskModel,
    WasteRecordModel,
)


class CustomerStaffWorkflowTests(unittest.TestCase):
    def setUp(self):
        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(engine)
        self.session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
        session = self.session_factory()
        session.add(
            ProductModel(
                id="prod-test",
                sku="SKU-TEST",
                name="Test Milk",
                brand="Test",
                category="Dairy",
                price="₹64",
                price_num=64,
                aisle="Aisle 2",
                shelf="C2",
                stock_count=10,
                is_available=True,
                is_low_stock=False,
                backroom_stock=8,
                map_x=10,
                map_y=20,
            )
        )
        session.add(
            StaffModel(
                id="staff-test",
                employee_id="EMP-TEST",
                name="Test Associate",
                role="FLOOR_ASSOCIATE",
                zone="Dairy",
                status="AVAILABLE",
            )
        )
        session.commit()
        session.close()

        app = FastAPI()
        app.include_router(customer.router, prefix="/customer")
        app.include_router(staff.router, prefix="/staff")

        def override_db():
            db = self.session_factory()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_db
        self.client = TestClient(app)

    def test_customer_request_tracks_staff_and_two_way_messages(self):
        created = self.client.post(
            "/customer/assist",
            json={
                "request_type": "BACKROOM_REQUEST",
                "location_zone": "Dairy",
                "shelf_code": "C2",
                "product_id": "prod-test",
                "product_name": "Test Milk",
                "customer_notes": "Please check the backroom.",
            },
        )
        self.assertEqual(created.status_code, 200)
        request_id = created.json()["request_id"]

        shopper_message = self.client.post(
            f"/customer/assist/{request_id}/messages",
            json={"sender": "CUSTOMER", "text": "I am beside shelf C2."},
        )
        self.assertEqual(shopper_message.status_code, 200)

        accepted = self.client.patch(
            f"/staff/tasks/{request_id}/status",
            json={"status": "IN_PROGRESS", "assigned_staff_id": "staff-test"},
        )
        self.assertEqual(accepted.status_code, 200)
        self.assertEqual(accepted.json()["assigned_staff_name"], "Test Associate")

        associate_message = self.client.post(
            f"/customer/assist/{request_id}/messages",
            json={"sender": "ASSOCIATE", "text": "I am on my way."},
        )
        self.assertEqual(associate_message.status_code, 200)
        arrived = self.client.patch(
            f"/staff/tasks/{request_id}/status",
            json={"status": "ASSISTING"},
        )
        self.assertEqual(arrived.status_code, 200)

        live = self.client.get(f"/customer/assist/{request_id}")
        self.assertEqual(live.status_code, 200)
        self.assertEqual(live.json()["status"], "ASSISTING")
        self.assertEqual(
            [message["sender"] for message in live.json()["customer_request_data"]["messages"]],
            ["CUSTOMER", "ASSOCIATE"],
        )

        completed = self.client.patch(
            f"/staff/tasks/{request_id}/status",
            json={"status": "COMPLETED"},
        )
        self.assertEqual(completed.status_code, 200)
        db = self.session_factory()
        try:
            worker = db.get(StaffModel, "staff-test")
            self.assertEqual(worker.status, "AVAILABLE")
            self.assertEqual(worker.tasks_completed_today, 1)
        finally:
            db.close()


class InventoryMutationWorkflowTests(unittest.TestCase):
    def setUp(self):
        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(engine)
        self.session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
        session = self.session_factory()
        expires = datetime.now(timezone.utc) + timedelta(days=2)
        session.add(
            ProductModel(
                id="prod-waste",
                sku="SKU-WASTE",
                name="Waste Test Milk",
                stock_count=10,
                is_available=True,
                is_low_stock=False,
            )
        )
        session.add(
            ShelfModel(
                id="shelf-c2-test",
                code="C2",
                name="Shelf C2",
                current_skus_count=10,
                visible_units=10,
                capacity_count=20,
                availability=50,
                status="OPTIMAL",
                sku="SKU-WASTE",
            )
        )
        session.add(
            InventoryBatchModel(
                id="batch-waste",
                store_id="store-01",
                product_id="prod-waste",
                product_sku="SKU-WASTE",
                product_name="Waste Test Milk",
                category="Dairy",
                batch_number="BATCH-WASTE",
                quantity=10,
                shelf_quantity=6,
                backroom_quantity=4,
                expires_at=expires,
                storage_location_id="shelf-c2-test",
                shelf_id="shelf-c2-test",
                shelf_code="C2",
                unit_cost=40,
                unit_price=64,
                status="ACTIVE",
            )
        )
        session.commit()
        session.close()

        app = FastAPI()
        app.include_router(inventory.router, prefix="/inventory")

        def override_db():
            db = self.session_factory()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_db
        self.client = TestClient(app)

    def test_expiry_correction_and_waste_update_live_inventory(self):
        corrected = datetime.now(timezone.utc) + timedelta(days=5)
        response = self.client.patch(
            "/inventory/batches/batch-waste/expiry",
            json={
                "expires_at": corrected.isoformat(),
                "reason": "Package date checked",
                "staff_id": "staff-test",
            },
        )
        self.assertEqual(response.status_code, 200)

        waste = self.client.post(
            "/inventory/waste",
            json={
                "store_id": "store-01",
                "product_id": "prod-waste",
                "product_sku": "SKU-WASTE",
                "product_name": "Waste Test Milk",
                "batch_id": "batch-waste",
                "batch_number": "BATCH-WASTE",
                "quantity": 2,
                "reason": "DAMAGED",
                "recorded_by_staff_id": "staff-test",
                "recorded_by_staff_name": "Test Associate",
                "location_id": "C2",
                "location_name": "Shelf C2",
                "unit_cost": 40,
                "notes": "Damaged seal",
            },
        )
        self.assertEqual(waste.status_code, 200)
        self.assertEqual(waste.json()["remaining_quantity"], 8)

        db = self.session_factory()
        try:
            batch = db.get(InventoryBatchModel, "batch-waste")
            shelf = db.get(ShelfModel, "shelf-c2-test")
            product = db.get(ProductModel, "prod-waste")
            record = db.query(WasteRecordModel).one()
            self.assertEqual(batch.shelf_quantity, 4)
            self.assertEqual(shelf.visible_units, 8)
            self.assertEqual(product.stock_count, 8)
            self.assertEqual(record.total_loss_cost, 80)
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main()

