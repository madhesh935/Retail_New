import React, { useMemo } from 'react'
import * as THREE from 'three'

export const StoreFloor: React.FC = () => {
  // Create a realistic commercial floor tile texture procedurally
  const tileTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Modern commercial store tile base (clean light-grey tone)
      ctx.fillStyle = '#222F3E'
      ctx.fillRect(0, 0, 512, 512)

      // Tile grid lines (crisp light grout)
      ctx.strokeStyle = '#18222F'
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

      // Subtle surface grain
      for (let i = 0; i < 2000; i++) {
        const nx = Math.random() * 512
        const ny = Math.random() * 512
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)'
        ctx.fillRect(nx, ny, 2, 2)
      }
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(12, 9)
    return texture
  }, [])

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Main Store Floor Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[44, 32]} />
        <meshStandardMaterial
          map={tileTexture}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* 2. Walkway / Aisle Circulation Pathways (Polished lighter finish) */}
      {/* Main Entrance Concourse Pathway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -10]} receiveShadow>
        <planeGeometry args={[38, 3.8]} />
        <meshStandardMaterial color="#2C3B4E" roughness={0.4} metalness={0.15} />
      </mesh>

      {/* Center Main Spine Aisle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -0.5]} receiveShadow>
        <planeGeometry args={[3.8, 18]} />
        <meshStandardMaterial color="#2C3B4E" roughness={0.4} metalness={0.15} />
      </mesh>

      {/* Front-of-Checkout Staging Area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[14.5, 0.002, 6.5]} receiveShadow>
        <planeGeometry args={[11, 3.2]} />
        <meshStandardMaterial color="#2C3B4E" roughness={0.4} metalness={0.15} />
      </mesh>

      {/* Back aisle pathway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 7.5]} receiveShadow>
        <planeGeometry args={[38, 2.6]} />
        <meshStandardMaterial color="#2C3B4E" roughness={0.4} metalness={0.15} />
      </mesh>

      {/* 3. Architectural Cutaway Perimeter Walls (1.2m height) */}
      {/* North Wall (Backroom boundary) */}
      <group position={[0, 0, 15.5]}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[44, 1.4, 0.35]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
        {/* Wall Top White Trim */}
        <mesh position={[0, 1.42, 0]}>
          <boxGeometry args={[44.2, 0.06, 0.4]} />
          <meshStandardMaterial color="#94A3B8" />
        </mesh>
        {/* Wall Baseboard Trim */}
        <mesh position={[0, 0.1, -0.18]}>
          <boxGeometry args={[44, 0.2, 0.05]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
      </group>

      {/* South Wall (West side of entrance) */}
      <group position={[-13.5, 0, -15.5]}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[17, 1.4, 0.35]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.42, 0]}>
          <boxGeometry args={[17.2, 0.06, 0.4]} />
          <meshStandardMaterial color="#94A3B8" />
        </mesh>
        <mesh position={[0, 0.1, 0.18]}>
          <boxGeometry args={[17, 0.2, 0.05]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
      </group>

      {/* South Wall (East side of exit) */}
      <group position={[13.5, 0, -15.5]}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[17, 1.4, 0.35]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.42, 0]}>
          <boxGeometry args={[17.2, 0.06, 0.4]} />
          <meshStandardMaterial color="#94A3B8" />
        </mesh>
        <mesh position={[0, 0.1, 0.18]}>
          <boxGeometry args={[17, 0.2, 0.05]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
      </group>

      {/* West Wall */}
      <group position={[-21.5, 0, 0]}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.35, 1.4, 31]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.42, 0]}>
          <boxGeometry args={[0.4, 0.06, 31.2]} />
          <meshStandardMaterial color="#94A3B8" />
        </mesh>
      </group>

      {/* East Wall */}
      <group position={[21.5, 0, 0]}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.35, 1.4, 31]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.42, 0]}>
          <boxGeometry args={[0.4, 0.06, 31.2]} />
          <meshStandardMaterial color="#94A3B8" />
        </mesh>
      </group>

      {/* 4. Stockroom Warehouse Partition Wall */}
      <group position={[0, 0, 9.5]}>
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[43, 2.2, 0.3]} />
          <meshStandardMaterial color="#1E293B" roughness={0.8} />
        </mesh>
        {/* Wall Top Trim */}
        <mesh position={[0, 2.22, 0]}>
          <boxGeometry args={[43.2, 0.08, 0.36]} />
          <meshStandardMaterial color="#64748B" metalness={0.7} />
        </mesh>
      </group>

      {/* Stockroom Access Double Doors (West & East) */}
      {[-10, 10].map((doorX, idx) => (
        <group key={`door-${idx}`} position={[doorX, 1.0, 9.5]}>
          <mesh position={[-0.7, 0, 0]}>
            <boxGeometry args={[1.3, 2.0, 0.36]} />
            <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0.7, 0, 0]}>
            <boxGeometry args={[1.3, 2.0, 0.36]} />
            <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
          </mesh>
          {/* Stainless Kickplate */}
          <mesh position={[0, -0.7, 0.19]}>
            <boxGeometry args={[2.7, 0.4, 0.02]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.8} />
          </mesh>
          {/* Door Frame */}
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[2.9, 0.15, 0.4]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>
        </group>
      ))}

      {/* 5. Entrance Turnstile Pedestals & Security Gates */}
      <group position={[-3, 0, -14.5]}>
        {/* Entrance Mat */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
          <planeGeometry args={[4.5, 2.0]} />
          <meshStandardMaterial color="#0F172A" roughness={0.9} />
        </mesh>

        {/* 3 Optical Stainless Turnstiles */}
        {[-1.8, 0, 1.8].map((xPos, idx) => (
          <group key={`turnstile-${idx}`} position={[xPos, 0.55, 0]}>
            {/* Stainless Post Body */}
            <mesh castShadow>
              <boxGeometry args={[0.22, 1.1, 0.9]} />
              <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Acrylic Swing Gate */}
            <mesh position={[0, 0.1, 0.25]}>
              <boxGeometry args={[0.04, 0.6, 0.45]} />
              <meshStandardMaterial color="#38BDF8" transparent opacity={0.5} />
            </mesh>
            {/* Bright LED Status Indicator */}
            <mesh position={[0, 0.56, -0.3]}>
              <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
              <meshBasicMaterial color="#10B981" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 6. Exit Glass Security Gates */}
      <group position={[3.5, 0, -14.5]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
          <planeGeometry args={[4.0, 2.0]} />
          <meshStandardMaterial color="#0F172A" roughness={0.9} />
        </mesh>
        {[-1.5, 1.5].map((xPos, idx) => (
          <group key={`exit-gate-${idx}`} position={[xPos, 0.7, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.15, 1.4, 0.15]} />
              <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-Math.sign(xPos) * 0.6, 0, 0]}>
              <boxGeometry args={[1.2, 1.0, 0.04]} />
              <meshStandardMaterial color="#38BDF8" transparent opacity={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 7. Chrome Shopping Carts Staging Bay */}
      <group position={[-10, 0, -13]}>
        {/* Cart Bay Railings */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.06, 1.0, 3.5]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[2.2, 0.5, 0]}>
          <boxGeometry args={[0.06, 1.0, 3.5]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Nested Shopping Carts Rows */}
        {[-1.2, -0.4, 0.4, 1.2].map((zOffset, idx) => (
          <group key={`cart-${idx}`} position={[1.1, 0.4, zOffset]}>
            <mesh castShadow>
              <boxGeometry args={[0.8, 0.65, 0.65]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Handlebar */}
            <mesh position={[0, 0.4, 0.35]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
              <meshStandardMaterial color="#EF4444" />
            </mesh>
          </group>
        ))}
      </group>

      {/* 8. Hand Shopping Basket Staging Racks near Entrance */}
      <group position={[-6.2, 0, -13.5]}>
        {/* Wire Stand */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.9, 8]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.8} />
        </mesh>
        {/* Stack of Red Hand Baskets */}
        {[-0.1, 0.05, 0.2, 0.35].map((yOff, idx) => (
          <mesh key={idx} position={[0, 0.6 + yOff, 0]}>
            <boxGeometry args={[0.32, 0.12, 0.44]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#EF4444' : '#0284C7'} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* 9. Sanitizer & Cart Wipe Station */}
      <group position={[-0.8, 0, -13.5]}>
        {/* Stainless Steel Pedestal Pole */}
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.3, 12]} />
          <meshStandardMaterial color="#CBD5E1" metalness={0.9} />
        </mesh>
        {/* Heavy Circular Floor Base */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        {/* Dispenser Box with Cyan Touchless Sensor */}
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[0.16, 0.26, 0.14]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.1, 0.075]}>
          <boxGeometry args={[0.06, 0.04, 0.02]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
      </group>

      {/* 10. Autonomous Retail Floor Scrubber Robot near Stockroom */}
      <group position={[6.5, 0, 7.8]}>
        {/* Robot Body */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.85, 0.7, 1.2]} />
          <meshStandardMaterial color="#0284C7" metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Top LiDAR / Sensor Turret */}
        <mesh position={[0, 0.74, 0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
        {/* Warning Hazard Amber Flashing Strobe */}
        <mesh position={[0, 0.76, -0.3]}>
          <cylinderGeometry args={[0.05, 0.05, 0.08, 12]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
        {/* Front Bumper with Hazard Chevrons */}
        <mesh position={[0, 0.15, 0.62]}>
          <boxGeometry args={[0.88, 0.2, 0.06]} />
          <meshStandardMaterial color="#FACC15" />
        </mesh>
      </group>

      {/* 11. Stockroom Hydraulic Pallet Jack in Backroom */}
      <group position={[-5, 0, 13.5]} rotation={[0, 0.6, 0]}>
        {/* Safety Yellow Jack Body */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.6]} />
          <meshStandardMaterial color="#FACC15" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Steering T-Handle */}
        <mesh position={[0, 0.65, -0.2]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.8, 8]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
        {/* Steel Lifting Forks */}
        <mesh position={[-0.14, 0.08, 0.6]}>
          <boxGeometry args={[0.12, 0.08, 1.1]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        <mesh position={[0.14, 0.08, 0.6]}>
          <boxGeometry args={[0.12, 0.08, 1.1]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
      </group>
    </group>
  )
}
