import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

interface Waypoint {
  x: number
  z: number
  dwell: number // Seconds to pause/browse at this waypoint
  action: 'walk' | 'reach_shelf' | 'inspect_item' | 'look_phone'
}

interface ShopperAgent {
  id: string
  waypoints: Waypoint[]
  currentWpIndex: number
  speed: number
  shirtColor: string
  jacketColor?: string
  trouserColor: string
  shoeColor: string
  hairColor: string
  hairStyle: 'short' | 'long' | 'cap' | 'curly' | 'beanie'
  skinTone: string
  accessory: 'cart' | 'basket' | 'phone' | 'none'
  scale: number
  trail: [number, number, number][]
}

interface Shoppers3DProps {
  showPositions: boolean
  showTrails: boolean
  replaySpeedMultiplier?: number
}

// Detailed Realistic Human Avatar Component with Hair, Clothes, Props & Shelf-Reaching Animation
const DetailedHumanAvatar: React.FC<{
  agent: ShopperAgent
  isMoving: boolean
  isReaching: boolean
  walkCycle: number
}> = ({ agent, isMoving, isReaching, walkCycle }) => {
  const armSwing = isMoving ? Math.sin(walkCycle) * 0.5 : 0
  const legSwing = isMoving ? Math.sin(walkCycle) * 0.6 : 0
  const verticalBob = isMoving ? Math.abs(Math.sin(walkCycle)) * 0.035 : 0

  const hasCart = agent.accessory === 'cart'
  const hasBasket = agent.accessory === 'basket'
  const hasPhone = agent.accessory === 'phone'

  // Arm reaching up to inspect shelf item when dwelling
  const rightArmRotation: [number, number, number] = isReaching
    ? [-1.3, -0.2, 0.4]
    : hasCart
    ? [-0.65, 0, 0]
    : hasPhone
    ? [-0.9, 0.3, 0.2]
    : [-armSwing, 0, 0]

  const leftArmRotation: [number, number, number] = hasCart
    ? [-0.65, 0, 0]
    : [armSwing, 0, 0]

  return (
    <group position={[0, verticalBob, 0]}>
      {/* 1. Contact Drop Shadow Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[hasCart ? 0.45 : 0.28, 16]} />
        <meshBasicMaterial color="#0A0E17" transparent opacity={0.55} />
      </mesh>

      {/* 2. Head & Hair */}
      <group position={[0, 1.58, 0]}>
        {/* Head Mesh with Facial Contour */}
        <mesh castShadow>
          <sphereGeometry args={[0.115, 14, 12]} />
          <meshStandardMaterial color={agent.skinTone} roughness={0.6} />
        </mesh>

        {/* Hair Variations */}
        {agent.hairStyle === 'short' && (
          <mesh position={[0, 0.05, -0.01]}>
            <sphereGeometry args={[0.12, 12, 10]} />
            <meshStandardMaterial color={agent.hairColor} roughness={0.9} />
          </mesh>
        )}
        {agent.hairStyle === 'long' && (
          <group position={[0, 0.04, 0]}>
            <mesh position={[0, 0.02, -0.02]}>
              <sphereGeometry args={[0.125, 12, 10]} />
              <meshStandardMaterial color={agent.hairColor} roughness={0.9} />
            </mesh>
            {/* Ponytail */}
            <mesh position={[0, -0.08, -0.11]} rotation={[0.3, 0, 0]}>
              <cylinderGeometry args={[0.035, 0.02, 0.16, 8]} />
              <meshStandardMaterial color={agent.hairColor} roughness={0.9} />
            </mesh>
          </group>
        )}
        {agent.hairStyle === 'cap' && (
          <group position={[0, 0.06, 0.02]}>
            {/* Cap Dome */}
            <mesh position={[0, 0.02, -0.02]}>
              <sphereGeometry args={[0.122, 12, 10]} />
              <meshStandardMaterial color="#1E293B" roughness={0.8} />
            </mesh>
            {/* Cap Visor */}
            <mesh position={[0, -0.01, 0.1]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.14, 0.02, 0.1]} />
              <meshStandardMaterial color="#1E293B" roughness={0.8} />
            </mesh>
          </group>
        )}
        {agent.hairStyle === 'curly' && (
          <mesh position={[0, 0.06, 0]}>
            <sphereGeometry args={[0.13, 14, 12]} />
            <meshStandardMaterial color={agent.hairColor} roughness={1.0} />
          </mesh>
        )}
        {agent.hairStyle === 'beanie' && (
          <mesh position={[0, 0.06, -0.01]}>
            <cylinderGeometry args={[0.12, 0.125, 0.14, 12]} />
            <meshStandardMaterial color="#B45309" roughness={0.9} />
          </mesh>
        )}

        {/* Neck */}
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.05, 0.055, 0.09, 8]} />
          <meshStandardMaterial color={agent.skinTone} roughness={0.6} />
        </mesh>
      </group>

      {/* 3. Torso / Upper Body Clothing */}
      <group position={[0, 1.18, 0]}>
        {/* Shirt / Inner Garment */}
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.48, 0.2]} />
          <meshStandardMaterial color={agent.shirtColor} roughness={0.7} />
        </mesh>

        {/* Outer Jacket / Open Hoodie */}
        {agent.jacketColor && (
          <group>
            {/* Left Jacket Lapel */}
            <mesh position={[-0.11, 0, 0.02]}>
              <boxGeometry args={[0.14, 0.49, 0.21]} />
              <meshStandardMaterial color={agent.jacketColor} roughness={0.7} />
            </mesh>
            {/* Right Jacket Lapel */}
            <mesh position={[0.11, 0, 0.02]}>
              <boxGeometry args={[0.14, 0.49, 0.21]} />
              <meshStandardMaterial color={agent.jacketColor} roughness={0.7} />
            </mesh>
            {/* Back Jacket */}
            <mesh position={[0, 0, -0.02]}>
              <boxGeometry args={[0.35, 0.49, 0.18]} />
              <meshStandardMaterial color={agent.jacketColor} roughness={0.7} />
            </mesh>
          </group>
        )}

        {/* Collar Line */}
        <mesh position={[0, 0.23, 0.09]}>
          <boxGeometry args={[0.16, 0.04, 0.04]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
        </mesh>
      </group>

      {/* 4. Left Arm & Hand (Swinging or holding props) */}
      <group position={[-0.22, 1.36, 0]} rotation={leftArmRotation}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.08, 0.44, 0.09]} />
          <meshStandardMaterial color={agent.jacketColor || agent.shirtColor} roughness={0.7} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.46, 0]}>
          <boxGeometry args={[0.065, 0.09, 0.07]} />
          <meshStandardMaterial color={agent.skinTone} roughness={0.6} />
        </mesh>

        {/* Handheld Shopping Basket in Left Hand */}
        {hasBasket && (
          <group position={[-0.05, -0.58, 0.05]}>
            {/* Basket Handle */}
            <mesh position={[0, 0.12, 0]}>
              <torusGeometry args={[0.1, 0.015, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#1E293B" metalness={0.8} />
            </mesh>
            {/* Red Plastic Basket Tub */}
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.26, 0.2, 0.38]} />
              <meshStandardMaterial color="#EF4444" roughness={0.5} />
            </mesh>
            {/* Items inside basket */}
            <mesh position={[0, 0.06, 0]}>
              <boxGeometry args={[0.22, 0.1, 0.32]} />
              <meshStandardMaterial color="#65A30D" />
            </mesh>
          </group>
        )}
      </group>

      {/* 5. Right Arm & Hand (Holding phone, cart, or reaching for shelf item) */}
      <group position={[0.22, 1.36, 0]} rotation={rightArmRotation}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.08, 0.44, 0.09]} />
          <meshStandardMaterial color={agent.jacketColor || agent.shirtColor} roughness={0.7} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.46, 0]}>
          <boxGeometry args={[0.065, 0.09, 0.07]} />
          <meshStandardMaterial color={agent.skinTone} roughness={0.6} />
        </mesh>

        {/* Glowing Smartphone in Hand */}
        {hasPhone && !isReaching && (
          <mesh position={[0, -0.48, 0.08]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.06, 0.12, 0.01]} />
            <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.8} />
          </mesh>
        )}
      </group>

      {/* 6. Pelvis & Belt */}
      <group position={[0, 0.88, 0]}>
        <mesh>
          <boxGeometry args={[0.32, 0.12, 0.19]} />
          <meshStandardMaterial color={agent.trouserColor} roughness={0.8} />
        </mesh>
        {/* Belt */}
        <mesh position={[0, 0.04, 0.01]}>
          <boxGeometry args={[0.33, 0.04, 0.2]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
        {/* Metallic Buckle */}
        <mesh position={[0, 0.04, 0.11]}>
          <boxGeometry args={[0.06, 0.035, 0.01]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.9} />
        </mesh>
      </group>

      {/* 7. Left Leg with Jeans/Trousers & Sneakers */}
      <group position={[-0.09, 0.82, 0]} rotation={[-legSwing, 0, 0]}>
        <mesh position={[0, -0.38, 0]} castShadow>
          <boxGeometry args={[0.115, 0.74, 0.125]} />
          <meshStandardMaterial color={agent.trouserColor} roughness={0.8} />
        </mesh>
        {/* Sneaker Shoe Body */}
        <mesh position={[0, -0.78, 0.04]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.22]} />
          <meshStandardMaterial color={agent.shoeColor} roughness={0.6} />
        </mesh>
        {/* White Sneaker Rubber Sole */}
        <mesh position={[0, -0.81, 0.04]}>
          <boxGeometry args={[0.125, 0.02, 0.23]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* 8. Right Leg with Jeans/Trousers & Sneakers */}
      <group position={[0.09, 0.82, 0]} rotation={[legSwing, 0, 0]}>
        <mesh position={[0, -0.38, 0]} castShadow>
          <boxGeometry args={[0.115, 0.74, 0.125]} />
          <meshStandardMaterial color={agent.trouserColor} roughness={0.8} />
        </mesh>
        {/* Sneaker Shoe Body */}
        <mesh position={[0, -0.78, 0.04]} castShadow>
          <boxGeometry args={[0.12, 0.08, 0.22]} />
          <meshStandardMaterial color={agent.shoeColor} roughness={0.6} />
        </mesh>
        {/* White Sneaker Rubber Sole */}
        <mesh position={[0, -0.81, 0.04]}>
          <boxGeometry args={[0.125, 0.02, 0.23]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* ======================================================= */}
      {/* 9. ATTACHED SHOPPING CART IN FRONT OF SHOPPER */}
      {/* ======================================================= */}
      {hasCart && (
        <group position={[0, 0, 0.95]}>
          {/* Chrome Wire Basket */}
          <mesh position={[0, 0.65, 0]} castShadow>
            <boxGeometry args={[0.65, 0.45, 0.8]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Red Plastic Handle Bar */}
          <mesh position={[0, 0.9, -0.42]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.62, 8]} />
            <meshStandardMaterial color="#EF4444" roughness={0.5} />
          </mesh>

          {/* Cart Frame & Lower Shelf */}
          <mesh position={[0, 0.25, -0.05]}>
            <boxGeometry args={[0.55, 0.04, 0.75]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.8} />
          </mesh>

          {/* 4 Caster Wheels */}
          {[-0.26, 0.26].map((wx, wIdx) =>
            [-0.32, 0.32].map((wz, zIdx) => (
              <mesh key={`${wIdx}-${zIdx}`} position={[wx, 0.07, wz]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.065, 0.065, 0.04, 12]} />
                <meshStandardMaterial color="#1E293B" metalness={0.6} />
              </mesh>
            ))
          )}

          {/* Groceries inside Cart (Cereal boxes, milk, fruits) */}
          <group position={[0, 0.6, 0]}>
            <mesh position={[-0.14, 0.1, 0.1]} castShadow>
              <boxGeometry args={[0.18, 0.26, 0.12]} />
              <meshStandardMaterial color="#F59E0B" />
            </mesh>
            <mesh position={[0.14, 0.1, -0.1]} castShadow>
              <boxGeometry args={[0.16, 0.22, 0.16]} />
              <meshStandardMaterial color="#38BDF8" />
            </mesh>
            <mesh position={[0, 0.05, 0.18]}>
              <sphereGeometry args={[0.09, 8, 8]} />
              <meshStandardMaterial color="#16A34A" />
            </mesh>
          </group>
        </group>
      )}
    </group>
  )
}

