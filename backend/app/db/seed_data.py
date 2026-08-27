from __future__ import annotations

from datetime import datetime, timedelta, timezone
from math import hypot
from typing import Any


STORE_ID = "store-01"
SEED_VERSION = "retail-platform-2026-08-v8-waste-barcodes"


def build_seed_data(now: datetime | None = None) -> dict[str, list[dict[str, Any]]]:
    """Build one coherent operational snapshot used by every platform module."""
    now = now or datetime.now(timezone.utc)

    stores = [
        {
            "id": STORE_ID,
            "code": "STORE-01-CHN",
            "name": "FreshMart Flagship — Chennai Central",
            "address": "Anna Salai, Thousand Lights, Chennai, Tamil Nadu 600006",
            "is_open": True,
            "edge_ai_status": "ACTIVE",
            "current_occupancy": 142,
            "max_capacity": 350,
            "todays_total_footfall": 1840,
            "peak_occupancy_today": 288,
            "occupancy_rate": 40.6,
            "average_dwell_time_minutes": 24,
        }
    ]

    zone_specs = [
        ("zone-1", "Main Entrance & Lobby", "Z-ENTRANCE", "Entrance", 14, 50, "LOW", 45, 0, (50, 10, 40, 25)),
        ("zone-2", "Fresh Produce & Fruits", "Z-PRODUCE", "Grocery", 28, 60, "MEDIUM", 420, 1, (10, 40, 35, 45)),
        ("zone-3", "Dairy, Bakery & Chilled", "Z-DAIRY", "Perishables", 22, 50, "MEDIUM", 310, 1, (50, 40, 40, 45)),
        ("zone-4", "Beverages & Snacks Aisle", "Z-SNACKS", "Packaged Goods", 31, 55, "HIGH", 380, 2, (95, 40, 35, 45)),
        ("zone-5", "Household & Personal Care", "Z-HOUSEHOLD", "FMCG", 18, 45, "LOW", 290, 0, (10, 90, 35, 40)),
        ("zone-6", "Electronics & Gadgets", "Z-ELEC", "High-Value", 9, 30, "LOW", 540, 0, (50, 90, 40, 40)),
        ("zone-7", "Checkout Lanes & Express", "Z-CHECKOUT", "Billing", 20, 60, "HIGH", 150, 2, (95, 90, 35, 40)),
        ("zone-stockroom", "Stockroom & Receiving", "Z-STOCK", "Backroom", 0, 25, "LOW", 0, 0, (5, 135, 45, 25)),
    ]
    zones = [
        {
            "id": zone_id,
            "name": name,
            "code": code,
            "category": category,
            "current_occupancy": occupancy,
            "max_capacity": capacity,
            "congestion_level": congestion,
            "avg_dwell_time_seconds": dwell,
            "alert_count": alerts,
            "coordinates": {"x": x, "y": y, "width": width, "height": height},
        }
        for zone_id, name, code, category, occupancy, capacity, congestion, dwell, alerts, (x, y, width, height) in zone_specs
    ]

    def shelf(
        code: str,
        zone_id: str,
        zone_name: str,
        aisle: str,
        sku: str,
        product: str,
        brand: str,
        category: str,
        price: float,
        visible: int,
        capacity: int,
        status: str,
        compliance: float,
        camera: str,
        backroom: int,
        depletion: float = 0.0,
        minutes: int | None = None,
        misplaced: bool = False,
    ) -> dict[str, Any]:
        availability = round((visible / capacity) * 100, 1) if capacity else 0.0
        return {
            "id": f"shelf-{code.lower()}",
            "code": code,
            "name": f"Shelf {code} — {product}",
            "zone_id": zone_id,
            "zone_name": zone_name,
            "aisle": aisle,
            "sku": sku,
            "sku_name": product,
            "brand": brand,
            "category": category,
            "unit_price": price,
            "current_skus_count": visible,
            "capacity_count": capacity,
            "compliance_score": compliance,
            "status": status,
            "availability": availability,
            "visible_units": visible,
            "facing_capacity": 4,
            "current_facings": min(4, max(0, round(visible / max(capacity, 1) * 4))),
            "is_misplaced": misplaced,
            "confidence_score": 0.94,
            "camera_code": camera,
            "backroom_units": backroom,
            "depletion_rate_per_hour": depletion,
            "minutes_until_stockout": minutes,
        }

    shelves = [
        shelf("A1", "zone-2", "Fresh Produce & Fruits", "Aisle 1 Produce Island", "SKU-PROD-101", "Royal Gala Organic Apples 1kg", "Nature's Farm", "Fresh Produce", 180, 3, 40, "CRITICAL", 68, "CAM-02", 45, 4.8, 38),
        shelf("A2", "zone-2", "Fresh Produce & Fruits", "Aisle 1 Produce Island", "SKU-PROD-502", "Hydroponic Strawberries 250g", "FreshFarm", "Fresh Produce", 120, 5, 20, "LOW", 90, "CAM-02", 0, 1.2, 250),
        shelf("A3", "zone-2", "Fresh Produce & Fruits", "Aisle 1 Produce Island", "SKU-PROD-303", "Hybrid Red Tomatoes 1kg", "FreshFarm", "Fresh Produce", 38, 32, 40, "OPTIMAL", 96, "CAM-02", 60),
        shelf("A4", "zone-2", "Fresh Produce & Fruits", "Aisle 1 Produce Island", "SKU-PROD-604", "Honeycrisp Farm Apples 1kg", "Orchard Select", "Fresh Produce", 225, 30, 60, "OPTIMAL", 94, "CAM-02", 30),
        shelf("B1", "zone-4", "Beverages & Snacks Aisle", "Aisle 4 Cold Beverages", "SKU-BEV-101", "Sparkling Mineral Water 1L", "AquaPure", "Beverages", 55, 32, 40, "OPTIMAL", 95, "CAM-04", 38),
        shelf("B2", "zone-4", "Beverages & Snacks Aisle", "Aisle 4 Snacks Gondola", "SKU-SNK-402", "Roasted Almonds 200g", "NutriChoice", "Snacks", 210, 6, 25, "LOW", 72, "CAM-04", 18, 2.1, 171, True),
        shelf("B3", "zone-4", "Beverages & Snacks Aisle", "Aisle 4 Cold Beverages", "SKU-BEV-304", "Organic Orange Juice 1L", "Fresh Press", "Beverages", 145, 0, 24, "OUT_OF_STOCK", 91, "CAM-04", 0),
        shelf("B4", "zone-4", "Beverages & Snacks Aisle", "Aisle 4 Beverage Gondola", "SKU-BEV-1029", "Sparkling Cola Zero 12-Pack", "Wave Beverage", "Beverages", 399, 3, 18, "CRITICAL", 84, "CAM-04", 24, 20.0, 9),
        shelf("B5", "zone-4", "Beverages & Snacks Aisle", "Aisle 4 Beverage Gondola", "SKU-BEV-207", "Orange Juice 1L", "Real", "Beverages", 125, 14, 20, "OPTIMAL", 93, "CAM-04", 24),
        shelf("B6", "zone-4", "Beverages & Snacks Aisle", "Aisle 4 Beverage Gondola", "SKU-BEV-506", "Sparkling Water 500ml", "AquaPure", "Beverages", 35, 18, 24, "OPTIMAL", 91, "CAM-04", 36),
        shelf("C1", "zone-3", "Dairy, Bakery & Chilled", "Dairy Cooler Wall Bay 1", "SKU-DAIRY-401", "Farm Fresh Organic Eggs 6-Pack", "Eggoz", "Dairy", 65, 2, 18, "CRITICAL", 88, "CAM-03", 0, 0.5, 240),
        shelf("C2", "zone-3", "Dairy, Bakery & Chilled", "Dairy Cooler Wall Bay 2", "SKU-DAIRY-101", "Fresh Whole Milk 1L", "Heritage", "Dairy", 64, 6, 24, "LOW", 78, "CAM-03", 28, 6.2, 58),
        shelf("C3", "zone-3", "Dairy, Bakery & Chilled", "Dairy Cooler Wall Bay 3", "SKU-DAIRY-305", "Organic Malai Paneer 200g", "Milky Mist", "Dairy", 95, 10, 18, "OPTIMAL", 94, "CAM-03", 5),
        shelf("C4", "zone-3", "Dairy, Bakery & Chilled", "Dairy Cooler Wall Bay 4", "SKU-DAIRY-204", "Greek Style Yogurt 500g", "Epigamia", "Dairy", 80, 12, 20, "OPTIMAL", 96, "CAM-03", 0),
        shelf("C5", "zone-3", "Dairy, Bakery & Chilled", "Chilled Deli Bay 5", "SKU-MEAT-601", "Smoked Honey Ham Slices 200g", "DeliCraft", "Meat & Chilled", 175, 8, 16, "OPTIMAL", 93, "CAM-03", 6),
        shelf("D1", "zone-3", "Dairy, Bakery & Chilled", "Bakery Display 1", "SKU-BAK-301", "Whole Wheat Farm Bread 400g", "Modern", "Bakery", 45, 6, 20, "LOW", 92, "CAM-03", 0, 1.1, 327),
        shelf("D2", "zone-3", "Dairy, Bakery & Chilled", "Ready-to-Eat Chiller", "SKU-RTE-401", "Chicken Caesar Salad 320g", "FreshBowl", "Ready-to-Eat", 155, 8, 12, "OPTIMAL", 95, "CAM-03", 0),
        shelf("D3", "zone-4", "Beverages & Snacks Aisle", "Aisle 4 Breakfast & Pantry", "SKU-BRK-303", "Crunchy Honey Oat Granola 500g", "Morning Harvest", "Breakfast", 285, 20, 40, "OPTIMAL", 92, "CAM-04", 20),
        shelf("D4", "zone-4", "Beverages & Snacks Aisle", "Aisle 4 Snacks Gondola", "SKU-SNK-404", "Kettle Cooked Potato Chips 150g", "Kettle Craft", "Snacks", 85, 8, 22, "LOW", 88, "CAM-04", 14, 1.4, 28),
        shelf("D5", "zone-5", "Household & Personal Care", "Aisle 6 Hair Care", "SKU-PC-355", "Sunsilk Soft & Smooth Shampoo 350ml", "Sunsilk", "Personal Care", 215, 12, 20, "OPTIMAL", 94, "CAM-05", 10),
        shelf("D6", "zone-5", "Household & Personal Care", "Aisle 6 Hair Care", "SKU-PC-366", "Pantene Silky Smooth Shampoo 340ml", "Pantene", "Personal Care", 260, 9, 18, "OPTIMAL", 93, "CAM-05", 8),
        shelf("E1", "zone-5", "Household & Personal Care", "Aisle 5 Staples", "SKU-STP-501", "Basmati Rice Rozzana 5kg", "India Gate", "Staples & Grains", 420, 16, 20, "OPTIMAL", 97, "CAM-05", 25),
        shelf("E3", "zone-5", "Household & Personal Care", "Aisle 5 Personal Care", "SKU-PC-253", "Deep Moisture Body Wash 250ml", "Dove", "Personal Care", 210, 22, 25, "OPTIMAL", 94, "CAM-05", 16),
        shelf("F2", "zone-5", "Household & Personal Care", "Aisle 6 Cleaning Essentials", "SKU-HH-602", "Matic Liquid Detergent 1L", "Surf Excel", "Household", 220, 12, 18, "OPTIMAL", 86, "CAM-05", 18),
        shelf("G1", "zone-6", "Electronics & Gadgets", "Electronics Display 1", "SKU-EL-101", "USB-C 30W Fast Charger", "VoltEdge", "Electronics", 1299, 8, 12, "OPTIMAL", 98, "CAM-05", 10),
        shelf("G2", "zone-6", "Electronics & Gadgets", "Electronics Display 2", "SKU-EL-102", "Braided USB-C Cable 1.5m", "VoltEdge", "Electronics", 499, 14, 20, "OPTIMAL", 97, "CAM-05", 20),
    ]

    def product(
        product_id: str,
        sku: str,
        name: str,
        brand: str,
        category: str,
        price: float,
        aisle: str,
        shelf_code: str,
        stock: int,
        backroom: int,
        x: float,
        y: float,
        alternatives: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        return {
            "id": product_id,
            "sku": sku,
            "name": name,
            "description": f"{brand} {category.lower()} product stocked at Shelf {shelf_code}.",
            "brand": brand,
            "category": category,
            "price": f"₹{price:g}",
            "price_num": price,
            "aisle": aisle,
            "shelf": f"Shelf {shelf_code}",
            "stock_count": stock,
            "is_available": stock > 0,
            "is_low_stock": stock <= 6,
            "backroom_stock": backroom,
            "map_x": x,
            "map_y": y,
            "alternatives": alternatives or [],
        }

    products = [
        product("prod-apples", "SKU-PROD-101", "Royal Gala Organic Apples 1kg", "Nature's Farm", "Fresh Produce", 180, "Aisle 1", "A1", 3, 45, 80, 120),
        product("prod-strawberries", "SKU-PROD-502", "Hydroponic Strawberries 250g", "FreshFarm", "Fresh Produce", 120, "Aisle 1", "A2", 5, 0, 80, 140),
        product("prod-bananas", "SKU-PROD-202", "Robusta Bananas 1 Dozen", "FreshFarm", "Fresh Produce", 60, "Aisle 1", "A2", 35, 50, 80, 145),
        product("prod-tomatoes", "SKU-PROD-303", "Hybrid Red Tomatoes 1kg", "FreshFarm", "Fresh Produce", 38, "Aisle 1", "A3", 32, 60, 80, 160),
        product("prod-milk", "SKU-DAIRY-101", "Fresh Whole Milk 1L", "Heritage", "Dairy", 64, "Aisle 2", "C2", 6, 28, 142, 220, [{"productId": "prod-aavin-milk", "name": "Aavin Full Cream Milk 500ml", "price": 34}]),
        product("prod-aavin-milk", "SKU-DAIRY-102", "Aavin Full Cream Milk 500ml", "Aavin", "Dairy", 34, "Aisle 2", "C2", 25, 40, 142, 225),
        product("prod-amul-butter", "SKU-DAIRY-150", "Amul Pasteurised Butter 100g", "Amul", "Dairy", 56, "Aisle 2", "C3", 32, 50, 142, 228),
        product("prod-yogurt", "SKU-DAIRY-204", "Greek Style Yogurt 500g", "Epigamia", "Dairy", 80, "Aisle 2", "C4", 12, 0, 142, 235),
        product("prod-paneer", "SKU-DAIRY-305", "Organic Malai Paneer 200g", "Milky Mist", "Dairy", 95, "Aisle 2", "C3", 10, 5, 142, 230),
        product("prod-eggs", "SKU-DAIRY-401", "Farm Fresh Organic Eggs 6-Pack", "Eggoz", "Dairy", 65, "Aisle 2", "C1", 2, 0, 142, 210),
        product("prod-bread", "SKU-BAK-301", "Whole Wheat Farm Bread 400g", "Modern", "Bakery", 45, "Aisle 3", "D1", 6, 0, 220, 160),
        product("prod-sourdough", "SKU-BAK-334", "Artisan Stoneground Sourdough Loaf", "OvenCraft", "Bakery", 145, "Aisle 3", "D1", 15, 12, 220, 165),
        product("prod-salad", "SKU-RTE-401", "Chicken Caesar Salad 320g", "FreshBowl", "Ready-to-Eat", 155, "Aisle 3", "D2", 8, 0, 220, 175),
        product("prod-ham", "SKU-MEAT-601", "Smoked Honey Ham Slices 200g", "DeliCraft", "Meat & Chilled", 175, "Aisle 2", "C5", 8, 6, 142, 245),
        product("prod-almonds", "SKU-SNK-402", "Roasted Almonds 200g", "NutriChoice", "Snacks", 210, "Aisle 4", "B2", 6, 18, 275, 115),
        product("prod-coke", "SKU-BEV-1029", "Sparkling Cola Zero 12-Pack", "Wave Beverage", "Beverages", 399, "Aisle 4", "B4", 3, 24, 280, 120, [{"productId": "prod-sparkling-water", "name": "Sparkling Water 500ml", "price": 35}]),
        product("prod-sparkling-water", "SKU-BEV-506", "Sparkling Water 500ml", "AquaPure", "Beverages", 35, "Aisle 4", "B6", 18, 36, 285, 120),
        product("prod-orange-juice", "SKU-BEV-207", "Orange Juice 1L", "Real", "Beverages", 125, "Aisle 4", "B5", 14, 24, 282, 125),
        product("prod-rice", "SKU-STP-501", "Basmati Rice Rozzana 5kg", "India Gate", "Staples & Grains", 420, "Aisle 5", "E1", 16, 25, 300, 200),
        product("prod-bodywash", "SKU-PC-253", "Deep Moisture Body Wash 250ml", "Dove", "Personal Care", 210, "Aisle 5", "E3", 22, 16, 350, 240),
        product("prod-surf", "SKU-HH-602", "Matic Liquid Detergent 1L", "Surf Excel", "Household", 220, "Aisle 6", "F2", 12, 18, 380, 280),
        product("prod-charger", "SKU-EL-101", "USB-C 30W Fast Charger", "VoltEdge", "Electronics", 1299, "Electronics", "G1", 8, 10, 420, 210),
        product("prod-cable", "SKU-EL-102", "Braided USB-C Cable 1.5m", "VoltEdge", "Electronics", 499, "Electronics", "G2", 14, 20, 425, 215),
    ]

    # Products referenced directly by the customer PWA and inventory widgets.
    # Keeping these in SQLite removes the need for UI-only fallback catalog rows.
    products.extend([
        product("prod-amul-taaza", "SKU-DAIRY-103", "Amul Taaza Homogenised Toned Milk 1L", "Amul", "Dairy", 72, "Aisle 2", "C4", 3, 18, 0, 0),
        product("prod-amul-100", "SKU-DAIRY-151", "Amul Butter 100g Mini Pack", "Amul", "Dairy", 58, "Aisle 2", "C1", 22, 24, 0, 0),
        # Shelf codes must match navigation nodes / zone map (A=produce, B=bev/snacks,
        # C=dairy, D1–D2=bakery, D3–D4=snacks, E=staples, F/G=personal care).
        product("prod-tea", "SKU-BEV-TEA-501", "Tata Tea Gold Premium Black Tea 500g", "Tata Tea", "Beverages", 310, "Aisle 4", "B5", 16, 20, 0, 0),
        product("prod-biscuits", "SKU-SNK-BIS-250", "Britannia NutriChoice Digestive Biscuits 250g", "Britannia", "Snacks & Pantry", 65, "Aisle 4", "B2", 2, 24, 0, 0),
        product("prod-marie-gold", "SKU-SNK-MAR-300", "Britannia Marie Gold Biscuits 300g", "Britannia", "Snacks & Pantry", 55, "Aisle 4", "D3", 25, 18, 0, 0),
        product("prod-parle-g", "SKU-SNK-PAR-250", "Parle-G Glucose Biscuits 250g", "Parle", "Snacks & Pantry", 40, "Aisle 4", "D4", 30, 30, 0, 0),
        product("prod-lays", "SKU-SNK-LAY-050", "Lay's Classic Salted Potato Chips 50g", "Lay's", "Snacks & Pantry", 20, "Aisle 4", "B6", 40, 36, 0, 0),
        product("prod-haldirams", "SKU-SNK-HAL-200", "Haldiram's Nagpur Aloo Bhujia 200g", "Haldiram's", "Snacks & Pantry", 95, "Aisle 4", "B3", 15, 22, 0, 0),
        product("prod-juice", "SKU-BEV-REAL-1L", "Real Fruit Power Mixed Fruit Juice 1L", "Real", "Beverages", 110, "Aisle 4", "B1", 18, 24, 0, 0),
        product("prod-dove", "SKU-PC-DOVE-340", "Dove Daily Moisture Shampoo 340ml", "Dove", "Personal Care & Hair", 245, "Aisle 6", "F2", 7, 16, 0, 0),
        product("prod-sunsilk", "SKU-PC-SUN-350", "Sunsilk Soft & Smooth Shampoo 350ml", "Sunsilk", "Personal Care & Hair", 215, "Aisle 6", "D5", 12, 10, 0, 0),
        product("prod-pantene", "SKU-PC-PAN-340", "Pantene Silky Smooth Care Shampoo 340ml", "Pantene", "Personal Care & Hair", 260, "Aisle 6", "D6", 9, 8, 0, 0),
        product("prod-pasta", "SKU-STP-PAS-500", "Barilla Penne Rigate Durum Wheat Pasta 500g", "Barilla", "Grains & Staples", 195, "Aisle 5", "E1", 14, 20, 0, 0),
        product("prod-pasta-sauce", "SKU-STP-SAU-500", "Del Monte Traditional Pasta Sauce 500g", "Del Monte", "Grains & Staples", 145, "Aisle 5", "E3", 11, 14, 0, 0),
        product("prod-cheese", "SKU-DAIRY-CHS-200", "Amul Processed Cheese Slices 200g", "Amul", "Dairy", 140, "Aisle 2", "C5", 16, 12, 0, 0),
        product("prod-britannia-bread", "SKU-BAK-BRI-400", "Britannia 100% Whole Wheat Bread 400g", "Britannia", "Bakery", 48, "Aisle 3", "D1", 14, 8, 0, 0),
        product("prod-valencia-oranges", "SKU-PROD-VAL-1K", "Valencia Seedless Oranges 1kg", "FreshFarm", "Fresh Produce", 165, "Aisle 1", "A2", 24, 26, 0, 0),
        product("prod-hass-avocados", "SKU-PROD-AVO-004", "Organic Hass Avocados 4-Pack", "Nature's Farm", "Fresh Produce", 240, "Aisle 1", "A3", 12, 18, 0, 0),
        product("prod-honeycrisp-apples", "SKU-PROD-HON-1K", "Honeycrisp Farm Apples 1kg", "Orchard Select", "Fresh Produce", 225, "Aisle 1", "A4", 30, 30, 0, 0),
        product("prod-mineral-water", "SKU-BEV-MIN-1L", "Sparkling Mineral Water 1L", "AquaPure", "Beverages", 55, "Aisle 4", "B1", 32, 38, 0, 0),
        product("prod-sports-drink", "SKU-BEV-SPT-500", "Electrolyte Sports Drink Blue 500ml", "HydraMax", "Beverages", 75, "Aisle 4", "B2", 4, 16, 0, 0),
        product("prod-green-tea", "SKU-BEV-GRN-500", "Zero Calorie Green Tea 500ml", "Leaf Zero", "Beverages", 60, "Aisle 4", "B3", 26, 29, 0, 0),
        product("prod-horizon-milk", "SKU-DAIRY-HOR-1G", "Horizon Organic Whole Milk 1Gal", "Horizon", "Dairy", 520, "Aisle 2", "C2", 0, 24, 0, 0),
        product("prod-vanilla-yogurt", "SKU-DAIRY-VAN-32", "Greek Yogurt Vanilla 32oz", "Epigamia", "Dairy", 195, "Aisle 2", "C1", 8, 17, 0, 0),
        product("prod-brioche-rolls", "SKU-BAK-BRIO-006", "French Brioche Rolls 6pk", "OvenCraft", "Bakery", 120, "Aisle 3", "D2", 18, 6, 0, 0),
        product("prod-tortilla-chips", "SKU-SNK-TOR-200", "Organic Tortilla Sea Salt Chips 200g", "Nature's Basket", "Snacks", 135, "Aisle 4", "D4", 28, 32, 0, 0),
        product("prod-granola", "SKU-BRK-GRA-500", "Crunchy Honey Oat Granola 500g", "Morning Harvest", "Breakfast", 285, "Aisle 4", "D3", 20, 20, 0, 0),
        product("prod-kettle-chips", "SKU-SNK-KET-150", "Kettle Cooked Potato Chips 150g", "Kettle Craft", "Snacks", 85, "Aisle 4", "D4", 8, 14, 0, 0),
        product("prod-organic-orange-juice", "SKU-BEV-OJ-1L", "Organic Orange Juice 1L", "Fresh Press", "Beverages", 145, "Aisle 4", "B5", 0, 0, 0, 0),
        product("prod-whole-almonds", "SKU-SNK-WAL-200", "Whole Roasted Almonds 200g", "NutriChoice", "Snacks", 210, "Aisle 4", "D3", 5, 18, 0, 0),
        product("prod-lactose-free-milk", "SKU-DAIRY-LFM-1L", "Lactose-Free Organic Milk 1L", "Organic Valley", "Dairy", 110, "Aisle 2", "C2", 9, 12, 0, 0),
    ])

    # Customer navigation uses the same 600 x 420 coordinate grid as the PWA map.
    # Product pins are kept at their shelf destination so catalog and routing data agree.
    shelf_coordinates = {
        "A1": (140, 105), "A2": (180, 105), "A3": (195, 120), "A4": (200, 130),
        "B1": (240, 220), "B2": (250, 235), "B3": (265, 220), "B4": (275, 235), "B5": (290, 235), "B6": (300, 250),
        "C1": (135, 225), "C2": (165, 235), "C3": (190, 225), "C4": (190, 245), "C5": (165, 260),
        "D1": (250, 105), "D2": (290, 105), "D3": (290, 245), "D4": (300, 255), "D5": (350, 235), "D6": (410, 235),
        "E1": (360, 105), "E3": (400, 105),
        "F2": (385, 235), "G1": (405, 225), "G2": (410, 250),
    }
    for product_row in products:
        shelf_code = product_row["shelf"].removeprefix("Shelf ")
        if shelf_code in shelf_coordinates:
            product_row["map_x"], product_row["map_y"] = shelf_coordinates[shelf_code]

    items = [
        {
            "id": index,
            "name": product_row["name"],
            "description": (
                f"{product_row['description']} SKU {product_row['sku']}; "
                f"{product_row['aisle']}, {product_row['shelf']}."
            ),
            "price": int(round(product_row["price_num"])),
            "is_synced": True,
        }
        for index, product_row in enumerate(products, start=1)
    ]

    layout_id = "layout-store-01-ground"
    layouts = [
        {
            "id": layout_id,
            "store_id": STORE_ID,
            "name": "FreshMart Chennai Central — Ground Floor",
            "floor_number": 0,
            "width": 600,
            "height": 420,
            "coordinate_unit": "svg_unit",
            "meters_per_unit": 0.25,
            "entrance_node_id": "nav-entry-main",
            "default_checkout_node_id": "nav-checkout-c2",
            "version": "2026.08.1",
            "is_active": True,
            "details": {
                "orientation": "north-up",
                "customer_map_view_box": "0 0 600 420",
                "walking_speed_meters_per_second": 1.2,
            },
        }
    ]

    area_specs = [
        ("area-help", "zone-1", "HELP", "Customer Service", "SERVICE", 18, 62, 75, 55, "#E0F2FE", 1, True),
        ("area-restrooms", "zone-1", "WC", "Accessible Restrooms", "AMENITY", 18, 185, 75, 55, "#F8FAFC", 2, True),
        ("area-entry", "zone-1", "ENTRY", "Main Entrance & Basket Corral", "ENTRANCE", 18, 318, 85, 78, "#ECFDF5", 3, True),
        ("area-aisle-1", "zone-2", "A1", "Aisle 1 — Fresh Produce", "AISLE", 115, 60, 90, 80, "#ECFDF5", 10, True),
        ("area-aisle-2", "zone-3", "A2", "Aisle 2 — Dairy & Chilled", "AISLE", 115, 185, 90, 88, "#E0F2FE", 20, True),
        ("area-aisle-3", "zone-3", "A3", "Aisle 3 — Bakery & Ready-to-Eat", "AISLE", 225, 60, 90, 80, "#FEF3C7", 30, True),
        ("area-aisle-4", "zone-4", "A4", "Aisle 4 — Snacks & Beverages", "AISLE", 225, 185, 90, 88, "#FEF3C7", 40, True),
        ("area-aisle-5", "zone-5", "A5", "Aisle 5 — Staples & Personal Care", "AISLE", 335, 60, 90, 80, "#F0FDF4", 50, True),
        ("area-aisle-6", "zone-5", "A6", "Aisle 6 — Household & Electronics", "AISLE", 335, 185, 90, 88, "#F3E8FF", 60, True),
        ("area-checkout", "zone-7", "CHECKOUT", "Checkout Lanes C1–C5", "CHECKOUT", 455, 60, 115, 215, "#F8FAFC", 70, True),
        ("area-stockroom", "zone-stockroom", "STOCK", "Stockroom & Receiving", "BACKROOM", 465, 318, 105, 78, "#E2E8F0", 80, False),
    ]
    areas = [
        {
            "id": area_id,
            "layout_id": layout_id,
            "zone_id": zone_id,
            "code": code,
            "name": name,
            "area_type": area_type,
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "fill_color": color,
            "sort_order": sort_order,
            "customer_accessible": customer_accessible,
            "details": {},
        }
        for area_id, zone_id, code, name, area_type, x, y, width, height, color, sort_order, customer_accessible in area_specs
    ]

    def nav_node(
        node_id: str,
        code: str,
        label: str,
        node_type: str,
        x: float,
        y: float,
        zone_id: str | None = None,
        *,
        shelf_code: str | None = None,
        product_id: str | None = None,
        lane_code: str | None = None,
        customer_accessible: bool = True,
        details: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        return {
            "id": node_id,
            "layout_id": layout_id,
            "code": code,
            "label": label,
            "node_type": node_type,
            "x": x,
            "y": y,
            "zone_id": zone_id,
            "shelf_code": shelf_code,
            "product_id": product_id,
            "lane_code": lane_code,
            "accessible": True,
            "customer_accessible": customer_accessible,
            "details": details or {},
        }

    nodes = [
        nav_node("nav-entry-main", "ENTRY", "Main Entrance", "ENTRANCE", 75, 345, "zone-1", details={"landmark": "Automatic glass doors", "start_point": True}),
        nav_node("nav-south-0", "S0", "Entrance Concourse West", "INTERSECTION", 75, 295, "zone-1"),
        nav_node("nav-south-1", "S1", "Checkout Concourse at Aisle 2", "INTERSECTION", 165, 295, "zone-3"),
        nav_node("nav-south-2", "S2", "Checkout Concourse at Aisle 4", "INTERSECTION", 275, 295, "zone-4"),
        nav_node("nav-south-3", "S3", "Checkout Concourse at Aisle 6", "INTERSECTION", 385, 295, "zone-5"),
        nav_node("nav-south-4", "S4", "Checkout Concourse East", "INTERSECTION", 485, 295, "zone-7"),
        nav_node("nav-central-0", "C0", "Central Aisle West", "INTERSECTION", 75, 160, "zone-1"),
        nav_node("nav-central-1", "C1X", "Central Aisle at Aisles 1–2", "INTERSECTION", 165, 160, "zone-3"),
        nav_node("nav-central-2", "C2X", "Central Aisle at Aisles 3–4", "INTERSECTION", 275, 160, "zone-4"),
        nav_node("nav-central-3", "C3X", "Central Aisle at Aisles 5–6", "INTERSECTION", 385, 160, "zone-5"),
        nav_node("nav-central-4", "C4X", "Central Aisle at Checkout", "INTERSECTION", 485, 160, "zone-7"),
        nav_node("nav-north-0", "N0", "North Concourse West", "INTERSECTION", 75, 40, "zone-1"),
        nav_node("nav-north-1", "N1", "North Concourse at Aisle 1", "INTERSECTION", 165, 40, "zone-2"),
        nav_node("nav-north-2", "N2", "North Concourse at Aisle 3", "INTERSECTION", 275, 40, "zone-3"),
        nav_node("nav-north-3", "N3", "North Concourse at Aisle 5", "INTERSECTION", 385, 40, "zone-5"),
        nav_node("nav-north-4", "N4", "North Concourse East", "INTERSECTION", 485, 40, "zone-7"),
        nav_node("nav-help-desk", "HELP", "Customer Service Desk", "SERVICE", 55, 90, "zone-1"),
        nav_node("nav-restrooms", "WC", "Accessible Restrooms", "AMENITY", 55, 210, "zone-1"),
    ]
    shelf_zone = {
        "A1": "zone-2", "A2": "zone-2", "A3": "zone-2", "A4": "zone-2",
        "B1": "zone-4", "B2": "zone-4", "B3": "zone-4", "B4": "zone-4", "B5": "zone-4", "B6": "zone-4",
        "C1": "zone-3", "C2": "zone-3", "C3": "zone-3", "C4": "zone-3", "C5": "zone-3",
        "D1": "zone-3", "D2": "zone-3", "D3": "zone-4", "D4": "zone-4", "D5": "zone-5", "D6": "zone-5", "E1": "zone-5", "E3": "zone-5",
        "F2": "zone-5", "G1": "zone-6", "G2": "zone-6",
    }
    for shelf_code, (x, y) in shelf_coordinates.items():
        nodes.append(nav_node(
            f"nav-shelf-{shelf_code.lower()}",
            shelf_code,
            f"Shelf {shelf_code}",
            "SHELF",
            x,
            y,
            shelf_zone[shelf_code],
            shelf_code=shelf_code,
            details={"landmark": f"Look for the {shelf_code} shelf marker"},
        ))
    for lane_code, y in [("C1", 110), ("C2", 165), ("C3", 220), ("C4", 250), ("C5", 265)]:
        nodes.append(nav_node(
            f"nav-checkout-{lane_code.lower()}",
            f"CHECKOUT-{lane_code}",
            f"Checkout {lane_code}",
            "CHECKOUT",
            505 if lane_code != "C5" else 545,
            y,
            "zone-7",
            lane_code=lane_code,
        ))

    node_positions = {node["id"]: (node["x"], node["y"]) for node in nodes}

    def nav_edge(
        edge_id: str,
        from_node_id: str,
        to_node_id: str,
        instructions: str,
        *,
        status: str = "OPEN",
        accessible: bool = True,
    ) -> dict[str, Any]:
        from_x, from_y = node_positions[from_node_id]
        to_x, to_y = node_positions[to_node_id]
        distance = round(hypot(to_x - from_x, to_y - from_y) * 0.25, 1)
        return {
            "id": edge_id,
            "layout_id": layout_id,
            "from_node_id": from_node_id,
            "to_node_id": to_node_id,
            "distance_meters": distance,
            "estimated_seconds": max(1, round(distance / 1.2)),
            "bidirectional": True,
            "accessible": accessible,
            "status": status,
            "instructions": instructions,
            "details": {},
        }

    edge_specs = [
        ("edge-entry-s0", "nav-entry-main", "nav-south-0", "Walk straight from the automatic entry doors."),
        ("edge-s0-s1", "nav-south-0", "nav-south-1", "Continue east along the checkout concourse."),
        ("edge-s1-s2", "nav-south-1", "nav-south-2", "Continue east along the checkout concourse."),
        ("edge-s2-s3", "nav-south-2", "nav-south-3", "Continue east along the checkout concourse."),
        ("edge-s3-s4", "nav-south-3", "nav-south-4", "Continue east toward checkout."),
        ("edge-c0-c1", "nav-central-0", "nav-central-1", "Continue east along the central aisle."),
        ("edge-c1-c2", "nav-central-1", "nav-central-2", "Continue east along the central aisle."),
        ("edge-c2-c3", "nav-central-2", "nav-central-3", "Continue east along the central aisle."),
        ("edge-c3-c4", "nav-central-3", "nav-central-4", "Continue east along the central aisle."),
        ("edge-n0-n1", "nav-north-0", "nav-north-1", "Continue east along the north concourse."),
        ("edge-n1-n2", "nav-north-1", "nav-north-2", "Continue east along the north concourse."),
        ("edge-n2-n3", "nav-north-2", "nav-north-3", "Continue east along the north concourse."),
        ("edge-n3-n4", "nav-north-3", "nav-north-4", "Continue east along the north concourse."),
        ("edge-n0-c0", "nav-north-0", "nav-central-0", "Continue south along the west walkway."),
        ("edge-c0-s0", "nav-central-0", "nav-south-0", "Continue south along the west walkway."),
        ("edge-n1-c1", "nav-north-1", "nav-central-1", "Continue south past Aisle 1."),
        ("edge-c1-s1", "nav-central-1", "nav-south-1", "Continue south past Aisle 2."),
        ("edge-n2-c2", "nav-north-2", "nav-central-2", "Continue south past Aisle 3."),
        ("edge-c2-s2", "nav-central-2", "nav-south-2", "Continue south past Aisle 4.", "CONGESTED"),
        ("edge-n3-c3", "nav-north-3", "nav-central-3", "Continue south past Aisle 5."),
        ("edge-c3-s3", "nav-central-3", "nav-south-3", "Continue south past Aisle 6."),
        ("edge-n4-c4", "nav-north-4", "nav-central-4", "Continue south beside checkout."),
        ("edge-c4-s4", "nav-central-4", "nav-south-4", "Continue south beside checkout."),
        ("edge-help-n0", "nav-help-desk", "nav-north-0", "Follow signs for Customer Service."),
        ("edge-wc-c0", "nav-restrooms", "nav-central-0", "Follow the accessible restroom signs."),
    ]
    edges = [
        nav_edge(edge_id, from_id, to_id, instructions, status=status)
        for edge_id, from_id, to_id, instructions, *edge_status in edge_specs
        for status in [edge_status[0] if edge_status else "OPEN"]
    ]

    shelf_connections = {
        "A1": "nav-central-1", "A2": "nav-central-1", "A3": "nav-central-1", "A4": "nav-central-1",
        "C1": "nav-south-1", "C2": "nav-south-1", "C3": "nav-south-1", "C4": "nav-south-1", "C5": "nav-south-1",
        "D1": "nav-central-2", "D2": "nav-central-2",
        "B1": "nav-south-2", "B2": "nav-south-2", "B3": "nav-south-2", "B4": "nav-south-2", "B5": "nav-south-2", "B6": "nav-south-2",
        "D3": "nav-south-2", "D4": "nav-south-2", "D5": "nav-south-3", "D6": "nav-south-3",
        "E1": "nav-central-3", "E3": "nav-central-3",
        "F2": "nav-south-3", "G1": "nav-south-3", "G2": "nav-south-3",
    }
    for shelf_code, corridor_node in shelf_connections.items():
        edges.append(nav_edge(
            f"edge-{corridor_node.removeprefix('nav-')}-shelf-{shelf_code.lower()}",
            corridor_node,
            f"nav-shelf-{shelf_code.lower()}",
            f"Enter the department and stop at Shelf {shelf_code}.",
        ))
    for lane_code in ["C1", "C2", "C3"]:
        edges.append(nav_edge(
            f"edge-c4-checkout-{lane_code.lower()}",
            "nav-central-4",
            f"nav-checkout-{lane_code.lower()}",
            f"Enter the checkout area and proceed to lane {lane_code}.",
        ))
    for lane_code in ["C4", "C5"]:
        edges.append(nav_edge(
            f"edge-s4-checkout-{lane_code.lower()}",
            "nav-south-4",
            f"nav-checkout-{lane_code.lower()}",
            f"Enter the checkout area and proceed to lane {lane_code}.",
        ))

    queues = [
        {"lane_code": "C1", "lane_number": 1, "name": "Checkout C1 — Regular", "type": "REGULAR_CASHIER", "status": "CONGESTED", "queue_length": 8, "wait_time_seconds": 324, "cashier_name": "Elena Rostova", "assigned_staff_id": "staff-s01", "is_express": False, "processing_rate_items_per_minute": 18, "predicted_queue_in_10_min": 13, "predicted_wait_in_10_min_seconds": 390, "camera_code": "CAM-06"},
        {"lane_code": "C2", "lane_number": 2, "name": "Checkout C2 — Regular", "type": "REGULAR_CASHIER", "status": "CONGESTED", "queue_length": 7, "wait_time_seconds": 294, "cashier_name": "Chen Wei", "assigned_staff_id": "staff-s09", "is_express": False, "processing_rate_items_per_minute": 20, "predicted_queue_in_10_min": 11, "predicted_wait_in_10_min_seconds": 330, "camera_code": "CAM-06"},
        {"lane_code": "C3", "lane_number": 3, "name": "Checkout C3 — Express 10 Items", "type": "EXPRESS_10_ITEMS", "status": "STANDBY", "queue_length": 0, "wait_time_seconds": 0, "cashier_name": None, "assigned_staff_id": None, "is_express": True, "processing_rate_items_per_minute": 32, "predicted_queue_in_10_min": 4, "predicted_wait_in_10_min_seconds": 85, "camera_code": "CAM-06"},
        {"lane_code": "C4", "lane_number": 4, "name": "Checkout C4 — Self Checkout", "type": "SELF_CHECKOUT", "status": "ACTIVE", "queue_length": 3, "wait_time_seconds": 70, "cashier_name": None, "assigned_staff_id": None, "is_express": True, "processing_rate_items_per_minute": 28, "predicted_queue_in_10_min": 5, "predicted_wait_in_10_min_seconds": 90, "camera_code": "CAM-06"},
        {"lane_code": "C5", "lane_number": 5, "name": "Checkout C5 — Priority", "type": "PRIORITY", "status": "CLOSED", "queue_length": 0, "wait_time_seconds": 0, "cashier_name": None, "assigned_staff_id": None, "is_express": False, "processing_rate_items_per_minute": 20, "predicted_queue_in_10_min": 0, "predicted_wait_in_10_min_seconds": 0, "camera_code": "CAM-06"},
    ]

    staff_specs = [
        ("staff-s01", "EMP-401", "Elena Rostova", "Billing Specialist", "Billing", ["POS Billing", "Cash Handling", "Customer Support"], "zone-7", "Checkout Counter C1", "BUSY", "Serving register queue", 94, 4, "Radio Ch 1"),
        ("staff-s02", "EMP-402", "Marcus Vance", "Billing & Customer Care", "Billing", ["POS Billing", "Product Assistance", "Customer Support"], "zone-4", "Aisle 3 Snacks", "AVAILABLE", "Standby in zone", 89, 3, "Radio Ch 1"),
        ("staff-s03", "EMP-403", "Madhesh", "Inventory Replenishment", "Replenishment", ["Rapid Restock", "Stockroom Operations", "Safety"], "zone-4", "Beverage Gondola B4", "BUSY", "Restocking Shelf B4", 91, 5, "Radio Ch 2"),
        ("staff-s04", "EMP-404", "Sarah Jenkins", "Store Operations Specialist", "Operations", ["Planogram Compliance", "Spill Safety", "Produce Handling"], "zone-2", "Produce Perimeter", "BUSY", "Spill hazard cleanup", 92, 4, "Radio Ch 3"),
        ("staff-s05", "EMP-405", "David Kim", "Customer Guidance & Returns", "Support", ["Customer Assistance", "Returns", "Floor Guide"], "zone-1", "Entrance Lobby", "BUSY", "Customer product navigation", 93, 2, "Radio Ch 3"),
        ("staff-s06", "EMP-406", "Priya Sharma", "Floor Supervisor", "Operations", ["Cashier Override", "Escalation Resolution", "Team Dispatch"], "zone-1", "Store Center Floor", "AVAILABLE", "Supervisory floor walk", 98, 3, "Direct Line"),
        ("staff-s07", "EMP-407", "Ananya Patel", "Electronics Specialist", "Support", ["Gadget Advisory", "Warranty Support", "High-Value Care"], "zone-6", "Electronics Hub", "BUSY", "Customer product demonstration", 95, 3, "Radio Ch 4"),
        ("staff-s08", "EMP-408", "Vikram Rao", "Inventory Associate", "Replenishment", ["Chiller Restock", "Heavy Pallet Handling", "Dairy Rotation"], "zone-3", "Dairy Cooler Wall", "BUSY", "Refilling Greek Yogurt C4", 90, 4, "Radio Ch 2"),
        ("staff-s09", "EMP-409", "Chen Wei", "Cashier & Express Counter", "Billing", ["POS Billing", "Contactless Pay", "Quick Checkout"], "zone-7", "Checkout Counter C2", "BUSY", "Processing express payments", 96, 6, "Radio Ch 1"),
        ("staff-s10", "EMP-410", "Aisha Khan", "Inventory Associate", "Replenishment", ["Dry Grocery Restock", "Barcode Auditing", "Forklift"], "zone-4", "Snacks Gondola B2", "BUSY", "Refilling roasted almonds", 90, 3, "Radio Ch 2"),
        ("staff-s11", "EMP-411", "Mateo Rossi", "Bakery & Deli Associate", "Operations", ["Bakery Merchandising", "Bread Slicing", "Hygiene"], "zone-3", "Bakery Rack D1", "BUSY", "Arranging bread loaves", 94, 2, "Radio Ch 3"),
        ("staff-s12", "EMP-412", "Lucas Silva", "Billing & Cashiering", "Billing", ["POS Billing", "Bagging Support", "Cash Drops"], "zone-7", "Staff Break Area", "ON_BREAK", "Scheduled afternoon break", 88, 3, "Radio Ch 1"),
    ]
    staff = [
        {
            "id": staff_id,
            "employee_id": employee_id,
            "name": name,
            "role": role,
            "department": department,
            "skills": skills,
            "current_zone_id": zone_id,
            "zone": zone,
            "status": status,
            "active_task_id": None,
            "current_task_description": task,
            "performance_score": score,
            "tasks_completed_today": completed,
            "shift_start": "14:00",
            "shift_end": "22:00",
            "shift_status": "ON_SHIFT",
            "contact_channel": channel,
        }
        for staff_id, employee_id, name, role, department, skills, zone_id, zone, status, task, score, completed, channel in staff_specs
    ]
    active_task_map = {
        "staff-s02": "task-102",
        "staff-s03": "task-104",
        "staff-s04": "task-101",
        "staff-s08": "task-107",
        "staff-s10": "task-103",
    }
    for member in staff:
        member["active_task_id"] = active_task_map.get(member["id"])

    def task(
        task_id: str,
        title: str,
        task_type: str,
        priority: str,
        status: str,
        location: str,
        description: str,
        minutes_ago: int,
        staff_id: str | None = None,
        staff_name: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        return {
            "id": task_id,
            "title": title,
            "type": task_type,
            "priority": priority,
            "status": status,
            "assigned_staff_id": staff_id,
            "assigned_staff_name": staff_name,
            "target_location": location,
            "description": description,
            "customer_request_data": None,
            "details": details or {},
            "created_at": now - timedelta(minutes=minutes_ago),
            "completed_at": (now - timedelta(minutes=4)) if status == "COMPLETED" else None,
        }

    tasks = [
        task("task-101", "Spill Hazard Cleanup", "SPILL_CLEANUP", "HIGH", "IN_PROGRESS", "Produce Perimeter — Aisle 1", "Minor moisture spill detected near produce chiller; secure and dry the area.", 5, "staff-s04", "Sarah Jenkins", {"source": "CAM-02", "eta_minutes": 2, "source_incident_id": "inc-04"}),
        task("task-102", "Open Counter C3 for Queue Relief", "QUEUE_SUPPORT", "CRITICAL", "ASSIGNED", "Checkout Register C3", "Open express C3 to reduce C1 and C2 evening queues.", 4, "staff-s02", "Marcus Vance", {"source": "Queue Intelligence", "eta_minutes": 1, "source_incident_id": "inc-01"}),
        task("task-103", "Restock Roasted Almonds on B2", "RESTOCK", "MEDIUM", "IN_PROGRESS", "Snacks Gondola B2", "Shelf is at 24% capacity; 18 backroom units are ready.", 12, "staff-s10", "Aisha Khan", {"sku": "SKU-SNK-402", "backroom_units": 18, "eta_minutes": 3}),
        task("task-104", "Refill Beverage B4 — Cola Zero", "RESTOCK", "CRITICAL", "IN_PROGRESS", "Beverage Gondola B4", "Only 3 visible units remain; move 24 units from Backroom Bay 3B.", 7, "staff-s03", "Madhesh", {"sku": "SKU-BEV-1029", "availability": 16.7, "stockout_minutes": 9, "camera": "CAM-04", "source_incident_id": "inc-03"}),
        task("task-105", "Dairy Chiller C2 Restock", "RESTOCK", "HIGH", "COMPLETED", "Dairy Cooler Wall C2", "Whole milk replenished from cold storage and camera verified.", 35, "staff-s08", "Vikram Rao", {"sku": "SKU-DAIRY-101", "before_availability": 0, "after_availability": 75, "verification": "CAMERA_CONFIRMED"}),
        task("task-106", "A1 Apple Planogram Fix", "PLANOGRAM_AUDIT", "LOW", "COMPLETED", "Produce Tier A1", "Apple facing aligned with the current planogram.", 55, "staff-s04", "Sarah Jenkins", {"sku": "SKU-PROD-101", "verification": "STAFF_CONFIRMED"}),
        task("task-107", "Rotate Milk Batch MILK-0827", "STOCK_ROTATION", "HIGH", "ASSIGNED", "Dairy Cooler Wall C2", "Move earlier-expiring milk batch to front facings under FEFO.", 10, "staff-s08", "Vikram Rao", {"batch_id": "batch-milk-0827", "batch_number": "MILK-0827", "expiry_hours": 20}),
        task("task-108", "Remove Expired Egg Batch", "REMOVE_EXPIRED", "CRITICAL", "PENDING", "Dairy Cooler Wall C1", "Quarantine two expired egg packs and record waste.", 3, None, None, {"batch_id": "batch-eggs-0825", "batch_number": "EGG-0825", "quantity": 2}),
        task("task-109", "Inspect Camera CAM-04 Lens", "FACILITY", "MEDIUM", "PENDING", "Beverage Gondola B4", "Image sharpness dropped below the shelf-analytics threshold.", 20, None, None, {"camera": "CAM-04", "source_incident_id": "inc-07"}),
    ]

    def incident(
        incident_id: str,
        title: str,
        description: str,
        severity: str,
        incident_type: str,
        zone: str,
        zone_id: str,
        status: str,
        camera: str,
        minutes_ago: int,
        recommendation: str,
        action: str,
        staff_id: str | None = None,
        staff_name: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        return {
            "id": incident_id,
            "title": title,
            "description": description,
            "severity": severity,
            "type": incident_type,
            "zone": zone,
            "zone_id": zone_id,
            "status": status,
            "camera_code": camera,
            "assigned_staff_id": staff_id,
            "assigned_staff_name": staff_name,
            "recommendation_title": recommendation,
            "recommendation_action": action,
            "recommendation_state": "EXECUTED" if status == "RESOLVED" else ("EXECUTING" if staff_id else "PENDING"),
            "details": details or {},
            "created_at": now - timedelta(minutes=minutes_ago),
            "resolved_at": (now - timedelta(minutes=max(1, minutes_ago - 4))) if status == "RESOLVED" else None,
        }

    incidents = [
        incident("inc-01", "Checkout C1 Congestion", "Eight shoppers are waiting and service capacity is below the arrival rate.", "CRITICAL", "QUEUE_CONGESTION", "Checkout C1", "zone-7", "ACTIVE", "CAM-06", 3, "Open standby Counter C3", "OPEN_LANE_C3", None, None, {"queue_length": 8, "wait_seconds": 324, "forecast_queue_5_min": 13, "confidence": 0.92}),
        incident("inc-02", "Checkout C2 Express Delay", "Seven shoppers are waiting at C2 during the evening surge.", "CRITICAL", "QUEUE_CONGESTION", "Checkout C2", "zone-7", "ACTIVE", "CAM-06", 6, "Deploy contactless checkout support", "ASSIGN_CHECKOUT_SUPPORT", "staff-s09", "Chen Wei", {"queue_length": 7, "wait_seconds": 294}),
        incident("inc-03", "Shelf B4 Cola Zero Depletion", "Cola Zero has three visible units and will stock out in approximately nine minutes.", "HIGH", "STOCK_DEPLETION", "Beverage Gondola B4", "zone-4", "ACTIVE", "CAM-04", 7, "Replenish 24 units from Bay 3B", "RESTOCK_SHELF_B4", "staff-s03", "Madhesh", {"availability": 16.7, "visible_units": 3, "backroom_units": 24, "stockout_minutes": 9}),
        incident("inc-04", "Liquid Spill Hazard", "A 1.2 metre moisture patch was detected near the produce chiller.", "HIGH", "SPILL_HAZARD", "Produce Perimeter", "zone-2", "ACTIVE", "CAM-02", 5, "Secure area and dry mop immediately", "CLEAN_SPILL", "staff-s04", "Sarah Jenkins"),
        incident("inc-05", "Dairy Chiller Temperature Drift", "Cooler temperature reached 6.4°C against the 4.0°C target.", "HIGH", "COLD_CHAIN", "Dairy Cooler Wall", "zone-3", "ACTIVE", "CAM-03", 15, "Inspect door seal and temperature gauge", "INSPECT_CHILLER", "staff-s08", "Vikram Rao", {"temperature_c": 6.4, "target_c": 4.0}),
        incident("inc-06", "Aisle Cart Obstruction", "An unattended replenishment cart is obstructing the shopper path.", "HIGH", "AISLE_OBSTRUCTION", "Aisle 3 Snacks", "zone-4", "ACTIVE", "CAM-04", 9, "Return cart to stockroom bay", "CLEAR_AISLE"),
        incident("inc-07", "CAM-04 Image Quality Degraded", "Optical blur may reduce Shelf B4 recognition confidence.", "MEDIUM", "CAMERA_DEGRADED", "Beverage Gondola B4", "zone-4", "ACTIVE", "CAM-04", 20, "Inspect and clean camera lens", "SERVICE_CAMERA"),
        incident("inc-08", "B4 Shelf Replenishment Completed", "Twenty-four units were transferred from Bay 3B and verified by camera.", "HIGH", "STOCK_DEPLETION", "Beverage Gondola B4", "zone-4", "RESOLVED", "CAM-04", 90, "Replenish 24 units", "RESTOCK_SHELF_B4", "staff-s03", "Madhesh", {"before_availability": 17, "after_availability": 79, "duration_seconds": 222}),
        incident("inc-09", "C3 Queue Support Completed", "The express lane was opened and average wait fell to 2.1 minutes.", "CRITICAL", "QUEUE_CONGESTION", "Checkout C3", "zone-7", "RESOLVED", "CAM-06", 120, "Open express C3", "OPEN_LANE_C3", "staff-s02", "Marcus Vance", {"before_wait_seconds": 324, "after_wait_seconds": 126}),
        incident("inc-10", "A1 Planogram Realigned", "Apple facings were returned to their approved shelf positions.", "LOW", "PLANOGRAM_VIOLATION", "Produce Tier A1", "zone-2", "RESOLVED", "CAM-02", 150, "Realign apple facings", "FIX_PLANOGRAM", "staff-s04", "Sarah Jenkins"),
    ]

    camera_specs = [
        (1, "CAM-01", "Main Entrance Overhead Wide", "zone-1", "Main Entrance & Lobby", "entrance_wide", "YOLO-PersonCounter", ["SHOPPER_TRACKING", "INCIDENT_DETECTION"], 14.2, 14, "110° Ultra-Wide"),
        (2, "CAM-02", "Fresh Produce Aisle", "zone-2", "Fresh Produce & Fruits", "produce_shelf", "PlanogramNet-ShelfDet", ["SHELF_MONITORING", "SHOPPER_TRACKING", "INCIDENT_DETECTION"], 16.8, 28, "90° Standard"),
        (3, "CAM-03", "Dairy & Chilled Wall", "zone-3", "Dairy, Bakery & Chilled", "dairy_cooler", "PlanogramNet-ShelfDet", ["SHELF_MONITORING", "STAFF_TRACKING"], 15.4, 22, "85° Varifocal"),
        (4, "CAM-04", "Beverage & Snacks Gondola", "zone-4", "Beverages & Snacks Aisle", "snacks_gondola", "ShelfEye-SKU-v3", ["SHELF_MONITORING", "SHOPPER_TRACKING"], 24.5, 31, "95° Wide"),
        (5, "CAM-05", "Electronics & Household Cross-Aisle", "zone-6", "Electronics & Gadgets", "electronics_hub", "YOLO-Security-DwellTracker", ["SHOPPER_TRACKING", "INCIDENT_DETECTION", "STAFF_TRACKING"], 18.1, 9, "75° Telephoto"),
        (6, "CAM-06", "Checkout Queues and Lanes", "zone-7", "Checkout Lanes & Express", "checkout_lanes", "QueueSense-Temporal", ["QUEUE_DETECTION", "STAFF_TRACKING", "INCIDENT_DETECTION"], 13.8, 20, "120° Panoramic"),
    ]
    cameras = [
        {
            "id": camera_id,
            "lane_code": code,
            "stream_url": f"rtsp://edge-jetson-01.local:8554/live/{stream}",
            "name": name,
            "code": code,
            "zone_id": zone_id,
            "zone_name": zone_name,
            "status": "DEGRADED" if code == "CAM-04" else "ONLINE",
            "resolution": "1920x1080",
            "fps": 27.8 if code == "CAM-04" else 30.0,
            "target_fps": 30.0,
            "inference_latency_ms": latency,
            "model_loaded": model,
            "ai_tasks": tasks_list,
            "uptime_percent": 99.7 if code == "CAM-04" else 99.95,
            "active_detections_count": detections,
            "lens_fov": fov,
            "ip_address": f"192.168.10.{100 + camera_id}",
            "mac_address": f"B8:27:EB:4A:12:{camera_id:02d}",
            "last_heartbeat": now,
        }
        for camera_id, code, name, zone_id, zone_name, stream, model, tasks_list, latency, detections, fov in camera_specs
    ]

    def batch(
        batch_id: str,
        product_id: str,
        sku: str,
        name: str,
        category: str,
        batch_number: str,
        quantity: int,
        shelf_quantity: int,
        backroom_quantity: int,
        shelf_code: str,
        unit_cost: float,
        unit_price: float,
        expires_in_hours: int,
        status: str,
        source: str,
    ) -> dict[str, Any]:
        return {
            "id": batch_id,
            "store_id": STORE_ID,
            "product_id": product_id,
            "product_sku": sku,
            "product_name": name,
            "category": category,
            "batch_number": batch_number,
            "quantity": quantity,
            "shelf_quantity": shelf_quantity,
            "backroom_quantity": backroom_quantity,
            "received_at": now - timedelta(days=2),
            "manufactured_at": now - timedelta(days=3),
            "best_before_at": now + timedelta(hours=expires_in_hours),
            "expires_at": now + timedelta(hours=expires_in_hours),
            "storage_location_id": f"loc-{shelf_code.lower()}",
            "shelf_id": f"shelf-{shelf_code.lower()}",
            "shelf_code": shelf_code,
            "unit_cost": unit_cost,
            "unit_price": unit_price,
            "status": status,
            "source": source,
        }

    batches = [
        batch("batch-milk-0827", "prod-milk", "SKU-DAIRY-101", "Fresh Whole Milk 1L", "Dairy", "MILK-0827", 18, 10, 8, "C2", 42, 64, 20, "EXPIRING_SOON", "ERP"),
        batch("batch-milk-0902", "prod-milk", "SKU-DAIRY-101", "Fresh Whole Milk 1L", "Dairy", "MILK-0902", 24, 4, 20, "C2", 42, 64, 144, "ACTIVE", "GOODS_RECEIVING"),
        batch("batch-yogurt-451", "prod-yogurt", "SKU-DAIRY-204", "Greek Style Yogurt 500g", "Dairy", "Y-451", 12, 12, 0, "C4", 50, 80, 28, "EXPIRING_SOON", "ERP"),
        batch("batch-bread-230", "prod-bread", "SKU-BAK-301", "Whole Wheat Farm Bread 400g", "Bakery", "BR-230", 6, 6, 0, "D1", 24, 45, 8, "EXPIRING_SOON", "MANUAL_ENTRY"),
        batch("batch-strawberries-502", "prod-strawberries", "SKU-PROD-502", "Hydroponic Strawberries 250g", "Fresh Produce", "BERRY-0826", 5, 5, 0, "A2", 65, 120, 6, "EXPIRING_SOON", "GOODS_RECEIVING"),
        batch("batch-paneer-305", "prod-paneer", "SKU-DAIRY-305", "Organic Malai Paneer 200g", "Dairy", "PAN-0828", 15, 10, 5, "C3", 65, 95, 50, "ACTIVE", "ERP"),
        batch("batch-salad-401", "prod-salad", "SKU-RTE-401", "Chicken Caesar Salad 320g", "Ready-to-Eat", "RTE-0827", 8, 8, 0, "D2", 88, 155, 5, "EXPIRING_SOON", "GS1_SCAN"),
        batch("batch-eggs-0825", "prod-eggs", "SKU-DAIRY-401", "Farm Fresh Organic Eggs 6-Pack", "Dairy", "EGG-0825", 2, 2, 0, "C1", 40, 65, -2, "EXPIRED", "ERP"),
        batch("batch-bread-228", "prod-bread", "SKU-BAK-301", "Whole Wheat Farm Bread 400g", "Bakery", "BR-228", 3, 3, 0, "D1", 24, 45, -8, "EXPIRED", "ERP"),
        batch("batch-berry-0824", "prod-strawberries", "SKU-PROD-502", "Hydroponic Strawberries 250g", "Fresh Produce", "BERRY-0824", 2, 2, 0, "A2", 65, 120, -4, "EXPIRED", "GOODS_RECEIVING"),
        batch("batch-milk-0824", "prod-milk", "SKU-DAIRY-101", "Fresh Whole Milk 1L", "Dairy", "MILK-0824", 2, 2, 0, "C2", 42, 64, -1, "EXPIRED", "ERP"),
        batch("batch-ham-0829", "prod-ham", "SKU-MEAT-601", "Smoked Honey Ham Slices 200g", "Meat & Chilled", "HAM-0829", 14, 8, 6, "C5", 110, 175, 72, "ACTIVE", "ERP"),
    ]

    markdown_candidates = [
        {"id": "markdown-bread-230", "batch_id": "batch-bread-230", "product_id": "prod-bread", "product_sku": "SKU-BAK-301", "product_name": "Whole Wheat Farm Bread 400g", "category": "Bakery", "shelf_code": "D1", "current_price": 45, "suggested_discount_percent": 20, "suggested_new_price": 36, "remaining_quantity": 6, "at_risk_quantity": 4, "expires_at": now + timedelta(hours=8), "reason": "Six units expire within eight hours and expected demand will not clear the batch.", "status": "APPROVED", "approved_by": "Store Manager", "approved_at": now - timedelta(hours=1), "applied_at": None},
        {"id": "markdown-berries-502", "batch_id": "batch-strawberries-502", "product_id": "prod-strawberries", "product_sku": "SKU-PROD-502", "product_name": "Hydroponic Strawberries 250g", "category": "Fresh Produce", "shelf_code": "A2", "current_price": 120, "suggested_discount_percent": 35, "suggested_new_price": 78, "remaining_quantity": 5, "at_risk_quantity": 3, "expires_at": now + timedelta(hours=6), "reason": "Fresh produce batch has six hours remaining and three units are at risk.", "status": "APPROVED", "approved_by": "Store Manager", "approved_at": now - timedelta(minutes=40), "applied_at": None},
        {"id": "markdown-salad-401", "batch_id": "batch-salad-401", "product_id": "prod-salad", "product_sku": "SKU-RTE-401", "product_name": "Chicken Caesar Salad 320g", "category": "Ready-to-Eat", "shelf_code": "D2", "current_price": 155, "suggested_discount_percent": 25, "suggested_new_price": 116.25, "remaining_quantity": 8, "at_risk_quantity": 6, "expires_at": now + timedelta(hours=5), "reason": "Ready-to-eat batch expires during the current shift.", "status": "RECOMMENDED", "approved_by": None, "approved_at": None, "applied_at": None},
    ]

    waste_records = [
        {"id": "waste-rec-1", "store_id": STORE_ID, "product_id": "prod-bread", "product_sku": "SKU-BAK-301", "product_name": "Whole Wheat Farm Bread 400g", "batch_id": "batch-bread-228", "batch_number": "BR-228", "quantity": 3, "reason": "EXPIRED", "recorded_by_staff_id": "staff-s03", "recorded_by_staff_name": "Madhesh", "location_id": "shelf-d1", "location_name": "Bakery D1", "recorded_at": now - timedelta(hours=7), "unit_cost": 24, "total_loss_cost": 72, "notes": "Past sell-by date at morning audit."},
        {"id": "waste-rec-2", "store_id": STORE_ID, "product_id": "prod-strawberries", "product_sku": "SKU-PROD-502", "product_name": "Hydroponic Strawberries 250g", "batch_id": "batch-berry-0824", "batch_number": "BERRY-0824", "quantity": 2, "reason": "SPOILED", "recorded_by_staff_id": "staff-s04", "recorded_by_staff_name": "Sarah Jenkins", "location_id": "shelf-a2", "location_name": "Produce A2", "recorded_at": now - timedelta(hours=5), "unit_cost": 65, "total_loss_cost": 130, "notes": "Soft berries found during shelf facing."},
        {"id": "waste-rec-3", "store_id": STORE_ID, "product_id": "prod-milk", "product_sku": "SKU-DAIRY-101", "product_name": "Fresh Whole Milk 1L", "batch_id": "batch-milk-0824", "batch_number": "MILK-0824", "quantity": 2, "reason": "DAMAGED", "recorded_by_staff_id": "staff-s08", "recorded_by_staff_name": "Vikram Rao", "location_id": "shelf-c2", "location_name": "Dairy C2", "recorded_at": now - timedelta(hours=3), "unit_cost": 42, "total_loss_cost": 84, "notes": "Cartons damaged during pallet unpacking."},
    ]

    metrics: list[dict[str, Any]] = []
    for hour, actual, forecast in [
        (8, 65, 70), (9, 120, 115), (10, 185, 190), (11, 240, 235),
        (12, 310, 300), (13, 280, 290), (14, 220, 210), (15, 260, 250),
        (16, 330, 340), (17, 390, 380), (18, 420, 430),
    ]:
        recorded_at = now.replace(hour=hour, minute=0, second=0, microsecond=0)
        metrics.append({"id": f"metric-footfall-{hour:02d}", "store_id": STORE_ID, "metric_type": "HOURLY_FOOTFALL", "label": f"{hour:02d}:00", "value": actual, "unit": "shoppers", "dimensions": {"forecast": forecast}, "recorded_at": recorded_at})
    for index, (label, regular, express) in enumerate([
        ("17:00", 105, 55), ("17:30", 135, 68), ("18:00", 175, 85),
        ("18:30", 195, 92), ("19:00", 140, 60),
    ]):
        metrics.append({"id": f"metric-queue-{index}", "store_id": STORE_ID, "metric_type": "QUEUE_WAIT_TREND", "label": label, "value": regular, "unit": "seconds", "dimensions": {"express_wait_seconds": express}, "recorded_at": now - timedelta(minutes=(4 - index) * 30)})
    for zone in zones[1:7]:
        metrics.append({"id": f"metric-dwell-{zone['id']}", "store_id": STORE_ID, "metric_type": "ZONE_DWELL", "label": zone["name"], "value": zone["avg_dwell_time_seconds"], "unit": "seconds", "dimensions": {"zone_id": zone["id"], "occupancy": zone["current_occupancy"]}, "recorded_at": now})

    return {
        "stores": stores,
        "items": items,
        "zones": zones,
        "shelves": shelves,
        "products": products,
        "layouts": layouts,
        "areas": areas,
        "navigation_nodes": nodes,
        "navigation_edges": edges,
        "queues": queues,
        "staff": staff,
        "tasks": tasks,
        "incidents": incidents,
        "cameras": cameras,
        "batches": batches,
        "markdown_candidates": markdown_candidates,
        "waste_records": waste_records,
        "metrics": metrics,
    }
