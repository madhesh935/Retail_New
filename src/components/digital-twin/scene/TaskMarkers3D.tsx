import React, { useMemo, useState } from 'react'
import { UserCheck } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { resolveZonePosition, SHELF_FOCUS, CHECKOUT_FOCUS } from '../layout/storeLayout'
import { RetailPalette } from '../theme/retailPalette'
import { TooltipData } from '../controls/TwinTooltip'
import { TwinIconBadge } from './TwinIconBadge'

export interface TwinTaskMarker {
  id: string
  title: string
  priority: string
  status: string
  zoneName?: string
  position: [number, number, number]
}

interface TaskMarkers3DProps {
  showTasks: boolean
  onSelectTask?: (task: TwinTaskMarker) => void
  onHoverTask?: (data: TooltipData | null) => void
}

function resolveTaskPosition(task: {
  zoneId?: string
  shelfCode?: string
}): [number, number, number] | null {
  if (task.shelfCode) {
    const shelfId = `shelf-${task.shelfCode.toLowerCase()}`
    if (SHELF_FOCUS[shelfId]) return SHELF_FOCUS[shelfId]
    if (CHECKOUT_FOCUS[`lane-${task.shelfCode.replace(/\D/g, '')}`]) {
      return CHECKOUT_FOCUS[`lane-${task.shelfCode.replace(/\D/g, '')}`]
    }
  }
  return resolveZonePosition(task.zoneId)
}

export const TaskMarkers3D: React.FC<TaskMarkers3DProps> = ({
  showTasks,
  onSelectTask,
  onHoverTask,
}) => {
  const pendingTasks = useAppStore((s) => s.pendingTasks)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const markers = useMemo(() => {
    if (!pendingTasks?.length) return []
    return pendingTasks
      .filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && t.status !== 'VERIFIED')
      .map((t) => {
        const pos = resolveTaskPosition(t)
        if (!pos) return null
        return {
          id: t.id,
          title: t.title,
          priority: t.priority,
          status: t.status,
          zoneName: t.zoneName,
          position: [pos[0], 0.05, pos[2]] as [number, number, number],
        } satisfies TwinTaskMarker
      })
      .filter(Boolean) as TwinTaskMarker[]
  }, [pendingTasks])

  if (!showTasks || markers.length === 0) return null

  return (
    <group>
      {markers.map((task) => {
        const critical = task.priority === 'CRITICAL' || task.priority === 'URGENT'
        const color = critical ? RetailPalette.critical : RetailPalette.low
        const hovered = hoveredId === task.id
        return (
          <group
            key={task.id}
            position={task.position}
            onClick={(e) => {
              e.stopPropagation()
              onSelectTask?.(task)
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHoveredId(task.id)
              onHoverTask?.({
                type: 'incident',
                title: task.title,
                subtitle: task.zoneName,
                status: task.status,
                statusColor: critical ? 'rose' : 'amber',
                metrics: [
                  { label: 'Priority', value: task.priority },
                  { label: 'Status', value: task.status },
                ],
                actionHint: 'Click for task details',
                screenX: e.clientX,
                screenY: e.clientY,
              })
            }}
            onPointerOut={() => {
              setHoveredId(null)
              onHoverTask?.(null)
            }}
          >
            <group position={[0, 1.5, 0]}>
              {/* Invisible hit-sphere — the badge itself is a non-interactive HTML overlay */}
              <mesh>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
              <TwinIconBadge icon={UserCheck} color={color} hovered={hovered} />
            </group>
            <mesh position={[0, hovered ? 0.95 : 0.85, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.7, 6]} />
              <meshStandardMaterial color="#64748B" />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <circleGeometry args={[0.2, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.2} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