export const Shoppers3D: React.FC<Shoppers3DProps> = ({
  showPositions,
  showTrails,
  replaySpeedMultiplier = 1.0,
}) => {
  // Generate realistic shopper agents with multi-waypoint patrol & dwell routes
  const shoppers = useMemo<ShopperAgent[]>(() => {
    const rawData = [
      // 1. Produce Shopper with Cart (browses Table A1, Table A2, Concourse)
      {
        waypoints: [
          { x: -7.5, z: -3.0, dwell: 3.5, action: 'reach_shelf' as const },
          { x: -8.5, z: -5.5, dwell: 4.0, action: 'reach_shelf' as const },
          { x: -6.0, z: -7.0, dwell: 2.5, action: 'inspect_item' as const },
          { x: -3.0, z: -5.0, dwell: 1.5, action: 'walk' as const },
        ],
        speed: 1.1,
        shirtColor: '#F5F5F0',
        jacketColor: '#2D4A6B',
        trouserColor: '#263238',
        shoeColor: '#1A1A2E',
        hairColor: '#3E2723',
        hairStyle: 'short' as const,
        skinTone: '#E0AC69',
        accessory: 'cart' as const,
      },
      // 2. Fresh Greens Shopper with Hand Basket
      {
        waypoints: [
          { x: -10.5, z: -6.5, dwell: 4.5, action: 'reach_shelf' as const },
          { x: -8.5, z: -8.5, dwell: 3.0, action: 'reach_shelf' as const },
          { x: -13.0, z: -6.5, dwell: 3.5, action: 'inspect_item' as const },
        ],
        speed: 0.9,
        shirtColor: '#4A5568',
        trouserColor: '#334155',
        shoeColor: '#E8E8E8',
        hairColor: '#171717',
        hairStyle: 'curly' as const,
        skinTone: '#8D5524',
        accessory: 'basket' as const,
      },
      // 3. Bakery Shopper (Inspecting Baguettes D1)
      {
        waypoints: [
          { x: -14.5, z: -5.0, dwell: 4.0, action: 'reach_shelf' as const },
          { x: -16.0, z: -7.5, dwell: 3.5, action: 'inspect_item' as const },
          { x: -12.5, z: -8.0, dwell: 2.0, action: 'walk' as const },
        ],
        speed: 1.0,
        shirtColor: '#D97706',
        trouserColor: '#1E293B',
        shoeColor: '#0F172A',
        hairColor: '#171717',
        hairStyle: 'long' as const,
        skinTone: '#E0AC69',
        accessory: 'basket' as const,
      },
      // 4. Dairy Cooler C2 Shopper with Cart (Out of stock milk inspection)
      {
        waypoints: [
          { x: 2.0, z: -6.5, dwell: 5.0, action: 'reach_shelf' as const },
          { x: 3.5, z: -8.5, dwell: 3.5, action: 'inspect_item' as const },
          { x: 0.5, z: -4.5, dwell: 2.0, action: 'walk' as const },
        ],
        speed: 1.1,
        shirtColor: '#F8FAFC',
        jacketColor: '#475569',
        trouserColor: '#1E293B',
        shoeColor: '#0F172A',
        hairColor: '#171717',
        hairStyle: 'cap' as const,
        skinTone: '#D4A373',
        accessory: 'cart' as const,
      },
      // 5. Yogurt & Butter Shopper with Basket
      {
        waypoints: [
          { x: 3.5, z: -3.5, dwell: 3.0, action: 'reach_shelf' as const },
          { x: 1.5, z: -5.5, dwell: 4.0, action: 'reach_shelf' as const },
          { x: 5.5, z: -2.0, dwell: 2.0, action: 'walk' as const },
        ],
        speed: 0.95,
        shirtColor: '#9333EA',
        trouserColor: '#334155',
        shoeColor: '#FFFFFF',
        hairColor: '#451A03',
        hairStyle: 'short' as const,
        skinTone: '#C68642',
        accessory: 'basket' as const,
      },
      // 6. Cold Beverage High Density B4 with Cart (Trying to get Cola)
      {
        waypoints: [
          { x: 13.5, z: -4.0, dwell: 5.5, action: 'reach_shelf' as const },
          { x: 15.5, z: -5.5, dwell: 3.0, action: 'reach_shelf' as const },
          { x: 12.0, z: -6.5, dwell: 2.0, action: 'walk' as const },
        ],
        speed: 1.2,
        shirtColor: '#FFFFFF',
        jacketColor: '#DC2626',
        trouserColor: '#1E293B',
        shoeColor: '#0F172A',
        hairColor: '#171717',
        hairStyle: 'short' as const,
        skinTone: '#F1C27D',
        accessory: 'cart' as const,
      },
      // 7. Sparkling Soda B3 Shopper with Basket
      {
        waypoints: [
          { x: 15.5, z: -7.0, dwell: 4.0, action: 'reach_shelf' as const },
          { x: 13.0, z: -8.0, dwell: 3.5, action: 'reach_shelf' as const },
          { x: 16.5, z: -5.0, dwell: 2.0, action: 'inspect_item' as const },
        ],
        speed: 1.0,
        shirtColor: '#0284C7',
        trouserColor: '#334155',
        shoeColor: '#FFFFFF',
        hairColor: '#3E2723',
        hairStyle: 'beanie' as const,
        skinTone: '#D4A373',
        accessory: 'basket' as const,
      },
      // 8. Promotional Endcap EC1 Snack Shopper
      {
        waypoints: [
          { x: 17.5, z: -4.5, dwell: 3.5, action: 'reach_shelf' as const },
          { x: 16.0, z: -2.0, dwell: 2.5, action: 'inspect_item' as const },
          { x: 14.5, z: 0.5, dwell: 1.5, action: 'walk' as const },
        ],
        speed: 1.05,
        shirtColor: '#16A34A',
        trouserColor: '#1E293B',
        shoeColor: '#0F172A',
        hairColor: '#171717',
        hairStyle: 'curly' as const,
        skinTone: '#8D5524',
        accessory: 'phone' as const,
      },
      // 9. Electronics Hub Tablet Inspector
      {
        waypoints: [
          { x: 2.0, z: 4.5, dwell: 6.0, action: 'reach_shelf' as const },
          { x: 4.5, z: 5.5, dwell: 4.5, action: 'inspect_item' as const },
          { x: 1.5, z: 3.0, dwell: 2.0, action: 'walk' as const },
        ],
        speed: 0.85,
        shirtColor: '#475569',
        jacketColor: '#0F172A',
        trouserColor: '#334155',
        shoeColor: '#FFFFFF',
        hairColor: '#171717',
        hairStyle: 'short' as const,
        skinTone: '#E0AC69',
        accessory: 'none' as const,
      },
      // 10. Electronics Table Shopper with Cart
      {
        waypoints: [
          { x: 4.5, z: 3.5, dwell: 4.5, action: 'reach_shelf' as const },
          { x: 2.5, z: 3.0, dwell: 3.0, action: 'inspect_item' as const },
          { x: 5.5, z: 6.0, dwell: 2.0, action: 'walk' as const },
        ],
        speed: 0.95,
        shirtColor: '#2563EB',
        trouserColor: '#1E293B',
        shoeColor: '#0F172A',
        hairColor: '#3E2723',
        hairStyle: 'cap' as const,
        skinTone: '#C68642',
        accessory: 'cart' as const,
      },
      // 11. Central Main Concourse Walkway with Cart
      {
        waypoints: [
          { x: 0, z: -11.0, dwell: 1.0, action: 'walk' as const },
          { x: 0, z: -4.0, dwell: 2.5, action: 'inspect_item' as const },
          { x: 0, z: 2.0, dwell: 1.5, action: 'walk' as const },
          { x: 4.0, z: 0, dwell: 2.0, action: 'walk' as const },
        ],
        speed: 1.2,
        shirtColor: '#EA580C',
        trouserColor: '#1E293B',
        shoeColor: '#FFFFFF',
        hairColor: '#171717',
        hairStyle: 'short' as const,
        skinTone: '#D4A373',
        accessory: 'cart' as const,
      },
      // 12. Concourse Crosswalk Shopper with Basket
      {
        waypoints: [
          { x: 6.5, z: -1.0, dwell: 1.5, action: 'walk' as const },
          { x: 8.5, z: 2.0, dwell: 3.0, action: 'inspect_item' as const },
          { x: 10.5, z: 4.5, dwell: 2.0, action: 'walk' as const },
        ],
        speed: 1.1,
        shirtColor: '#0D9488',
        trouserColor: '#334155',
        shoeColor: '#0F172A',
        hairColor: '#451A03',
        hairStyle: 'long' as const,
        skinTone: '#F1C27D',
        accessory: 'basket' as const,
      },
      // 13. Household & Health Aisle Shopper with Cart
      {
        waypoints: [
          { x: -2.5, z: 2.0, dwell: 3.5, action: 'reach_shelf' as const },
          { x: -4.5, z: 4.5, dwell: 4.0, action: 'reach_shelf' as const },
          { x: -1.0, z: 6.0, dwell: 2.0, action: 'walk' as const },
        ],
        speed: 1.0,
        shirtColor: '#7C3AED',
        trouserColor: '#1E293B',
        shoeColor: '#FFFFFF',
        hairColor: '#171717',
        hairStyle: 'short' as const,
        skinTone: '#E0AC69',
        accessory: 'cart' as const,
      },
      // 14. West Produce Concourse Shopper with Basket
      {
        waypoints: [
          { x: -7.5, z: 3.5, dwell: 3.0, action: 'reach_shelf' as const },
          { x: -9.5, z: 5.5, dwell: 3.5, action: 'inspect_item' as const },
          { x: -6.0, z: 7.0, dwell: 2.0, action: 'walk' as const },
        ],
        speed: 1.05,
        shirtColor: '#0284C7',
        trouserColor: '#1E293B',
        shoeColor: '#FFFFFF',
        hairColor: '#171717',
        hairStyle: 'short' as const,
        skinTone: '#D4A373',
        accessory: 'basket' as const,
      },
      // 15. Checkout Inflow Shopper with Cart
      {
        waypoints: [
          { x: 8.5, z: 3.5, dwell: 2.0, action: 'walk' as const },
          { x: 10.5, z: 5.0, dwell: 4.0, action: 'inspect_item' as const },
          { x: 12.0, z: 6.0, dwell: 3.0, action: 'walk' as const },
        ],
        speed: 0.9,
        shirtColor: '#B91C1C',
        trouserColor: '#334155',
        shoeColor: '#0F172A',
        hairColor: '#3E2723',
        hairStyle: 'curly' as const,
        skinTone: '#8D5524',
        accessory: 'cart' as const,
      },
    ]

    return rawData.map((d, idx) => ({
      id: 'shopper-' + (idx + 1),
      waypoints: d.waypoints,
      currentWpIndex: 0,
      speed: d.speed,
      shirtColor: d.shirtColor,
      jacketColor: d.jacketColor,
      trouserColor: d.trouserColor,
      shoeColor: d.shoeColor,
      hairColor: d.hairColor,
      hairStyle: d.hairStyle,
      skinTone: d.skinTone,
      accessory: d.accessory,
      scale: 0.96 + (idx % 3) * 0.04,
      trail: d.waypoints.map((wp) => [wp.x, 0.05, wp.z] as [number, number, number]),
    }))
  }, [])

  const shopperGroupRefs = useRef<(THREE.Group | null)[]>([])
  // Internal state tracker for each shopper's current location, progress, and dwell timer
  const shopperStates = useRef(
    shoppers.map(() => ({
      currentWp: 0,
      nextWp: 1,
      progress: 0,
      dwellTimer: 0,
      isDwelling: false,
      isReaching: false,
      currentHeading: 0,
      walkCycle: 0,
    }))
  )

  // Advanced behavior state machine and smooth turning physics in frame loop
  useFrame((_, delta) => {
    if (!showPositions) return
    const dt = Math.min(delta, 0.1) * replaySpeedMultiplier

    shoppers.forEach((ag, idx) => {
      const grp = shopperGroupRefs.current[idx]
      const st = shopperStates.current[idx]
      if (!grp) return

      const wpList = ag.waypoints
      const startWp = wpList[st.currentWp]
      const endWp = wpList[st.nextWp]

      if (st.isDwelling) {
        st.dwellTimer -= dt
        st.isReaching = startWp.action === 'reach_shelf'
        if (st.dwellTimer <= 0) {
          st.isDwelling = false
          st.isReaching = false
          st.progress = 0
        }
      } else {
        // Move towards next waypoint
        const dx = endWp.x - startWp.x
        const dz = endWp.z - startWp.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        const step = (ag.speed * dt) / (dist || 1)

        st.progress += step
        st.walkCycle += dt * ag.speed * 7.5

        // Smoothly interpolate heading angle
        const targetHeading = Math.atan2(dx, dz)
        let diff = targetHeading - st.currentHeading
        while (diff < -Math.PI) diff += Math.PI * 2
        while (diff > Math.PI) diff -= Math.PI * 2
        st.currentHeading += diff * Math.min(dt * 6.0, 1.0)
        grp.rotation.y = st.currentHeading

        if (st.progress >= 1.0) {
          st.progress = 1.0
          st.currentWp = st.nextWp
          st.nextWp = (st.nextWp + 1) % wpList.length
          st.isDwelling = true
          st.dwellTimer = endWp.dwell
        }

        const curX = startWp.x + dx * st.progress
        const curZ = startWp.z + dz * st.progress
        grp.position.set(curX, 0, curZ)
      }
    })
  })

  if (!showPositions) return null

  return (
    <group>
      {shoppers.map((agent, index) => (
        <group key={agent.id}>
          {/* Subtle Shopper Path Trail */}
          {showTrails && (
            <Line
              points={agent.trail}
              color="#38BDF8"
              lineWidth={1.2}
              transparent
              opacity={0.25}
            />
          )}

          {/* Detailed Realistic Human Shopper Avatar */}
          <group
            ref={(el) => {
              shopperGroupRefs.current[index] = el
            }}
            position={[agent.waypoints[0].x, 0, agent.waypoints[0].z]}
            scale={[agent.scale, agent.scale, agent.scale]}
          >
            <DetailedHumanAvatar
              agent={agent}
              isMoving={!shopperStates.current[index]?.isDwelling}
              isReaching={shopperStates.current[index]?.isReaching}
              walkCycle={shopperStates.current[index]?.walkCycle || 0}
            />
          </group>
        </group>
      ))}
    </group>
  )
}
