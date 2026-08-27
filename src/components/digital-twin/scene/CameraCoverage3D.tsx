import React, { useState } from 'react'
import * as THREE from 'three'
import { TooltipData } from '../controls/TwinTooltip'

export interface Camera3DData {
  id: string
  code: string
  name: string
  zone: string
  status: 'ONLINE' | 'WARNING' | 'OFFLINE'
  fps: number
  latencyMs: number
  resolution: string
  aiModel: string
  position: [number, number, number]
  targetPosition: [number, number, number]
  fovConeRadius: number
  fovConeLength: number
}

interface CameraCoverage3DProps {
  showCoverage: boolean
  onSelectCamera: (cam: Camera3DData) => void
  onHoverCamera?: (data: TooltipData | null) => void
}

export const CameraCoverage3D: React.FC<CameraCoverage3DProps> = ({
  showCoverage,
  onSelectCamera,
  onHoverCamera,
}) => {
  const [hoveredCamId, setHoveredCamId] = useState<string | null>(null)

  const cameras: Camera3DData[] = [
    {
      id: 'cam-01',
      code: 'CAM-01',
      name: 'Entrance & Turnstiles',
      zone: 'Entrance',
      status: 'ONLINE',
      fps: 30.0,
      latencyMs: 14.2,
      resolution: '1920x1080 @ 30fps',
      aiModel: 'YOLOv8x PersonCounter',
      position: [0, 5.0, -12.5],
      targetPosition: [0, 0, -10],
      fovConeRadius: 4.5,
      fovConeLength: 5.2,
    },
    {
      id: 'cam-02',
      code: 'CAM-02',
      name: 'Fresh Produce',
      zone: 'Fresh Produce',
      status: 'ONLINE',
      fps: 29.8,
      latencyMs: 16.8,
      resolution: '1920x1080 @ 30fps',
      aiModel: 'PlanogramNet ResNet50',
      position: [-8, 5.0, -5.5],
      targetPosition: [-8, 0, -5.5],
      fovConeRadius: 5.2,
      fovConeLength: 5.0,
    },
    {
      id: 'cam-03',
      code: 'CAM-03',
      name: 'Cold Beverages & Dairy',
      zone: 'Beverages',
      status: 'ONLINE',
      fps: 30.0,
      latencyMs: 15.2,
      resolution: '1920x1080 @ 30fps',
      aiModel: 'ShelfEye SKU-Det v3',
      position: [14, 5.0, -5.5],
      targetPosition: [14, 0, -5.5],
      fovConeRadius: 5.0,
      fovConeLength: 5.0,
    },
    {
      id: 'cam-05',
      code: 'CAM-05',
      name: 'Checkout Plaza',
      zone: 'Checkout Plaza',
      status: 'ONLINE',
      fps: 30.0,
      latencyMs: 13.8,
      resolution: '1920x1080 @ 30fps',
      aiModel: 'QueueSense Temporal v2.4',
      position: [14, 5.0, 3.5],
      targetPosition: [14, 0, 3.5],
      fovConeRadius: 5.5,
      fovConeLength: 5.0,
    },
  ]

  const handlePointerOver = (cam: Camera3DData, e: any) => {
    e.stopPropagation()
    setHoveredCamId(cam.id)
    if (onHoverCamera) {
      onHoverCamera({
        type: 'camera',
        title: `${cam.code} • ${cam.name}`,
        subtitle: `${cam.zone} • ${cam.aiModel}`,
        status: cam.status,
        statusColor: 'cyan',
        metrics: [
          { label: 'Stream FPS', value: `${cam.fps} FPS` },
          { label: 'Edge Latency', value: `${cam.latencyMs} ms` },
          { label: 'Resolution', value: cam.resolution.split(' ')[0] },
          { label: 'Active Pipeline', value: cam.aiModel.split(' ')[0] },
        ],
        actionHint: 'Click to open live camera feed',
        screenX: e.clientX,
        screenY: e.clientY,
      })
    }
  }

  const handlePointerOut = () => {
    setHoveredCamId(null)
    if (onHoverCamera) onHoverCamera(null)
  }

  if (!showCoverage) return null

  return (
    <group>
      {cameras.map((cam) => {
        const isHovered = hoveredCamId === cam.id

        return (
          <group
            key={cam.id}
            position={cam.position}
            onClick={(e) => {
              e.stopPropagation()
              onSelectCamera(cam)
            }}
            onPointerOver={(e) => handlePointerOver(cam, e)}
            onPointerOut={handlePointerOut}
          >
            {/* Camera Ceiling Mount Pole */}
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>

            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.28, 0.18, 0.32]} />
              <meshStandardMaterial
                color={isHovered ? '#64748B' : '#475569'}
                metalness={0.65}
                roughness={0.35}
              />
            </mesh>

            <mesh position={[0, -0.06, 0.16]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color="#22C55E" />
            </mesh>

            {/* FOV cone only while hovered — not permanently shown */}
            {isHovered && (
              <group position={[0, -cam.fovConeLength / 2, 0]}>
                <mesh>
                  <coneGeometry args={[cam.fovConeRadius, cam.fovConeLength, 16, 1, true]} />
                  <meshBasicMaterial
                    color="#64748B"
                    transparent
                    opacity={0.12}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                  />
                </mesh>
              </group>
            )}
          </group>
        )
      })}
    </group>
  )
}
