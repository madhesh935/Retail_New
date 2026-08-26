import React, { useMemo } from 'react'
import * as THREE from 'three'

export const StoreFloor: React.FC = () => {
  // 1. High-Tech Dark Architectural Retail Floor Tile Texture
  const tileTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Deep dark slate/graphite base
      ctx.fillStyle = '#0B1322'
      ctx.fillRect(0, 0, 512, 512)

      // Subtle high-tech grid lines
      ctx.strokeStyle = '#1E293B'
      ctx.lineWidth = 2

      const tileSize = 64
      for (let x = 0; x <= 512; x += tileSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, 512)
        ctx.stroke()
      }
      for (let y = 0; y <= 512; y += tileSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(512, y)
        ctx.stroke()
      }

      // Micro surface variation for polished high-gloss sheen
      for (let i = 0; i < 1500; i++) {
        const nx = Math.random() * 512
        const ny = Math.random() * 512
        ctx.fillStyle = Math.random() > 0.6
          ? 'rgba(56, 189, 248, 0.04)' // subtle cyan fleck
          : 'rgba(255, 255, 255, 0.02)'
        ctx.fillRect(nx, ny, 2, 2)
      }
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(14, 10)
    return texture
  }, [])

  // 2. Yellow/Black Safety Hazard Stripes for Stockroom Loading Bays
  const hazardTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#0F172A'
      ctx.fillRect(0, 0, 256, 64)
      ctx.fillStyle = '#EAB308' // safety yellow

      const stripeW = 32
      for (let x = -64; x < 320; x += stripeW * 2) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + stripeW, 0)
        ctx.lineTo(x + stripeW - 32, 64)
        ctx.lineTo(x - 32, 64)
        ctx.closePath()
        ctx.fill()
      }
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 1)
    return texture
  }, [])

  return (
    <group position={[0, 0, 0]}>
      {/* ======================================================= */}
      {/* 1. MAIN STORE FLOOR BASE (Deep Obsidian Tile)          */}
      {/* ======================================================= */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[44, 32]} />
        <meshStandardMaterial
          map={tileTexture}
          roughness={0.28}
          metalness={0.25}
        />
      </mesh>

      {/* ======================================================= */}
      {/* 2. HIGH-TECH WALKWAYS & CIRCULATION ARTERIES            */}
      {/* ======================================================= */}
      {/* Main Entrance Concourse Pathway */}
      <group position={[0, 0.002, -10.5]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[38, 3.2]} />
          <meshStandardMaterial color="#111C2E" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Glowing edge guide lines */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -1.55]}>
          <planeGeometry args={[38, 0.06]} />
          <meshBasicMaterial color="#0284C7" transparent opacity={0.6} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 1.55]}>
          <planeGeometry args={[38, 0.06]} />
          <meshBasicMaterial color="#0284C7" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Center Main Spine Aisle */}
      <group position={[0, 0.002, -1.0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[3.2, 16.5]} />
          <meshStandardMaterial color="#111C2E" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.55, 0.001, 0]}>
          <planeGeometry args={[0.06, 16.5]} />
          <meshBasicMaterial color="#0284C7" transparent opacity={0.6} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.55, 0.001, 0]}>
          <planeGeometry args={[0.06, 16.5]} />
          <meshBasicMaterial color="#0284C7" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Front-of-Checkout Staging Area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[14.5, 0.002, 6.5]} receiveShadow>
        <planeGeometry args={[11, 3.2]} />
        <meshStandardMaterial color="#111C2E" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Back aisle pathway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 7.5]} receiveShadow>
        <planeGeometry args={[38, 2.6]} />
        <meshStandardMaterial color="#111C2E" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* ======================================================= */}
      {/* 3. ARCHITECTURAL PERIMETER WALLS WITH GLOWING TOP TRIM  */}
      {/* ======================================================= */}
      {/* North Wall (Backroom boundary) */}
      <group position={[0, 0, 15.5]}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[44, 1.4, 0.35]} />
          <meshStandardMaterial color="#0F172A" roughness={0.6} metalness={0.3} />
        </mesh>
        {/* Wall Top Cyan Accent Glow Rail */}
        <mesh position={[0, 1.42, 0]}>
          <boxGeometry args={[44.2, 0.05, 0.38]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
        {/* Baseboard Trim */}
        <mesh position={[0, 0.1, -0.18]}>
          <boxGeometry args={[44, 0.2, 0.05]} />
          <meshStandardMaterial color="#0284C7" metalness={0.6} />
        </mesh>
      </group>

      {/* South Wall (West side of entrance) */}
      <group position={[-13.5, 0, -15.5]}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[17, 1.4, 0.35]} />
          <meshStandardMaterial color="#0F172A" roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[0, 1.42, 0]}>
          <boxGeometry args={[17.2, 0.05, 0.38]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
      </group>

      {/* South Wall (East side of exit) */}
      <group position={[13.5, 0, -15.5]}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[17, 1.4, 0.35]} />
          <meshStandardMaterial color="#0F172A" roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[0, 1.42, 0]}>
          <boxGeometry args={[17.2, 0.05, 0.38]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
      </group>

      {/* West Wall */}
      <group position={[-21.5, 0, 0]}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.35, 1.4, 31]} />
          <meshStandardMaterial color="#0F172A" roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[0, 1.42, 0]}>
          <boxGeometry args={[0.38, 0.05, 31.2]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
      </group>

      {/* East Wall */}
      <group position={[21.5, 0, 0]}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.35, 1.4, 31]} />
          <meshStandardMaterial color="#0F172A" roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[0, 1.42, 0]}>
          <boxGeometry args={[0.38, 0.05, 31.2]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
      </group>

      {/* ======================================================= */}
      {/* 4. STOCKROOM LOGISTICS HUB & HIGH-BAY WAREHOUSE         */}
      {/* ======================================================= */}
      {/* Warehouse Partition Wall */}
      <group position={[0, 0, 9.5]}>
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[43, 2.2, 0.3]} />
          <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.4} />
        </mesh>
        {/* Wall Top Trim */}
        <mesh position={[0, 2.22, 0]}>
          <boxGeometry args={[43.2, 0.06, 0.34]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
      </group>

      {/* Stockroom Access Fast-Roll High-Speed Doors */}
      {[-10, 10].map((doorX, idx) => (
        <group key={`door-${idx}`} position={[doorX, 1.0, 9.5]}>
          <mesh position={[-0.7, 0, 0]}>
            <boxGeometry args={[1.3, 2.0, 0.36]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0.7, 0, 0]}>
            <boxGeometry args={[1.3, 2.0, 0.36]} />
            <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Yellow Hazard Border Frame */}
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[2.9, 0.12, 0.4]} />
            <meshBasicMaterial color="#FACC15" />
          </mesh>
          {/* Status Beacons */}
          <mesh position={[0, 1.16, 0.22]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#10B981" />
          </mesh>
        </group>
      ))}

      {/* Stockroom Safety Hazard Striping Zones */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, 0.003, 12.5]}>
        <planeGeometry args={[7, 3.5]} />
        <meshStandardMaterial map={hazardTexture} roughness={0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0.003, 12.5]}>
        <planeGeometry args={[7, 3.5]} />
        <meshStandardMaterial map={hazardTexture} roughness={0.5} />
      </mesh>

      {/* Stockroom Center Staging Area: Pallet Stacks & Cartons */}
      <group position={[0, 0, 12.8]}>
        {/* Stack of 3 Wooden Pallets with Shrink-Wrapped Bulk Boxes */}
        {[-2.2, 0, 2.2].map((px, pIdx) => (
          <group key={`pallet-stack-${pIdx}`} position={[px, 0, 0]}>
            {/* Wooden Pallet base */}
            <mesh position={[0, 0.08, 0]} castShadow>
              <boxGeometry args={[1.3, 0.14, 1.1]} />
              <meshStandardMaterial color="#92400E" roughness={0.85} />
            </mesh>
            {/* Tier 1 Cartons */}
            <mesh position={[-0.28, 0.36, -0.24]} castShadow>
              <boxGeometry args={[0.55, 0.44, 0.48]} />
              <meshStandardMaterial color="#B45309" roughness={0.7} />
            </mesh>
            <mesh position={[0.28, 0.36, -0.24]} castShadow>
              <boxGeometry args={[0.55, 0.44, 0.48]} />
              <meshStandardMaterial color="#D97706" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.36, 0.26]} castShadow>
              <boxGeometry args={[1.1, 0.44, 0.48]} />
              <meshStandardMaterial color="#B45309" roughness={0.7} />
            </mesh>
            {/* Tier 2 Cartons */}
            <mesh position={[0, 0.78, 0]} castShadow>
              <boxGeometry args={[1.15, 0.4, 0.95]} />
              <meshStandardMaterial color="#CA8A04" roughness={0.65} />
            </mesh>
            {/* Transparent stretch film sheen */}
            <mesh position={[0, 0.58, 0]}>
              <boxGeometry args={[1.22, 0.88, 1.02]} />
              <meshStandardMaterial color="#E0F2FE" transparent opacity={0.15} roughness={0.1} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Industrial Warehouse Forklift Vehicle (Stockroom Left) */}
      <group position={[-16, 0, 12.8]} rotation={[0, 0.3, 0]}>
        {/* Chassis Body */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[1.1, 0.7, 1.6]} />
          <meshStandardMaterial color="#EA580C" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Overhead Safety Roll Cage */}
        <mesh position={[0, 1.25, -0.2]}>
          <boxGeometry args={[0.95, 0.9, 0.9]} />
          <meshStandardMaterial color="#1E293B" wireframe />
        </mesh>
        {/* Mast & Forks */}
        <mesh position={[0, 0.85, 0.9]}>
          <boxGeometry args={[0.6, 1.5, 0.1]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        <mesh position={[-0.18, 0.08, 1.3]}>
          <boxGeometry args={[0.1, 0.06, 0.8]} />
          <meshStandardMaterial color="#64748B" metalness={0.9} />
        </mesh>
        <mesh position={[0.18, 0.08, 1.3]}>
          <boxGeometry args={[0.1, 0.06, 0.8]} />
          <meshStandardMaterial color="#64748B" metalness={0.9} />
        </mesh>
        {/* Flashing Amber Beacon */}
        <mesh position={[0, 1.75, -0.2]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
      </group>

      {/* Hydraulic Pallet Jack (Stockroom Right) */}
      <group position={[16, 0, 12.8]} rotation={[0, -0.4, 0]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.6]} />
          <meshStandardMaterial color="#FACC15" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.65, -0.2]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.8, 8]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
        <mesh position={[-0.14, 0.08, 0.6]}>
          <boxGeometry args={[0.12, 0.08, 1.1]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        <mesh position={[0.14, 0.08, 0.6]}>
          <boxGeometry args={[0.12, 0.08, 1.1]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
      </group>

      {/* ======================================================= */}
      {/* 5. ENTRANCE GATEWAYS, TURNSTILES & CUSTOMER SERVICE     */}
      {/* ======================================================= */}
      {/* Entrance Laser Optical Turnstiles */}
      <group position={[-3, 0, -14.5]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
          <planeGeometry args={[4.5, 2.0]} />
          <meshStandardMaterial color="#0A0E1A" roughness={0.9} />
        </mesh>
        {[-1.8, 0, 1.8].map((xPos, idx) => (
          <group key={`turnstile-${idx}`} position={[xPos, 0.55, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.22, 1.1, 0.9]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Acrylic Swing Gate with Laser Edge */}
            <mesh position={[0, 0.1, 0.25]}>
              <boxGeometry args={[0.04, 0.6, 0.45]} />
              <meshStandardMaterial color="#38BDF8" transparent opacity={0.5} />
            </mesh>
            {/* Green Laser Sensor Beam */}
            <mesh position={[0, 0.56, -0.3]}>
              <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
              <meshBasicMaterial color="#10B981" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Exit Glass Security Pedestals */}
      <group position={[3.5, 0, -14.5]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
          <planeGeometry args={[4.0, 2.0]} />
          <meshStandardMaterial color="#0A0E1A" roughness={0.9} />
        </mesh>
        {[-1.5, 1.5].map((xPos, idx) => (
          <group key={`exit-gate-${idx}`} position={[xPos, 0.7, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.15, 1.4, 0.15]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-Math.sign(xPos) * 0.6, 0, 0]}>
              <boxGeometry args={[1.2, 1.0, 0.04]} />
              <meshStandardMaterial color="#38BDF8" transparent opacity={0.35} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Customer Service & Click-and-Collect Desk (Entrance East) */}
      <group position={[8.5, 0, -13.2]}>
        {/* Service Counter Desk */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[2.8, 1.0, 1.1]} />
          <meshStandardMaterial color="#1E293B" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Counter Top Trim */}
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[2.86, 0.04, 1.16]} />
          <meshStandardMaterial color="#38BDF8" metalness={0.8} />
        </mesh>
        {/* Staff Monitor Screen */}
        <mesh position={[-0.4, 1.25, 0]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.4, 0.28, 0.03]} />
          <meshStandardMaterial color="#0284C7" emissive="#0284C7" emissiveIntensity={0.6} />
        </mesh>
        {/* Customer Help Sign Badge */}
        <mesh position={[0, 0.5, 0.56]}>
          <boxGeometry args={[1.4, 0.25, 0.02]} />
          <meshBasicMaterial color="#0284C7" />
        </mesh>
      </group>

      {/* Shopping Cart Staging Bay (Entrance West) */}
      <group position={[-10, 0, -13]}>
        {/* Stainless Steel Railings */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.06, 1.0, 3.5]} />
          <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[2.2, 0.5, 0]}>
          <boxGeometry args={[0.06, 1.0, 3.5]} />
          <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Rows of Metallic Wire Shopping Carts */}
        {[-1.2, -0.4, 0.4, 1.2].map((zOffset, idx) => (
          <group key={`cart-${idx}`} position={[1.1, 0.4, zOffset]}>
            <mesh castShadow>
              <boxGeometry args={[0.8, 0.65, 0.65]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.15} />
            </mesh>
            {/* Red handle bar */}
            <mesh position={[0, 0.4, 0.35]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
              <meshStandardMaterial color="#DC2626" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Flower & Plant Stand (Entrance Welcome Fixture) */}
      <group position={[-15.5, 0, -12.5]}>
        {/* Tiered Display Stand */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[2.0, 0.6, 1.4]} />
          <meshStandardMaterial color="#78350F" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.7, -0.3]} castShadow>
          <boxGeometry args={[1.9, 0.4, 0.6]} />
          <meshStandardMaterial color="#854D0E" roughness={0.8} />
        </mesh>
        {/* Potted Green Plants & Colorful Blooms */}
        {[-0.6, 0, 0.6].map((fx, idx) => (
          <group key={`flower-${idx}`} position={[fx, 0.65, 0.2]}>
            <mesh>
              <cylinderGeometry args={[0.15, 0.1, 0.22, 10]} />
              <meshStandardMaterial color="#C2410C" />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <sphereGeometry args={[0.2, 10, 8]} />
              <meshStandardMaterial color={idx === 0 ? '#EC4899' : idx === 1 ? '#10B981' : '#F59E0B'} />
            </mesh>
          </group>
        ))}
        {[-0.5, 0.5].map((fx, idx) => (
          <group key={`flower-top-${idx}`} position={[fx, 0.95, -0.3]}>
            <mesh>
              <cylinderGeometry args={[0.14, 0.09, 0.2, 10]} />
              <meshStandardMaterial color="#9A3412" />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <sphereGeometry args={[0.18, 10, 8]} />
              <meshStandardMaterial color={idx === 0 ? '#8B5CF6' : '#E11D48'} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Hand Basket Staging Stand */}
      <group position={[-6.2, 0, -13.5]}>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.9, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        {[-0.1, 0.05, 0.2, 0.35].map((yOff, idx) => (
          <mesh key={idx} position={[0, 0.6 + yOff, 0]}>
            <boxGeometry args={[0.32, 0.12, 0.44]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#DC2626' : '#0284C7'} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Sanitizer & Wipe Station */}
      <group position={[-0.8, 0, -13.5]}>
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.3, 12]} />
          <meshStandardMaterial color="#64748B" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[0.16, 0.26, 0.14]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.1, 0.075]}>
          <boxGeometry args={[0.06, 0.04, 0.02]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
      </group>
    </group>
  )
}
