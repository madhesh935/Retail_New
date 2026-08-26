import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { StoreFloor } from './scene/StoreFloor'
import { StoreShelves3D, Shelf3DData } from './scene/StoreShelves3D'
import { CheckoutLanes3D, Checkout3DData } from './scene/CheckoutLanes3D'
import { Shoppers3D } from './scene/Shoppers3D'
import { StaffMarkers3D, Staff3DData } from './scene/StaffMarkers3D'
import { HeatmapFloor3D } from './scene/HeatmapFloor3D'
import { CameraCoverage3D, Camera3DData } from './scene/CameraCoverage3D'
import { IncidentBeacons3D } from './scene/IncidentBeacons3D'
import { ZoneLabels3D, Zone3DData } from './scene/ZoneLabels3D'
import { TwinLayerState } from './controls/LayerControlPanel'
import { TwinViewMode } from './controls/TopViewportControls'
import { TwinTooltip, TooltipData } from './controls/TwinTooltip'

interface CameraControllerProps {
  viewMode: TwinViewMode
  resetTrigger: number
  fitTrigger: number
}

const CameraController: React.FC<CameraControllerProps> = ({
  viewMode,
  resetTrigger,
  fitTrigger,
}) => {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)

  // Handle 3D vs Top View camera position switches
  useEffect(() => {
    if (viewMode === 'TOP_VIEW') {
      camera.position.set(0, 32, 0.001)
      camera.lookAt(0, 0, 0)
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0)
        controlsRef.current.enableRotate = false
      }
    } else {
      camera.position.set(0, 20, 24)
      camera.lookAt(0, 0, 0)
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0)
        controlsRef.current.enableRotate = true
      }
    }
  }, [viewMode, camera])

  // Reset Trigger
  useEffect(() => {
    if (resetTrigger > 0) {
      if (viewMode === 'TOP_VIEW') {
        camera.position.set(0, 32, 0.001)
      } else {
        camera.position.set(0, 20, 24)
      }
      camera.lookAt(0, 0, 0)
      if (controlsRef.current) controlsRef.current.target.set(0, 0, 0)
    }
  }, [resetTrigger, viewMode, camera])

  // Fit Trigger
  useEffect(() => {
    if (fitTrigger > 0) {
      camera.position.set(0, 18, 22)
      camera.lookAt(0, 0, 0)
      if (controlsRef.current) controlsRef.current.target.set(0, 0, 0)
    }
  }, [fitTrigger, camera])

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      minDistance={8}
      maxDistance={50}
      maxPolarAngle={viewMode === 'TOP_VIEW' ? 0 : Math.PI / 2.15}
      dampingFactor={0.06}
    />
  )
}

