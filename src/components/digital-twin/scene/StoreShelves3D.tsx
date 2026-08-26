import React, { useState } from 'react'
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
    category: 'produce' | 'beverage' | 'dairy' | 'bakery' | 'electronics' | 'stockroom' | 'endcap' | 'dumpbin'
  })[] = [
    // 1. BEVERAGE SHELF B4 (Critical Stock-Out: 17% Availability, 3 units, 9 min stockout)
    {
      id: 'shelf-b4',
      code: 'B4',
      name: 'Beverage Shelf B4',
      zone: 'Beverages',
      status: 'CRITICAL',
      availability: 17,
      visibleUnits: 3,
      posInventory: 14,
      demand: 'High',
      stockoutPrediction: '9 min',
      replenishmentPriority: 94,
      planogramScore: 92,
      sku: 'Zero Sugar Cola',
      camera: 'CAM-03 (Beverages)',
      category: 'beverage',
      position: [14, 0.95, -4.5],
      dimensions: [3.4, 1.9, 1.3],
    },
    // 2. Beverage Shelf B3 (Healthy)
    {
      id: 'shelf-b3',
      code: 'B3',
      name: 'Snacks & Soda B3',
      zone: 'Beverages',
      status: 'HEALTHY',
      availability: 88,
      visibleUnits: 28,
      posInventory: 60,
      demand: 'Moderate',
      stockoutPrediction: '> 3 hrs',
      replenishmentPriority: 25,
      planogramScore: 96,
      sku: 'Sparkling Mineral Water',
      camera: 'CAM-03 (Beverages)',
      category: 'beverage',
      position: [14, 0.95, -7.5],
      dimensions: [3.4, 1.9, 1.3],
    },
    // 3. Produce Island A1 (Healthy 92%)
    {
      id: 'shelf-a1',
      code: 'A1',
      name: 'Produce Table A1',
      zone: 'Fresh Produce',
      status: 'HEALTHY',
      availability: 92,
      visibleUnits: 38,
      posInventory: 80,
      demand: 'High',
      stockoutPrediction: '4.5 hrs',
      replenishmentPriority: 15,
      planogramScore: 94,
      sku: 'Royal Gala Apples',
      camera: 'CAM-02 (Produce)',
      category: 'produce',
      position: [-8, 0.65, -4.5],
      dimensions: [4.2, 1.3, 1.8],
    },
    // 4. Produce Island A2 (Low Stock 58%)
    {
      id: 'shelf-a2',
      code: 'A2',
      name: 'Produce Table A2',
      zone: 'Fresh Produce',
      status: 'LOW',
      availability: 58,
      visibleUnits: 14,
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
    // 5. Dairy Cooler Wall C2 (Out of Stock Milk)
    {
      id: 'shelf-c2',
      code: 'C2',
      name: 'Dairy Cooler C2',
      zone: 'Dairy & Bakery',
      status: 'OUT_OF_STOCK',
      availability: 0,
      visibleUnits: 0,
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
    // 6. Dairy & Yogurt Cooler C1
    {
      id: 'shelf-c1',
      code: 'C1',
      name: 'Dairy Cooler C1',
      zone: 'Dairy & Bakery',
      status: 'HEALTHY',
      availability: 94,
      visibleUnits: 32,
      posInventory: 55,
      demand: 'Moderate',
      stockoutPrediction: '> 4 hrs',
      replenishmentPriority: 10,
      planogramScore: 97,
      sku: 'Greek Yogurt & Butter',
      camera: 'CAM-03 (Beverages)',
      category: 'dairy',
      position: [2, 1.15, -4.5],
      dimensions: [3.6, 2.3, 1.2],
    },
    // 7. Bakery Tier D1
    {
      id: 'shelf-d1',
      code: 'D1',
      name: 'Bakery Wall D1',
      zone: 'Dairy & Bakery',
      status: 'HEALTHY',
      availability: 85,
      visibleUnits: 22,
      posInventory: 30,
      demand: 'Moderate',
      stockoutPrediction: '2.5 hrs',
      replenishmentPriority: 30,
      planogramScore: 91,
      sku: 'Artisan Sourdough & Baguettes',
      camera: 'CAM-02 (Produce)',
      category: 'bakery',
      position: [-16, 0.95, -6.0],
      dimensions: [3.2, 1.9, 1.3],
    },
    // 8. Electronics Island E1
    {
      id: 'shelf-e1',
      code: 'E1',
      name: 'Electronics Table E1',
      zone: 'Electronics',
      status: 'HEALTHY',
      availability: 90,
      visibleUnits: 18,
      posInventory: 25,
      demand: 'Low',
      stockoutPrediction: '> 8 hrs',
      replenishmentPriority: 10,
      planogramScore: 99,
      sku: 'Tablets, Headphones & Accessories',
      camera: 'CAM-04 (Personal Care)',
      category: 'electronics',
      position: [3, 0.6, 4.5],
      dimensions: [4.2, 1.2, 1.8],
    },
    // 9. Stockroom Heavy Racks S1
    {
      id: 'shelf-s1',
      code: 'S1',
      name: 'Backroom Pallet Rack S1',
      zone: 'Stockroom',
      status: 'HEALTHY',
      availability: 78,
      visibleUnits: 45,
      posInventory: 120,
      demand: 'Internal',
      stockoutPrediction: 'Nominal',
      replenishmentPriority: 12,
      planogramScore: 95,
      sku: 'Overstock Dry Goods & Bulk Packs',
      camera: 'CAM-06 (Loading Dock)',
      category: 'stockroom',
      position: [-10, 1.3, 12.5],
      dimensions: [5.2, 2.6, 1.4],
    },
    // 10. Stockroom Heavy Racks S2
    {
      id: 'shelf-s2',
      code: 'S2',
      name: 'Backroom Pallet Rack S2',
      zone: 'Stockroom',
      status: 'HEALTHY',
      availability: 82,
      visibleUnits: 60,
      posInventory: 150,
      demand: 'Internal',
      stockoutPrediction: 'Nominal',
      replenishmentPriority: 15,
      planogramScore: 96,
      sku: 'Cold Storage Buffer & Inflow Crates',
      camera: 'CAM-06 (Loading Dock)',
      category: 'stockroom',
      position: [10, 1.3, 12.5],
      dimensions: [5.2, 2.6, 1.4],
    },
    // 11. Promotional Endcap Gondola - Aisle 3 (Snack & Salsa Tower)
    {
      id: 'shelf-ec1',
      code: 'EC1',
      name: 'Promotional Endcap EC1',
      zone: 'Beverages',
      status: 'HEALTHY',
      availability: 86,
      visibleUnits: 24,
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
    // 12. Seasonal Island Dump Bin - Main Concourse
    {
      id: 'shelf-db1',
      code: 'DB1',
      name: 'Promo Dump Bin DB1',
      zone: 'Fresh Produce',
      status: 'HEALTHY',
      availability: 95,
      visibleUnits: 50,
      posInventory: 90,
      demand: 'Moderate',
      stockoutPrediction: '> 5 hrs',
      replenishmentPriority: 10,
      planogramScore: 95,
      sku: 'Seasonal Citrus & Melons',
      camera: 'CAM-02 (Produce)',
      category: 'dumpbin',
      position: [-3.5, 0.45, -5.5],
      dimensions: [1.3, 0.9, 1.3],
    },
    // 13. Entrance Beverage Pallet Stack
    {
      id: 'shelf-db2',
      code: 'DB2',
      name: 'Inflow Pallet Shipper DB2',
      zone: 'Beverages',
      status: 'HEALTHY',
      availability: 90,
      visibleUnits: 36,
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
            {/* 1. PRODUCE DISPLAY TABLES */}
            {/* ======================================================= */}
            {shelf.category === 'produce' && (
              <group>
                {/* Wood Table Base */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[shelf.dimensions[0], 0.6, shelf.dimensions[2]]} />
                  <meshStandardMaterial color="#854D0E" roughness={0.7} />
                </mesh>
                {/* Sloped Top Display Tier */}
                <mesh position={[0, 0.45, 0]} rotation={[0.08, 0, 0]} castShadow>
                  <boxGeometry args={[shelf.dimensions[0] * 0.96, 0.3, shelf.dimensions[2] * 0.94]} />
                  <meshStandardMaterial color="#A16207" roughness={0.6} />
                </mesh>
                {/* Produce Wooden Crates & Fruit Rows */}
                {[-1.5, -0.75, 0, 0.75, 1.5].map((xOffset, idx) => (
                  <group key={idx} position={[xOffset, 0.68, 0]}>
                    <mesh castShadow>
                      <boxGeometry args={[0.62, 0.18, 1.3]} />
                      <meshStandardMaterial color="#78350F" roughness={0.8} />
                    </mesh>
                    {/* Vibrant Produce Items (Red Apples / Bright Citrus / Fresh Greens) */}
                    <mesh position={[0, 0.12, 0]}>
                      <boxGeometry args={[0.56, 0.14, 1.2]} />
                      <meshStandardMaterial
                        color={idx % 3 === 0 ? '#DC2626' : idx % 3 === 1 ? '#EA580C' : '#65A30D'}
                        roughness={0.4}
                      />
                    </mesh>
                  </group>
                ))}
              </group>
            )}

            {/* ======================================================= */}
            {/* 2. REFRIGERATED BEVERAGE COOLERS */}
            {/* ======================================================= */}
            {shelf.category === 'beverage' && (
              <group>
                {/* Cooler Metallic Charcoal Outer Cabinet */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[shelf.dimensions[0], shelf.dimensions[1], shelf.dimensions[2]]} />
                  <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.3} />
                </mesh>

                {/* Bright Illuminated Interior Backplate */}
                <mesh position={[0, 0, 0.1]}>
                  <boxGeometry args={[shelf.dimensions[0] * 0.94, shelf.dimensions[1] * 0.88, shelf.dimensions[2] * 0.7]} />
                  <meshStandardMaterial color="#F8FAFC" roughness={0.2} emissive="#F8FAFC" emissiveIntensity={0.15} />
                </mesh>

                {/* Cooler Top Header Branding Lightbox */}
                <mesh position={[0, shelf.dimensions[1] * 0.44, shelf.dimensions[2] * 0.48]}>
                  <boxGeometry args={[shelf.dimensions[0] * 0.95, 0.22, 0.08]} />
                  <meshStandardMaterial color="#0284C7" emissive="#0284C7" emissiveIntensity={0.4} />
                </mesh>

                {/* 3 Interior Shelves with Beverage Cans Rows */}
                {[-0.45, 0, 0.45].map((yOffset, shelfIdx) => (
                  <group key={shelfIdx} position={[0, yOffset, shelf.dimensions[2] * 0.2]}>
                    {/* Shelf Metal Grid */}
                    <mesh position={[0, -0.05, 0]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.9, 0.04, shelf.dimensions[2] * 0.6]} />
                      <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
                    </mesh>
                    {/* Instanced Cans / Bottle Facings */}
                    {[-1.2, -0.6, 0, 0.6, 1.2].map((canX, canIdx) => (
                      <mesh key={canIdx} position={[canX, 0.14, 0]} castShadow>
                        <cylinderGeometry args={[0.09, 0.09, 0.28, 12]} />
                        <meshStandardMaterial
                          color={shelf.id === 'shelf-b4' ? (canIdx < 1 ? '#EF4444' : '#E2E8F0') : canIdx % 2 === 0 ? '#38BDF8' : '#F59E0B'}
                          metalness={0.8}
                          roughness={0.2}
                        />
                      </mesh>
                    ))}
                  </group>
                ))}
                {/* Clear Specular Glass Front Panel */}
                <mesh position={[0, 0, shelf.dimensions[2] * 0.52]}>
                  <planeGeometry args={[shelf.dimensions[0] * 0.94, shelf.dimensions[1] * 0.85]} />
                  <meshStandardMaterial color="#E0F2FE" transparent opacity={0.25} roughness={0.1} metalness={0.9} />
                </mesh>
              </group>
            )}

            {/* ======================================================= */}
            {/* 3. DAIRY & BAKERY DISPLAY COOLERS & WIRE RACKS */}
            {/* ======================================================= */}
            {(shelf.category === 'dairy' || shelf.category === 'bakery') && (
              <group>
                {/* Cabinet Shell */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[shelf.dimensions[0], shelf.dimensions[1], shelf.dimensions[2]]} />
                  <meshStandardMaterial color={shelf.category === 'bakery' ? '#78350F' : '#334155'} metalness={0.4} roughness={0.4} />
                </mesh>
                {/* Illuminated Interior Backplate */}
                <mesh position={[0, 0, 0.1]}>
                  <boxGeometry args={[shelf.dimensions[0] * 0.94, shelf.dimensions[1] * 0.88, shelf.dimensions[2] * 0.7]} />
                  <meshStandardMaterial color={shelf.category === 'bakery' ? '#FEF3C7' : '#F8FAFC'} roughness={0.3} emissive="#FFFFFF" emissiveIntensity={0.1} />
                </mesh>
                {/* Tier Shelves */}
                {[-0.55, 0, 0.55].map((yOffset, idx) => (
                  <group key={idx} position={[0, yOffset, shelf.dimensions[2] * 0.2]}>
                    <mesh position={[0, -0.04, 0]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.92, 0.04, shelf.dimensions[2] * 0.55]} />
                      <meshStandardMaterial color="#CBD5E1" metalness={0.8} />
                    </mesh>
                    {/* Cartons / Bread packages */}
                    {[-1.1, -0.4, 0.4, 1.1].map((itemX, itemIdx) => (
                      <mesh key={itemIdx} position={[itemX, 0.15, 0]} castShadow>
                        <boxGeometry args={[0.24, 0.28, 0.24]} />
                        <meshStandardMaterial
                          color={shelf.category === 'bakery' ? '#D97706' : shelf.status === 'OUT_OF_STOCK' ? '#64748B' : itemIdx % 2 === 0 ? '#38BDF8' : '#EF4444'}
                          roughness={0.4}
                        />
                      </mesh>
                    ))}
                  </group>
                ))}
              </group>
            )}

            {/* ======================================================= */}
            {/* 4. ELECTRONICS DISPLAY ISLAND */}
            {/* ======================================================= */}
            {shelf.category === 'electronics' && (
              <group>
                {/* Modern White/Charcoal Table Stand */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[shelf.dimensions[0], 0.75, shelf.dimensions[2]]} />
                  <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.6} />
                </mesh>
                {/* Clean Tabletop Surface */}
                <mesh position={[0, 0.38, 0]}>
                  <boxGeometry args={[shelf.dimensions[0] * 0.98, 0.05, shelf.dimensions[2] * 0.98]} />
                  <meshStandardMaterial color="#F8FAFC" roughness={0.2} />
                </mesh>
                {/* Glowing Interactive Display Devices */}
                {[-1.3, -0.45, 0.45, 1.3].map((xOffset, idx) => (
                  <group key={idx} position={[xOffset, 0.45, 0]}>
                    <mesh rotation={[-0.3, 0, 0]} castShadow>
                      <boxGeometry args={[0.42, 0.03, 0.32]} />
                      <meshStandardMaterial color="#0284C7" emissive="#0284C7" emissiveIntensity={0.5} />
                    </mesh>
                  </group>
                ))}
              </group>
            )}

            {/* ======================================================= */}
            {/* 5. STOCKROOM INDUSTRIAL PALLET RACKS */}
            {/* ======================================================= */}
            {shelf.category === 'stockroom' && (
              <group>
                {/* Safety Orange Steel Upright Columns */}
                <mesh position={[-shelf.dimensions[0] * 0.48, 0, 0]}>
                  <boxGeometry args={[0.12, shelf.dimensions[1], shelf.dimensions[2]]} />
                  <meshStandardMaterial color="#EA580C" metalness={0.6} roughness={0.4} />
                </mesh>
                <mesh position={[shelf.dimensions[0] * 0.48, 0, 0]}>
                  <boxGeometry args={[0.12, shelf.dimensions[1], shelf.dimensions[2]]} />
                  <meshStandardMaterial color="#EA580C" metalness={0.6} roughness={0.4} />
                </mesh>
                {/* Industrial Blue Beams & Shipping Cartons */}
                {[-0.6, 0.6].map((yOffset, idx) => (
                  <group key={idx} position={[0, yOffset, 0]}>
                    <mesh>
                      <boxGeometry args={[shelf.dimensions[0] * 0.94, 0.09, shelf.dimensions[2]]} />
                      <meshStandardMaterial color="#2563EB" metalness={0.7} roughness={0.4} />
                    </mesh>
                    {/* Stacked Shipping Cartons with white labels */}
                    {[-1.5, -0.5, 0.5, 1.5].map((boxX, boxIdx) => (
                      <group key={boxIdx} position={[boxX, 0.38, 0]}>
                        <mesh castShadow>
                          <boxGeometry args={[0.85, 0.65, 0.95]} />
                          <meshStandardMaterial color="#D97706" roughness={0.8} />
                        </mesh>
                        {/* Shipping Label */}
                        <mesh position={[0, 0, 0.49]}>
                          <planeGeometry args={[0.3, 0.2]} />
                          <meshBasicMaterial color="#FFFFFF" />
                        </mesh>
                      </group>
                    ))}
                  </group>
                ))}
              </group>
            )}

            {/* ======================================================= */}
            {/* 6. PROMOTIONAL ENDCAP GONDOLA (Snack & Beverage Tower) */}
            {/* ======================================================= */}
            {shelf.category === 'endcap' && (
              <group>
                {/* Charcoal Gondola Frame */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[shelf.dimensions[0], shelf.dimensions[1], shelf.dimensions[2]]} />
                  <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.4} />
                </mesh>
                {/* Top Promo Header Cardboard Topper */}
                <mesh position={[0, shelf.dimensions[1] * 0.48, 0]}>
                  <boxGeometry args={[shelf.dimensions[0] * 1.05, 0.25, shelf.dimensions[2] * 0.95]} />
                  <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.3} />
                </mesh>
                {/* 4 Tier Shelves with colorful snack packaging */}
                {[-0.55, -0.2, 0.15, 0.5].map((yOffset, idx) => (
                  <group key={idx} position={[0, yOffset, 0]}>
                    <mesh position={[0, -0.04, 0]}>
                      <boxGeometry args={[shelf.dimensions[0] * 0.92, 0.04, shelf.dimensions[2] * 0.92]} />
                      <meshStandardMaterial color="#CBD5E1" metalness={0.8} />
                    </mesh>
                    {/* Rows of Chip bags / Salsa jars */}
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

            {/* ======================================================= */}
            {/* 7. SEASONAL ISLAND DUMP BINS & PALLET SHIPPERS */}
            {/* ======================================================= */}
            {shelf.category === 'dumpbin' && (
              <group>
                {/* Cardboard Hex/Square Shipper Tub */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[shelf.dimensions[0], shelf.dimensions[1], shelf.dimensions[2]]} />
                  <meshStandardMaterial color="#D97706" roughness={0.7} />
                </mesh>
                {/* Promotional Side Label Strip */}
                <mesh position={[0, 0, shelf.dimensions[2] * 0.51]}>
                  <planeGeometry args={[shelf.dimensions[0] * 0.8, shelf.dimensions[1] * 0.5]} />
                  <meshBasicMaterial color="#DC2626" />
                </mesh>
                {/* Bulging Fruits / Bulk Drink 24-Packs inside bin */}
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
            {/* REALISTIC SHELF-EDGE LED STATUS STRIP */}
            {/* ======================================================= */}
            {showShelfHealth && (
              <group position={[0, -shelf.dimensions[1] * 0.38, shelf.dimensions[2] * 0.51]}>
                <mesh>
                  <boxGeometry args={[shelf.dimensions[0] * 0.95, 0.06, 0.03]} />
                  <meshStandardMaterial
                    color={statusColor}
                    emissive={statusColor}
                    emissiveIntensity={isCritical ? 0.9 : 0.4}
                  />
                </mesh>
              </group>
            )}

            {/* Subtle Hover Selection Wireframe */}
            {isHovered && (
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[shelf.dimensions[0] + 0.12, shelf.dimensions[1] + 0.12, shelf.dimensions[2] + 0.12]} />
                <meshBasicMaterial color="#38BDF8" wireframe transparent opacity={0.45} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}
