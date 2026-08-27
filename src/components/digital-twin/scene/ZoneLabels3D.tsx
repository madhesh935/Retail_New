import React, { useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'
import type { StoreZone } from '@/types/store.types'
import type { ZoneTrafficMetric } from '@/types/shopper.types'
import { ZONE_ANCHORS } from '../layout/storeLayout'
import { RetailPalette } from '../theme/retailPalette'
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

/** Zones that always show an architectural hanging sign. */
const DEFAULT_VISIBLE_IDS = new Set([
  'zone-2',
  'zone-3',
  'zone-4',
  'zone-6',
  'zone-7',
  'zone-stockroom',
])

type ZoneTemplate = Omit<
  Zone3DData,
  'currentShoppers' | 'trafficDensity' | 'avgDwellSeconds' | 'criticalShelvesCount' | 'opportunityRisk'
> & {
  defaultShoppers: number
  defaultDensity: Zone3DData['trafficDensity']
  defaultDwell: number
  defaultCritical: number
  defaultRisk: Zone3DData['opportunityRisk']
}

const ZONE_TEMPLATES: ZoneTemplate[] = [
  {
    id: 'zone-2',
    code: 'Z02',
    name: 'Fresh Produce',
    signLabel: 'FRESH PRODUCE',
    accentColor: RetailPalette.brandTeal,
    shelfHealthPercent: 92,
    position: ZONE_ANCHORS['zone-2'].position,
    bounds: ZONE_ANCHORS['zone-2'].bounds,
    defaultShoppers: 28,
    defaultDensity: 'HIGH',
    defaultDwell: 134,
    defaultCritical: 0,
    defaultRisk: 'LOW',
  },
  {
    id: 'zone-3',
    code: 'Z03',
    name: 'Dairy',
    signLabel: 'DAIRY',
    accentColor: RetailPalette.brandTeal,
    shelfHealthPercent: 71,
    position: ZONE_ANCHORS['zone-3'].position,
    bounds: ZONE_ANCHORS['zone-3'].bounds,
    defaultShoppers: 22,
    defaultDensity: 'MODERATE',
    defaultDwell: 185,
    defaultCritical: 1,
    defaultRisk: 'HIGH',
  },
  {
    id: 'zone-4',
    code: 'Z04',
    name: 'Beverages',
    signLabel: 'BEVERAGES',
    accentColor: RetailPalette.brandTeal,
    shelfHealthPercent: 68,
    position: ZONE_ANCHORS['zone-4'].position,
    bounds: ZONE_ANCHORS['zone-4'].bounds,
    defaultShoppers: 24,
    defaultDensity: 'HIGH',
    defaultDwell: 85,
    defaultCritical: 1,
    defaultRisk: 'HIGH',
  },
  {
    id: 'zone-6',
    code: 'Z06',
    name: 'Electronics',
    signLabel: 'ELECTRONICS',
    accentColor: RetailPalette.brandTeal,
    shelfHealthPercent: 95,
    position: ZONE_ANCHORS['zone-6'].position,
    bounds: ZONE_ANCHORS['zone-6'].bounds,
    defaultShoppers: 12,
    defaultDensity: 'MODERATE',
    defaultDwell: 240,
    defaultCritical: 0,
    defaultRisk: 'LOW',
  },
  {
    id: 'zone-7',
    code: 'Z07',
    name: 'Checkout',
    signLabel: 'CHECKOUT',
    accentColor: RetailPalette.brandTeal,
    shelfHealthPercent: 100,
    position: ZONE_ANCHORS['zone-7'].position,
    bounds: ZONE_ANCHORS['zone-7'].bounds,
    defaultShoppers: 23,
    defaultDensity: 'HIGH',
    defaultDwell: 150,
    defaultCritical: 0,
    defaultRisk: 'HIGH',
  },
  {
    id: 'zone-stockroom',
    code: 'Z08',
    name: 'Stockroom',
    signLabel: 'STOCKROOM',
    accentColor: RetailPalette.brandTeal,
    shelfHealthPercent: 100,
    position: ZONE_ANCHORS['zone-stockroom'].position,
    bounds: ZONE_ANCHORS['zone-stockroom'].bounds,
    defaultShoppers: 4,
    defaultDensity: 'LOW',
    defaultDwell: 600,
    defaultCritical: 0,
    defaultRisk: 'LOW',
  },
]

const SIGN_HEIGHT = 3.0
const WARM_FOOTPRINT = '#D6D0C8'

function normalizeDensity(
  density?: string
): Zone3DData['trafficDensity'] {
  if (density === 'HIGH' || density === 'CONGESTED') return 'HIGH'
  if (density === 'MODERATE') return 'MODERATE'
  return 'LOW'
}

function findStoreZone(zones: StoreZone[], id: string): StoreZone | undefined {
  return zones.find((z) => z.id === id)
}

function findMetric(
  metrics: ZoneTrafficMetric[],
  id: string
): ZoneTrafficMetric | undefined {
  return metrics.find((m) => m.zoneId === id)
}

/** Clean architectural hanging-sign face — white panel, dark slate type, no count pills. */
const createSignTexture = (label: string): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  if (ctx) {
    // Off-white face
    ctx.fillStyle = RetailPalette.signFace
    ctx.fillRect(0, 0, 1024, 256)

    // Subtle inner inset
    ctx.fillStyle = '#F8FAFC'
    ctx.fillRect(18, 18, 988, 220)

    // Thin trim frame
    ctx.strokeStyle = RetailPalette.wallTrim
    ctx.lineWidth = 6
    ctx.strokeRect(12, 12, 1000, 232)

    // Centered department name
    ctx.fillStyle = RetailPalette.signText
    ctx.font = '600 72px "Segoe UI", system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 512, 128)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function buildZones(
  storeZones: StoreZone[],
  zoneMetrics: ZoneTrafficMetric[]
): Zone3DData[] {
  return ZONE_TEMPLATES.map((template) => {
    const storeZone = findStoreZone(storeZones, template.id)
    const metric = findMetric(zoneMetrics, template.id)

    const currentShoppers =
      storeZone?.currentOccupancy ??
      (metric && metric.visitorCount < 120 ? metric.visitorCount : undefined) ??
      template.defaultShoppers

    const trafficDensity = metric
      ? normalizeDensity(metric.trafficDensity)
      : template.defaultDensity

    const avgDwellSeconds =
      storeZone?.avgDwellTimeSeconds ??
      metric?.avgDwellSeconds ??
      template.defaultDwell

    const criticalShelvesCount =
      storeZone && storeZone.alertCount > 0
        ? storeZone.alertCount
        : template.defaultCritical

    const opportunityRisk: Zone3DData['opportunityRisk'] =
      criticalShelvesCount > 0
        ? 'HIGH'
        : trafficDensity === 'HIGH'
          ? 'MEDIUM'
          : template.defaultRisk

    return {
      id: template.id,
      code: storeZone?.code ?? template.code,
      name: storeZone?.name ?? template.name,
      signLabel: template.signLabel,
      accentColor: template.accentColor,
      currentShoppers,
      trafficDensity,
      avgDwellSeconds,
      shelfHealthPercent: template.shelfHealthPercent,
      criticalShelvesCount,
      opportunityRisk,
      position: template.position,
      bounds: template.bounds,
    }
  })
}

export const ZoneLabels3D: React.FC<ZoneLabels3DProps> = ({
  showZones,
  onSelectZone,
  onHoverZone,
}) => {
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null)

  const storeZones = useAppStore((s) => s.zones)
  const zoneMetrics = useAppStore((s) => s.zoneMetrics)

  const zones = useMemo(
    () => buildZones(storeZones ?? [], zoneMetrics ?? []),
    [storeZones, zoneMetrics]
  )

  // Sign faces never change — create once (labels are static template strings)
  const signTextures = useMemo(() => {
    const map = new Map<string, THREE.CanvasTexture>()
    for (const template of ZONE_TEMPLATES) {
      if (DEFAULT_VISIBLE_IDS.has(template.id)) {
        map.set(template.id, createSignTexture(template.signLabel))
      }
    }
    return map
  }, [])

  useEffect(() => {
    return () => {
      signTextures.forEach((t) => t.dispose())
    }
  }, [signTextures])

  const handlePointerOver = (
    zone: Zone3DData,
    e: { stopPropagation: () => void; clientX: number; clientY: number }
  ) => {
    e.stopPropagation()
    setHoveredZoneId(zone.id)
    if (!onHoverZone) return

    const dwellMins = Math.floor(zone.avgDwellSeconds / 60)
    const dwellSecs = zone.avgDwellSeconds % 60
    onHoverZone({
      type: 'zone',
      title: zone.name,
      subtitle: `Zone ${zone.code}`,
      status: `${zone.trafficDensity} TRAFFIC`,
      statusColor: zone.trafficDensity === 'HIGH' ? 'amber' : 'emerald',
      metrics: [
        { label: 'Current Shoppers', value: `${zone.currentShoppers}` },
        { label: 'Traffic Density', value: zone.trafficDensity },
        { label: 'Avg Dwell Time', value: `${dwellMins}m ${dwellSecs}s` },
        {
          label: 'Shelf Health',
          value: `${zone.shelfHealthPercent}%`,
          highlight: zone.shelfHealthPercent < 75,
        },
      ],
      alert:
        zone.criticalShelvesCount > 0
          ? `${zone.criticalShelvesCount} critical shelf needing attention`
          : undefined,
      actionHint: 'Click to open zone overview',
      screenX: e.clientX,
      screenY: e.clientY,
    })
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
        const showSign = DEFAULT_VISIBLE_IDS.has(zone.id)
        const texture = signTextures.get(zone.id)
        const signWidth = Math.min(3.2, Math.max(2.4, zone.signLabel.length * 0.18))

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
            {/* Soft warm-gray footprint — hover only */}
            {isHovered && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
                <planeGeometry args={zone.bounds} />
                <meshBasicMaterial
                  color={WARM_FOOTPRINT}
                  transparent
                  opacity={0.12}
                  depthWrite={false}
                />
              </mesh>
            )}

            {/* Invisible hit plane for easier pointer targeting */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} visible={false}>
              <planeGeometry args={zone.bounds} />
              <meshBasicMaterial />
            </mesh>

            {showSign && (
              <group position={[0, SIGN_HEIGHT, 0]}>
                {/* Suspension cables */}
                <mesh position={[-signWidth * 0.38, 0.55, 0]}>
                  <cylinderGeometry args={[0.008, 0.008, 1.1, 6]} />
                  <meshStandardMaterial
                    color={RetailPalette.baseboard}
                    metalness={0.55}
                    roughness={0.4}
                  />
                </mesh>
                <mesh position={[signWidth * 0.38, 0.55, 0]}>
                  <cylinderGeometry args={[0.008, 0.008, 1.1, 6]} />
                  <meshStandardMaterial
                    color={RetailPalette.baseboard}
                    metalness={0.55}
                    roughness={0.4}
                  />
                </mesh>

                {/* Thin wall-trim frame behind a white face */}
                <mesh>
                  <boxGeometry args={[signWidth + 0.05, 0.56, 0.05]} />
                  <meshStandardMaterial
                    color={RetailPalette.wallTrim}
                    roughness={0.7}
                    metalness={0.1}
                  />
                </mesh>
                <mesh castShadow>
                  <boxGeometry args={[signWidth, 0.5, 0.055]} />
                  <meshStandardMaterial
                    color={RetailPalette.signFace}
                    roughness={0.85}
                    metalness={0.05}
                  />
                </mesh>

                {texture && (
                  <>
                    <mesh position={[0, 0, 0.03]}>
                      <planeGeometry args={[signWidth - 0.05, 0.44]} />
                      <meshBasicMaterial map={texture} toneMapped={false} />
                    </mesh>
                    <mesh position={[0, 0, -0.03]} rotation={[0, Math.PI, 0]}>
                      <planeGeometry args={[signWidth - 0.05, 0.44]} />
                      <meshBasicMaterial map={texture} toneMapped={false} />
                    </mesh>
                  </>
                )}
              </group>
            )}
          </group>
        )
      })}
    </group>
  )
}
