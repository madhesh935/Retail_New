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

  useEffect(() => {
    if (viewMode === 'TOP_VIEW') {
      camera.position.set(0, 36, 0.001)
      camera.lookAt(0, 0, 0)
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0)
        controlsRef.current.enableRotate = false
      }
    } else {
      // Cinematic 3D isometric command center view
      camera.position.set(-6, 22, 27)
      camera.lookAt(0, 0, -2)
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, -2)
        controlsRef.current.enableRotate = true
      }
    }
  }, [viewMode, camera])

  useEffect(() => {
    if (resetTrigger > 0) {
      if (viewMode === 'TOP_VIEW') {
        camera.position.set(0, 36, 0.001)
        camera.lookAt(0, 0, 0)
        if (controlsRef.current) controlsRef.current.target.set(0, 0, 0)
      } else {
        camera.position.set(-6, 22, 27)
        camera.lookAt(0, 0, -2)
        if (controlsRef.current) controlsRef.current.target.set(0, 0, -2)
      }
    }
  }, [resetTrigger, viewMode, camera])

  useEffect(() => {
    if (fitTrigger > 0) {
      camera.position.set(-6, 22, 27)
      camera.lookAt(0, 0, -2)
      if (controlsRef.current) controlsRef.current.target.set(0, 0, -2)
    }
  }, [fitTrigger, camera])

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      minDistance={8}
      maxDistance={60}
      maxPolarAngle={viewMode === 'TOP_VIEW' ? 0 : Math.PI / 2.1}
      dampingFactor={0.07}
      enableDamping
    />
  )
}

// ============================================================
// ARCHITECTURAL CEILING TRUSSES, HVAC DUCTS & LED FIXTURES
// ============================================================
const SupermarketCeilingRig: React.FC = () => {
  const lightStrips = [
    { x: -14, z: -6, length: 16, rotate: false },
    { x: -8,  z: -6, length: 16, rotate: false },
    { x: -2,  z: -6, length: 16, rotate: false },
    { x: 4,   z: -6, length: 16, rotate: false },
    { x: 10,  z: -6, length: 16, rotate: false },
    { x: 16,  z: -6, length: 16, rotate: false },
    { x: 14,  z: 4.5, length: 12, rotate: false },
    { x: 0,   z: -11, length: 42, rotate: true },
    { x: 0,   z: 2.5, length: 42, rotate: true },
    { x: 0,   z: 11.5, length: 42, rotate: true },
  ]

  return (
    <group position={[0, 6.2, 0]}>
      {/* 1. Industrial Dark Steel Ceiling Trusses */}
      {[-12, -4, 4, 12].map((zPos, idx) => (
        <group key={`truss-${idx}`} position={[0, 0.4, zPos]}>
          {/* Main horizontal beam */}
          <mesh>
            <boxGeometry args={[44, 0.2, 0.2]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Diagonal braces */}
          {[-16, -8, 0, 8, 16].map((bx, bIdx) => (
            <mesh key={bIdx} position={[bx, -0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.08, 0.6, 0.08]} />
              <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 2. HVAC Spiral Metal Air Ventilation Ducts */}
      <group position={[0, 0.8, -3]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.38, 0.38, 43, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Duct hanging brackets */}
        {[-15, -7.5, 0, 7.5, 15].map((hx, hIdx) => (
          <mesh key={hIdx} position={[hx, 0.35, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
            <meshStandardMaterial color="#64748B" metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* 3. Linear Suspended LED Luminaire Strips */}
      {lightStrips.map((s, i) => (
        <group
          key={i}
          position={[s.x, 0, s.z]}
          rotation={s.rotate ? [0, Math.PI / 2, 0] : [0, 0, 0]}
        >
          {/* Dark aluminium fixture housing */}
          <mesh>
            <boxGeometry args={[0.26, 0.08, s.length]} />
            <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Cool White Glowing LED Diffuser Bar */}
          <mesh position={[0, -0.015, 0]}>
            <boxGeometry args={[0.2, 0.025, s.length - 0.1]} />
            <meshBasicMaterial color="#E0F2FE" />
          </mesh>
          {/* Suspension wire cords */}
          <mesh position={[0, 0.25, -s.length * 0.4]}>
            <cylinderGeometry args={[0.01, 0.01, 0.5, 6]} />
            <meshBasicMaterial color="#64748B" />
          </mesh>
          <mesh position={[0, 0.25, s.length * 0.4]}>
            <cylinderGeometry args={[0.01, 0.01, 0.5, 6]} />
            <meshBasicMaterial color="#64748B" />
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
  const containerRef = useRef<HTMLDivElement>(null)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null)

  // Listen to window-level mousemove so R3F canvas event interception doesn't block cursor updates
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      // If cursor is within viewport bounds
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        setCursorPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
    }

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[580px] bg-slate-950 rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
    >
      {/* Unified Hover Tooltip Overlay with Continuous Floating Tracking */}
      <TwinTooltip
        data={hoverData}
        cursorPos={cursorPos}
        containerRef={containerRef}
      />

      <Canvas
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        className="w-full h-full"
      >
        {/* Deep sleek command center background */}
        <color attach="background" args={['#070B14']} />

        <PerspectiveCamera makeDefault position={[-6, 22, 27]} fov={45} />
        <CameraController
          viewMode={viewMode}
          resetTrigger={resetTrigger}
          fitTrigger={fitTrigger}
        />

        {/* ======================================================= */}
        {/* CINEMATIC DIGITAL TWIN LIGHTING RIG                      */}
        {/* ======================================================= */}

        {/* 1. Hemisphere: Deep Cyan Sky + Dark Slate Floor Bounce */}
        <hemisphereLight
          args={['#38BDF8', '#0F172A', 1.05]}
          position={[0, 30, 0]}
        />

        {/* 2. Main Key Directional Light (Casts crisp geometric shadows) */}
        <directionalLight
          position={[12, 28, 16]}
          intensity={2.1}
          color="#FFFFFF"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0002}
          shadow-camera-near={0.5}
          shadow-camera-far={80}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={24}
          shadow-camera-bottom={-24}
        />

        {/* 3. Cool Cyan Fill Directional Light (Gives high-tech edge definition) */}
        <directionalLight
          position={[-18, 22, -14]}
          intensity={1.2}
          color="#0EA5E9"
        />

        {/* 4. Warm Shelf/Counter Rim Highlight */}
        <directionalLight
          position={[0, 16, 28]}
          intensity={0.9}
          color="#F1F5F9"
        />

        {/* 5. Overhead Trusses & Linear LED Light Fixtures */}
        <SupermarketCeilingRig />

        {/* ======================================================= */}
        {/* SCENE LAYERS                                             */}
        {/* ======================================================= */}

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

        {/* 7. 3D Camera Frustums & Coverage Cones */}
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
