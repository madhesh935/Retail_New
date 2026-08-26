import React, { useMemo } from 'react'
import * as THREE from 'three'

interface HeatmapFloor3DProps {
  showHeatmap: boolean
}

export const HeatmapFloor3D: React.FC<HeatmapFloor3DProps> = ({ showHeatmap }) => {
  // Create multi-hotspot texture on canvas for high performance Three.js floor blending
  const heatmapTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background transparent
    ctx.clearRect(0, 0, 512, 512)

    // Helper to draw smooth radial heat spot
    const drawSpot = (normX: number, normY: number, radius: number, intensity: number, color: string) => {
      const cx = normX * 512
      const cy = normY * 512
      const rad = radius * 512

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
      grad.addColorStop(0, color.replace('ALPHA', (intensity * 0.85).toFixed(2)))
      grad.addColorStop(0.5, color.replace('ALPHA', (intensity * 0.4).toFixed(2)))
      grad.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, rad, 0, Math.PI * 2)
      ctx.fill()
    }

    // 1. Entrance corridor hotspot (High/Moderate - Cyan/Amber)
    drawSpot(0.5, 0.15, 0.18, 0.7, 'rgba(6,182,212,ALPHA)')
    // 2. Fresh Produce A1/A2 hotspot (Moderate - Emerald/Amber)
    drawSpot(0.3, 0.35, 0.16, 0.8, 'rgba(245,158,11,ALPHA)')
    // 3. Dairy Cooler C2 hotspot (Moderate - Cyan)
    drawSpot(0.58, 0.35, 0.15, 0.65, 'rgba(6,182,212,ALPHA)')
    // 4. Beverage B4 hotspot (HIGH TRAFFIC - Red/Rose)
    drawSpot(0.82, 0.35, 0.2, 0.95, 'rgba(239,68,68,ALPHA)')
    // 5. Checkout Counters C1-C4 hotspot (CRITICAL CONGESTION - Red/Rose)
    drawSpot(0.82, 0.68, 0.22, 1.0, 'rgba(225,29,72,ALPHA)')
    // 6. Electronics High-Dwell hotspot (Moderate - Amber)
    drawSpot(0.58, 0.65, 0.14, 0.6, 'rgba(245,158,11,ALPHA)')

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    return tex
  }, [])

  if (!showHeatmap || !heatmapTexture) return null

  return (
    <group position={[0, 0.02, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[42, 30]} />
        <meshBasicMaterial
          map={heatmapTexture}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
