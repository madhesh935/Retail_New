import React, { useState } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
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

export const CheckoutLanes3D: React.FC<CheckoutLanes3DProps> = ({
  showQueueStatus,
  onSelectCheckout,
  onHoverCheckout,
}) => {
  const [hoveredLaneId, setHoveredLaneId] = useState<string | null>(null)

  const lanes: (Checkout3DData & { position: [number, number, number]; isSelfCheckout?: boolean })[] = [
    // 1. Counter C1 (Assisted - Congested: 8 queue, 5.4 min wait)
    {
      id: 'lane-1',
      code: 'C1',
      name: 'Checkout Counter C1',
      queueLength: 8,
      waitTimeMinutes: 5.4,
      arrivalRate: 2.8,
      serviceRate: 1.5,
      forecast5Min: 13,
      congestionRisk: 'CRITICAL',
      status: 'CONGESTED',
      cashierName: 'Elena Rostova',
      cashierEmpId: 'EMP-401',
      camera: 'CAM-05 (Checkout)',
      position: [10.5, 0, 2.5],
    },
    // 2. Counter C2 (Assisted - Active: 7 queue, 3.5 min wait)
    {
      id: 'lane-2',
      code: 'C2',
      name: 'Checkout Counter C2',
      queueLength: 7,
      waitTimeMinutes: 3.5,
      arrivalRate: 2.1,
      serviceRate: 1.8,
      forecast5Min: 8,
      congestionRisk: 'HIGH',
      status: 'ACTIVE',
      cashierName: 'Marcus Vance',
      cashierEmpId: 'EMP-402',
      camera: 'CAM-05 (Checkout)',
      position: [13.2, 0, 2.5],
    },
    // 3. Counter C3 (Standby / Express: 3 queue)
    {
      id: 'lane-3',
      code: 'C3',
      name: 'Checkout Counter C3',
      queueLength: 3,
      waitTimeMinutes: 1.1,
      arrivalRate: 1.0,
      serviceRate: 2.2,
      forecast5Min: 3,
      congestionRisk: 'LOW',
      status: 'STANDBY',
      cashierName: 'Priya Sharma',
      cashierEmpId: 'EMP-405',
      camera: 'CAM-05 (Checkout)',
      position: [15.9, 0, 2.5],
    },
    // 4. Counter C4 (Self-Checkout Hub)
    {
      id: 'lane-4',
      code: 'C4',
      name: 'Self-Checkout Station C4',
      queueLength: 5,
      waitTimeMinutes: 1.2,
      arrivalRate: 1.8,
      serviceRate: 2.5,
      forecast5Min: 6,
      congestionRisk: 'LOW',
      status: 'ACTIVE',
      cashierName: 'Self-Service Assist',
      cashierEmpId: 'AUTO-SYS',
      camera: 'CAM-05 (Checkout)',
      isSelfCheckout: true,
      position: [18.6, 0, 2.5],
    },
  ]

  const handlePointerOver = (lane: typeof lanes[0], e: any) => {
    e.stopPropagation()
    setHoveredLaneId(lane.id)
    if (onHoverCheckout) {
      onHoverCheckout({
        type: 'checkout',
        title: `${lane.code} • ${lane.name}`,
        subtitle: `Cashier: ${lane.cashierName}`,
        status: lane.status,
        statusColor: lane.congestionRisk === 'CRITICAL' ? 'rose' : lane.congestionRisk === 'HIGH' ? 'amber' : 'emerald',
        metrics: [
          { label: 'Current Queue', value: `${lane.queueLength} shoppers`, highlight: lane.queueLength > 6 },
          { label: 'Wait Time', value: `${lane.waitTimeMinutes} min`, highlight: lane.waitTimeMinutes > 4 },
          { label: 'Forecast +5m', value: `${lane.forecast5Min} shoppers`, highlight: lane.forecast5Min > 10 },
          { label: 'Risk SLA', value: lane.congestionRisk },
        ],
        alert: lane.congestionRisk === 'CRITICAL' ? 'SLA Exceeded: Open Counter C3 immediately' : undefined,
        actionHint: 'Click for queue analysis',
        screenX: e.clientX,
        screenY: e.clientY,
      })
    }
  }

  const handlePointerOut = () => {
    setHoveredLaneId(null)
    if (onHoverCheckout) onHoverCheckout(null)
  }

  return (
    <group>
      {lanes.map((lane) => {
        const isHovered = hoveredLaneId === lane.id
        const isCritical = lane.status === 'CONGESTED' || lane.congestionRisk === 'CRITICAL'

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
            {/* ======================================================= */}
            {/* CHECKOUT FURNITURE                                       */}
            {/* ======================================================= */}
            {!lane.isSelfCheckout ? (
              <group>
                {/* Main Counter Body — sleek dark slate/carbon */}
                <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
                  <boxGeometry args={[1.4, 0.9, 2.2]} />
                  <meshStandardMaterial color="#1E293B" metalness={0.4} roughness={0.4} />
                </mesh>

                {/* Top Counter Stainless Edge Trim */}
                <mesh position={[0, 0.91, 0]}>
                  <boxGeometry args={[1.44, 0.04, 2.24]} />
                  <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.2} />
                </mesh>

                {/* Black Rubber Conveyor Belt */}
                <mesh position={[0.25, 0.94, 0.2]}>
                  <boxGeometry args={[0.62, 0.025, 1.4]} />
                  <meshStandardMaterial color="#0B1322" roughness={0.85} />
                </mesh>

                {/* Cashier Barcode Scanner Glass Bed */}
                <mesh position={[0.25, 0.955, -0.6]}>
                  <boxGeometry args={[0.42, 0.018, 0.32]} />
                  <meshStandardMaterial color="#38BDF8" transparent opacity={0.65} roughness={0.05} metalness={0.9} />
                </mesh>

                {/* Impulse Candy & Gum Rack attached to belt side */}
                <group position={[0.62, 0.75, 0.2]}>
                  {/* Rack wire frame */}
                  <mesh>
                    <boxGeometry args={[0.18, 0.65, 1.2]} />
                    <meshStandardMaterial color="#546E7A" metalness={0.6} />
                  </mesh>
                  {/* Candy & Chocolate bars */}
                  {[-0.4, -0.15, 0.1, 0.35].map((cz, cIdx) => (
                    <mesh key={cIdx} position={[0.08, 0.1, cz]}>
                      <boxGeometry args={[0.08, 0.12, 0.18]} />
                      <meshStandardMaterial color={cIdx % 2 === 0 ? '#DC2626' : '#F59E0B'} roughness={0.5} />
                    </mesh>
                  ))}
                </group>

                {/* Plastic Bag Dispenser Carousel at End of Register */}
                <group position={[0.25, 0.75, 0.95]}>
                  {/* Carousel Center Post */}
                  <mesh>
                    <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
                    <meshStandardMaterial color="#90A4AE" metalness={0.9} />
                  </mesh>
                  {/* Bag Holder Wire Arms */}
                  <mesh position={[0, 0.25, 0]}>
                    <cylinderGeometry args={[0.25, 0.25, 0.02, 12]} />
                    <meshStandardMaterial color="#B0BEC5" metalness={0.8} />
                  </mesh>
                  {/* White plastic grocery bags */}
                  <mesh position={[0, 0.1, 0]}>
                    <boxGeometry args={[0.28, 0.35, 0.2]} />
                    <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
                  </mesh>
                </group>

                {/* Touchscreen POS Terminal on Swivel Arm */}
                <group position={[-0.35, 0.95, -0.4]}>
                  <mesh position={[0, 0.2, 0]}>
                    <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
                    <meshStandardMaterial color="#90A4AE" metalness={0.9} />
                  </mesh>
                  {/* Glowing POS Screen */}
                  <mesh position={[0.05, 0.35, 0]} rotation={[0, -0.4, -0.2]}>
                    <boxGeometry args={[0.28, 0.22, 0.03]} />
                    <meshStandardMaterial color="#0369A1" emissive="#0369A1" emissiveIntensity={0.7} />
                  </mesh>
                  {/* PIN Pad */}
                  <mesh position={[0.15, 0.18, 0.1]} rotation={[0.4, 0, 0]}>
                    <boxGeometry args={[0.1, 0.14, 0.03]} />
                    <meshStandardMaterial color="#0F172A" />
                  </mesh>
                </group>

                {/* Stainless Queue Guide Rails */}
                <mesh position={[-0.75, 0.45, 1.2]}>
                  <boxGeometry args={[0.05, 0.9, 2.0]} />
                  <meshStandardMaterial color="#B0BEC5" metalness={0.82} roughness={0.18} />
                </mesh>

                {/* Overhead Lane Indicator Pillar with 3D Signboard */}
                <group position={[-0.7, 1.3, -1.0]}>
                  <mesh>
                    <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
                    <meshStandardMaterial color="#90A4AE" metalness={0.8} />
                  </mesh>
                  {/* Lane sign box */}
                  <mesh position={[0, 0.6, 0]}>
                    <boxGeometry args={[0.42, 0.26, 0.08]} />
                    <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
                  </mesh>
                  {/* Bright Lane Status Beacon */}
                  <mesh position={[0, 0.76, 0]}>
                    <sphereGeometry args={[0.05, 12, 10]} />
                    <meshStandardMaterial
                      color={isCritical ? '#EF4444' : lane.status === 'STANDBY' ? '#F59E0B' : '#10B981'}
                      emissive={isCritical ? '#EF4444' : lane.status === 'STANDBY' ? '#F59E0B' : '#10B981'}
                      emissiveIntensity={0.9}
                    />
                  </mesh>
                </group>

                {/* Cashier Associate Avatar — teal vest to match store uniform */}
                <group position={[-0.35, 0, 0]}>
                  {/* Head */}
                  <mesh position={[0, 1.52, 0]} castShadow>
                    <sphereGeometry args={[0.11, 12, 10]} />
                    <meshStandardMaterial color="#E0AC69" roughness={0.65} />
                  </mesh>
                  {/* White shirt + teal vest */}
                  <mesh position={[0, 1.14, 0]} castShadow>
                    <boxGeometry args={[0.32, 0.48, 0.2]} />
                    <meshStandardMaterial color="#F8FAFC" roughness={0.7} />
                  </mesh>
                  <mesh position={[-0.09, 1.14, 0.02]}>
                    <boxGeometry args={[0.13, 0.47, 0.21]} />
                    <meshStandardMaterial color="#0D9488" roughness={0.6} />
                  </mesh>
                  <mesh position={[0.09, 1.14, 0.02]}>
                    <boxGeometry args={[0.13, 0.47, 0.21]} />
                    <meshStandardMaterial color="#0D9488" roughness={0.6} />
                  </mesh>
                </group>
              </group>
            ) : (
              /* ======================================================= */
              /* SELF-CHECKOUT KIOSK TOWER */
              /* ======================================================= */
              <group>
                <mesh position={[0, 0.55, 0]} castShadow>
                  <boxGeometry args={[0.9, 1.1, 0.7]} />
                  <meshStandardMaterial color="#1E293B" metalness={0.6} roughness={0.3} />
                </mesh>
                {/* Glowing Touchscreen Pedestal */}
                <mesh position={[0, 1.2, 0]} rotation={[-0.3, 0, 0]}>
                  <boxGeometry args={[0.42, 0.32, 0.05]} />
                  <meshStandardMaterial color="#0284C7" emissive="#0284C7" emissiveIntensity={0.6} />
                </mesh>
                {/* Side bagging platform */}
                <mesh position={[0.55, 0.45, 0]}>
                  <boxGeometry args={[0.42, 0.9, 0.62]} />
                  <meshStandardMaterial color="#475569" metalness={0.6} />
                </mesh>
                {/* Self-Checkout Overhead Sign */}
                <mesh position={[0, 1.55, 0]}>
                  <boxGeometry args={[0.5, 0.2, 0.06]} />
                  <meshStandardMaterial color="#0F172A" metalness={0.7} />
                </mesh>
                <mesh position={[0, 1.68, 0]}>
                  <sphereGeometry args={[0.04, 10, 8]} />
                  <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.8} />
                </mesh>
              </group>
            )}

            {/* ======================================================= */}
            {/* QUEUED SHOPPERS — proportional to queue length          */}
            {/* ======================================================= */}
            {showQueueStatus && (
              <group position={[0, 0, 1.5]}>
                {Array.from({ length: Math.min(lane.queueLength, 5) }).map((_, i) => {
                  const zPos = i * 0.95
                  const skinTones = ['#D4A373', '#E0AC69', '#C68642', '#F1C27D', '#8D5524']
                  // Neutral retail casual clothing — no neons
                  const shirtColors = ['#334155', '#1E3A5F', '#4A5568', '#6B4F3A', '#2D4A2D']

                  return (
                    <group key={`queued-shopper-${i}`} position={[0, 0, zPos]}>
                      {/* Soft shadow disc */}
                      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                        <circleGeometry args={[0.22, 16]} />
                        <meshBasicMaterial color="#1A2636" transparent opacity={0.35} />
                      </mesh>
                      {/* Head */}
                      <mesh position={[0, 1.54, 0]} castShadow>
                        <sphereGeometry args={[0.11, 12, 10]} />
                        <meshStandardMaterial color={skinTones[i % skinTones.length]} roughness={0.65} />
                      </mesh>
                      {/* Shirt */}
                      <mesh position={[0, 1.16, 0]} castShadow>
                        <boxGeometry args={[0.32, 0.48, 0.2]} />
                        <meshStandardMaterial color={shirtColors[i % shirtColors.length]} roughness={0.7} />
                      </mesh>
                      {/* Legs */}
                      <mesh position={[0, 0.46, 0]} castShadow>
                        <boxGeometry args={[0.28, 0.74, 0.14]} />
                        <meshStandardMaterial color="#263238" roughness={0.8} />
                      </mesh>
                    </group>
                  )
                })}
              </group>
            )}

            {/* Subtle Hover Selection Box */}
            {isHovered && (
              <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[1.7, 1.4, 2.6]} />
                <meshBasicMaterial color="#38BDF8" wireframe transparent opacity={0.4} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}
