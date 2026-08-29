import React, { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { TooltipData } from '../controls/TwinTooltip'
import { RetailPalette } from '../theme/retailPalette'
import { ZONE_ANCHORS } from '../layout/storeLayout'
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
  lastRestocked: string
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
} as const

type RenderCategory = 'produce' | 'beverage' | 'dairy' | 'frozen' | 'bakery' | 'deli' | 'grocery' | 'electronics' | 'stockroom'

/** Real backend shelf `category` strings mapped to the closest 3D display type. */
function toRenderCategory(realCategory: string): RenderCategory {
  const c = realCategory.toLowerCase()
  if (c.includes('produce') || c.includes('fruit') || c.includes('veg')) return 'produce'
  if (c.includes('beverage') || c.includes('drink')) return 'beverage'
  if (c.includes('frozen') || c.includes('meat') || c.includes('chilled')) return 'frozen'
  if (c.includes('dairy')) return 'dairy'
  if (c.includes('bakery') || c.includes('bread')) return 'bakery'
  if (c.includes('deli') || c.includes('ready-to-eat') || c.includes('ready to eat')) return 'deli'
  if (c.includes('electronic') || c.includes('gadget')) return 'electronics'
  if (c.includes('stock') || c.includes('backroom') || c.includes('warehouse')) return 'stockroom'
  // Snacks, breakfast, personal care, household, staples, etc. — generic packaged-goods gondola.
  return 'grocery'
}

/** Natural (uncompressed) footprint per display type: [width, height, depth]. */
const DEFAULT_DIMENSIONS: Record<RenderCategory, [number, number, number]> = {
  produce: [4.0, 1.3, 1.8],
  beverage: [3.4, 1.9, 1.3],
  dairy: [3.6, 2.3, 1.2],
  frozen: [3.6, 2.3, 1.2],
  bakery: [3.4, 1.9, 1.3],
  deli: [3.4, 1.7, 1.3],
  grocery: [3.6, 1.9, 1.4],
  electronics: [4.0, 1.2, 1.8],
  stockroom: [5.0, 2.8, 1.4],
}

interface LaidOutShelf {
  position: [number, number, number]
  dimensions: [number, number, number]
}

/**
 * Arranges `count` shelves in a centered grid inside a zone's real footprint
 * (its Digital Twin anchor position + bounds), shrinking each shelf's
 * footprint only as needed to avoid overlap when a zone holds many shelves.
 */
function layoutZoneGrid(
  anchor: { position: [number, number, number]; bounds: [number, number] },
  count: number,
  natural: [number, number, number]
): LaidOutShelf[] {
  if (count <= 0) return []
  const usableW = anchor.bounds[0] * 0.75
  const usableD = anchor.bounds[1] * 0.75
  const aspect = usableW / Math.max(usableD, 1)
  const cols = Math.max(1, Math.min(count, Math.round(Math.sqrt(count * aspect))))
  const rows = Math.max(1, Math.ceil(count / cols))

  const cellW = cols > 1 ? usableW / cols : usableW
  const cellD = rows > 1 ? usableD / rows : usableD
  const scale = Math.max(0.4, Math.min(1, (cellW * 0.86) / natural[0], (cellD * 0.86) / natural[2]))
  const dimensions: [number, number, number] = [natural[0] * scale, natural[1], natural[2] * scale]

  const colGap = cols > 1 ? usableW / (cols - 1) : 0
  const rowGap = rows > 1 ? usableD / (rows - 1) : 0

  const out: LaidOutShelf[] = []
  for (let i = 0; i < count; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = anchor.position[0] - usableW / 2 + (cols > 1 ? col * colGap : usableW / 2)
    const z = anchor.position[2] - usableD / 2 + (rows > 1 ? row * rowGap : usableD / 2)
    out.push({ position: [x, dimensions[1] / 2, z], dimensions })
  }
  return out
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
  const shelfItems = useAppStore((s) => s.shelfItems)

  const liveShelves = useMemo(() => {
    // Group real shelves by their real zone, then lay each zone's shelves
    // out programmatically within that zone's twin footprint — so the scene
    // always reflects exactly which shelves the store actually has, not a
    // hand-picked subset with hardcoded coordinates.
    const byZone = new Map<string, typeof shelfItems>()
    for (const item of shelfItems) {
      const list = byZone.get(item.zoneId)
      if (list) list.push(item)
      else byZone.set(item.zoneId, [item])
    }

    const out: (Shelf3DData & { position: [number, number, number]; dimensions: [number, number, number]; category: RenderCategory })[] = []

    byZone.forEach((items, zoneId) => {
      const anchor = ZONE_ANCHORS[zoneId]
      if (!anchor) return // zone has no mapped 3D footprint (e.g. unrecognized id)

      // Stable order so layout doesn't reshuffle between renders.
      const sorted = [...items].sort((a, b) => a.shelfId.localeCompare(b.shelfId))
      const dominantCategory = toRenderCategory(sorted[0]?.category || '')
      const positions = layoutZoneGrid(anchor, sorted.length, DEFAULT_DIMENSIONS[dominantCategory])

      sorted.forEach((item, i) => {
        const category = toRenderCategory(item.category)
        const laid = positions[i]
        const availability =
          item.capacityCount > 0 ? Math.round((item.currentCount / item.capacityCount) * 100) : 0
        const depletionRate =
          typeof item.depletionRatePerHour === 'number' ? item.depletionRatePerHour : null
        const demand =
          depletionRate === null ? 'Steady' : depletionRate >= 8 ? 'High' : depletionRate >= 3 ? 'Moderate' : 'Low'
        const stockoutPrediction =
          item.status === 'OUT_OF_STOCK'
            ? 'Empty (Now)'
            : typeof item.minutesUntilStockout === 'number' && item.minutesUntilStockout >= 0
              ? item.minutesUntilStockout < 60
                ? `~${Math.round(item.minutesUntilStockout)} min`
                : `${(item.minutesUntilStockout / 60).toFixed(1)} hrs`
              : 'Nominal'

        out.push({
          id: item.id,
          code: item.shelfId,
          name: item.shelfName,
          zone: item.zoneName,
          status: LIVE_STATUS_MAP[item.status] ?? 'HEALTHY',
          availability,
          visibleUnits: item.currentCount,
          capacity: item.capacityCount,
          posInventory: item.backroomUnits ?? 0,
          demand,
          stockoutPrediction,
          replenishmentPriority: Math.round(Math.max(0, Math.min(100, 100 - availability))),
          planogramScore: Math.round(item.planogramComplianceScore ?? 0),
          sku: item.productName || item.sku,
          camera: item.cameraSourceId || 'CAM-01',
          lastRestocked: item.lastRestocked || '',
          category,
          position: laid.position,
          dimensions: laid.dimensions,
        })
      })
    })

    return out
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
      {liveShelves.map((shelf, shelfIndex) => {
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
