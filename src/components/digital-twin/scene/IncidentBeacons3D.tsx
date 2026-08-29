import React, { useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { resolveZonePosition } from '../layout/storeLayout'
import { RetailPalette } from '../theme/retailPalette'
import { TooltipData } from '../controls/TwinTooltip'
import { TwinIconBadge } from './TwinIconBadge'

interface IncidentBeacons3DProps {
  showIncidents: boolean
  onSelectIncident?: (incident: unknown) => void
  onHoverIncident?: (data: TooltipData | null) => void
}

export const IncidentBeacons3D: React.FC<IncidentBeacons3DProps> = ({
  showIncidents,
  onSelectIncident,
  onHoverIncident,
}) => {
  const incidents = useAppStore((s) => s.incidents)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const markers = useMemo(() => {
    if (!incidents?.length) return []
    return incidents
      .filter((i) => i.status !== 'RESOLVED' && i.status !== 'DISMISSED')
      .map((inc) => {
        const pos = resolveZonePosition(inc.zoneId)
        if (!pos) return null
        return {
          ...inc,
          position: [pos[0], 0.02, pos[2]] as [number, number, number],
        }
      })
      .filter(Boolean) as (typeof incidents[0] & { position: [number, number, number] })[]
  }, [incidents])

  if (!showIncidents || markers.length === 0) return null

  return (
    <group>
      {markers.map((inc) => {
        const critical = inc.severity === 'critical'
        const color = critical ? RetailPalette.critical : RetailPalette.low
        const hovered = hoveredId === inc.id
        return (
          <group
            key={inc.id}
            position={inc.position}
            onClick={(e) => {
              e.stopPropagation()
              onSelectIncident?.(inc)
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHoveredId(inc.id)
              onHoverIncident?.({
                type: 'incident',
                title: inc.title,
                subtitle: inc.zoneName || inc.zoneId,
                status: String(inc.severity).toUpperCase(),
                statusColor: critical ? 'rose' : 'amber',
                metrics: [
                  { label: 'Status', value: String(inc.status) },
                  { label: 'Assigned', value: inc.assignedToStaffName || 'Unassigned' },
                ],
                actionHint: 'Click to open incident',
                screenX: e.clientX,
                screenY: e.clientY,
              })
            }}
            onPointerOut={() => {
              setHoveredId(null)
              onHoverIncident?.(null)
            }}
          >
            {/* Small caution cone */}
            <mesh position={[0.15, 0.28, 0.15]} castShadow>
              <coneGeometry args={[0.1, 0.5, 10]} />
              <meshStandardMaterial color="#EAB308" roughness={0.55} />
            </mesh>
            <mesh position={[0.15, 0.02, 0.15]}>
              <boxGeometry args={[0.22, 0.03, 0.22]} />
              <meshStandardMaterial color="#CA8A04" />
            </mesh>
            <group position={[0, 1.5, 0]}>
              <mesh>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
              <TwinIconBadge icon={AlertTriangle} color={color} hovered={hovered} />
            </group>
          </group>
        )
      })}
    </group>
  )
}
