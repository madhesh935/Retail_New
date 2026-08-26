from sqlalchemy.orm import Session
from app.db.database import engine, Base, SessionLocal
from app.db.models import (
    StoreModel, ZoneModel, ShelfModel, ProductModel,
    QueueModel, StaffModel, StaffTaskModel, IncidentModel, Camera
)
import datetime

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    try:
        # 1. Seed Store Info
        if not db.query(StoreModel).first():
            store = StoreModel(
                id="store-blr-01",
                name="FreshMart Flagship — Koramangala, BLR",
                address="100 Feet Rd, Koramangala 4th Block, Bengaluru, KA 560034",
                current_occupancy=142,
                max_capacity=350,
                todays_total_footfall=1840,
                peak_occupancy_today=288,
                occupancy_rate=40.6,
                average_dwell_time_minutes=24
            )
            db.add(store)

        # 2. Seed Zones
        if db.query(ZoneModel).count() == 0:
            zones = [
                ZoneModel(id="zone-1", name="Entrance & Lobby Area", code="Z1", current_occupancy=18, max_capacity=50, congestion_level="LOW"),
                ZoneModel(id="zone-2", name="Fresh Produce & Fruits", code="Z2", current_occupancy=36, max_capacity=60, congestion_level="MEDIUM"),
                ZoneModel(id="zone-3", name="Dairy, Bakery & Chilled", code="Z3", current_occupancy=42, max_capacity=55, congestion_level="MEDIUM"),
                ZoneModel(id="zone-4", name="Beverages & Snacks Aisle", code="Z4", current_occupancy=28, max_capacity=50, congestion_level="LOW"),
                ZoneModel(id="zone-5", name="Household & Personal Care", code="Z5", current_occupancy=14, max_capacity=45, congestion_level="LOW"),
                ZoneModel(id="zone-6", name="Checkout & Front-End", code="Z6", current_occupancy=24, max_capacity=40, congestion_level="HIGH"),
            ]
            db.add_all(zones)

        # 3. Seed Shelves
        if db.query(ShelfModel).count() == 0:
            shelves = [
                ShelfModel(id="shelf-b4", code="B4", name="Shelf B4 — Beverage Zone", zone_id="zone-4", zone_name="Beverages & Snacks Aisle", aisle="Aisle 4 (Gondola B)", sku_name="Diet Coke 300ml Can", current_skus_count=14, capacity_count=20, compliance_score=84.0, status="LOW", availability=17.0, visible_units=3),
                ShelfModel(id="shelf-a1", code="A1", name="Shelf A1 — Produce Tier", zone_id="zone-2", zone_name="Fresh Produce & Fruits", aisle="Aisle 1 (Produce Island)", sku_name="Organic Shimla Apples (1kg)", current_skus_count=18, capacity_count=22, compliance_score=92.0, status="OPTIMAL", availability=92.0, visible_units=18),
                ShelfModel(id="shelf-c2", code="C2", name="Shelf C2 — Dairy Chiller", zone_id="zone-3", zone_name="Dairy, Bakery & Chilled", aisle="Cooler Wall Bay 2", sku_name="Heritage Fresh Whole Milk (1L)", current_skus_count=8, capacity_count=16, compliance_score=78.0, status="CRITICAL", availability=35.0, visible_units=6),
                ShelfModel(id="shelf-d1", code="D1", name="Shelf D1 — Bakery Rack", zone_id="zone-3", zone_name="Dairy, Bakery & Chilled", aisle="Bakery Display 1", sku_name="Artisan Sourdough Loaf", current_skus_count=15, capacity_count=15, compliance_score=98.0, status="OPTIMAL", availability=100.0, visible_units=15),
                ShelfModel(id="shelf-e3", code="E3", name="Shelf E3 — Personal Care Bay", zone_id="zone-5", zone_name="Household & Personal Care", aisle="Aisle 5 (Health & Care)", sku_name="Dove Deep Moisture Body Wash (250ml)", current_skus_count=22, capacity_count=25, compliance_score=94.0, status="OPTIMAL", availability=88.0, visible_units=22),
                ShelfModel(id="shelf-f2", code="F2", name="Shelf F2 — Household Cleaning", zone_id="zone-5", zone_name="Household & Personal Care", aisle="Aisle 6 (Cleaning Essentials)", sku_name="Surf Excel Matic Liquid (1L)", current_skus_count=12, capacity_count=18, compliance_score=86.0, status="OPTIMAL", availability=75.0, visible_units=12),
            ]
            db.add_all(shelves)

        # 4. Seed Products
        if db.query(ProductModel).count() == 0:
            products = [
                ProductModel(id="prod-milk", name="Heritage Fresh Whole Milk (1L)", brand="Heritage", category="Dairy & Chilled", price="₹68", price_num=68.0, aisle="Aisle 2", shelf="Shelf C2", stock_count=18, is_available=True, backroom_stock=24, map_x=142.0, map_y=220.0),
                ProductModel(id="prod-aavin-milk", name="Aavin Full Cream Milk (500ml)", brand="Aavin", category="Dairy & Chilled", price="₹34", price_num=34.0, aisle="Aisle 2", shelf="Shelf C3", stock_count=25, is_available=True, backroom_stock=40, map_x=142.0, map_y=230.0),
                ProductModel(id="prod-amul-butter", name="Amul Butter Pasteurized (100g)", brand="Amul", category="Dairy & Chilled", price="₹56", price_num=56.0, aisle="Aisle 2", shelf="Shelf C1", stock_count=32, is_available=True, backroom_stock=50, map_x=142.0, map_y=210.0),
                ProductModel(id="prod-bread", name="Modern 100% Whole Wheat Bread (400g)", brand="Modern", category="Bakery & Breakfast", price="₹45", price_num=45.0, aisle="Aisle 3", shelf="Shelf D1", stock_count=14, is_available=True, backroom_stock=20, map_x=220.0, map_y=160.0),
                ProductModel(id="prod-eggs", name="Farm Fresh White Eggs (Pack of 12)", brand="Eggoz", category="Dairy & Chilled", price="₹95", price_num=95.0, aisle="Aisle 2", shelf="Shelf C4", stock_count=22, is_available=True, backroom_stock=30, map_x=142.0, map_y=240.0),
                ProductModel(id="prod-apples", name="Organic Shimla Apples (1kg)", brand="FreshFarm", category="Fresh Produce", price="₹180", price_num=180.0, aisle="Aisle 1", shelf="Shelf A1", stock_count=28, is_available=True, backroom_stock=45, map_x=80.0, map_y=120.0),
                ProductModel(id="prod-bananas", name="Robusta Bananas (1 Dozen)", brand="FreshFarm", category="Fresh Produce", price="₹60", price_num=60.0, aisle="Aisle 1", shelf="Shelf A2", stock_count=35, is_available=True, backroom_stock=50, map_x=80.0, map_y=140.0),
                ProductModel(id="prod-tomatoes", name="Hybrid Red Tomatoes (1kg)", brand="FreshFarm", category="Fresh Produce", price="₹38", price_num=38.0, aisle="Aisle 1", shelf="Shelf A3", stock_count=40, is_available=True, backroom_stock=60, map_x=80.0, map_y=160.0),
                ProductModel(id="prod-rice", name="India Gate Basmati Rice Feast Rozzana (5kg)", brand="India Gate", category="Staples & Grains", price="₹420", price_num=420.0, aisle="Aisle 4", shelf="Shelf E1", stock_count=16, is_available=True, backroom_stock=25, map_x=300.0, map_y=200.0),
                ProductModel(id="prod-coke", name="Diet Coke 300ml Can", brand="Coca-Cola", category="Beverages & Snacks", price="₹40", price_num=40.0, aisle="Aisle 4", shelf="Shelf B4", stock_count=3, is_available=True, is_low_stock=True, backroom_stock=24, map_x=280.0, map_y=120.0),
                ProductModel(id="prod-surf", name="Surf Excel Matic Liquid (1L)", brand="Surf Excel", category="Household & Personal Care", price="₹220", price_num=220.0, aisle="Aisle 6", shelf="Shelf F2", stock_count=12, is_available=True, backroom_stock=18, map_x=380.0, map_y=280.0),
            ]
            db.add_all(products)

        # 5. Seed Queues
        if db.query(QueueModel).count() == 0:
            queues = [
                QueueModel(lane_code="C1", lane_number=1, name="Counter C1 (Assisted)", type="ASSISTED", status="CONGESTED", queue_length=8, wait_time_seconds=324, cashier_name="Elena Rostova", is_express=False),
                QueueModel(lane_code="C2", lane_number=2, name="Counter C2 (Assisted)", type="ASSISTED", status="ACTIVE", queue_length=2, wait_time_seconds=72, cashier_name="Marcus Chen", is_express=False),
                QueueModel(lane_code="C3", lane_number=3, name="Express Self-Checkout 1", type="EXPRESS_SELF", status="ACTIVE", queue_length=1, wait_time_seconds=48, cashier_name=None, is_express=True),
                QueueModel(lane_code="C4", lane_number=4, name="Express Self-Checkout 2", type="EXPRESS_SELF", status="STANDBY", queue_length=0, wait_time_seconds=0, cashier_name=None, is_express=True),
                QueueModel(lane_code="C5", lane_number=5, name="Express Self-Checkout 3", type="EXPRESS_SELF", status="CLOSED", queue_length=0, wait_time_seconds=0, cashier_name=None, is_express=True),
            ]
            db.add_all(queues)

        # 6. Seed Staff
        if db.query(StaffModel).count() == 0:
            staff_list = [
                StaffModel(id="staff-1", name="Elena Rostova", role="Cashier", zone="Checkout C1", status="BUSY", performance_score=94.0, tasks_completed_today=18),
                StaffModel(id="staff-2", name="Marcus Chen", role="Cashier", zone="Checkout C2", status="BUSY", performance_score=96.5, tasks_completed_today=14),
                StaffModel(id="staff-3", name="Priya Sharma", role="Floor Associate", zone="Produce & Dairy", status="AVAILABLE", performance_score=98.0, tasks_completed_today=12),
                StaffModel(id="staff-4", name="David Kim", role="Restock Specialist", zone="Backroom / Aisle 4", status="BUSY", performance_score=91.0, tasks_completed_today=9),
                StaffModel(id="staff-5", name="Aisha Patel", role="Shift Supervisor", zone="Storewide", status="AVAILABLE", performance_score=99.0, tasks_completed_today=21),
            ]
            db.add_all(staff_list)

        # 7. Seed Incidents
        if db.query(IncidentModel).count() == 0:
            incidents = [
                IncidentModel(
                    id="inc-001",
                    title="Queue Surge detected at Lane C1 (8 Shoppers)",
                    severity="CRITICAL",
                    type="QUEUE_CONGESTION",
                    zone="Checkout & Front-End",
                    status="ACTIVE",
                    recommendation_title="Open Express Lane C4 & reassign Floor Associate",
                    recommendation_action="OPEN_LANE_C4",
                    recommendation_state="PENDING"
                ),
                IncidentModel(
                    id="inc-002",
                    title="Low Stock Alert: Diet Coke 300ml (3 units left)",
                    severity="HIGH",
                    type="STOCK_DEPLETION",
                    zone="Beverages & Snacks Aisle",
                    status="ACTIVE",
                    recommendation_title="Dispatch David Kim to restock from Backroom Bay 4",
                    recommendation_action="RESTOCK_SHELF_B4",
                    recommendation_state="PENDING"
                ),
            ]
            db.add_all(incidents)

        db.commit()
        print("Database initialized & seeded successfully with real baseline store records!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()
