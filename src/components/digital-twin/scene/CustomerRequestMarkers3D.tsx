import React, { useMemo, useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { resolveZonePosition, SHELF_FOCUS } from '../layout/storeLayout'
import { RetailPalette } from '../theme/retailPalette'
import { TooltipData } from '../controls/TwinTooltip'
import { TwinIconBadge } from './TwinIconBadge'
import type { CustomerHelpRequest } from '@/store/slices/customerRequestSlice'

interface CustomerRequestMarkers3DProps {
  showRequests: boolean
  onSelectRequest?: (req: CustomerHelpRequest) => void
  onHoverRequest?: (data: TooltipData | null) => void
}

export const CustomerRequestMarkers3D: React.FC<CustomerRequestMarkers3DProps> = ({
  showRequests,
  onSelectRequest,
  onHoverRequest,
}) => {
  const customerRequests = useAppStore((s) => s.customerRequests)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const markers = useMemo(() => {
    if (!customerRequests?.length) return []
    return customerRequests
      .filter((r) => !['COMPLETED', 'CANCELLED', 'UNAVAILABLE'].includes(r.status))
      .map((r) => {
        let pos = resolveZonePosition(r.zoneId)
        if (r.shelfCode) {
          const shelfKey = `shelf-${r.shelfCode.toLowerCase()}`
          if (SHELF_FOCUS[shelfKey]) pos = SHELF_FOCUS[shelfKey]
        }
        if (!pos) return null
        return { req: r, position: [pos[0] + 0.4, 0.05, pos[2] + 0.4] as [number, number, number] }
      })
      .filter(Boolean) as { req: CustomerHelpRequest; position: [number, number, number] }[]
  }, [customerRequests])

  if (!showRequests || markers.length === 0) return null

  return (
    <group>
      {markers.map(({ req, position }) => {
        const assigned = Boolean(req.assignedStaffId) || ['ASSIGNED', 'ACCEPTED', 'ASSISTING', 'ON_THE_WAY', 'ARRIVED'].includes(req.status)
        const color = assigned ? RetailPalette.brandTeal : RetailPalette.low
        const hovered = hoveredId === req.id
        return (
          <group
            key={req.id}
            position={position}
            onClick={(e) => {
              e.stopPropagation()
              onSelectRequest?.(req)
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHoveredId(req.id)
              onHoverRequest?.({
                type: 'incident',
                title: 'Customer Assistance',
                subtitle: `${req.zoneName}${req.shelfCode ? ` · ${req.shelfCode}` : ''}`,
                status: req.status,
                statusColor: assigned ? 'cyan' : 'amber',
                metrics: [
                  { label: 'Request', value: req.message.slice(0, 48) },
                  { label: 'Assigned', value: req.assignedStaffName || 'None' },
                ],
                actionHint: 'Click to open request',
                screenX: e.clientX,
                screenY: e.clientY,
              })
            }}
            onPointerOut={() => {
              setHoveredId(null)
              onHoverRequest?.(null)
            }}
          >
            <group position={[0, 1.5, 0]}>
              <mesh>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
              <TwinIconBadge icon={HelpCircle} color={color} hovered={hovered} />
            </group>
            <mesh position={[0, 0.85, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.75, 6]} />
              <meshStandardMaterial color="#64748B" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <circleGeometry args={[0.18, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.22} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
