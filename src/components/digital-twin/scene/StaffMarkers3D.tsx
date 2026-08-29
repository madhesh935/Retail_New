import React, { useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { resolveZonePosition } from '../layout/storeLayout'
import { RetailPalette } from '../theme/retailPalette'
import { TooltipData } from '../controls/TwinTooltip'
import { AnimatedHumanoid } from './AnimatedHumanoid'

const STAFF_SCALE = 1.6

export interface Staff3DData {
  id: string
  code: string
  name: string
  role: string
  currentTask: string
  position: [number, number, number]
  status: 'ACTIVE' | 'ASSIGNED' | 'STANDBY' | 'AVAILABLE' | 'BUSY'
  zoneId?: string
  zoneName?: string
}

interface StaffMarkers3DProps {
  showStaff: boolean
  onSelectStaff?: (staff: Staff3DData) => void
  onHoverStaff?: (data: TooltipData | null) => void
}

const StaffAvatar: React.FC<{ hovered: boolean; phase: number }> = ({ hovered, phase }) => (
  <AnimatedHumanoid
    primaryColor={RetailPalette.staffVest}
    skinColor="#E0AC69"
    accentColor={RetailPalette.staffAccent}
    legColor="#1E293B"
    ringColor={RetailPalette.staffAccent}
    scale={STAFF_SCALE}
    phase={phase}
    hovered={hovered}
  />
)

/**
 * Staff placed at approximate zone anchors from canonical staff state.
 * No fake patrol routes — only zone-level placement when precise coords are absent.
 */
export const StaffMarkers3D: React.FC<StaffMarkers3DProps> = ({
  showStaff,
  onSelectStaff,
  onHoverStaff,
}) => {
  const staffMembers = useAppStore((s) => s.staffMembers)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const staffList: Staff3DData[] = useMemo(() => {
    if (!staffMembers?.length) return []
    return staffMembers
      .filter((m) => m.status !== 'OFF_DUTY' && m.status !== 'ON_BREAK')
      .map((m, idx) => {
        const zonePos = resolveZonePosition(m.currentZoneId)
        // Slight offset so multiple staff in same zone don't stack
        const ox = ((idx % 3) - 1) * 0.7
        const oz = (Math.floor(idx / 3) % 2) * 0.6
        const base = zonePos || ([0, 0, 0] as [number, number, number])
        const code = m.employeeId?.replace('EMP-', 'S') || `S${String(idx + 1).padStart(2, '0')}`
        const busy =
          m.status === 'ON_DUTY_BUSY' || m.status === 'DISPATCHED'
            ? 'BUSY'
            : m.status === 'ON_DUTY_AVAILABLE'
              ? 'AVAILABLE'
              : 'ACTIVE'
        return {
          id: m.id,
          code,
          name: m.name,
          role: String(m.role).replace(/_/g, ' '),
          currentTask: m.currentTaskDescription || 'On floor',
          position: [base[0] + ox, 0, base[2] + oz] as [number, number, number],
          status: busy as Staff3DData['status'],
          zoneId: m.currentZoneId,
          zoneName: m.currentZoneName,
        }
      })
  }, [staffMembers])

  if (!showStaff || staffList.length === 0) return null

  return (
    <group>
      {staffList.map((st) => {
        const hovered = hoveredId === st.id
        return (
          <group
            key={st.id}
            position={st.position}
            onClick={(e) => {
              e.stopPropagation()
              onSelectStaff?.(st)
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHoveredId(st.id)
              onHoverStaff?.({
                type: 'staff',
                title: `${st.code} ${st.name}`,
                subtitle: st.role,
                status: st.status,
                statusColor: 'cyan',
                metrics: [
                  { label: 'Zone', value: st.zoneName || '—' },
                  { label: 'Task', value: st.currentTask },
                ],
                actionHint: 'Click for staff details',
                screenX: e.clientX,
                screenY: e.clientY,
              })
            }}
            onPointerOut={() => {
              setHoveredId(null)
              onHoverStaff?.(null)
            }}
          >
            <StaffAvatar hovered={hovered} phase={st.position[0] * 3.7 + st.position[2] * 1.3} />
            {hovered && (
              <mesh position={[0, 1.6 * STAFF_SCALE + 0.25, 0]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshBasicMaterial color={RetailPalette.staffAccent} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}
