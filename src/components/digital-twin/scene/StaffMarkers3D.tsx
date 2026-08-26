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

  // Skin tone and hair rotation per staff member for visual variety
  const staffAppearance = [
    { skin: '#E0AC69', hair: '#1E293B' },  // S01 — Elena
    { skin: '#D4A373', hair: '#3E2723' },  // S02 — Marcus
    { skin: '#C68642', hair: '#1E293B' },  // S04 — Liam
    { skin: '#F1C27D', hair: '#171717' },  // S05 — Sarah
  ]

  return (
    <group>
      {staffList.map((st, idx) => {
        const isHovered = hoveredStaffId === st.id
        const appearance = staffAppearance[idx % staffAppearance.length]
        // Status-driven vest accent: ACTIVE=teal, ASSIGNED=amber, STANDBY=grey
        const vestAccent = st.status === 'ACTIVE' ? '#0D9488'
          : st.status === 'ASSIGNED' ? '#D97706'
          : '#64748B'

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
            {/* Contact shadow disc */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
              <circleGeometry args={[0.26, 16]} />
              <meshBasicMaterial color="#1A2636" transparent opacity={0.4} />
            </mesh>

            {/* ===== HEAD ===== */}
            <group position={[0, 1.58, 0]}>
              {/* Head */}
              <mesh castShadow>
                <sphereGeometry args={[0.11, 14, 12]} />
                <meshStandardMaterial color={appearance.skin} roughness={0.6} />
              </mesh>
              {/* Short hair */}
              <mesh position={[0, 0.04, -0.01]}>
                <sphereGeometry args={[0.115, 12, 10]} />
                <meshStandardMaterial color={appearance.hair} roughness={0.9} />
              </mesh>
              {/* Neck */}
              <mesh position={[0, -0.12, 0]}>
                <cylinderGeometry args={[0.045, 0.05, 0.09, 8]} />
                <meshStandardMaterial color={appearance.skin} roughness={0.6} />
              </mesh>
            </group>

            {/* ===== TORSO — WHITE SHIRT UNDER TEAL VEST ===== */}
            <group position={[0, 1.18, 0]}>
              {/* White shirt base */}
              <mesh castShadow>
                <boxGeometry args={[0.34, 0.48, 0.2]} />
                <meshStandardMaterial color="#F8FAFC" roughness={0.7} />
              </mesh>
              {/* Teal store vest — left panel */}
              <mesh position={[-0.1, 0, 0.02]}>
                <boxGeometry args={[0.13, 0.47, 0.21]} />
                <meshStandardMaterial color={vestAccent} roughness={0.6} />
              </mesh>
              {/* Teal store vest — right panel */}
              <mesh position={[0.1, 0, 0.02]}>
                <boxGeometry args={[0.13, 0.47, 0.21]} />
                <meshStandardMaterial color={vestAccent} roughness={0.6} />
              </mesh>
              {/* Name badge */}
              <mesh position={[0.08, 0.16, 0.12]}>
                <boxGeometry args={[0.07, 0.04, 0.01]} />
                <meshBasicMaterial color="#F8FAFC" />
              </mesh>
            </group>

            {/* ===== LEFT ARM ===== */}
            <group position={[-0.21, 1.35, 0]}>
              <mesh position={[0, -0.22, 0]} castShadow>
                <boxGeometry args={[0.08, 0.44, 0.09]} />
                <meshStandardMaterial color="#F8FAFC" roughness={0.7} />
              </mesh>
              <mesh position={[0, -0.46, 0]}>
                <boxGeometry args={[0.06, 0.09, 0.07]} />
                <meshStandardMaterial color={appearance.skin} roughness={0.6} />
              </mesh>
            </group>

            {/* ===== RIGHT ARM — holding scanner ===== */}
            <group position={[0.21, 1.35, 0]} rotation={[-0.55, 0, 0]}>
              <mesh position={[0, -0.22, 0]} castShadow>
                <boxGeometry args={[0.08, 0.44, 0.09]} />
                <meshStandardMaterial color={vestAccent} roughness={0.6} />
              </mesh>
              <mesh position={[0, -0.46, 0]}>
                <boxGeometry args={[0.06, 0.09, 0.07]} />
                <meshStandardMaterial color={appearance.skin} roughness={0.6} />
              </mesh>
              {/* Inventory scanner */}
              <mesh position={[0, -0.5, 0.1]} rotation={[0.4, 0, 0]}>
                <boxGeometry args={[0.055, 0.045, 0.13]} />
                <meshStandardMaterial color="#1C2B3A" metalness={0.8} roughness={0.3} />
              </mesh>
              {/* Active laser beam for ASSIGNED staff */}
              {st.status === 'ASSIGNED' && (
                <mesh position={[0, -0.52, 0.68]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.004, 0.004, 0.8, 6]} />
                  <meshBasicMaterial color="#EF4444" transparent opacity={0.55} />
                </mesh>
              )}
            </group>

            {/* ===== PELVIS ===== */}
            <mesh position={[0, 0.88, 0]}>
              <boxGeometry args={[0.31, 0.11, 0.18]} />
              <meshStandardMaterial color="#1E293B" roughness={0.8} />
            </mesh>

            {/* ===== LEFT LEG ===== */}
            <group position={[-0.09, 0.44, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.11, 0.74, 0.12]} />
                <meshStandardMaterial color="#263238" roughness={0.8} />
              </mesh>
              {/* Shoe */}
              <mesh position={[0, -0.4, 0.04]} castShadow>
                <boxGeometry args={[0.12, 0.07, 0.2]} />
                <meshStandardMaterial color="#0F172A" roughness={0.5} />
              </mesh>
            </group>

            {/* ===== RIGHT LEG ===== */}
            <group position={[0.09, 0.44, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.11, 0.74, 0.12]} />
                <meshStandardMaterial color="#263238" roughness={0.8} />
              </mesh>
              {/* Shoe */}
              <mesh position={[0, -0.4, 0.04]} castShadow>
                <boxGeometry args={[0.12, 0.07, 0.2]} />
                <meshStandardMaterial color="#0F172A" roughness={0.5} />
              </mesh>
            </group>

            {/* Hover selection ring — teal pulse ring */}
            {isHovered && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <ringGeometry args={[0.26, 0.34, 18]} />
                <meshBasicMaterial color={vestAccent} transparent opacity={0.65} side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}
