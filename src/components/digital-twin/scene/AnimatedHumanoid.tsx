import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export interface AnimatedHumanoidProps {
  /** Torso/limb color */
  primaryColor: string
  /** Skin tone */
  skinColor: string
  /** Accent color (badge/lanyard); omit for plain shoppers */
  accentColor?: string
  /** Leg color (defaults to a dark trouser tone) */
  legColor?: string
  /** Per-instance seed so a crowd doesn't all walk in lockstep */
  phase?: number
  /** Overall size multiplier (feet stay planted at y=0) */
  scale?: number
  hovered?: boolean
  ringColor?: string
}

/** Low-poly human figure with a subtle procedural walk cycle (arm/leg swing + torso bob). */
export const AnimatedHumanoid: React.FC<AnimatedHumanoidProps> = ({
  primaryColor,
  skinColor,
  accentColor,
  legColor = '#334155',
  phase = 0,
  scale = 1,
  hovered = false,
  ringColor,
}) => {
  const torsoRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime * 2.4 + phase
    const swing = Math.sin(t) * 0.35
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing
    if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.8
    if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.8
    if (torsoRef.current) torsoRef.current.position.y = 1.15 + Math.abs(Math.sin(t)) * 0.02
  })

  return (
    <group scale={scale}>
      {/* Ground contact shadow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.26, 14]} />
        <meshBasicMaterial color={ringColor || '#94A3B8'} transparent opacity={hovered ? 0.4 : 0.22} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshStandardMaterial color={skinColor} roughness={0.65} />
      </mesh>

      {/* Torso (bobs slightly with the walk cycle) */}
      <group ref={torsoRef} position={[0, 1.15, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.36, 0.46, 0.2]} />
          <meshStandardMaterial color={primaryColor} roughness={0.75} />
        </mesh>
        {accentColor && (
          <mesh position={[0, 0.1, 0.11]}>
            <boxGeometry args={[0.15, 0.11, 0.02]} />
            <meshStandardMaterial color={accentColor} />
          </mesh>
        )}
      </group>

      {/* Arms — pivot at the shoulder so they swing naturally */}
      <group ref={leftArmRef} position={[-0.24, 1.32, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.09, 0.4, 0.09]} />
          <meshStandardMaterial color={primaryColor} roughness={0.75} />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.24, 1.32, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.09, 0.4, 0.09]} />
          <meshStandardMaterial color={primaryColor} roughness={0.75} />
        </mesh>
      </group>

      {/* Legs — pivot at the hip so they swing naturally */}
      <group ref={leftLegRef} position={[-0.11, 0.86, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.11, 0.6, 0.11]} />
          <meshStandardMaterial color={legColor} roughness={0.8} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.11, 0.86, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.11, 0.6, 0.11]} />
          <meshStandardMaterial color={legColor} roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}
