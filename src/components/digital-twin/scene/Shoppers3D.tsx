import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'
import { ZONE_ANCHORS } from '../layout/storeLayout'
import { AnimatedHumanoid } from './AnimatedHumanoid'

interface Shoppers3DProps {
  showPositions: boolean
  showTrails: boolean
  replaySpeedMultiplier?: number
}

const SHIRT_COLORS = ['#64748B', '#475569', '#78716C', '#57534E', '#0F766E', '#1E3A5F']
const SHOPPER_SCALE = 1.5

/** Deterministic pseudo-random in [-1, 1], stable per shopper slot so avatars don't jump every render. */
function stableJitter(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return (x - Math.floor(x)) * 2 - 1
}

/**
 * Renders one avatar per real live shopper currently in the store
 * (useAppStore's currentOccupancy — driven by the entrance camera's
 * enter/exit counter). This system has no per-person coordinate tracking
 * across the whole floor and no live per-zone occupancy breakdown (the
 * zones' occupancy field is one-time seed data, never updated) — so exact
 * positions aren't available. Avatars are spread round-robin across the
 * real shopping-floor zones as an honest approximation of "N real shoppers
 * are in the store right now," not a claim of individually tracked
 * positions.
 */
export const Shoppers3D: React.FC<Shoppers3DProps> = ({ showPositions }) => {
  const currentOccupancy = useAppStore((s) => s.currentOccupancy)
  const zones = useAppStore((s) => s.zones)
  const groupRefs = useRef<Map<string, THREE.Group>>(new Map())
  const targets = useRef<Map<string, THREE.Vector3>>(new Map())

  const shoppers = useMemo(() => {
    const floorZones = zones.filter((z) => z.id !== 'zone-stockroom' && ZONE_ANCHORS[z.id])
    if (floorZones.length === 0) return []

    const out: { id: string; position: [number, number, number]; shirt: string; skin: string }[] = []
    const total = Math.max(0, Math.min(currentOccupancy, 60))
    for (let i = 0; i < total; i++) {
      const zone = floorZones[i % floorZones.length]
      const anchor = ZONE_ANCHORS[zone.id]
      const [halfW, halfD] = [anchor.bounds[0] * 0.38, anchor.bounds[1] * 0.38]
      const seed = i + 1
      const x = anchor.position[0] + stableJitter(seed) * halfW
      const z = anchor.position[2] + stableJitter(seed * 7.31) * halfD
      out.push({
        id: `shopper-${i}`,
        position: [x, 0, z],
        shirt: SHIRT_COLORS[i % SHIRT_COLORS.length],
        skin: i % 2 === 0 ? '#E0AC69' : '#C68642',
      })
    }
    return out
  }, [currentOccupancy, zones])

  // Sync targets when store updates
  useMemo(() => {
    for (const s of shoppers) {
      targets.current.set(s.id, new THREE.Vector3(s.position[0], 0, s.position[2]))
    }
  }, [shoppers])

  useFrame((_, delta) => {
    if (!showPositions) return
    const dt = Math.min(delta, 0.05)
    groupRefs.current.forEach((grp, id) => {
      const target = targets.current.get(id)
      if (!target) return
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
          <AnimatedHumanoid
            primaryColor={s.shirt}
            skinColor={s.skin}
            scale={SHOPPER_SCALE}
            phase={s.position[0] * 3.7 + s.position[2] * 1.3}
          />
        </group>
      ))}
    </group>
  )
}
