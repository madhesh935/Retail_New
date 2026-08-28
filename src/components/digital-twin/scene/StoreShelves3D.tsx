import React, { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { TooltipData } from '../controls/TwinTooltip'
import { RetailPalette } from '../theme/retailPalette'
import type { StockStatus } from '@/types/inventory.types'

export interface Shelf3DData {
  id: string
  code: string
  name: string
  zone: string
  status: 'HEALTHY' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK'
  availability: number
  visibleUnits: number
  capacity: number
  posInventory: number
  demand: string
  stockoutPrediction: string
  replenishmentPriority: number
  planogramScore: number
  sku: string
  camera: string
}

const LIVE_STATUS_MAP: Record<StockStatus, Shelf3DData['status']> = {
  OPTIMAL: 'HEALTHY',
  LOW: 'LOW',
  CRITICAL: 'CRITICAL',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  MISPLACED: 'LOW',
}

/** Muted retail package colors (no neon). */
const PRODUCT_COLORS = {
  produce: ['#C45C4A', '#D4894A', '#7A9B4A', '#D4A04A', '#8BAE5A'],
  beverage: ['#C45C4A', '#5B8FA8', '#C4A04A', '#5A9B6A', '#8B6B5A'],
  dairy: ['#E8E4DC', '#D4E0E8', '#F0EDE6', '#C8D4DC'],
  frozen: ['#6B8FA8', '#B85C5C', '#7A9BB0', '#A86B6B'],
  grocery: ['#B85C4A', '#5A8A7A', '#C4A04A', '#7A6B5A', '#8B7355'],
  bakery: ['#C4A06A', '#8B6914', '#D4B896', '#A67C52'],
  deli: ['#C4A04A', '#B85C4A', '#D4B896', '#A86B5A'],
  endcap: ['#C4A04A', '#B85C4A'],
} as const

interface StoreShelves3DProps {
  showShelfHealth: boolean
  onSelectShelf: (shelf: Shelf3DData) => void
  onHoverShelf?: (data: TooltipData | null) => void
}

export const StoreShelves3D: React.FC<StoreShelves3DProps> = ({
  showShelfHealth,
  onSelectShelf,
  onHoverShelf,
}) => {
  const [hoveredShelfId, setHoveredShelfId] = useState<string | null>(null)
  const shelfItems = useAppStore((s) => s.shelfItems)

  const shelves: (Shelf3DData & {
    position: [number, number, number]
    dimensions: [number, number, number]
    category: 'produce' | 'beverage' | 'dairy' | 'frozen' | 'bakery' | 'deli' | 'grocery' | 'electronics' | 'stockroom' | 'endcap' | 'dumpbin'
  })[] = [
    // =======================================================
    // 1. FRESH PRODUCE DEPARTMENT (West-South)
    // =======================================================
    {
      id: 'shelf-a1',
      code: 'A1',
      name: 'Produce Table A1',
      zone: 'Fresh Produce',
      status: 'HEALTHY',
      availability: 92,
      visibleUnits: 38,
      capacity: 42,
      posInventory: 80,
      demand: 'High',
      stockoutPrediction: '4.5 hrs',
      replenishmentPriority: 15,
      planogramScore: 94,
      sku: 'Royal Gala Apples & Pears',
      camera: 'CAM-02 (Produce)',
      category: 'produce',
      position: [-8, 0.65, -4.5],
      dimensions: [4.2, 1.3, 1.8],
    },
    {
      id: 'shelf-a2',
      code: 'A2',
      name: 'Produce Table A2',
      zone: 'Fresh Produce',
      status: 'LOW',
      availability: 58,
      visibleUnits: 14,
      capacity: 24,
      posInventory: 40,
      demand: 'Moderate',
      stockoutPrediction: '48 min',
      replenishmentPriority: 62,
      planogramScore: 89,
      sku: 'Valencia Oranges & Greens',
      camera: 'CAM-02 (Produce)',
      category: 'produce',
      position: [-8, 0.65, -7.5],
      dimensions: [4.2, 1.3, 1.8],
    },
    {
      id: 'shelf-a3',
      code: 'A3',
      name: 'Tropical Fruit Island A3',
      zone: 'Fresh Produce',
      status: 'HEALTHY',
      availability: 88,
      visibleUnits: 32,
      capacity: 36,
      posInventory: 65,
      demand: 'Moderate',
      stockoutPrediction: '> 5 hrs',
      replenishmentPriority: 18,
      planogramScore: 95,
      sku: 'Bananas, Pineapples & Melons',
      camera: 'CAM-02 (Produce)',
      category: 'produce',
      position: [-13.5, 0.65, -4.5],
      dimensions: [3.8, 1.3, 1.8],
    },
    {
      id: 'shelf-a4',
      code: 'A4',
      name: 'Organic Salad Chilled Wall A4',
      zone: 'Fresh Produce',
      status: 'HEALTHY',
      availability: 94,
      visibleUnits: 28,
      capacity: 30,
      posInventory: 50,
      demand: 'High',
      stockoutPrediction: '6 hrs',
      replenishmentPriority: 12,
      planogramScore: 97,
      sku: 'Packaged Organic Greens & Berries',
      camera: 'CAM-02 (Produce)',
      category: 'produce',
      position: [-13.5, 0.65, -7.5],
      dimensions: [3.8, 1.3, 1.8],
    },
    {
      id: 'shelf-db1',
      code: 'DB1',
      name: 'Promo Dump Bin DB1',
      zone: 'Fresh Produce',
      status: 'HEALTHY',
      availability: 95,
      visibleUnits: 50,
      capacity: 52,
      posInventory: 90,
      demand: 'Moderate',
      stockoutPrediction: '> 5 hrs',
      replenishmentPriority: 10,
      planogramScore: 95,
      sku: 'Seasonal Citrus & Watermelons',
      camera: 'CAM-02 (Produce)',
      category: 'dumpbin',
      position: [-3.5, 0.45, -5.5],
      dimensions: [1.3, 0.9, 1.3],
    },

    // =======================================================
    // 2. ARTISAN BAKERY & GOURMET DELI (West-North)
    // =======================================================
    {
      id: 'shelf-d1',
      code: 'D1',
      name: 'Artisan Bakery Wall D1',
      zone: 'Dairy & Bakery',
      status: 'HEALTHY',
      availability: 85,
      visibleUnits: 22,
      capacity: 26,
      posInventory: 30,
      demand: 'Moderate',
      stockoutPrediction: '2.5 hrs',
      replenishmentPriority: 30,
      planogramScore: 91,
      sku: 'Artisan Sourdough & Baguettes',
      camera: 'CAM-02 (Produce)',
      category: 'bakery',
      position: [-16, 0.95, -1.0],
      dimensions: [3.4, 1.9, 1.3],
    },
    {
      id: 'shelf-d2',
      code: 'D2',
      name: 'Gourmet Pastry Showcase D2',
      zone: 'Dairy & Bakery',
      status: 'HEALTHY',
      availability: 90,
      visibleUnits: 24,
      capacity: 28,
      posInventory: 45,
      demand: 'High',
      stockoutPrediction: '3.5 hrs',
      replenishmentPriority: 22,
      planogramScore: 96,
      sku: 'Croissants, Tarts & Specialty Cakes',
      camera: 'CAM-02 (Produce)',
      category: 'deli',
      position: [-16, 0.85, 2.5],
      dimensions: [3.4, 1.7, 1.3],
    },
    {
      id: 'shelf-d3',
      code: 'D3',
      name: 'Artisan Deli & Cheese Counter D3',
      zone: 'Dairy & Bakery',
      status: 'HEALTHY',
      availability: 88,
      visibleUnits: 26,
      capacity: 30,
      posInventory: 55,
      demand: 'Moderate',
      stockoutPrediction: '> 4 hrs',
      replenishmentPriority: 20,
      planogramScore: 93,
      sku: 'Cold Cuts & Imported Cheeses',
      camera: 'CAM-02 (Produce)',
      category: 'deli',
      position: [-11, 0.85, 2.5],
      dimensions: [3.4, 1.7, 1.3],
    },

    // =======================================================
    // 3. CENTRAL GROCERY GONDOLA AISLES (Center)
    // =======================================================
    {
      id: 'shelf-g1',
      code: 'G1',
      name: 'Grocery Aisle G1 (Cereal & Coffee)',
      zone: 'Grocery & Dry Goods',
      status: 'HEALTHY',
      availability: 91,
      visibleUnits: 44,
      capacity: 48,
      posInventory: 110,
      demand: 'High',
      stockoutPrediction: '> 6 hrs',
      replenishmentPriority: 15,
      planogramScore: 96,
      sku: 'Whole Grain Cereals, Teas & Roast Coffee',
      camera: 'CAM-04 (Personal Care)',
      category: 'grocery',
      position: [-3.5, 0.95, -1.5],
      dimensions: [3.6, 1.9, 1.4],
    },
    {
      id: 'shelf-g2',
      code: 'G2',
      name: 'Grocery Aisle G2 (Pasta & Sauces)',
      zone: 'Grocery & Dry Goods',
      status: 'HEALTHY',
      availability: 86,
      visibleUnits: 38,
      capacity: 44,
      posInventory: 95,
      demand: 'Moderate',
      stockoutPrediction: '4 hrs',
      replenishmentPriority: 20,
      planogramScore: 94,
      sku: 'Italian Pasta, Olive Oils & Marinara',
      camera: 'CAM-04 (Personal Care)',
      category: 'grocery',
      position: [2.5, 0.95, -1.5],
      dimensions: [3.6, 1.9, 1.4],
    },
    {
      id: 'shelf-g3',
      code: 'G3',
      name: 'Grocery Aisle G3 (Soups & Snacks)',
      zone: 'Grocery & Dry Goods',
      status: 'HEALTHY',
      availability: 93,
      visibleUnits: 42,
      capacity: 46,
      posInventory: 120,
      demand: 'Moderate',
      stockoutPrediction: '> 5 hrs',
      replenishmentPriority: 12,
      planogramScore: 98,
      sku: 'Organic Soups, Canned Beans & Crackers',
      camera: 'CAM-04 (Personal Care)',
      category: 'grocery',
      position: [8.5, 0.95, -1.5],
      dimensions: [3.6, 1.9, 1.4],
    },

    // =======================================================
    // 4. DAIRY & FROZEN COOLERS (North-Center)
    // =======================================================
    {
      id: 'shelf-c1',
      code: 'C1',
      name: 'Dairy Cooler C1',
      zone: 'Dairy & Bakery',
      status: 'HEALTHY',
      availability: 94,
      visibleUnits: 32,
      capacity: 34,
      posInventory: 55,
      demand: 'Moderate',
      stockoutPrediction: '> 4 hrs',
      replenishmentPriority: 10,
      planogramScore: 97,
      sku: 'Greek Yogurt, Butter & Plant Milk',
      camera: 'CAM-03 (Beverages)',
      category: 'dairy',
      position: [2, 1.15, -4.5],
      dimensions: [3.6, 2.3, 1.2],
    },
    {
      id: 'shelf-c2',
      code: 'C2',
      name: 'Dairy Cooler C2 (Stockout Demo)',
      zone: 'Dairy & Bakery',
      status: 'OUT_OF_STOCK',
      availability: 0,
      visibleUnits: 0,
      capacity: 18,
      posInventory: 12,
      demand: 'High',
      stockoutPrediction: 'Empty (Now)',
      replenishmentPriority: 98,
      planogramScore: 85,
      sku: 'Organic Whole Milk 1 Gal',
      camera: 'CAM-03 (Beverages)',
      category: 'dairy',
      position: [2, 1.15, -7.5],
      dimensions: [3.6, 2.3, 1.2],
    },
    {
      id: 'shelf-c3',
      code: 'C3',
      name: 'Frozen Foods Cooler C3',
      zone: 'Dairy & Bakery',
      status: 'HEALTHY',
      availability: 89,
      visibleUnits: 28,
      capacity: 32,
      posInventory: 70,
      demand: 'Moderate',
      stockoutPrediction: '> 5 hrs',
      replenishmentPriority: 16,
      planogramScore: 95,
      sku: 'Artisan Frozen Pizzas & Gelato',
      camera: 'CAM-03 (Beverages)',
      category: 'frozen',
      position: [-3.5, 1.15, -7.5],
      dimensions: [3.6, 2.3, 1.2],
    },

    // =======================================================
    // 5. COLD BEVERAGES & PROMOTIONAL ENDCAPS (East)
    // =======================================================
    {
      id: 'shelf-b4',
      code: 'B4',
      name: 'Beverage Shelf B4 (Critical Stockout)',
      zone: 'Beverages',
      status: 'CRITICAL',
      availability: 17,
      visibleUnits: 3,
      capacity: 24,
      posInventory: 14,
      demand: 'High',
      stockoutPrediction: '9 min',
      replenishmentPriority: 94,
      planogramScore: 92,
      sku: 'Zero Sugar Cola 12-Packs',
      camera: 'CAM-03 (Beverages)',
      category: 'beverage',
      position: [14, 0.95, -4.5],
      dimensions: [3.4, 1.9, 1.3],
    },
    {
      id: 'shelf-b3',
      code: 'B3',
      name: 'Snacks & Soda B3',
      zone: 'Beverages',
      status: 'HEALTHY',
      availability: 88,
      visibleUnits: 28,
      capacity: 32,
      posInventory: 60,
      demand: 'Moderate',
      stockoutPrediction: '> 3 hrs',
      replenishmentPriority: 25,
      planogramScore: 96,
      sku: 'Sparkling Mineral Water & Seltzers',
      camera: 'CAM-03 (Beverages)',
      category: 'beverage',
      position: [14, 0.95, -7.5],
      dimensions: [3.4, 1.9, 1.3],
    },
    {
      id: 'shelf-b2',
      code: 'B2',
      name: 'Cold Pressed Juices B2',
      zone: 'Beverages',
      status: 'HEALTHY',
      availability: 92,
      visibleUnits: 26,
      capacity: 28,
      posInventory: 50,
      demand: 'Moderate',
      stockoutPrediction: '4 hrs',
      replenishmentPriority: 18,
      planogramScore: 97,
      sku: 'Cold Brews, Kombucha & Smoothies',
      camera: 'CAM-03 (Beverages)',
      category: 'beverage',
      position: [14, 0.95, -1.5],
      dimensions: [3.4, 1.9, 1.3],
    },
    {
      id: 'shelf-ec1',
      code: 'EC1',
      name: 'Promotional Endcap EC1',
      zone: 'Beverages',
      status: 'HEALTHY',
      availability: 86,
      visibleUnits: 24,
      capacity: 28,
      posInventory: 45,
      demand: 'High',
      stockoutPrediction: '3.2 hrs',
      replenishmentPriority: 20,
      planogramScore: 98,
      sku: 'Tortilla Chips & Salsa Promo',
      camera: 'CAM-03 (Beverages)',
      category: 'endcap',
      position: [17.5, 0.9, -6.0],
      dimensions: [1.2, 1.8, 3.2],
    },
    {
      id: 'shelf-db2',
      code: 'DB2',
      name: 'Inflow Pallet Shipper DB2',
      zone: 'Beverages',
      status: 'HEALTHY',
      availability: 90,
      visibleUnits: 36,
      capacity: 40,
      posInventory: 70,
      demand: 'High',
      stockoutPrediction: '4 hrs',
      replenishmentPriority: 18,
      planogramScore: 94,
      sku: 'Bulk Energy Drink 24-Packs',
      camera: 'CAM-03 (Beverages)',
      category: 'dumpbin',
      position: [8.5, 0.45, -5.5],
      dimensions: [1.3, 0.9, 1.3],
    },

    // =======================================================
    // 6. ELECTRONICS & GADGETS ISLAND (Center-South)
    // =======================================================
    {
      id: 'shelf-e1',
      code: 'E1',
      name: 'Electronics Table E1',
      zone: 'Electronics',
      status: 'HEALTHY',
      availability: 90,
      visibleUnits: 18,
      capacity: 20,
      posInventory: 25,
      demand: 'Low',
      stockoutPrediction: '> 8 hrs',
      replenishmentPriority: 10,
      planogramScore: 99,
      sku: 'Tablets, Headphones & Smart Home',
      camera: 'CAM-04 (Personal Care)',
      category: 'electronics',
      position: [3.5, 0.6, 5.0],
      dimensions: [4.2, 1.2, 1.8],
    },

    // =======================================================
    // 7. STOCKROOM HIGH-BAY WAREHOUSE RACKS (North)
    // =======================================================
    {
      id: 'shelf-s1',
      code: 'S1',
      name: 'Backroom Pallet Rack S1',
      zone: 'Stockroom',
      status: 'HEALTHY',
      availability: 78,
      visibleUnits: 45,
      capacity: 58,
      posInventory: 120,
      demand: 'Internal',
      stockoutPrediction: 'Nominal',
      replenishmentPriority: 12,
      planogramScore: 95,
      sku: 'Overstock Dry Goods & Bulk Packs',
      camera: 'CAM-06 (Loading Dock)',
      category: 'stockroom',
      position: [-13, 1.4, 12.5],
      dimensions: [5.2, 2.8, 1.4],
    },
    {
      id: 'shelf-s2',
      code: 'S2',
      name: 'Backroom Pallet Rack S2',
      zone: 'Stockroom',
      status: 'HEALTHY',
      availability: 82,
      visibleUnits: 60,
      capacity: 73,
      posInventory: 150,
      demand: 'Internal',
      stockoutPrediction: 'Nominal',
      replenishmentPriority: 15,
      planogramScore: 96,
      sku: 'Cold Storage Buffer & Inflow Crates',
      camera: 'CAM-06 (Loading Dock)',
      category: 'stockroom',
      position: [-5, 1.4, 12.5],
      dimensions: [5.2, 2.8, 1.4],
    },
    {
      id: 'shelf-s3',
      code: 'S3',
      name: 'Backroom Pallet Rack S3',
      zone: 'Stockroom',
      status: 'HEALTHY',
      availability: 88,
      visibleUnits: 55,
      capacity: 65,
      posInventory: 135,
      demand: 'Internal',
      stockoutPrediction: 'Nominal',
      replenishmentPriority: 10,
      planogramScore: 97,
      sku: 'Beverage Reserves & Liquid Inflow',
      camera: 'CAM-06 (Loading Dock)',
      category: 'stockroom',
      position: [5, 1.4, 12.5],
      dimensions: [5.2, 2.8, 1.4],
    },
    {
      id: 'shelf-s4',
      code: 'S4',
      name: 'Backroom Pallet Rack S4',
      zone: 'Stockroom',
      status: 'HEALTHY',
      availability: 85,
      visibleUnits: 50,
      capacity: 60,
      posInventory: 140,
      demand: 'Internal',
      stockoutPrediction: 'Nominal',
      replenishmentPriority: 14,
      planogramScore: 94,
      sku: 'Paper Goods & Cleaning Supply Skids',
      camera: 'CAM-06 (Loading Dock)',
      category: 'stockroom',
      position: [13, 1.4, 12.5],
      dimensions: [5.2, 2.8, 1.4],
    },
  ]

  const liveShelves = useMemo(() => {
    // item.id carries the "shelf-a1" DB id matching this layout's static ids;
    // item.shelfId is the short display code ("A1") and never matches here.
    const liveById = new Map(shelfItems.map((item) => [item.id, item]))
    return shelves.map((shelf) => {
      const live = liveById.get(shelf.id)
      if (!live) return shelf
      const availability =
        live.capacityCount > 0
          ? Math.round((live.currentCount / live.capacityCount) * 100)
          : shelf.availability
      return {
        ...shelf,
        status: LIVE_STATUS_MAP[live.status] ?? shelf.status,
        availability,
        visibleUnits: live.currentCount,
        sku: live.productName || live.sku || shelf.sku,
      }
    })
    // shelves is a static fixture layout; live metrics come from shelfItems
  }, [shelfItems])

  const handlePointerOver = (shelf: (typeof liveShelves)[0], e: any) => {
    e.stopPropagation()
    setHoveredShelfId(shelf.id)
    if (onHoverShelf) {
      onHoverShelf({
        type: 'shelf',
        title: shelf.code,
        subtitle: shelf.sku,
        status: shelf.status === 'OUT_OF_STOCK' ? 'OUT OF STOCK' : shelf.status,
        statusColor:
          shelf.status === 'CRITICAL' || shelf.status === 'OUT_OF_STOCK'
            ? 'rose'
            : shelf.status === 'LOW'
              ? 'amber'
              : 'emerald',
        metrics: [
          { label: 'Availability', value: `${shelf.availability}%`, highlight: shelf.availability < 30 },
          { label: 'Visible', value: `${shelf.visibleUnits}` },
          { label: 'Backroom', value: `${shelf.posInventory}` },
        ],
        screenX: e.clientX,
        screenY: e.clientY,
      })
    }
  }

  const handlePointerOut = () => {
    setHoveredShelfId(null)
    if (onHoverShelf) onHoverShelf(null)
  }

  return (
    <group>
      {liveShelves.map((shelf) => {
        const isHovered = hoveredShelfId === shelf.id
        const isCritical = shelf.status === 'CRITICAL' || shelf.status === 'OUT_OF_STOCK'
        const isLow = shelf.status === 'LOW'
        const statusColor = isCritical
          ? RetailPalette.critical
          : isLow
            ? RetailPalette.low
            : RetailPalette.healthy
        const edgeEmissive = isCritical ? 0.35 : isLow ? 0.25 : 0.0

        return (
          <group
            key={shelf.id}
            position={shelf.position}
            onClick={(e) => {
              e.stopPropagation()
              onSelectShelf(shelf)
            }}
            onPointerOver={(e) => handlePointerOver(shelf, e)}
            onPointerOut={handlePointerOut}
          >
            {/* ======================================================= */}
            {/* 1. PRODUCE DISPLAY TABLES — occupancy-driven            */}
            {/* ======================================================= */}
            {shelf.category === 'produce' && (() => {
              const crateSlots = 5
              const filledCrates = Math.max(1, Math.round((shelf.visibleUnits / Math.max(shelf.capacity, 1)) * crateSlots))
              const crateXPositions = [-1.5, -0.75, 0, 0.75, 1.5]
              return (
                <group>
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[shelf.dimensions[0], 0.6, shelf.dimensions[2]]} />
                    <meshStandardMaterial color={RetailPalette.woodDark} roughness={0.75} />
                  </mesh>
                  <mesh position={[0, 0.45, 0]} rotation={[0.08, 0, 0]} castShadow>
                    <boxGeometry args={[shelf.dimensions[0] * 0.96, 0.3, shelf.dimensions[2] * 0.94]} />
                    <meshStandardMaterial color={RetailPalette.woodProduce} roughness={0.65} />
                  </mesh>
                  {crateXPositions.map((xOffset, idx) => {
                    const hasProduce = idx < filledCrates
                    return (
                      <group key={idx} position={[xOffset, 0.68, 0]}>
                        <mesh castShadow>
                          <boxGeometry args={[0.62, 0.18, 1.3]} />
                          <meshStandardMaterial color={RetailPalette.woodDark} roughness={0.8} />
                        </mesh>
                        {hasProduce && (
                          <mesh position={[0, 0.12, 0]}>
                            <boxGeometry args={[0.56, 0.14, 1.2]} />
                            <meshStandardMaterial
                              color={PRODUCT_COLORS.produce[idx % PRODUCT_COLORS.produce.length]}
                              roughness={0.55}
                            />
                          </mesh>
                        )}
                      </group>
                    )
                  })}
                </group>
              )
            })()}

            {/* ======================================================= */}
            {/* 2. REFRIGERATED BEVERAGE COOLERS — occupancy-driven      */}
            {/* ======================================================= */}
            {shelf.category === 'beverage' && (() => {
              const maxSlots = 15
              const filledSlots = Math.round((shelf.visibleUnits / Math.max(shelf.capacity, 1)) * maxSlots)
              const canPositions = [
                [-1.1, -0.45], [-0.55, -0.45], [0, -0.45], [0.55, -0.45], [1.1, -0.45],
                [-1.1,  0   ], [-0.55,  0   ], [0,  0   ], [0.55,  0   ], [1.1,  0   ],
                [-1.1,  0.45], [-0.55,  0.45], [0,  0.45], [0.55,  0.45], [1.1,  0.45],
              ]
              return (
                <group>
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[shelf.dimensions[0], shelf.dimensions[1], shelf.dimensions[2]]} />
                    <meshStandardMaterial color={RetailPalette.coolerBody} metalness={0.25} roughness={0.45} />
                  </mesh>
                  <mesh position={[0, 0, 0.1]}>
                    <boxGeometry args={[shelf.dimensions[0] * 0.94, shelf.dimensions[1] * 0.88, shelf.dimensions[2] * 0.7]} />
                    <meshStandardMaterial color={RetailPalette.coolerInterior} roughness={0.35} />
                  </mesh>
                  {[-0.45, 0, 0.45].map((yOff, ti) => (
                    <mesh key={ti} position={[0, yOff - 0.055, shelf.dimensions[2] * 0.2]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.9, 0.03, shelf.dimensions[2] * 0.55]} />
                      <meshStandardMaterial color={RetailPalette.stainless} metalness={0.55} roughness={0.35} />
                    </mesh>
                  ))}
                  {canPositions.map(([cx, cy], slotIdx) => {
                    if (slotIdx >= filledSlots) return null
                    return (
                      <mesh key={slotIdx} position={[cx, cy, shelf.dimensions[2] * 0.15]} castShadow>
                        <cylinderGeometry args={[0.08, 0.08, 0.26, 12]} />
                        <meshStandardMaterial
                          color={PRODUCT_COLORS.beverage[slotIdx % PRODUCT_COLORS.beverage.length]}
                          metalness={0.45}
                          roughness={0.35}
                        />
                      </mesh>
                    )
                  })}
                  {/* Subtle white header strip */}
                  <mesh position={[0, shelf.dimensions[1] * 0.44, shelf.dimensions[2] * 0.48]}>
                    <boxGeometry args={[shelf.dimensions[0] * 0.95, 0.16, 0.06]} />
                    <meshStandardMaterial color={RetailPalette.signFace} roughness={0.5} />
                  </mesh>
                  <mesh position={[0, 0, shelf.dimensions[2] * 0.52]}>
                    <planeGeometry args={[shelf.dimensions[0] * 0.94, shelf.dimensions[1] * 0.85]} />
                    <meshStandardMaterial
                      color={RetailPalette.coolerGlass}
                      transparent
                      opacity={0.18}
                      roughness={0.08}
                      metalness={0.35}
                    />
                  </mesh>
                </group>
              )
            })()}

            {/* ======================================================= */}
            {/* 3. DAIRY COOLERS & CHILLED SHELVES                       */}
            {/* ======================================================= */}
            {shelf.category === 'dairy' && (() => {
              const maxSlots = 12
              const filledSlots = Math.round((shelf.visibleUnits / Math.max(shelf.capacity, 1)) * maxSlots)
              const itemPositions: [number, number][] = [
                [-1.1, -0.55], [-0.37, -0.55], [0.37, -0.55], [1.1, -0.55],
                [-1.1,  0   ], [-0.37,  0   ], [0.37,  0   ], [1.1,  0   ],
                [-1.1,  0.55], [-0.37,  0.55], [0.37,  0.55], [1.1,  0.55],
              ]
              return (
                <group>
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[shelf.dimensions[0], shelf.dimensions[1], shelf.dimensions[2]]} />
                    <meshStandardMaterial color={RetailPalette.coolerBody} metalness={0.2} roughness={0.5} />
                  </mesh>
                  <mesh position={[0, 0, 0.1]}>
                    <boxGeometry args={[shelf.dimensions[0] * 0.94, shelf.dimensions[1] * 0.88, shelf.dimensions[2] * 0.7]} />
                    <meshStandardMaterial color={RetailPalette.coolerInterior} roughness={0.4} />
                  </mesh>
                  {[-0.55, 0, 0.55].map((yOff, ti) => (
                    <mesh key={ti} position={[0, yOff - 0.045, shelf.dimensions[2] * 0.18]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.92, 0.03, shelf.dimensions[2] * 0.52]} />
                      <meshStandardMaterial color={RetailPalette.stainless} metalness={0.5} roughness={0.4} />
                    </mesh>
                  ))}
                  {itemPositions.map(([ix, iy], slotIdx) => {
                    if (slotIdx >= filledSlots) return null
                    return (
                      <mesh key={slotIdx} position={[ix, iy, shelf.dimensions[2] * 0.12]} castShadow>
                        <boxGeometry args={[0.2, 0.26, 0.2]} />
                        <meshStandardMaterial
                          color={PRODUCT_COLORS.dairy[slotIdx % PRODUCT_COLORS.dairy.length]}
                          roughness={0.5}
                        />
                      </mesh>
                    )
                  })}
                  <mesh position={[0, shelf.dimensions[1] * 0.44, shelf.dimensions[2] * 0.48]}>
                    <boxGeometry args={[shelf.dimensions[0] * 0.95, 0.16, 0.06]} />
                    <meshStandardMaterial color={RetailPalette.signFace} roughness={0.5} />
                  </mesh>
                </group>
              )
            })()}

            {/* ======================================================= */}
            {/* 4. FROZEN FOODS REACH-IN FREEZER COOLERS                 */}
            {/* ======================================================= */}
            {shelf.category === 'frozen' && (
              <group>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[shelf.dimensions[0], shelf.dimensions[1], shelf.dimensions[2]]} />
                  <meshStandardMaterial color={RetailPalette.coolerBody} metalness={0.3} roughness={0.4} />
                </mesh>
                <mesh position={[0, 0, 0.1]}>
                  <boxGeometry args={[shelf.dimensions[0] * 0.94, shelf.dimensions[1] * 0.88, shelf.dimensions[2] * 0.7]} />
                  <meshStandardMaterial color={RetailPalette.coolerInterior} roughness={0.35} />
                </mesh>
                {[-0.55, 0, 0.55].map((yOff, ti) => (
                  <group key={ti} position={[0, yOff, shelf.dimensions[2] * 0.18]}>
                    <mesh position={[0, -0.04, 0]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.92, 0.03, shelf.dimensions[2] * 0.52]} />
                      <meshStandardMaterial color={RetailPalette.stainless} metalness={0.5} roughness={0.4} />
                    </mesh>
                    {[-1.1, -0.37, 0.37, 1.1].map((px, pi) => (
                      <mesh key={pi} position={[px, 0.12, 0]} castShadow>
                        <boxGeometry args={[0.26, 0.22, 0.22]} />
                        <meshStandardMaterial
                          color={PRODUCT_COLORS.frozen[pi % PRODUCT_COLORS.frozen.length]}
                          roughness={0.5}
                        />
                      </mesh>
                    ))}
                  </group>
                ))}
                <mesh position={[0, 0, shelf.dimensions[2] * 0.52]}>
                  <planeGeometry args={[shelf.dimensions[0] * 0.94, shelf.dimensions[1] * 0.85]} />
                  <meshStandardMaterial
                    color={RetailPalette.coolerGlass}
                    transparent
                    opacity={0.22}
                    roughness={0.12}
                    metalness={0.35}
                  />
                </mesh>
                <mesh position={[0, shelf.dimensions[1] * 0.44, shelf.dimensions[2] * 0.48]}>
                  <boxGeometry args={[shelf.dimensions[0] * 0.95, 0.16, 0.06]} />
                  <meshStandardMaterial color={RetailPalette.signFace} roughness={0.5} />
                </mesh>
              </group>
            )}

            {/* ======================================================= */}
            {/* 5. ARTISAN BAKERY RACKS & WARM DELI SHOWCASES           */}
            {/* ======================================================= */}
            {shelf.category === 'bakery' && (
              <group>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[shelf.dimensions[0], shelf.dimensions[1], shelf.dimensions[2]]} />
                  <meshStandardMaterial color={RetailPalette.woodDark} roughness={0.8} />
                </mesh>
                <mesh position={[0, 0, 0.1]}>
                  <boxGeometry args={[shelf.dimensions[0] * 0.94, shelf.dimensions[1] * 0.88, shelf.dimensions[2] * 0.7]} />
                  <meshStandardMaterial color={RetailPalette.woodProduce} roughness={0.7} />
                </mesh>
                {[-0.55, 0, 0.55].map((yOff, ti) => (
                  <group key={ti} position={[0, yOff, shelf.dimensions[2] * 0.18]}>
                    <mesh position={[0, -0.04, 0]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.92, 0.03, shelf.dimensions[2] * 0.52]} />
                      <meshStandardMaterial color={RetailPalette.shelfBoard} roughness={0.65} />
                    </mesh>
                    {[-1.1, -0.37, 0.37, 1.1].map((bx, bi) => (
                      <mesh key={bi} position={[bx, 0.12, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.08, 0.08, 0.32, 8]} />
                        <meshStandardMaterial
                          color={PRODUCT_COLORS.bakery[bi % PRODUCT_COLORS.bakery.length]}
                          roughness={0.8}
                        />
                      </mesh>
                    ))}
                  </group>
                ))}
              </group>
            )}

            {shelf.category === 'deli' && (
              <group>
                <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
                  <boxGeometry args={[shelf.dimensions[0], 0.8, shelf.dimensions[2]]} />
                  <meshStandardMaterial color={RetailPalette.stainless} metalness={0.45} roughness={0.35} />
                </mesh>
                <mesh position={[0, 0.45, 0]} castShadow>
                  <boxGeometry args={[shelf.dimensions[0] * 0.96, 0.6, shelf.dimensions[2] * 0.92]} />
                  <meshStandardMaterial
                    color={RetailPalette.coolerGlass}
                    transparent
                    opacity={0.22}
                    roughness={0.12}
                  />
                </mesh>
                {[-1.1, -0.37, 0.37, 1.1].map((dx, di) => (
                  <mesh key={di} position={[dx, 0.35, 0]} castShadow>
                    <cylinderGeometry args={[0.16, 0.16, 0.15, 12]} />
                    <meshStandardMaterial
                      color={PRODUCT_COLORS.deli[di % PRODUCT_COLORS.deli.length]}
                      roughness={0.5}
                    />
                  </mesh>
                ))}
              </group>
            )}

            {/* ======================================================= */}
            {/* 6. CENTRAL GROCERY DOUBLE-SIDED GONDOLAS                 */}
            {/* ======================================================= */}
            {shelf.category === 'grocery' && (
              <group>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[shelf.dimensions[0], shelf.dimensions[1], 0.18]} />
                  <meshStandardMaterial color={RetailPalette.shelfFrame} metalness={0.15} roughness={0.55} />
                </mesh>
                <mesh position={[0, shelf.dimensions[1] * 0.48, 0]}>
                  <boxGeometry args={[shelf.dimensions[0] * 1.02, 0.14, 0.22]} />
                  <meshStandardMaterial color={RetailPalette.signFace} roughness={0.5} />
                </mesh>
                {[-0.55, -0.18, 0.18, 0.55].map((yOff, ti) => (
                  <group key={ti} position={[0, yOff, 0]}>
                    <mesh position={[0, -0.04, 0.32]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.96, 0.03, 0.55]} />
                      <meshStandardMaterial color={RetailPalette.shelfBoard} roughness={0.55} />
                    </mesh>
                    <mesh position={[0, -0.04, -0.32]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.96, 0.03, 0.55]} />
                      <meshStandardMaterial color={RetailPalette.shelfBoard} roughness={0.55} />
                    </mesh>
                    {[-1.3, -0.75, -0.2, 0.35, 0.9, 1.3].map((ix, ii) => (
                      <mesh key={`f-${ii}`} position={[ix, 0.12, 0.32]} castShadow>
                        <boxGeometry args={[0.22, 0.24, 0.18]} />
                        <meshStandardMaterial
                          color={PRODUCT_COLORS.grocery[ii % PRODUCT_COLORS.grocery.length]}
                          roughness={0.5}
                        />
                      </mesh>
                    ))}
                    {[-1.3, -0.75, -0.2, 0.35, 0.9, 1.3].map((ix, ii) => (
                      <mesh key={`b-${ii}`} position={[ix, 0.12, -0.32]} castShadow>
                        <boxGeometry args={[0.22, 0.24, 0.18]} />
                        <meshStandardMaterial
                          color={PRODUCT_COLORS.grocery[(ii + 2) % PRODUCT_COLORS.grocery.length]}
                          roughness={0.5}
                        />
                      </mesh>
                    ))}
                  </group>
                ))}
              </group>
            )}

            {/* ======================================================= */}
            {/* 7. ELECTRONICS & GADGETS ISLAND                          */}
            {/* ======================================================= */}
            {shelf.category === 'electronics' && (
              <group>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[shelf.dimensions[0], 0.75, shelf.dimensions[2]]} />
                  <meshStandardMaterial color={RetailPalette.shelfFrame} roughness={0.45} metalness={0.2} />
                </mesh>
                <mesh position={[0, 0.38, 0]}>
                  <boxGeometry args={[shelf.dimensions[0] * 0.98, 0.05, shelf.dimensions[2] * 0.98]} />
                  <meshStandardMaterial color={RetailPalette.shelfBoard} roughness={0.4} metalness={0.15} />
                </mesh>
                {/* Muted device slabs — no glowing screens */}
                {[-1.3, -0.45, 0.45, 1.3].map((xOffset, idx) => (
                  <group key={idx} position={[xOffset, 0.45, 0]}>
                    <mesh rotation={[-0.3, 0, 0]} castShadow>
                      <boxGeometry args={[0.42, 0.03, 0.32]} />
                      <meshStandardMaterial color="#94A3B8" roughness={0.35} metalness={0.4} />
                    </mesh>
                  </group>
                ))}
              </group>
            )}

            {/* ======================================================= */}
            {/* 8. STOCKROOM HIGH-BAY INDUSTRIAL PALLET RACKS           */}
            {/* ======================================================= */}
            {shelf.category === 'stockroom' && (
              <group>
                <mesh position={[-shelf.dimensions[0] * 0.48, 0, 0]}>
                  <boxGeometry args={[0.12, shelf.dimensions[1], shelf.dimensions[2]]} />
                  <meshStandardMaterial color={RetailPalette.stockroomOrange} metalness={0.45} roughness={0.45} />
                </mesh>
                <mesh position={[shelf.dimensions[0] * 0.48, 0, 0]}>
                  <boxGeometry args={[0.12, shelf.dimensions[1], shelf.dimensions[2]]} />
                  <meshStandardMaterial color={RetailPalette.stockroomOrange} metalness={0.45} roughness={0.45} />
                </mesh>
                {[-0.8, 0, 0.8].map((yOffset, idx) => (
                  <group key={idx} position={[0, yOffset, 0]}>
                    <mesh>
                      <boxGeometry args={[shelf.dimensions[0] * 0.94, 0.09, shelf.dimensions[2]]} />
                      <meshStandardMaterial color={RetailPalette.stockroomSteel} metalness={0.55} roughness={0.4} />
                    </mesh>
                    {[-1.6, -0.55, 0.55, 1.6].map((boxX, boxIdx) => (
                      <group key={boxIdx} position={[boxX, 0.38, 0]}>
                        <mesh castShadow>
                          <boxGeometry args={[0.9, 0.65, 0.95]} />
                          <meshStandardMaterial color={RetailPalette.cardboard} roughness={0.85} />
                        </mesh>
                        <mesh position={[0, 0, 0.49]}>
                          <planeGeometry args={[0.32, 0.22]} />
                          <meshBasicMaterial color={RetailPalette.signFace} />
                        </mesh>
                      </group>
                    ))}
                  </group>
                ))}
              </group>
            )}

            {/* ======================================================= */}
            {/* 9. PROMOTIONAL ENDCAPS & DUMP BINS                       */}
            {/* ======================================================= */}
            {shelf.category === 'endcap' && (
              <group>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[shelf.dimensions[0], shelf.dimensions[1], shelf.dimensions[2]]} />
                  <meshStandardMaterial color={RetailPalette.shelfFrame} roughness={0.55} metalness={0.15} />
                </mesh>
                {/* Muted red promo header — no strong emissive */}
                <mesh position={[0, shelf.dimensions[1] * 0.48, 0]}>
                  <boxGeometry args={[shelf.dimensions[0] * 1.05, 0.2, shelf.dimensions[2] * 0.95]} />
                  <meshStandardMaterial color="#B85C4A" roughness={0.55} emissive="#B85C4A" emissiveIntensity={0.08} />
                </mesh>
                {[-0.55, -0.2, 0.15, 0.5].map((yOffset, idx) => (
                  <group key={idx} position={[0, yOffset, 0]}>
                    <mesh position={[0, -0.04, 0]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.92, 0.04, shelf.dimensions[2] * 0.92]} />
                      <meshStandardMaterial color={RetailPalette.shelfBoard} roughness={0.5} />
                    </mesh>
                    {[-1.0, -0.35, 0.35, 1.0].map((itemZ, itemIdx) => (
                      <mesh key={itemIdx} position={[0, 0.14, itemZ]} castShadow>
                        <boxGeometry args={[0.65, 0.28, 0.32]} />
                        <meshStandardMaterial
                          color={PRODUCT_COLORS.endcap[itemIdx % PRODUCT_COLORS.endcap.length]}
                          roughness={0.5}
                        />
                      </mesh>
                    ))}
                  </group>
                ))}
              </group>
            )}

            {shelf.category === 'dumpbin' && (
              <group>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[shelf.dimensions[0], shelf.dimensions[1], shelf.dimensions[2]]} />
                  <meshStandardMaterial color={RetailPalette.woodDark} roughness={0.7} />
                </mesh>
                <mesh position={[0, 0, shelf.dimensions[2] * 0.51]}>
                  <planeGeometry args={[shelf.dimensions[0] * 0.8, shelf.dimensions[1] * 0.5]} />
                  <meshBasicMaterial color="#B85C4A" />
                </mesh>
                <mesh position={[0, shelf.dimensions[1] * 0.42, 0]} castShadow>
                  <sphereGeometry args={[shelf.dimensions[0] * 0.44, 12, 10]} />
                  <meshStandardMaterial
                    color={shelf.id === 'shelf-db1' ? '#6B9B5A' : '#5B8FA8'}
                    roughness={0.55}
                  />
                </mesh>
              </group>
            )}

            {/* ======================================================= */}
            {/* SHELF-EDGE STATUS STRIP ONLY (thin LED)                 */}
            {/* ======================================================= */}
            {showShelfHealth && (
              <group position={[0, -shelf.dimensions[1] * 0.38, shelf.dimensions[2] * 0.51]}>
                <mesh>
                  <boxGeometry args={[shelf.dimensions[0] * 0.95, 0.05, 0.025]} />
                  <meshStandardMaterial
                    color={statusColor}
                    emissive={statusColor}
                    emissiveIntensity={edgeEmissive}
                  />
                </mesh>
              </group>
            )}

            {/* Soft hover outline — no wireframe cage */}
            {isHovered && (
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[shelf.dimensions[0] + 0.08, shelf.dimensions[1] + 0.08, shelf.dimensions[2] + 0.08]} />
                <meshBasicMaterial color={RetailPalette.hover} transparent opacity={0.12} depthWrite={false} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}
