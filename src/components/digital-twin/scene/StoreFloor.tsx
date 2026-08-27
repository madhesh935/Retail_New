import React, { useMemo } from 'react'
import * as THREE from 'three'
import { RetailPalette } from '../theme/retailPalette'

const WALL_H = 1.35
const WALL_THICK = 0.32

/** Deterministic pseudo-noise in [0, 1] from integer coords (no Math.random). */
function hash2(ix: number, iy: number): number {
  const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453
  return n - Math.floor(n)
}

export const StoreFloor: React.FC = () => {
  const tileTexture = useMemo(() => {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = RetailPalette.floor
      ctx.fillRect(0, 0, size, size)

      const tileSize = 64
      // Soft per-tile tone variation (deterministic)
      for (let ty = 0; ty < size; ty += tileSize) {
        for (let tx = 0; tx < size; tx += tileSize) {
          const v = hash2(tx / tileSize, ty / tileSize)
          const shade = Math.floor(240 + v * 12)
          ctx.fillStyle = `rgb(${shade}, ${shade - 2}, ${shade - 6})`
          ctx.fillRect(tx + 1, ty + 1, tileSize - 2, tileSize - 2)
        }
      }

      // Light grout lines
      ctx.strokeStyle = RetailPalette.floorGrout
      ctx.lineWidth = 2
      for (let x = 0; x <= size; x += tileSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, size)
        ctx.stroke()
      }
      for (let y = 0; y <= size; y += tileSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(size, y)
        ctx.stroke()
      }

      // Subtle surface flecks (deterministic grid)
      for (let iy = 0; iy < 64; iy++) {
        for (let ix = 0; ix < 64; ix++) {
          const h = hash2(ix + 17, iy + 41)
          if (h > 0.72) {
            const px = (ix / 64) * size + h * 6
            const py = (iy / 64) * size + hash2(iy, ix) * 6
            const a = 0.04 + h * 0.05
            ctx.fillStyle = `rgba(180, 170, 155, ${a})`
            ctx.fillRect(px, py, 1.5, 1.5)
          }
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(14, 10)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  const hazardTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#F5F5F4'
      ctx.fillRect(0, 0, 256, 64)
      ctx.fillStyle = '#D97706'

      const stripeW = 28
      for (let x = -64; x < 320; x += stripeW * 2) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + stripeW, 0)
        ctx.lineTo(x + stripeW - 28, 64)
        ctx.lineTo(x - 28, 64)
        ctx.closePath()
        ctx.fill()
      }
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 1)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])

  return (
    <group position={[0, 0, 0]}>
      {/* Main store floor — bright cream tile */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[44, 32]} />
        <meshStandardMaterial
          map={tileTexture}
          roughness={0.72}
          metalness={0.02}
        />
      </mesh>

      {/* Soft aisle pathways — raised enough to avoid floor z-fight */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -10.5]} receiveShadow>
        <planeGeometry args={[38, 3.2]} />
        <meshStandardMaterial color={RetailPalette.aisle} roughness={0.78} metalness={0} depthWrite />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -1.0]} receiveShadow>
        <planeGeometry args={[3.2, 16.5]} />
        <meshStandardMaterial color={RetailPalette.aisle} roughness={0.78} metalness={0} depthWrite />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[14.5, 0.012, 6.5]} receiveShadow>
        <planeGeometry args={[11, 3.2]} />
        <meshStandardMaterial color={RetailPalette.aisle} roughness={0.78} metalness={0} depthWrite />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 7.5]} receiveShadow>
        <planeGeometry args={[38, 2.6]} />
        <meshStandardMaterial color={RetailPalette.aisle} roughness={0.78} metalness={0} depthWrite />
      </mesh>

      {/* Cutaway perimeter walls — no receiveShadow (avoids self-shadow flicker on rotate) */}
      {/* North */}
      <group position={[0, 0, 15.5]}>
        <mesh position={[0, WALL_H / 2, 0]} castShadow>
          <boxGeometry args={[44, WALL_H, WALL_THICK]} />
          <meshStandardMaterial
            color={RetailPalette.wall}
            roughness={0.88}
            metalness={0.04}
            polygonOffset
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        </mesh>
        <mesh position={[0, 0.1, -WALL_THICK / 2 - 0.03]}>
          <boxGeometry args={[43.6, 0.2, 0.06]} />
          <meshStandardMaterial color={RetailPalette.baseboard} roughness={0.75} metalness={0.1} />
        </mesh>
        <mesh position={[0, WALL_H + 0.04, 0]}>
          <boxGeometry args={[44.1, 0.08, WALL_THICK + 0.04]} />
          <meshStandardMaterial color={RetailPalette.wallTrim} roughness={0.7} metalness={0.08} />
        </mesh>
      </group>

      {/* South west of entrance */}
      <group position={[-13.5, 0, -15.5]}>
        <mesh position={[0, WALL_H / 2, 0]} castShadow>
          <boxGeometry args={[17, WALL_H, WALL_THICK]} />
          <meshStandardMaterial
            color={RetailPalette.wall}
            roughness={0.88}
            metalness={0.04}
            polygonOffset
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        </mesh>
        <mesh position={[0, 0.1, WALL_THICK / 2 + 0.03]}>
          <boxGeometry args={[16.6, 0.2, 0.06]} />
          <meshStandardMaterial color={RetailPalette.baseboard} roughness={0.75} metalness={0.1} />
        </mesh>
        <mesh position={[0, WALL_H + 0.04, 0]}>
          <boxGeometry args={[17.1, 0.08, WALL_THICK + 0.04]} />
          <meshStandardMaterial color={RetailPalette.wallTrim} roughness={0.7} metalness={0.08} />
        </mesh>
      </group>

      {/* South east of exit */}
      <group position={[13.5, 0, -15.5]}>
        <mesh position={[0, WALL_H / 2, 0]} castShadow>
          <boxGeometry args={[17, WALL_H, WALL_THICK]} />
          <meshStandardMaterial
            color={RetailPalette.wall}
            roughness={0.88}
            metalness={0.04}
            polygonOffset
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        </mesh>
        <mesh position={[0, 0.1, WALL_THICK / 2 + 0.03]}>
          <boxGeometry args={[16.6, 0.2, 0.06]} />
          <meshStandardMaterial color={RetailPalette.baseboard} roughness={0.75} metalness={0.1} />
        </mesh>
        <mesh position={[0, WALL_H + 0.04, 0]}>
          <boxGeometry args={[17.1, 0.08, WALL_THICK + 0.04]} />
          <meshStandardMaterial color={RetailPalette.wallTrim} roughness={0.7} metalness={0.08} />
        </mesh>
      </group>

      {/* West */}
      <group position={[-21.5, 0, 0]}>
        <mesh position={[0, WALL_H / 2, 0]} castShadow>
          <boxGeometry args={[WALL_THICK, WALL_H, 31]} />
          <meshStandardMaterial
            color={RetailPalette.wall}
            roughness={0.88}
            metalness={0.04}
            polygonOffset
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        </mesh>
        <mesh position={[WALL_THICK / 2 + 0.03, 0.1, 0]}>
          <boxGeometry args={[0.06, 0.2, 30.6]} />
          <meshStandardMaterial color={RetailPalette.baseboard} roughness={0.75} metalness={0.1} />
        </mesh>
        <mesh position={[0, WALL_H + 0.04, 0]}>
          <boxGeometry args={[WALL_THICK + 0.04, 0.08, 31.1]} />
          <meshStandardMaterial color={RetailPalette.wallTrim} roughness={0.7} metalness={0.08} />
        </mesh>
      </group>

      {/* East */}
      <group position={[21.5, 0, 0]}>
        <mesh position={[0, WALL_H / 2, 0]} castShadow>
          <boxGeometry args={[WALL_THICK, WALL_H, 31]} />
          <meshStandardMaterial
            color={RetailPalette.wall}
            roughness={0.88}
            metalness={0.04}
            polygonOffset
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        </mesh>
        <mesh position={[-WALL_THICK / 2 - 0.03, 0.1, 0]}>
          <boxGeometry args={[0.06, 0.2, 30.6]} />
          <meshStandardMaterial color={RetailPalette.baseboard} roughness={0.75} metalness={0.1} />
        </mesh>
        <mesh position={[0, WALL_H + 0.04, 0]}>
          <boxGeometry args={[WALL_THICK + 0.04, 0.08, 31.1]} />
          <meshStandardMaterial color={RetailPalette.wallTrim} roughness={0.7} metalness={0.08} />
        </mesh>
      </group>

      {/* Stockroom partition — doors offset so they don't share the wall plane */}
      <group position={[0, 0, 9.5]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[43, 2.2, 0.28]} />
          <meshStandardMaterial
            color="#D1D5DB"
            roughness={0.82}
            metalness={0.1}
            polygonOffset
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        </mesh>
        <mesh position={[0, 2.24, 0]}>
          <boxGeometry args={[43.15, 0.08, 0.34]} />
          <meshStandardMaterial color={RetailPalette.wallTrim} roughness={0.7} metalness={0.12} />
        </mesh>
      </group>

      {/* Stockroom roll-up doors — amber accents only on frames */}
      {[-10, 10].map((doorX, idx) => (
        <group key={`door-${idx}`} position={[doorX, 1.0, 9.35]}>
          <mesh position={[-0.7, 0, 0]} castShadow>
            <boxGeometry args={[1.25, 2.0, 0.22]} />
            <meshStandardMaterial color={RetailPalette.stockroomSteel} metalness={0.55} roughness={0.45} />
          </mesh>
          <mesh position={[0.7, 0, 0]} castShadow>
            <boxGeometry args={[1.25, 2.0, 0.22]} />
            <meshStandardMaterial color={RetailPalette.stockroomSteel} metalness={0.55} roughness={0.45} />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[2.85, 0.1, 0.26]} />
            <meshStandardMaterial color="#D97706" roughness={0.55} metalness={0.2} />
          </mesh>
          <mesh position={[0, 1.14, 0.14]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color={RetailPalette.healthy} roughness={0.4} metalness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Loading bay floor markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, 0.003, 12.5]} receiveShadow>
        <planeGeometry args={[7, 3.5]} />
        <meshStandardMaterial map={hazardTexture} roughness={0.65} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0.003, 12.5]} receiveShadow>
        <planeGeometry args={[7, 3.5]} />
        <meshStandardMaterial map={hazardTexture} roughness={0.65} />
      </mesh>

      {/* Pallet stacks & cartons */}
      <group position={[0, 0, 12.8]}>
        {[-2.2, 0, 2.2].map((px, pIdx) => (
          <group key={`pallet-stack-${pIdx}`} position={[px, 0, 0]}>
            <mesh position={[0, 0.08, 0]} castShadow>
              <boxGeometry args={[1.3, 0.14, 1.1]} />
              <meshStandardMaterial color={RetailPalette.woodDark} roughness={0.88} />
            </mesh>
            <mesh position={[-0.28, 0.36, -0.24]} castShadow>
              <boxGeometry args={[0.55, 0.44, 0.48]} />
              <meshStandardMaterial color={RetailPalette.cardboard} roughness={0.82} />
            </mesh>
            <mesh position={[0.28, 0.36, -0.24]} castShadow>
              <boxGeometry args={[0.55, 0.44, 0.48]} />
              <meshStandardMaterial color="#B8956A" roughness={0.82} />
            </mesh>
            <mesh position={[0, 0.36, 0.26]} castShadow>
              <boxGeometry args={[1.1, 0.44, 0.48]} />
              <meshStandardMaterial color={RetailPalette.cardboard} roughness={0.82} />
            </mesh>
            <mesh position={[0, 0.78, 0]} castShadow>
              <boxGeometry args={[1.15, 0.4, 0.95]} />
              <meshStandardMaterial color="#C9A876" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.58, 0]}>
              <boxGeometry args={[1.22, 0.88, 1.02]} />
              <meshStandardMaterial
                color="#F1F5F9"
                transparent
                opacity={0.12}
                roughness={0.15}
                metalness={0.05}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Forklift — orange, matte (not glowing) */}
      <group position={[-16, 0, 12.8]} rotation={[0, 0.3, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[1.1, 0.7, 1.6]} />
          <meshStandardMaterial color={RetailPalette.stockroomOrange} roughness={0.55} metalness={0.25} />
        </mesh>
        <mesh position={[0, 1.25, -0.2]} castShadow>
          <boxGeometry args={[0.95, 0.9, 0.9]} />
          <meshStandardMaterial color="#475569" wireframe roughness={0.6} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.85, 0.9]} castShadow>
          <boxGeometry args={[0.6, 1.5, 0.1]} />
          <meshStandardMaterial color={RetailPalette.stockroomSteel} metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[-0.18, 0.08, 1.3]} castShadow>
          <boxGeometry args={[0.1, 0.06, 0.8]} />
          <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.18, 0.08, 1.3]} castShadow>
          <boxGeometry args={[0.1, 0.06, 0.8]} />
          <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.75, -0.2]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#D97706" roughness={0.45} metalness={0.2} />
        </mesh>
      </group>

      {/* Pallet jack */}
      <group position={[16, 0, 12.8]} rotation={[0, -0.4, 0]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.6]} />
          <meshStandardMaterial color="#CA8A04" metalness={0.45} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.65, -0.2]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.8, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[-0.14, 0.08, 0.6]} castShadow>
          <boxGeometry args={[0.12, 0.08, 1.1]} />
          <meshStandardMaterial color={RetailPalette.stockroomSteel} metalness={0.75} roughness={0.35} />
        </mesh>
        <mesh position={[0.14, 0.08, 0.6]} castShadow>
          <boxGeometry args={[0.12, 0.08, 1.1]} />
          <meshStandardMaterial color={RetailPalette.stockroomSteel} metalness={0.75} roughness={0.35} />
        </mesh>
      </group>

      {/* Entrance turnstiles — brushed metal + clear glass */}
      <group position={[-3, 0, -14.5]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
          <planeGeometry args={[4.5, 2.0]} />
          <meshStandardMaterial color="#E8E4DC" roughness={0.85} />
        </mesh>
        {[-1.8, 0, 1.8].map((xPos, idx) => (
          <group key={`turnstile-${idx}`} position={[xPos, 0.55, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.22, 1.1, 0.9]} />
              <meshStandardMaterial color={RetailPalette.stainless} metalness={0.75} roughness={0.28} />
            </mesh>
            <mesh position={[0, 0.1, 0.25]}>
              <boxGeometry args={[0.04, 0.6, 0.45]} />
              <meshStandardMaterial
                color="#C5D4E0"
                transparent
                opacity={0.35}
                roughness={0.08}
                metalness={0.1}
              />
            </mesh>
            <mesh position={[0, 0.56, -0.3]}>
              <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
              <meshStandardMaterial color={RetailPalette.healthy} roughness={0.4} metalness={0.25} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Exit security pedestals */}
      <group position={[3.5, 0, -14.5]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
          <planeGeometry args={[4.0, 2.0]} />
          <meshStandardMaterial color="#E8E4DC" roughness={0.85} />
        </mesh>
        {[-1.5, 1.5].map((xPos, idx) => (
          <group key={`exit-gate-${idx}`} position={[xPos, 0.7, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.15, 1.4, 0.15]} />
              <meshStandardMaterial color={RetailPalette.stainless} metalness={0.75} roughness={0.28} />
            </mesh>
            <mesh position={[-Math.sign(xPos) * 0.6, 0, 0]}>
              <boxGeometry args={[1.2, 1.0, 0.04]} />
              <meshStandardMaterial
                color="#B8C9D6"
                transparent
                opacity={0.28}
                roughness={0.1}
                metalness={0.05}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Customer service desk — neutral */}
      <group position={[8.5, 0, -13.2]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[2.8, 1.0, 1.1]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.65} metalness={0.08} />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <boxGeometry args={[2.86, 0.04, 1.16]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.45} metalness={0.1} />
        </mesh>
        <mesh position={[-0.4, 1.25, 0]} rotation={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.4, 0.28, 0.03]} />
          <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.5, 0.56]}>
          <boxGeometry args={[1.4, 0.25, 0.02]} />
          <meshStandardMaterial color={RetailPalette.brandTeal} roughness={0.55} metalness={0.1} />
        </mesh>
      </group>

      {/* Shopping cart bay */}
      <group position={[-10, 0, -13]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.06, 1.0, 3.5]} />
          <meshStandardMaterial color={RetailPalette.stainless} metalness={0.8} roughness={0.22} />
        </mesh>
        <mesh position={[2.2, 0.5, 0]} castShadow>
          <boxGeometry args={[0.06, 1.0, 3.5]} />
          <meshStandardMaterial color={RetailPalette.stainless} metalness={0.8} roughness={0.22} />
        </mesh>
        {[-1.2, -0.4, 0.4, 1.2].map((zOffset, idx) => (
          <group key={`cart-${idx}`} position={[1.1, 0.4, zOffset]}>
            <mesh castShadow>
              <boxGeometry args={[0.8, 0.65, 0.65]} />
              <meshStandardMaterial color="#A8B4C0" metalness={0.85} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.4, 0.35]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
              <meshStandardMaterial color="#DC2626" roughness={0.55} metalness={0.15} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Flower stand */}
      <group position={[-15.5, 0, -12.5]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[2.0, 0.6, 1.4]} />
          <meshStandardMaterial color={RetailPalette.woodDark} roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.7, -0.3]} castShadow>
          <boxGeometry args={[1.9, 0.4, 0.6]} />
          <meshStandardMaterial color={RetailPalette.woodProduce} roughness={0.85} />
        </mesh>
        {[-0.6, 0, 0.6].map((fx, idx) => (
          <group key={`flower-${idx}`} position={[fx, 0.65, 0.2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.15, 0.1, 0.22, 10]} />
              <meshStandardMaterial color="#B45309" roughness={0.75} />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <sphereGeometry args={[0.2, 10, 8]} />
              <meshStandardMaterial
                color={idx === 0 ? '#DB2777' : idx === 1 ? '#16A34A' : '#CA8A04'}
                roughness={0.7}
              />
            </mesh>
          </group>
        ))}
        {[-0.5, 0.5].map((fx, idx) => (
          <group key={`flower-top-${idx}`} position={[fx, 0.95, -0.3]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.14, 0.09, 0.2, 10]} />
              <meshStandardMaterial color="#9A3412" roughness={0.75} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <sphereGeometry args={[0.18, 10, 8]} />
              <meshStandardMaterial color={idx === 0 ? '#7C3AED' : '#BE123C'} roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Hand baskets */}
      <group position={[-6.2, 0, -13.5]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.25, 0.9, 8]} />
          <meshStandardMaterial color={RetailPalette.stainless} metalness={0.7} roughness={0.3} />
        </mesh>
        {[-0.1, 0.05, 0.2, 0.35].map((yOff, idx) => (
          <mesh key={idx} position={[0, 0.6 + yOff, 0]} castShadow>
            <boxGeometry args={[0.32, 0.12, 0.44]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? '#DC2626' : '#0D9488'}
              roughness={0.55}
              metalness={0.05}
            />
          </mesh>
        ))}
      </group>

      {/* Sanitizer station */}
      <group position={[-0.8, 0, -13.5]}>
        <mesh position={[0, 0.65, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.3, 12]} />
          <meshStandardMaterial color={RetailPalette.stainless} metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
          <meshStandardMaterial color="#64748B" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 1.15, 0]} castShadow>
          <boxGeometry args={[0.16, 0.26, 0.14]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.4} metalness={0.05} />
        </mesh>
        <mesh position={[0, 1.1, 0.075]}>
          <boxGeometry args={[0.06, 0.04, 0.02]} />
          <meshStandardMaterial color={RetailPalette.brandTeal} roughness={0.5} metalness={0.1} />
        </mesh>
      </group>
    </group>
  )
}
