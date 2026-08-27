import React, { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'
import { ZONE_ANCHORS } from '../layout/storeLayout'
import { RetailPalette } from '../theme/retailPalette'

interface HeatmapFloor3DProps {
  showHeatmap: boolean
}

/**
 * Floor heatmap from live zoneMetrics.
 * Texture identity is keyed by content hash — only recreates when density changes.
 */
export const HeatmapFloor3D: React.FC<HeatmapFloor3DProps> = ({ showHeatmap }) => {
  const zoneMetrics = useAppStore((s) => s.zoneMetrics)

  const metricsKey = useMemo(
    () =>
      (zoneMetrics ?? [])
        .map((z) => `${z.zoneId}:${z.visitorCount}:${z.trafficDensity}`)
        .join('|'),
    [zoneMetrics]
  )

  const heatmapTexture = useMemo(() => {
    if (!zoneMetrics || zoneMetrics.length === 0) return null

    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.clearRect(0, 0, 512, 512)

    const drawSpot = (worldX: number, worldZ: number, intensity: number) => {
      const cx = ((worldX + 22) / 44) * 512
      const cy = ((worldZ + 16) / 32) * 512
      const rad = 48 + intensity * 40
      const color =
        intensity > 0.7
          ? RetailPalette.heatHigh
          : intensity > 0.4
            ? RetailPalette.heatMed
            : RetailPalette.heatLow

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
      grad.addColorStop(0, color.replace('ALPHA', (intensity * 0.5).toFixed(2)))
      grad.addColorStop(0.55, color.replace('ALPHA', (intensity * 0.2).toFixed(2)))
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, rad, 0, Math.PI * 2)
      ctx.fill()
    }

    const densityWeight = (d: string) => {
      if (d === 'CONGESTED') return 1
      if (d === 'HIGH') return 0.75
      if (d === 'MODERATE') return 0.45
      return 0.2
    }

    const maxVisitors = Math.max(...zoneMetrics.map((z) => z.visitorCount || 0), 1)

    for (const metric of zoneMetrics) {
      const anchor = ZONE_ANCHORS[metric.zoneId]
      if (!anchor) continue
      const fromCount = (metric.visitorCount || 0) / maxVisitors
      const fromDensity = densityWeight(metric.trafficDensity)
      const intensity = Math.min(1, Math.max(fromCount, fromDensity * 0.85))
      if (intensity < 0.08) continue
      drawSpot(anchor.position[0], anchor.position[2], intensity)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    return tex
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by metricsKey
  }, [metricsKey])

  useEffect(() => {
    return () => {
      heatmapTexture?.dispose()
    }
  }, [heatmapTexture])

  if (!showHeatmap || !heatmapTexture) return null

  return (
    <group position={[0, 0.025, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[42, 30]} />
        <meshBasicMaterial map={heatmapTexture} transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  )
}
