import React, { useState, useMemo } from 'react'
import * as THREE from 'three'
import { TooltipData } from '../controls/TwinTooltip'

export interface Zone3DData {
  id: string
  code: string
  name: string
  currentShoppers: number
  trafficDensity: 'HIGH' | 'MODERATE' | 'LOW'
  avgDwellSeconds: number
  shelfHealthPercent: number
  criticalShelvesCount: number
  opportunityRisk: 'HIGH' | 'MEDIUM' | 'LOW'
  position: [number, number, number]
  bounds: [number, number]
  signLabel: string
  accentColor: string
}

interface ZoneLabels3DProps {
  showZones: boolean
  onSelectZone: (zone: Zone3DData) => void
  onHoverZone?: (data: TooltipData | null) => void
}

// Generate high-resolution procedural 3D sign texture
const createSignTexture = (label: string, count: number, accentColor: string) => {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    // 1. High-tech dark glass panel background
    ctx.fillStyle = '#0B1322'
    ctx.roundRect(14, 14, 996, 228, 24)
    ctx.fill()

    // 2. Glowing outer accent border
    ctx.lineWidth = 6
    ctx.strokeStyle = accentColor
    ctx.roundRect(14, 14, 996, 228, 24)
    ctx.stroke()

    // 3. Top accent glow band
    ctx.fillStyle = accentColor
    ctx.roundRect(14, 14, 996, 44, [24, 24, 0, 0])
    ctx.fill()

    // 4. White department category indicator
    ctx.fillStyle = '#0B1322'
    ctx.font = 'bold 26px Inter, Arial, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText('• STORE INTELLIGENCE DEPARTMENT •', 40, 36)

    // 5. Main department title text
    ctx.fillStyle = '#F8FAFC'
    ctx.font = 'bold 74px Inter, Arial, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 40, 150)

    // 6. Real-time Shopper Count Pill (Right)
    if (count > 0) {
      const countText = `${count} shoppers`
      ctx.font = 'bold 44px Inter, Arial, sans-serif'
      const textWidth = ctx.measureText(countText).width
      const pillX = 996 - textWidth - 54

      ctx.fillStyle = '#1E293B'
      ctx.roundRect(pillX, 90, textWidth + 38, 100, 16)
      ctx.fill()

      ctx.strokeStyle = accentColor
      ctx.lineWidth = 3
      ctx.roundRect(pillX, 90, textWidth + 38, 100, 16)
      ctx.stroke()

      ctx.fillStyle = '#38BDF8'
      ctx.fillText(countText, pillX + 19, 142)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export const ZoneLabels3D: React.FC<ZoneLabels3DProps> = ({
  showZones,
  onSelectZone,
  onHoverZone,
}) => {
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null)

  const zones: Zone3DData[] = useMemo(
    () => [
      {
        id: 'zone-1',
        code: 'Z01',
        name: 'Bakery & Gourmet Deli',
        signLabel: 'BAKERY & DELI',
        accentColor: '#F59E0B',
        currentShoppers: 16,
        trafficDensity: 'MODERATE',
        avgDwellSeconds: 160,
        shelfHealthPercent: 88,
        criticalShelvesCount: 0,
        opportunityRisk: 'LOW',
        position: [-14, 0.01, 0],
        bounds: [8.5, 9.5],
      },
      {
        id: 'zone-2',
        code: 'Z02',
        name: 'Fresh Produce',
        signLabel: 'FRESH PRODUCE',
        accentColor: '#10B981',
        currentShoppers: 28,
        trafficDensity: 'HIGH',
        avgDwellSeconds: 134,
        shelfHealthPercent: 92,
        criticalShelvesCount: 0,
        opportunityRisk: 'LOW',
        position: [-10, 0.01, -6],
        bounds: [10.5, 7.5],
      },
      {
        id: 'zone-5',
        code: 'Z05',
        name: 'Grocery & Packaged Goods',
        signLabel: 'GROCERY & PANTRY',
        accentColor: '#6366F1',
        currentShoppers: 34,
        trafficDensity: 'HIGH',
        avgDwellSeconds: 210,
        shelfHealthPercent: 93,
        criticalShelvesCount: 0,
        opportunityRisk: 'LOW',
        position: [2.5, 0.01, -1.5],
        bounds: [11.0, 7.5],
      },
      {
        id: 'zone-3',
        code: 'Z03',
        name: 'Dairy & Frozen Foods',
        signLabel: 'DAIRY & FROZEN',
        accentColor: '#06B6D4',
        currentShoppers: 22,
        trafficDensity: 'MODERATE',
        avgDwellSeconds: 185,
        shelfHealthPercent: 71,
        criticalShelvesCount: 1,
        opportunityRisk: 'HIGH',
        position: [0, 0.01, -6],
        bounds: [9.5, 7.5],
      },
      {
        id: 'zone-4',
        code: 'Z04',
        name: 'Cold Beverages & Snacks',
        signLabel: 'COLD BEVERAGES',
        accentColor: '#0EA5E9',
        currentShoppers: 24,
        trafficDensity: 'HIGH',
        avgDwellSeconds: 85,
        shelfHealthPercent: 68,
        criticalShelvesCount: 1,
        opportunityRisk: 'HIGH',
        position: [14, 0.01, -5.5],
        bounds: [8.5, 8.5],
      },
      {
        id: 'zone-6',
        code: 'Z06',
        name: 'Electronics & Smart Tech',
        signLabel: 'ELECTRONICS',
        accentColor: '#8B5CF6',
        currentShoppers: 12,
        trafficDensity: 'MODERATE',
        avgDwellSeconds: 240,
        shelfHealthPercent: 95,
        criticalShelvesCount: 0,
        opportunityRisk: 'LOW',
        position: [3.5, 0.01, 5.0],
        bounds: [8.5, 6.5],
      },
      {
        id: 'zone-7',
        code: 'Z07',
        name: 'Checkout Plaza',
        signLabel: 'CHECKOUT PLAZA',
        accentColor: '#F43F5E',
        currentShoppers: 23,
        trafficDensity: 'HIGH',
        avgDwellSeconds: 150,
        shelfHealthPercent: 100,
        criticalShelvesCount: 0,
        opportunityRisk: 'HIGH',
        position: [15, 0.01, 3.5],
        bounds: [9.0, 7.5],
      },
      {
        id: 'zone-8',
        code: 'Z08',
        name: 'Stockroom Logistics',
        signLabel: 'STOCKROOM / INVENTORY',
        accentColor: '#F59E0B',
        currentShoppers: 4,
        trafficDensity: 'LOW',
        avgDwellSeconds: 600,
        shelfHealthPercent: 100,
        criticalShelvesCount: 0,
        opportunityRisk: 'LOW',
        position: [0, 0.01, 12.5],
        bounds: [42, 5.0],
      },
    ],
    []
  )

  // Memoize textures for performance
  const signTextures = useMemo(() => {
    const map = new Map<string, THREE.CanvasTexture>()
    zones.forEach((z) => {
      map.set(z.id, createSignTexture(z.signLabel, z.currentShoppers, z.accentColor))
    })
    return map
  }, [zones])

  const handlePointerOver = (zone: Zone3DData, e: any) => {
    e.stopPropagation()
    setHoveredZoneId(zone.id)
    if (onHoverZone) {
      const dwellMins = Math.floor(zone.avgDwellSeconds / 60)
      const dwellSecs = zone.avgDwellSeconds % 60
      onHoverZone({
        type: 'zone',
        title: zone.name,
        subtitle: `Zone ${zone.code} • Live Spatial Telemetry`,
        status: `${zone.trafficDensity} TRAFFIC`,
        statusColor: zone.trafficDensity === 'HIGH' ? 'amber' : 'emerald',
        metrics: [
          { label: 'Current Shoppers', value: `${zone.currentShoppers}` },
          { label: 'Traffic Density', value: zone.trafficDensity },
          { label: 'Avg Dwell Time', value: `${dwellMins}m ${dwellSecs}s` },
          { label: 'Shelf Health', value: `${zone.shelfHealthPercent}%`, highlight: zone.shelfHealthPercent < 75 },
        ],
        alert: zone.criticalShelvesCount > 0 ? `${zone.criticalShelvesCount} Critical shelf needing attention` : undefined,
        actionHint: 'Click to open zone overview',
        screenX: e.clientX,
        screenY: e.clientY,
      })
    }
  }

  const handlePointerOut = () => {
    setHoveredZoneId(null)
    if (onHoverZone) onHoverZone(null)
  }

  if (!showZones) return null

  return (
    <group>
      {zones.map((zone) => {
        const isHovered = hoveredZoneId === zone.id
        const texture = signTextures.get(zone.id)

        return (
          <group
            key={zone.id}
            position={zone.position}
            onClick={(e) => {
              e.stopPropagation()
              onSelectZone(zone)
            }}
            onPointerOver={(e) => handlePointerOver(zone, e)}
            onPointerOut={handlePointerOut}
          >
            {/* Subtle Floor Zone Footprint Boundary */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
              <planeGeometry args={zone.bounds} />
              <meshBasicMaterial
                color={zone.accentColor}
                transparent
                opacity={isHovered ? 0.15 : 0.04}
              />
            </mesh>

            {/* Perimeter border outline */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
              <ringGeometry
                args={[
                  Math.min(zone.bounds[0], zone.bounds[1]) * 0.44,
                  Math.min(zone.bounds[0], zone.bounds[1]) * 0.46,
                  32,
                ]}
              />
              <meshBasicMaterial
                color={zone.accentColor}
                transparent
                opacity={isHovered ? 0.6 : 0.25}
              />
            </mesh>

            {/* Physical Overhead Suspended Architectural Department Sign */}
            <group position={[0, 4.2, 0]}>
              {/* Suspended Steel Wire Cables */}
              <mesh position={[-1.4, 0.9, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 1.8, 8]} />
                <meshStandardMaterial color="#90A4AE" metalness={0.9} />
              </mesh>
              <mesh position={[1.4, 0.9, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 1.8, 8]} />
                <meshStandardMaterial color="#90A4AE" metalness={0.9} />
              </mesh>

              {/* Sign Board Body — dark glass panel */}
              <mesh castShadow>
                <boxGeometry args={[3.4, 0.85, 0.1]} />
                <meshStandardMaterial color="#0B1322" roughness={0.3} metalness={0.6} />
              </mesh>

              {/* Luminous Department Accent Neon Bottom Strip */}
              <mesh position={[0, -0.43, 0]}>
                <boxGeometry args={[3.3, 0.06, 0.12]} />
                <meshBasicMaterial color={zone.accentColor} />
              </mesh>

              {/* Front Sign Face (3D Texture - NEVER leaks over UI drawers) */}
              {texture && (
                <mesh position={[0, 0, 0.055]}>
                  <planeGeometry args={[3.3, 0.8]} />
                  <meshBasicMaterial map={texture} transparent />
                </mesh>
              )}

              {/* Back Sign Face (Double Sided) */}
              {texture && (
                <mesh position={[0, 0, -0.055]} rotation={[0, Math.PI, 0]}>
                  <planeGeometry args={[3.3, 0.8]} />
                  <meshBasicMaterial map={texture} transparent />
                </mesh>
              )}
            </group>
          </group>
        )
      })}
    </group>
  )
}
