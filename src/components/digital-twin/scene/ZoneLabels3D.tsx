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
    // Dark architectural background
    ctx.fillStyle = '#0F172A'
    ctx.roundRect(16, 16, 992, 224, 28)
    ctx.fill()

    // Outer accent border
    ctx.lineWidth = 10
    ctx.strokeStyle = accentColor
    ctx.roundRect(16, 16, 992, 224, 28)
    ctx.stroke()

    // Inner subtle glow border
    ctx.lineWidth = 3
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.roundRect(26, 26, 972, 204, 20)
    ctx.stroke()

    // Accent indicator dot
    ctx.fillStyle = accentColor
    ctx.beginPath()
    ctx.arc(80, 128, 22, 0, Math.PI * 2)
    ctx.fill()

    // Department Title Text
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 72px Inter, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 130, 128)

    // Shopper count pill
    if (count > 0) {
      const countText = `${count} shoppers`
      ctx.font = 'bold 50px Inter, sans-serif'
      const textWidth = ctx.measureText(countText).width
      const pillX = 992 - textWidth - 60

      ctx.fillStyle = '#1E293B'
      ctx.roundRect(pillX, 70, textWidth + 40, 116, 20)
      ctx.fill()

      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 4
      ctx.roundRect(pillX, 70, textWidth + 40, 116, 20)
      ctx.stroke()

      ctx.fillStyle = '#94A3B8'
      ctx.fillText(countText, pillX + 20, 128)
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
        position: [-8, 0.01, -6],
        bounds: [9.5, 7.5],
      },
      {
        id: 'zone-3',
        code: 'Z03',
        name: 'Dairy & Bakery',
        signLabel: 'DAIRY & BAKERY',
        accentColor: '#06B6D4',
        currentShoppers: 22,
        trafficDensity: 'MODERATE',
        avgDwellSeconds: 185,
        shelfHealthPercent: 71,
        criticalShelvesCount: 1,
        opportunityRisk: 'HIGH',
        position: [2, 0.01, -6],
        bounds: [9.5, 7.5],
      },
      {
        id: 'zone-4',
        code: 'Z04',
        name: 'Cold Beverages',
        signLabel: 'COLD BEVERAGES',
        accentColor: '#38BDF8',
        currentShoppers: 18,
        trafficDensity: 'HIGH',
        avgDwellSeconds: 54,
        shelfHealthPercent: 68,
        criticalShelvesCount: 1,
        opportunityRisk: 'HIGH',
        position: [14, 0.01, -6],
        bounds: [8.5, 7.5],
      },
      {
        id: 'zone-6',
        code: 'Z06',
        name: 'Electronics Hub',
        signLabel: 'ELECTRONICS',
        accentColor: '#818CF8',
        currentShoppers: 12,
        trafficDensity: 'MODERATE',
        avgDwellSeconds: 240,
        shelfHealthPercent: 95,
        criticalShelvesCount: 0,
        opportunityRisk: 'LOW',
        position: [3, 0.01, 4.5],
        bounds: [9.5, 7.5],
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
        name: 'Stockroom',
        signLabel: 'STOCKROOM / INVENTORY',
        accentColor: '#F59E0B',
        currentShoppers: 2,
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
                <meshStandardMaterial color="#94A3B8" metalness={0.9} />
              </mesh>
              <mesh position={[1.4, 0.9, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 1.8, 8]} />
                <meshStandardMaterial color="#94A3B8" metalness={0.9} />
              </mesh>

              {/* Sign Board Body Housing */}
              <mesh castShadow>
                <boxGeometry args={[3.4, 0.85, 0.1]} />
                <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.6} />
              </mesh>

              {/* Glowing Accent Underside Light Bar */}
              <mesh position={[0, -0.43, 0]}>
                <boxGeometry args={[3.3, 0.05, 0.08]} />
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