// Overhead Linear Supermarket LED Lighting Fixtures
const SupermarketCeilingLights: React.FC = () => {
  const lightAisles = [
    { x: -8, z: -6, length: 16 },
    { x: 2, z: -6, length: 16 },
    { x: 14, z: -6, length: 16 },
    { x: 3, z: 4.5, length: 14 },
    { x: 14, z: 3.5, length: 14 },
    { x: 0, z: -10, length: 36, rotate: true },
  ]

  return (
    <group position={[0, 6.2, 0]}>
      {lightAisles.map((aisle, idx) => (
        <group
          key={idx}
          position={[aisle.x, 0, aisle.z]}
          rotation={aisle.rotate ? [0, Math.PI / 2, 0] : [0, 0, 0]}
        >
          {/* Aluminum Light Fixture Housing */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.3, 0.1, aisle.length]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Glowing LED Diffuser Bar */}
          <mesh position={[0, -0.01, 0]}>
            <boxGeometry args={[0.24, 0.04, aisle.length]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

interface DigitalTwinViewportProps {
  layers: TwinLayerState
  viewMode: TwinViewMode
  resetTrigger: number
  fitTrigger: number
  replaySpeed: number
  onSelectShelf: (shelf: Shelf3DData) => void
  onSelectCheckout: (checkout: Checkout3DData) => void
  onSelectZone: (zone: Zone3DData) => void
  onSelectCamera: (cam: Camera3DData) => void
  onSelectStaff?: (staff: Staff3DData) => void
  onSelectIncident?: (incident: any) => void
}

export const DigitalTwinViewport: React.FC<DigitalTwinViewportProps> = ({
  layers,
  viewMode,
  resetTrigger,
  fitTrigger,
  replaySpeed,
  onSelectShelf,
  onSelectCheckout,
  onSelectZone,
  onSelectCamera,
  onSelectStaff,
  onSelectIncident,
}) => {
  const [hoverData, setHoverData] = useState<TooltipData | null>(null)

  return (
    <div className="relative w-full h-full min-h-[580px] bg-[#0B0F17] rounded-lg border border-[#1E293B] overflow-hidden">
      {/* Unified Hover Tooltip Overlay */}
      <TwinTooltip data={hoverData} />

      <Canvas
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        className="w-full h-full"
      >
        <color attach="background" args={['#0B0F17']} />

        <PerspectiveCamera makeDefault position={[0, 20, 24]} fov={45} />
        <CameraController
          viewMode={viewMode}
          resetTrigger={resetTrigger}
          fitTrigger={fitTrigger}
        />

        {/* ======================================================= */}
        {/* BRIGHT, CRYSTAL CLEAR COMMERCIAL SUPERMARKET LIGHTING */}
        {/* ======================================================= */}
        {/* 1. Global Hemisphere Light (Soft Sky White + Warm Floor Bounce) */}
        <hemisphereLight
          args={['#FFFFFF', '#475569', 1.4]}
          position={[0, 30, 0]}
        />

        {/* 2. Main Key Commercial Ceiling Light */}
        <directionalLight
          position={[12, 30, 14]}
          intensity={1.8}
          color="#FFFFFF"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />

        {/* 3. Cool Secondary Fill Directional Light (Eliminates pitch black shadows) */}
        <directionalLight
          position={[-16, 25, -14]}
          intensity={1.1}
          color="#E2E8F0"
        />

        {/* 4. Front Fill Light for Clear Face & Shelf Visibility */}
        <directionalLight
          position={[0, 18, 26]}
          intensity={0.8}
          color="#F8FAFC"
        />

        {/* 5. Overhead Aisle Linear LED Fixtures */}
        <SupermarketCeilingLights />

        {/* 1. Base Store Floor & Architectural Shell */}
        <StoreFloor />

        {/* 2. Floor-Level Footfall Heatmap Plane */}
        <HeatmapFloor3D showHeatmap={layers.heatmap} />

        {/* 3. Interactive 3D Product Shelves & Gondolas */}
        <StoreShelves3D
          showShelfHealth={layers.shelfHealth}
          onSelectShelf={onSelectShelf}
          onHoverShelf={setHoverData}
        />

        {/* 4. Interactive 3D Checkout Counters C1-C4 */}
        <CheckoutLanes3D
          showQueueStatus={layers.queueStatus}
          onSelectCheckout={onSelectCheckout}
          onHoverCheckout={setHoverData}
        />

        {/* 5. Live Anonymous Shopper Human Avatars */}
        <Shoppers3D
          showPositions={layers.shopperPositions}
          showTrails={layers.shopperTrails}
          replaySpeedMultiplier={replaySpeed}
        />

        {/* 6. 3D Staff Avatars with Uniform Vests */}
        <StaffMarkers3D
          showStaff={layers.staff}
          onSelectStaff={onSelectStaff}
          onHoverStaff={setHoverData}
        />

        {/* 7. 3D Camera Frustums & Cones */}
        <CameraCoverage3D
          showCoverage={layers.cameraCoverage}
          onSelectCamera={onSelectCamera}
          onHoverCamera={setHoverData}
        />

        {/* 8. Floor Incidents & Caution Cones */}
        <IncidentBeacons3D
          showIncidents={layers.incidents}
          onSelectIncident={onSelectIncident}
          onHoverIncident={setHoverData}
        />

        {/* 9. Suspended Departmental Signage Boards */}
        <ZoneLabels3D
          showZones={layers.productZones}
          onSelectZone={onSelectZone}
          onHoverZone={setHoverData}
        />
      </Canvas>
    </div>
  )
}
