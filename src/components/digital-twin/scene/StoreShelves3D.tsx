import React, { useState, useMemo } from 'react'
import * as THREE from 'three'
import { TooltipData } from '../controls/TwinTooltip'

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

  const handlePointerOver = (shelf: typeof shelves[0], e: any) => {
    e.stopPropagation()
    setHoveredShelfId(shelf.id)
    if (onHoverShelf) {
      onHoverShelf({
        type: 'shelf',
        title: shelf.name,
        subtitle: `${shelf.sku} • ${shelf.zone}`,
        status: shelf.status === 'OUT_OF_STOCK' ? 'OUT OF STOCK' : shelf.status,
        statusColor: shelf.status === 'CRITICAL' || shelf.status === 'OUT_OF_STOCK' ? 'rose' : shelf.status === 'LOW' ? 'amber' : 'emerald',
        metrics: [
          { label: 'Availability', value: `${shelf.availability}%`, highlight: shelf.availability < 30 },
          { label: 'Visible Units', value: `${shelf.visibleUnits} units` },
          { label: 'Backroom Stock', value: `${shelf.posInventory} units` },
          { label: 'Stockout ETA', value: shelf.stockoutPrediction, highlight: shelf.availability < 30 },
        ],
        alert: shelf.availability < 20 ? `Predicted Stockout in ${shelf.stockoutPrediction}` : undefined,
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
      {shelves.map((shelf) => {
        const isHovered = hoveredShelfId === shelf.id
        const isCritical = shelf.status === 'CRITICAL' || shelf.status === 'OUT_OF_STOCK'
        const isLow = shelf.status === 'LOW'
        const statusColor = isCritical ? '#EF4444' : isLow ? '#F59E0B' : '#10B981'

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
              const produceColors = ['#DC2626', '#EA580C', '#65A30D', '#F97316', '#84CC16']
              return (
                <group>
                  {/* Dark Walnut Display Base */}
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[shelf.dimensions[0], 0.6, shelf.dimensions[2]]} />
                    <meshStandardMaterial color="#3E2723" roughness={0.75} />
                  </mesh>
                  {/* Sloped Top Display Platform */}
                  <mesh position={[0, 0.45, 0]} rotation={[0.08, 0, 0]} castShadow>
                    <boxGeometry args={[shelf.dimensions[0] * 0.96, 0.3, shelf.dimensions[2] * 0.94]} />
                    <meshStandardMaterial color="#4E342E" roughness={0.65} />
                  </mesh>
                  {/* Wooden Crates & Fruit */}
                  {crateXPositions.map((xOffset, idx) => {
                    const hasProduce = idx < filledCrates
                    return (
                      <group key={idx} position={[xOffset, 0.68, 0]}>
                        <mesh castShadow>
                          <boxGeometry args={[0.62, 0.18, 1.3]} />
                          <meshStandardMaterial color="#5D4037" roughness={0.8} />
                        </mesh>
                        {hasProduce && (
                          <mesh position={[0, 0.12, 0]}>
                            <boxGeometry args={[0.56, 0.14, 1.2]} />
                            <meshStandardMaterial
                              color={produceColors[idx % produceColors.length]}
                              roughness={0.45}
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
                  {/* Dark Metallic Cooler Cabinet */}
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[shelf.dimensions[0], shelf.dimensions[1], shelf.dimensions[2]]} />
                    <meshStandardMaterial color="#1E293B" metalness={0.65} roughness={0.3} />
                  </mesh>
                  {/* Glowing Illuminated Interior Backplate */}
                  <mesh position={[0, 0, 0.1]}>
                    <boxGeometry args={[shelf.dimensions[0] * 0.94, shelf.dimensions[1] * 0.88, shelf.dimensions[2] * 0.7]} />
                    <meshStandardMaterial color="#0F172A" roughness={0.2} emissive="#0284C7" emissiveIntensity={0.18} />
                  </mesh>
                  {/* 3 Chrome Wire Shelf Grids */}
                  {[-0.45, 0, 0.45].map((yOff, ti) => (
                    <mesh key={ti} position={[0, yOff - 0.055, shelf.dimensions[2] * 0.2]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.9, 0.03, shelf.dimensions[2] * 0.55]} />
                      <meshStandardMaterial color="#64748B" metalness={0.85} roughness={0.2} />
                    </mesh>
                  ))}
                  {/* Product Cans based on occupancy */}
                  {canPositions.map(([cx, cy], slotIdx) => {
                    if (slotIdx >= filledSlots) return null
                    const canColors = ['#EF4444', '#0EA5E9', '#F59E0B', '#10B981', '#8B5CF6']
                    return (
                      <mesh key={slotIdx} position={[cx, cy, shelf.dimensions[2] * 0.15]} castShadow>
                        <cylinderGeometry args={[0.08, 0.08, 0.26, 12]} />
                        <meshStandardMaterial color={canColors[slotIdx % canColors.length]} metalness={0.8} roughness={0.2} />
                      </mesh>
                    )
                  })}
                  {/* Branding Header Lightbox */}
                  <mesh position={[0, shelf.dimensions[1] * 0.44, shelf.dimensions[2] * 0.48]}>
                    <boxGeometry args={[shelf.dimensions[0] * 0.95, 0.2, 0.07]} />
                    <meshStandardMaterial color="#0284C7" emissive="#0284C7" emissiveIntensity={0.6} />
                  </mesh>
                  {/* Glass Front Panel */}
                  <mesh position={[0, 0, shelf.dimensions[2] * 0.52]}>
                    <planeGeometry args={[shelf.dimensions[0] * 0.94, shelf.dimensions[1] * 0.85]} />
                    <meshStandardMaterial color="#38BDF8" transparent opacity={0.2} roughness={0.05} metalness={0.9} />
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
                    <meshStandardMaterial color="#1E293B" metalness={0.5} roughness={0.4} />
                  </mesh>
                  {/* Glowing Cool White Interior */}
                  <mesh position={[0, 0, 0.1]}>
                    <boxGeometry args={[shelf.dimensions[0] * 0.94, shelf.dimensions[1] * 0.88, shelf.dimensions[2] * 0.7]} />
                    <meshStandardMaterial color="#0F172A" emissive="#38BDF8" emissiveIntensity={0.12} />
                  </mesh>
                  {[-0.55, 0, 0.55].map((yOff, ti) => (
                    <mesh key={ti} position={[0, yOff - 0.045, shelf.dimensions[2] * 0.18]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.92, 0.03, shelf.dimensions[2] * 0.52]} />
                      <meshStandardMaterial color="#64748B" metalness={0.8} />
                    </mesh>
                  ))}
                  {/* Dairy Jugs / Yogurt cartons */}
                  {itemPositions.map(([ix, iy], slotIdx) => {
                    if (slotIdx >= filledSlots) return null
                    return (
                      <mesh key={slotIdx} position={[ix, iy, shelf.dimensions[2] * 0.12]} castShadow>
                        <boxGeometry args={[0.2, 0.26, 0.2]} />
                        <meshStandardMaterial
                          color={slotIdx % 2 === 0 ? '#38BDF8' : '#F8FAFC'}
                          roughness={0.4}
                        />
                      </mesh>
                    )
                  })}
                  {/* Header Lightbox */}
                  <mesh position={[0, shelf.dimensions[1] * 0.44, shelf.dimensions[2] * 0.48]}>
                    <boxGeometry args={[shelf.dimensions[0] * 0.95, 0.2, 0.07]} />
                    <meshStandardMaterial color="#0284C7" emissive="#0284C7" emissiveIntensity={0.6} />
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
                  <meshStandardMaterial color="#0F172A" metalness={0.7} roughness={0.3} />
                </mesh>
                {/* Ice-Blue Illuminated Freezer Cavity */}
                <mesh position={[0, 0, 0.1]}>
                  <boxGeometry args={[shelf.dimensions[0] * 0.94, shelf.dimensions[1] * 0.88, shelf.dimensions[2] * 0.7]} />
                  <meshStandardMaterial color="#082F49" emissive="#0284C7" emissiveIntensity={0.35} />
                </mesh>
                {/* 3 Tier Shelves with Frozen Packages */}
                {[-0.55, 0, 0.55].map((yOff, ti) => (
                  <group key={ti} position={[0, yOff, shelf.dimensions[2] * 0.18]}>
                    <mesh position={[0, -0.04, 0]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.92, 0.03, shelf.dimensions[2] * 0.52]} />
                      <meshStandardMaterial color="#94A3B8" metalness={0.8} />
                    </mesh>
                    {[-1.1, -0.37, 0.37, 1.1].map((px, pi) => (
                      <mesh key={pi} position={[px, 0.12, 0]} castShadow>
                        <boxGeometry args={[0.26, 0.22, 0.22]} />
                        <meshStandardMaterial color={pi % 2 === 0 ? '#0284C7' : '#DC2626'} roughness={0.4} />
                      </mesh>
                    ))}
                  </group>
                ))}
                {/* Frosty Glass Doors with Handles */}
                <mesh position={[0, 0, shelf.dimensions[2] * 0.52]}>
                  <planeGeometry args={[shelf.dimensions[0] * 0.94, shelf.dimensions[1] * 0.85]} />
                  <meshStandardMaterial color="#BAE6FD" transparent opacity={0.28} roughness={0.15} metalness={0.9} />
                </mesh>
                {/* Freezer Header */}
                <mesh position={[0, shelf.dimensions[1] * 0.44, shelf.dimensions[2] * 0.48]}>
                  <boxGeometry args={[shelf.dimensions[0] * 0.95, 0.2, 0.07]} />
                  <meshStandardMaterial color="#0284C7" emissive="#0284C7" emissiveIntensity={0.6} />
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
                  <meshStandardMaterial color="#451A03" roughness={0.8} />
                </mesh>
                {/* Warm Golden Interior Backlight */}
                <mesh position={[0, 0, 0.1]}>
                  <boxGeometry args={[shelf.dimensions[0] * 0.94, shelf.dimensions[1] * 0.88, shelf.dimensions[2] * 0.7]} />
                  <meshStandardMaterial color="#78350F" emissive="#F59E0B" emissiveIntensity={0.2} />
                </mesh>
                {[-0.55, 0, 0.55].map((yOff, ti) => (
                  <group key={ti} position={[0, yOff, shelf.dimensions[2] * 0.18]}>
                    <mesh position={[0, -0.04, 0]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.92, 0.03, shelf.dimensions[2] * 0.52]} />
                      <meshStandardMaterial color="#B45309" roughness={0.7} />
                    </mesh>
                    {[-1.1, -0.37, 0.37, 1.1].map((bx, bi) => (
                      <mesh key={bi} position={[bx, 0.12, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.08, 0.08, 0.32, 8]} />
                        <meshStandardMaterial color={bi % 2 === 0 ? '#D97706' : '#92400E'} roughness={0.8} />
                      </mesh>
                    ))}
                  </group>
                ))}
              </group>
            )}

            {shelf.category === 'deli' && (
              <group>
                {/* Stainless & Glass Deli Counter */}
                <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
                  <boxGeometry args={[shelf.dimensions[0], 0.8, shelf.dimensions[2]]} />
                  <meshStandardMaterial color="#1E293B" metalness={0.6} roughness={0.3} />
                </mesh>
                {/* Curved Glass Top Display Showcase */}
                <mesh position={[0, 0.45, 0]} castShadow>
                  <boxGeometry args={[shelf.dimensions[0] * 0.96, 0.6, shelf.dimensions[2] * 0.92]} />
                  <meshStandardMaterial color="#38BDF8" transparent opacity={0.3} roughness={0.1} />
                </mesh>
                {/* Illuminated Gourmet Pastries & Cheese Wheels */}
                {[-1.1, -0.37, 0.37, 1.1].map((dx, di) => (
                  <mesh key={di} position={[dx, 0.35, 0]} castShadow>
                    <cylinderGeometry args={[0.16, 0.16, 0.15, 12]} />
                    <meshStandardMaterial color={di % 2 === 0 ? '#F59E0B' : '#DC2626'} roughness={0.4} />
                  </mesh>
                ))}
              </group>
            )}

            {/* ======================================================= */}
            {/* 6. CENTRAL GROCERY DOUBLE-SIDED GONDOLAS                 */}
            {/* ======================================================= */}
            {shelf.category === 'grocery' && (
              <group>
                {/* Central Charcoal Spine Structure */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[shelf.dimensions[0], shelf.dimensions[1], 0.18]} />
                  <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
                </mesh>
                {/* Top Aisle Signage Header Track */}
                <mesh position={[0, shelf.dimensions[1] * 0.48, 0]}>
                  <boxGeometry args={[shelf.dimensions[0] * 1.02, 0.18, 0.25]} />
                  <meshStandardMaterial color="#0284C7" emissive="#0284C7" emissiveIntensity={0.5} />
                </mesh>
                {/* 4 Tiers of Shelves on BOTH Front and Back */}
                {[-0.55, -0.18, 0.18, 0.55].map((yOff, ti) => (
                  <group key={ti} position={[0, yOff, 0]}>
                    {/* Front Shelf Shelf-board */}
                    <mesh position={[0, -0.04, 0.32]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.96, 0.03, 0.55]} />
                      <meshStandardMaterial color="#334155" metalness={0.6} />
                    </mesh>
                    {/* Back Shelf Shelf-board */}
                    <mesh position={[0, -0.04, -0.32]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.96, 0.03, 0.55]} />
                      <meshStandardMaterial color="#334155" metalness={0.6} />
                    </mesh>
                    {/* Front Packaged Goods Rows */}
                    {[-1.3, -0.75, -0.2, 0.35, 0.9, 1.3].map((ix, ii) => (
                      <mesh key={`f-${ii}`} position={[ix, 0.12, 0.32]} castShadow>
                        <boxGeometry args={[0.22, 0.24, 0.18]} />
                        <meshStandardMaterial
                          color={ii % 3 === 0 ? '#DC2626' : ii % 3 === 1 ? '#0284C7' : '#F59E0B'}
                          roughness={0.4}
                        />
                      </mesh>
                    ))}
                    {/* Back Packaged Goods Rows */}
                    {[-1.3, -0.75, -0.2, 0.35, 0.9, 1.3].map((ix, ii) => (
                      <mesh key={`b-${ii}`} position={[ix, 0.12, -0.32]} castShadow>
                        <boxGeometry args={[0.22, 0.24, 0.18]} />
                        <meshStandardMaterial
                          color={ii % 3 === 0 ? '#10B981' : ii % 3 === 1 ? '#8B5CF6' : '#EA580C'}
                          roughness={0.4}
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
                  <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.7} />
                </mesh>
                {/* Luminous Tabletop Edge Glow */}
                <mesh position={[0, 0.38, 0]}>
                  <boxGeometry args={[shelf.dimensions[0] * 0.98, 0.05, shelf.dimensions[2] * 0.98]} />
                  <meshStandardMaterial color="#1E293B" roughness={0.2} metalness={0.5} />
                </mesh>
                {/* Glowing Interactive Display Devices */}
                {[-1.3, -0.45, 0.45, 1.3].map((xOffset, idx) => (
                  <group key={idx} position={[xOffset, 0.45, 0]}>
                    <mesh rotation={[-0.3, 0, 0]} castShadow>
                      <boxGeometry args={[0.42, 0.03, 0.32]} />
                      <meshStandardMaterial color="#0284C7" emissive="#0284C7" emissiveIntensity={0.6} />
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
                {/* Safety Orange Steel Uprights */}
                <mesh position={[-shelf.dimensions[0] * 0.48, 0, 0]}>
                  <boxGeometry args={[0.12, shelf.dimensions[1], shelf.dimensions[2]]} />
                  <meshStandardMaterial color="#EA580C" metalness={0.6} roughness={0.4} />
                </mesh>
                <mesh position={[shelf.dimensions[0] * 0.48, 0, 0]}>
                  <boxGeometry args={[0.12, shelf.dimensions[1], shelf.dimensions[2]]} />
                  <meshStandardMaterial color="#EA580C" metalness={0.6} roughness={0.4} />
                </mesh>
                {/* 3 Vertical Tiers of Pallet Storage */}
                {[-0.8, 0, 0.8].map((yOffset, idx) => (
                  <group key={idx} position={[0, yOffset, 0]}>
                    {/* Blue Heavy Steel Beam */}
                    <mesh>
                      <boxGeometry args={[shelf.dimensions[0] * 0.94, 0.09, shelf.dimensions[2]]} />
                      <meshStandardMaterial color="#1D4ED8" metalness={0.7} roughness={0.4} />
                    </mesh>
                    {/* Stacked Shipping Cartons with Labels */}
                    {[-1.6, -0.55, 0.55, 1.6].map((boxX, boxIdx) => (
                      <group key={boxIdx} position={[boxX, 0.38, 0]}>
                        <mesh castShadow>
                          <boxGeometry args={[0.9, 0.65, 0.95]} />
                          <meshStandardMaterial color="#B45309" roughness={0.8} />
                        </mesh>
                        <mesh position={[0, 0, 0.49]}>
                          <planeGeometry args={[0.32, 0.22]} />
                          <meshBasicMaterial color="#FFFFFF" />
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
                  <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.5} />
                </mesh>
                {/* Glowing Top Promo Header */}
                <mesh position={[0, shelf.dimensions[1] * 0.48, 0]}>
                  <boxGeometry args={[shelf.dimensions[0] * 1.05, 0.25, shelf.dimensions[2] * 0.95]} />
                  <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.5} />
                </mesh>
                {[-0.55, -0.2, 0.15, 0.5].map((yOffset, idx) => (
                  <group key={idx} position={[0, yOffset, 0]}>
                    <mesh position={[0, -0.04, 0]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.92, 0.04, shelf.dimensions[2] * 0.92]} />
                      <meshStandardMaterial color="#475569" metalness={0.8} />
                    </mesh>
                    {[-1.0, -0.35, 0.35, 1.0].map((itemZ, itemIdx) => (
                      <mesh key={itemIdx} position={[0, 0.14, itemZ]} castShadow>
                        <boxGeometry args={[0.65, 0.28, 0.32]} />
                        <meshStandardMaterial
                          color={itemIdx % 2 === 0 ? '#F59E0B' : '#DC2626'}
                          roughness={0.4}
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
                  <meshStandardMaterial color="#92400E" roughness={0.7} />
                </mesh>
                <mesh position={[0, 0, shelf.dimensions[2] * 0.51]}>
                  <planeGeometry args={[shelf.dimensions[0] * 0.8, shelf.dimensions[1] * 0.5]} />
                  <meshBasicMaterial color="#DC2626" />
                </mesh>
                <mesh position={[0, shelf.dimensions[1] * 0.42, 0]} castShadow>
                  <sphereGeometry args={[shelf.dimensions[0] * 0.44, 12, 10]} />
                  <meshStandardMaterial
                    color={shelf.id === 'shelf-db1' ? '#16A34A' : '#0284C7'}
                    roughness={0.5}
                  />
                </mesh>
              </group>
            )}

            {/* ======================================================= */}
            {/* REALISTIC SHELF-EDGE LED STATUS STRIP                   */}
            {/* ======================================================= */}
            {showShelfHealth && (
              <group position={[0, -shelf.dimensions[1] * 0.38, shelf.dimensions[2] * 0.51]}>
                <mesh>
                  <boxGeometry args={[shelf.dimensions[0] * 0.95, 0.06, 0.03]} />
                  <meshStandardMaterial
                    color={statusColor}
                    emissive={statusColor}
                    emissiveIntensity={isCritical ? 1.0 : 0.45}
                  />
                </mesh>
              </group>
            )}

            {/* Hover Selection Wireframe */}
            {isHovered && (
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[shelf.dimensions[0] + 0.12, shelf.dimensions[1] + 0.12, shelf.dimensions[2] + 0.12]} />
                <meshBasicMaterial color="#38BDF8" wireframe transparent opacity={0.5} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}
