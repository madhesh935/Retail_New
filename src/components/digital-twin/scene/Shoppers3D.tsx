import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'
import { resolveZonePosition } from '../layout/storeLayout'
import { RetailPalette } from '../theme/retailPalette'

interface Shoppers3DProps {
  showPositions: boolean
  showTrails: boolean
  replaySpeedMultiplier?: number
}

/** Map 2D tracking coords (percent or meters) into store world space when available. */
function toWorldPosition(coords: { x: number; y: number }, zoneId: string): [number, number, number] {
  // If coords look like percent layout (0–100), map into store bounds
  if (coords.x >= 0 && coords.x <= 100 && coords.y >= 0 && coords.y <= 100) {
    const x = (coords.x / 100) * 40 - 20
    const z = (coords.y / 100) * 28 - 14
    return [x, 0, z]
  }
  // Otherwise treat as already near world units, with zone fallback
  if (Number.isFinite(coords.x) && Number.isFinite(coords.y)) {
    return [coords.x, 0, coords.y]
  }
  const zone = resolveZonePosition(zoneId)
  return zone ? [zone[0], 0, zone[2]] : [0, 0, 0]
}

const SHIRT_COLORS = ['#64748B', '#475569', '#78716C', '#57534E', '#0F766E', '#1E3A5F']
const STALE_MS = 8000

const HumanAvatar: React.FC<{ shirt: string; skin: string }> = ({ shirt, skin }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <circleGeometry args={[0.22, 12]} />
      <meshBasicMaterial color="#94A3B8" transparent opacity={0.25} />
    </mesh>
    <mesh position={[0, 1.55, 0]} castShadow>
      <sphereGeometry args={[0.11, 10, 8]} />
      <meshStandardMaterial color={skin} roughness={0.65} />
    </mesh>
    <mesh position={[0, 1.15, 0]} castShadow>
      <boxGeometry args={[0.32, 0.42, 0.18]} />
      <meshStandardMaterial color={shirt} roughness={0.75} />
    </mesh>
    <mesh position={[-0.22, 1.1, 0]} castShadow>
      <boxGeometry args={[0.08, 0.36, 0.08]} />
      <meshStandardMaterial color={shirt} roughness={0.75} />
    </mesh>
    <mesh position={[0.22, 1.1, 0]} castShadow>
      <boxGeometry args={[0.08, 0.36, 0.08]} />
      <meshStandardMaterial color={shirt} roughness={0.75} />
    </mesh>
    <mesh position={[-0.1, 0.55, 0]} castShadow>
      <boxGeometry args={[0.1, 0.55, 0.1]} />
      <meshStandardMaterial color="#334155" roughness={0.8} />
    </mesh>
    <mesh position={[0.1, 0.55, 0]} castShadow>
      <boxGeometry args={[0.1, 0.55, 0.1]} />
      <meshStandardMaterial color="#334155" roughness={0.8} />
    </mesh>
  </group>
)

/**
 * Renders shoppers only from live tracked positions.
 * Interpolates between updates; freezes when data goes stale.
 * Does not invent walking paths.
 */
export const Shoppers3D: React.FC<Shoppers3DProps> = ({ showPositions }) => {
  const activeShoppers = useAppStore((s) => s.activeShoppers)
  const groupRefs = useRef<Map<string, THREE.Group>>(new Map())
  const targets = useRef<Map<string, THREE.Vector3>>(new Map())
  const lastUpdate = useRef<Map<string, number>>(new Map())

  const shoppers = useMemo(() => {
    if (!activeShoppers?.length) return []
    return activeShoppers.map((s, i) => {
      const pos = toWorldPosition(s.currentCoordinates, s.zoneId)
      return {
        id: s.trackingId,
        position: pos,
        shirt: SHIRT_COLORS[i % SHIRT_COLORS.length],
        skin: i % 2 === 0 ? '#E0AC69' : '#C68642',
        updatedAt: Date.now(),
      }
    })
  }, [activeShoppers])

  // Sync targets when store updates
  useMemo(() => {
    const now = Date.now()
    for (const s of shoppers) {
      targets.current.set(s.id, new THREE.Vector3(s.position[0], 0, s.position[2]))
      lastUpdate.current.set(s.id, now)
    }
  }, [shoppers])

  useFrame((_, delta) => {
    if (!showPositions) return
    const now = Date.now()
    const dt = Math.min(delta, 0.05)
    groupRefs.current.forEach((grp, id) => {
      const target = targets.current.get(id)
      const updated = lastUpdate.current.get(id) ?? 0
      if (!target) return
      // Stale: stop interpolating
      if (now - updated > STALE_MS) return
      grp.position.lerp(target, 1 - Math.exp(-6 * dt))
    })
  })

  if (!showPositions || shoppers.length === 0) return null

  return (
    <group>
      {shoppers.map((s) => (
        <group
          key={s.id}
          ref={(el) => {
            if (el) groupRefs.current.set(s.id, el)
            else groupRefs.current.delete(s.id)
          }}
          position={s.position}
        >
          <HumanAvatar shirt={s.shirt} skin={s.skin} />
        </group>
      ))}
    </group>
  )
}
