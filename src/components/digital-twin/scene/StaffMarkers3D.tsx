import React, { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TooltipData } from '../controls/TwinTooltip'

export interface Staff3DData {
  id: string
  code: string
  name: string
  role: string
  currentTask: string
  position: [number, number, number]
  status: 'ACTIVE' | 'ASSIGNED' | 'STANDBY'
  patrolRoute?: [number, number][]
}

interface StaffMarkers3DProps {
  showStaff: boolean
  onSelectStaff?: (staff: Staff3DData) => void
  onHoverStaff?: (data: TooltipData | null) => void
}

export const StaffMarkers3D: React.FC<StaffMarkers3DProps> = ({
  showStaff,
  onSelectStaff,
  onHoverStaff,
}) => {
  const [hoveredStaffId, setHoveredStaffId] = useState<string | null>(null)

  const staffList: Staff3DData[] = [
    {
      id: 'staff-01',
      code: 'S01',
      name: 'Elena Rostova',
      role: 'Head Cashier',
      currentTask: 'Register Billing (Counter C1)',
      position: [10.5, 0, 1.0],
      status: 'ACTIVE',
    },
    {
      id: 'staff-02',
      code: 'S02',
      name: 'Marcus Vance',
      role: 'Store Associate / Billing Backup',
      currentTask: 'Register Billing (Counter C2)',
      position: [13.2, 0, 1.0],
      status: 'ACTIVE',
    },
    {
      id: 'staff-04',
      code: 'S04',
      name: 'Liam O\'Connor',
      role: 'Inventory Specialist',
      currentTask: 'Produce & Beverage Restock (B4)',
      position: [13.0, 0, -4.5],
      status: 'ASSIGNED',
      patrolRoute: [
        [13.0, -4.5],
        [14.5, -6.5],
        [8.0, 11.5],
        [13.0, -4.5],
      ],
    },
    {
      id: 'staff-05',
      code: 'S05',
      name: 'Sarah Jenkins',
      role: 'Safety & Floor Lead',
      currentTask: 'Hazard Containment (Cooler 2)',
      position: [-8.0, 0, 1.5],
      status: 'ACTIVE',
      patrolRoute: [
        [-8.0, 1.5],
        [-6.5, -5.0],
        [0.0, -9.0],
        [-8.0, 1.5],
      ],
    },
  ]

  const staffGroupRefs = useRef<(THREE.Group | null)[]>([])
  const staffProgress = useRef([0, 0, 0, 0])

  useFrame((_, delta) => {
    if (!showStaff) return
    const dt = Math.min(delta, 0.1)

    staffList.forEach((st, idx) => {
      const grp = staffGroupRefs.current[idx]
      if (!grp || !st.patrolRoute) return

      staffProgress.current[idx] += dt * 0.15
      const t = staffProgress.current[idx]
      const pts = st.patrolRoute
      const numSegments = pts.length - 1
      const loopT = t % numSegments
      const segIndex = Math.min(Math.floor(loopT), numSegments - 1)
      const frac = loopT - segIndex

      const p1 = pts[segIndex]
      const p2 = pts[(segIndex + 1) % pts.length]

      const curX = p1[0] + (p2[0] - p1[0]) * frac
      const curZ = p1[1] + (p2[1] - p1[1]) * frac

      const dx = p2[0] - p1[0]
      const dz = p2[1] - p1[1]
      grp.rotation.y = Math.atan2(dx, dz)
      grp.position.set(curX, 0, curZ)
    })
  })

  const handlePointerOver = (st: Staff3DData, e: any) => {
    e.stopPropagation()
    setHoveredStaffId(st.id)
    if (onHoverStaff) {
      onHoverStaff({
        type: 'staff',
        title: `${st.code} • ${st.name}`,
        subtitle: st.role,
        status: st.status,
        statusColor: 'purple',
        metrics: [
          { label: 'Role', value: st.role },
          { label: 'Status', value: st.status },
          { label: 'Current Task', value: st.currentTask },
        ],
        actionHint: 'Click to assign task',
        screenX: e.clientX,
        screenY: e.clientY,
      })
    }
  }

  const handlePointerOut = () => {
    setHoveredStaffId(null)
    if (onHoverStaff) onHoverStaff(null)
  }

  if (!showStaff) return null

  return (
    <group>
      {staffList.map((st, idx) => {
        const isHovered = hoveredStaffId === st.id

        return (
          <group
            key={st.id}
            ref={(el) => {
              staffGroupRefs.current[idx] = el
            }}
            position={st.position}
            onClick={(e) => {
              e.stopPropagation()
              if (onSelectStaff) onSelectStaff(st)
            }}
            onPointerOver={(e) => handlePointerOver(st, e)}
            onPointerOut={handlePointerOut}
          >
            {/* Soft Contact Drop Shadow Disc */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
              <circleGeometry args={[0.26, 16]} />
              <meshBasicMaterial color="#0F172A" transparent opacity={0.5} />
            </mesh>

            {/* 1. Head with neutral skin tone */}
            <mesh position={[0, 1.58, 0]} castShadow>
              <sphereGeometry args={[0.11, 12, 10]} />
              <meshStandardMaterial color="#E0AC69" roughness={0.6} />
            </mesh>
            {/* Hair */}
            <mesh position={[0, 1.64, -0.01]}>
              <sphereGeometry args={[0.115, 10, 10]} />
              <meshStandardMaterial color="#1E293B" roughness={0.9} />
            </mesh>
            {/* Neck */}
            <mesh position={[0, 1.46, 0]}>
              <cylinderGeometry args={[0.045, 0.05, 0.08, 8]} />
              <meshStandardMaterial color="#E0AC69" roughness={0.6} />
            </mesh>

            {/* 2. Torso with Store Uniform Apron / Vest (Purple) */}
            <mesh position={[0, 1.18, 0]} castShadow>
              <boxGeometry args={[0.34, 0.48, 0.2]} />
              <meshStandardMaterial color="#9333EA" roughness={0.6} />
            </mesh>
            {/* Store Name Badge on Vest */}
            <mesh position={[0.08, 1.28, 0.11]}>
              <boxGeometry args={[0.07, 0.04, 0.01]} />
              <meshBasicMaterial color="#F8FAFC" />
            </mesh>

            {/* 3. Left Arm */}
            <group position={[-0.21, 1.36, 0]}>
              <mesh position={[0, -0.22, 0]} castShadow>
                <boxGeometry args={[0.08, 0.44, 0.09]} />
                <meshStandardMaterial color="#1E293B" roughness={0.7} />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.46, 0]}>
                <boxGeometry args={[0.06, 0.09, 0.07]} />
                <meshStandardMaterial color="#E0AC69" roughness={0.6} />
              </mesh>
            </group>

            {/* 4. Right Arm holding Inventory Handheld Scanner with active laser */}
            <group position={[0.21, 1.36, 0]} rotation={[-0.5, 0, 0]}>
              <mesh position={[0, -0.22, 0]} castShadow>
                <boxGeometry args={[0.08, 0.44, 0.09]} />
                <meshStandardMaterial color="#1E293B" roughness={0.7} />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.46, 0]}>
                <boxGeometry args={[0.06, 0.09, 0.07]} />
                <meshStandardMaterial color="#E0AC69" roughness={0.6} />
              </mesh>
              {/* Scanner Device */}
              <mesh position={[0, -0.48, 0.08]} rotation={[0.4, 0, 0]}>
                <boxGeometry args={[0.06, 0.05, 0.14]} />
                <meshStandardMaterial color="#0F172A" metalness={0.8} />
              </mesh>
              {/* Red Scanner Laser Beam */}
              {st.status === 'ASSIGNED' && (
                <mesh position={[0, -0.5, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.005, 0.005, 0.9, 6]} />
                  <meshBasicMaterial color="#EF4444" transparent opacity={0.6} />
                </mesh>
              )}
            </group>

            {/* 5. Legs & Trousers */}
            <mesh position={[-0.09, 0.44, 0]} castShadow>
              <boxGeometry args={[0.11, 0.74, 0.12]} />
              <meshStandardMaterial color="#0F172A" roughness={0.8} />
            </mesh>
            <mesh position={[0.09, 0.44, 0]} castShadow>
              <boxGeometry args={[0.11, 0.74, 0.12]} />
              <meshStandardMaterial color="#0F172A" roughness={0.8} />
            </mesh>

            {/* Subtle Ground Beacon Ring only when Hovered */}
            {isHovered && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <ringGeometry args={[0.24, 0.32, 16]} />
                <meshBasicMaterial color="#A855F7" transparent opacity={0.6} side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}
