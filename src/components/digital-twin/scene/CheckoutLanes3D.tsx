import React, { useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { RetailPalette } from '../theme/retailPalette'
import { TooltipData } from '../controls/TwinTooltip'

export interface Checkout3DData {
  id: string
  code: string
  name: string
  queueLength: number
  waitTimeMinutes: number
  arrivalRate: number
  serviceRate: number
  forecast5Min: number
  congestionRisk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  status: 'CONGESTED' | 'ACTIVE' | 'STANDBY' | 'CLOSED'
  cashierName: string
  cashierEmpId: string
  camera: string
}

interface CheckoutLanes3DProps {
  showQueueStatus: boolean
  onSelectCheckout: (checkout: Checkout3DData) => void
  onHoverCheckout?: (data: TooltipData | null) => void
}

const LANE_LAYOUT: {
  id: string
  code: string
  position: [number, number, number]
  isSelfCheckout?: boolean
}[] = [
  { id: 'lane-1', code: 'C1', position: [10.5, 0, 2.5] },
  { id: 'lane-2', code: 'C2', position: [13.2, 0, 2.5] },
  { id: 'lane-3', code: 'C3', position: [15.9, 0, 2.5] },
  { id: 'lane-4', code: 'C4', position: [18.6, 0, 2.5], isSelfCheckout: true },
]

function riskFromQueue(len: number, waitMin: number): Checkout3DData['congestionRisk'] {
  if (len >= 7 || waitMin >= 4) return 'CRITICAL'
  if (len >= 5 || waitMin >= 3) return 'HIGH'
  if (len >= 3) return 'MODERATE'
  return 'LOW'
}

export const CheckoutLanes3D: React.FC<CheckoutLanes3DProps> = ({
  showQueueStatus,
  onSelectCheckout,
  onHoverCheckout,
}) => {
  const [hoveredLaneId, setHoveredLaneId] = useState<string | null>(null)
  const queues = useAppStore((s) => s.queues)

  const lanes = useMemo(() => {
    return LANE_LAYOUT.map((layout) => {
      const live = queues?.find((q) => q.id === layout.id)
      const queueLength = live?.currentQueueLength ?? 0
      const waitTimeMinutes = live
        ? Math.round((live.currentWaitTimeSeconds / 60) * 10) / 10
        : 0
      const forecast5Min = live?.predictedQueueIn10Min ?? queueLength
      const statusRaw = live?.status
      const status: Checkout3DData['status'] =
        statusRaw === 'CONGESTED'
          ? 'CONGESTED'
          : statusRaw === 'CLOSED'
            ? 'CLOSED'
            : statusRaw === 'STANDBY'
              ? 'STANDBY'
              : 'ACTIVE'
      const congestionRisk = riskFromQueue(queueLength, waitTimeMinutes)
      return {
        id: layout.id,
        code: layout.code,
        name: layout.isSelfCheckout
          ? `Self-Checkout ${layout.code}`
          : `Checkout ${layout.code}`,
        queueLength,
        waitTimeMinutes,
        arrivalRate: 1.5,
        serviceRate: 1.8,
        forecast5Min,
        congestionRisk,
        status: status === 'ACTIVE' && congestionRisk === 'CRITICAL' ? 'CONGESTED' : status,
        cashierName: live?.assignedStaffName || (layout.isSelfCheckout ? 'Self-Service' : 'Unassigned'),
        cashierEmpId: live?.assignedStaffId || '—',
        camera: live?.cameraSourceId || 'cam-05',
        position: layout.position,
        isSelfCheckout: layout.isSelfCheckout,
      }
    })
  }, [queues])

  const handlePointerOver = (lane: (typeof lanes)[0], e: any) => {
    e.stopPropagation()
    setHoveredLaneId(lane.id)
    onHoverCheckout?.({
      type: 'checkout',
      title: lane.code,
      subtitle: lane.cashierName,
      status: lane.status,
      statusColor:
        lane.congestionRisk === 'CRITICAL' ? 'rose' : lane.congestionRisk === 'HIGH' ? 'amber' : 'emerald',
      metrics: [
        { label: 'Queue', value: `${lane.queueLength} shoppers`, highlight: lane.queueLength > 6 },
        { label: 'Wait', value: `${lane.waitTimeMinutes} min`, highlight: lane.waitTimeMinutes > 4 },
        { label: 'Forecast', value: `${lane.forecast5Min}` },
        { label: 'Risk', value: lane.congestionRisk },
      ],
      alert: lane.congestionRisk === 'CRITICAL' ? 'Open another counter' : undefined,
      actionHint: 'Click for details',
      screenX: e.clientX,
      screenY: e.clientY,
    })
  }

  const handlePointerOut = () => {
    setHoveredLaneId(null)
    onHoverCheckout?.(null)
  }

  return (
    <group>
      {lanes.map((lane) => {
        const isHovered = hoveredLaneId === lane.id
        const isCritical = lane.status === 'CONGESTED' || lane.congestionRisk === 'CRITICAL'
        const markerColor = isCritical
          ? RetailPalette.critical
          : lane.congestionRisk === 'HIGH'
            ? RetailPalette.low
            : RetailPalette.healthy

        return (
          <group
            key={lane.id}
            position={lane.position}
            onClick={(e) => {
              e.stopPropagation()
              onSelectCheckout(lane)
            }}
            onPointerOver={(e) => handlePointerOver(lane, e)}
            onPointerOut={handlePointerOut}
          >
            {!lane.isSelfCheckout ? (
              <group>
                <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
                  <boxGeometry args={[1.4, 0.9, 2.2]} />
                  <meshStandardMaterial color={RetailPalette.checkoutBody} metalness={0.35} roughness={0.45} />
                </mesh>
                <mesh position={[0, 0.91, 0]}>
                  <boxGeometry args={[1.44, 0.04, 2.24]} />
                  <meshStandardMaterial color={RetailPalette.checkoutTop} metalness={0.7} roughness={0.25} />
                </mesh>
                <mesh position={[0.25, 0.94, 0.2]}>
                  <boxGeometry args={[0.62, 0.025, 1.4]} />
                  <meshStandardMaterial color={RetailPalette.conveyor} roughness={0.85} />
                </mesh>
                <mesh position={[0.25, 0.955, -0.6]}>
                  <boxGeometry args={[0.42, 0.018, 0.32]} />
                  <meshStandardMaterial color="#94A3B8" transparent opacity={0.55} roughness={0.1} metalness={0.8} />
                </mesh>
                <group position={[-0.35, 0.95, -0.4]}>
                  <mesh position={[0, 0.2, 0]}>
                    <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
                    <meshStandardMaterial color={RetailPalette.stainless} metalness={0.85} />
                  </mesh>
                  <mesh position={[0.05, 0.35, 0]} rotation={[0, -0.4, -0.2]}>
                    <boxGeometry args={[0.28, 0.22, 0.03]} />
                    <meshStandardMaterial color="#1E293B" emissive="#334155" emissiveIntensity={0.15} />
                  </mesh>
                </group>
                <mesh position={[-0.75, 0.45, 1.2]}>
                  <boxGeometry args={[0.05, 0.9, 2.0]} />
                  <meshStandardMaterial color={RetailPalette.stainless} metalness={0.75} roughness={0.25} />
                </mesh>
                <group position={[-0.7, 1.3, -1.0]}>
                  <mesh>
                    <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
                    <meshStandardMaterial color={RetailPalette.stainless} metalness={0.8} />
                  </mesh>
                  <mesh position={[0, 0.6, 0]}>
                    <boxGeometry args={[0.42, 0.26, 0.08]} />
                    <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
                  </mesh>
                  {showQueueStatus && (
                    <mesh position={[0, 0.76, 0]}>
                      <sphereGeometry args={[0.045, 10, 8]} />
                      <meshStandardMaterial
                        color={markerColor}
                        emissive={markerColor}
                        emissiveIntensity={isCritical ? 0.35 : 0.15}
                      />
                    </mesh>
                  )}
                </group>
                <group position={[-0.35, 0, 0]}>
                  <mesh position={[0, 1.52, 0]} castShadow>
                    <sphereGeometry args={[0.11, 10, 8]} />
                    <meshStandardMaterial color="#E0AC69" roughness={0.65} />
                  </mesh>
                  <mesh position={[0, 1.14, 0]} castShadow>
                    <boxGeometry args={[0.32, 0.48, 0.2]} />
                    <meshStandardMaterial color="#F8FAFC" roughness={0.7} />
                  </mesh>
                  <mesh position={[0, 1.14, 0.05]}>
                    <boxGeometry args={[0.3, 0.42, 0.12]} />
                    <meshStandardMaterial color={RetailPalette.staffVest} roughness={0.65} />
                  </mesh>
                </group>
              </group>
            ) : (
              <group>
                <mesh position={[0, 0.55, 0]} castShadow>
                  <boxGeometry args={[0.9, 1.1, 0.7]} />
                  <meshStandardMaterial color={RetailPalette.checkoutBody} metalness={0.45} roughness={0.35} />
                </mesh>
                <mesh position={[0, 1.2, 0]} rotation={[-0.3, 0, 0]}>
                  <boxGeometry args={[0.42, 0.32, 0.05]} />
                  <meshStandardMaterial color="#1E293B" emissive="#475569" emissiveIntensity={0.12} />
                </mesh>
                <mesh position={[0.55, 0.45, 0]}>
                  <boxGeometry args={[0.42, 0.9, 0.62]} />
                  <meshStandardMaterial color={RetailPalette.checkoutTop} metalness={0.5} />
                </mesh>
                {showQueueStatus && (
                  <mesh position={[0, 1.68, 0]}>
                    <sphereGeometry args={[0.04, 10, 8]} />
                    <meshStandardMaterial
                      color={markerColor}
                      emissive={markerColor}
                      emissiveIntensity={0.2}
                    />
                  </mesh>
                )}
              </group>
            )}

            {showQueueStatus &&
              [0, 1, 2, 3, 4].map((i) => {
                const skins = ['#D4A373', '#E0AC69', '#C68642', '#F1C27D', '#8D5524']
                const shirts = ['#64748B', '#475569', '#78716C', '#57534E', '#334155']
                const visible = i < lane.queueLength
                return (
                  <group
                    key={`q-${i}`}
                    position={[0, 0, 1.5 + i * 0.9]}
                    visible={visible}
                  >
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                      <circleGeometry args={[0.2, 12]} />
                      <meshBasicMaterial color="#94A3B8" transparent opacity={0.22} />
                    </mesh>
                    <mesh position={[0, 1.54, 0]} castShadow>
                      <sphereGeometry args={[0.1, 10, 8]} />
                      <meshStandardMaterial color={skins[i % skins.length]} roughness={0.65} />
                    </mesh>
                    <mesh position={[0, 1.16, 0]} castShadow>
                      <boxGeometry args={[0.3, 0.44, 0.18]} />
                      <meshStandardMaterial color={shirts[i % shirts.length]} roughness={0.7} />
                    </mesh>
                    <mesh position={[0, 0.48, 0]} castShadow>
                      <boxGeometry args={[0.26, 0.7, 0.12]} />
                      <meshStandardMaterial color="#334155" roughness={0.8} />
                    </mesh>
                  </group>
                )
              })}

            {isHovered && (
              <mesh position={[0, 0.6, 0.4]}>
                <boxGeometry args={[1.65, 1.35, 3.2]} />
                <meshBasicMaterial color={RetailPalette.hover} transparent opacity={0.1} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}
