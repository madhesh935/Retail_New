import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
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
import { TaskMarkers3D } from './scene/TaskMarkers3D'
import { CustomerRequestMarkers3D } from './scene/CustomerRequestMarkers3D'
import { TwinLayerState } from './controls/LayerControlPanel'
import { TwinViewMode } from './controls/TopViewportControls'
import { TwinTooltip, TooltipData } from './controls/TwinTooltip'
import {
  RetailPalette,
  ISOMETRIC_CAMERA,
  TOP_CAMERA,
  CAMERA_TRANSITION_MS,
} from './theme/retailPalette'

interface CameraControllerProps {
  viewMode: TwinViewMode
  resetTrigger: number
  fitTrigger: number
  focusTarget?: { position: [number, number, number]; distance?: number } | null
}

function resolveDefaultPose(viewMode: TwinViewMode) {
  if (viewMode === 'TOP_VIEW') {
    return {
      position: new THREE.Vector3(...TOP_CAMERA.position),
      target: new THREE.Vector3(...TOP_CAMERA.target),
      enableRotate: false,
    }
  }
  return {
    position: new THREE.Vector3(...ISOMETRIC_CAMERA.position),
    target: new THREE.Vector3(...ISOMETRIC_CAMERA.target),
    enableRotate: true,
  }
}

function resolveFocusPose(
  focus: { position: [number, number, number]; distance?: number },
  viewMode: TwinViewMode
) {
  const [fx, fy, fz] = focus.position
  const distance = focus.distance ?? 12
  const target = new THREE.Vector3(fx, Math.max(fy, 0.6), fz)

  if (viewMode === 'TOP_VIEW') {
    return {
      position: new THREE.Vector3(fx, Math.max(distance * 2.2, 18), fz + 0.001),
      target,
      enableRotate: false,
    }
  }

  // Elevated isometric offset — keep current orbit azimuth feel
  const offset = new THREE.Vector3(-1.05, 1.25, 1.05).normalize().multiplyScalar(distance)
  return {
    position: new THREE.Vector3(fx, fy, fz).add(offset),
    target,
    enableRotate: true,
  }
}

const ORBIT_MOUSE_BUTTONS = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.PAN,
} as const

const ORBIT_TOUCHES = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN,
} as const

const HEMI_ARGS: [string, string, number] = [
  RetailPalette.ambientSky,
  RetailPalette.ambientGround,
  0.85,
]
const BG_ARGS: [string] = [RetailPalette.sky]
const KEY_LIGHT_POS: [number, number, number] = [14, 28, 12]
const FILL_LIGHT_POS: [number, number, number] = [-16, 18, -12]

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * OrbitControls owns interaction. Programmatic fly-to only runs while `animating`
 * is true, and is cancelled immediately when the user starts dragging.
 */
const CameraController: React.FC<CameraControllerProps> = ({
  viewMode,
  resetTrigger,
  fitTrigger,
  focusTarget = null,
}) => {
  const { camera, gl } = useThree()
  const controlsRef = useRef<any>(null)

  const animating = useRef(false)
  const animElapsed = useRef(0)
  const animDuration = useRef(CAMERA_TRANSITION_MS / 1000)
  const startPos = useRef(new THREE.Vector3())
  const startTarget = useRef(new THREE.Vector3())
  const goalPos = useRef(new THREE.Vector3(...ISOMETRIC_CAMERA.position))
  const goalTarget = useRef(new THREE.Vector3(...ISOMETRIC_CAMERA.target))
  const lastFocusKey = useRef<string | null>(null)
  const lastHomeKey = useRef('')

  const stopAnimation = useCallback(() => {
    animating.current = false
    animElapsed.current = 0
  }, [])

  const beginTransition = useCallback(
    (position: THREE.Vector3, target: THREE.Vector3, enableRotate: boolean, durationSec?: number) => {
      const controls = controlsRef.current
      startPos.current.copy(camera.position)
      startTarget.current.copy(controls?.target ?? new THREE.Vector3())
      goalPos.current.copy(position)
      goalTarget.current.copy(target)
      animElapsed.current = 0
      animDuration.current = durationSec ?? CAMERA_TRANSITION_MS / 1000
      animating.current = true
      if (controls) {
        controls.enableRotate = enableRotate
        controls.enablePan = true
        controls.enableZoom = true
      }
    },
    [camera]
  )

  // Home pose: view mode / reset / fit only
  useEffect(() => {
    const key = `${viewMode}|${resetTrigger}|${fitTrigger}`
    if (key === lastHomeKey.current) return
    lastHomeKey.current = key
    lastFocusKey.current = null
    const pose = resolveDefaultPose(viewMode)
    beginTransition(pose.position, pose.target, pose.enableRotate, 0.75)
  }, [viewMode, resetTrigger, fitTrigger, beginTransition])

  // Focus fly-to when selection changes
  useEffect(() => {
    if (!focusTarget) {
      lastFocusKey.current = null
      return
    }
    const key = `${focusTarget.position.join(',')}|${focusTarget.distance ?? 12}|${viewMode}`
    if (key === lastFocusKey.current) return
    lastFocusKey.current = key
    const pose = resolveFocusPose(focusTarget, viewMode)
    beginTransition(pose.position, pose.target, pose.enableRotate, 0.85)
  }, [focusTarget, viewMode, beginTransition])

  // Cancel scripted animation as soon as the user grabs the view
  useEffect(() => {
    const el = gl.domElement
    const onUserStart = () => stopAnimation()
    const onContextMenu = (e: Event) => e.preventDefault()
    el.addEventListener('pointerdown', onUserStart)
    el.addEventListener('wheel', onUserStart, { passive: true })
    el.addEventListener('contextmenu', onContextMenu)
    return () => {
      el.removeEventListener('pointerdown', onUserStart)
      el.removeEventListener('wheel', onUserStart)
      el.removeEventListener('contextmenu', onContextMenu)
    }
  }, [gl, stopAnimation])

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (!controls || !animating.current) return

    animElapsed.current += delta
    const raw = Math.min(1, animElapsed.current / Math.max(animDuration.current, 0.05))
    const t = easeInOutCubic(raw)

    camera.position.lerpVectors(startPos.current, goalPos.current, t)
    controls.target.lerpVectors(startTarget.current, goalTarget.current, t)
    controls.update()

    if (raw >= 1) {
      camera.position.copy(goalPos.current)
      controls.target.copy(goalTarget.current)
      controls.update()
      animating.current = false
    }
  })

  const isTop = viewMode === 'TOP_VIEW'

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.72}
      panSpeed={0.9}
      zoomSpeed={1.05}
      minDistance={5}
      maxDistance={65}
      minPolarAngle={isTop ? 0 : 0.25}
      maxPolarAngle={isTop ? 0.02 : Math.PI / 2.08}
      enableRotate={!isTop}
      screenSpacePanning
      // Left = orbit, right/middle = pan — standard 3D viewport feel
      mouseButtons={ORBIT_MOUSE_BUTTONS}
      touches={ORBIT_TOUCHES}
      onStart={stopAnimation}
    />
  )
}

/** Optional subtle white light strips — cutaway isometric (no dark industrial ceiling). */
const SubtleOverheadStrips: React.FC = () => {
  const strips = [
    { x: -10, z: -4, length: 14 },
    { x: 0, z: -4, length: 14 },
    { x: 10, z: -4, length: 14 },
    { x: -10, z: 6, length: 10 },
    { x: 6, z: 6, length: 10 },
  ]

  return (
    <group position={[0, 5.8, 0]}>
      {strips.map((s, i) => (
        <mesh key={i} position={[s.x, 0, s.z]}>
          <boxGeometry args={[0.12, 0.02, s.length]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={0.15}
            roughness={0.9}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  )
}

export interface DigitalTwinViewportProps {
  layers: TwinLayerState
  viewMode: TwinViewMode
  resetTrigger: number
  fitTrigger: number
  replaySpeed: number
  focusTarget?: { position: [number, number, number]; distance?: number } | null
  selectedEntityId?: string | null
  onSelectShelf: (shelf: Shelf3DData) => void
  onSelectCheckout: (checkout: Checkout3DData) => void
  onSelectZone: (zone: Zone3DData) => void
  onSelectCamera: (cam: Camera3DData) => void
  onSelectStaff?: (staff: Staff3DData) => void
  onSelectIncident?: (incident: any) => void
  onSelectTask?: (task: any) => void
  onSelectCustomerRequest?: (req: any) => void
  onClearHover?: () => void
}

export const DigitalTwinViewport: React.FC<DigitalTwinViewportProps> = ({
  layers,
  viewMode,
  resetTrigger,
  fitTrigger,
  replaySpeed,
  focusTarget = null,
  selectedEntityId = null,
  onSelectShelf,
  onSelectCheckout,
  onSelectZone,
  onSelectCamera,
  onSelectStaff,
  onSelectIncident,
  onSelectTask,
  onSelectCustomerRequest,
  onClearHover,
}) => {
  const [hoverData, setHoverData] = useState<TooltipData | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hoverRef = useRef<(data: TooltipData | null) => void>(() => {})

  void selectedEntityId
  void replaySpeed

  // Stable hover callback so child meshes don't see a new function every move
  hoverRef.current = (data: TooltipData | null) => {
    setHoverData(data)
    if (!data) onClearHover?.()
  }
  const handleHover = useCallback((data: TooltipData | null) => {
    hoverRef.current(data)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[580px] bg-slate-100 rounded-xl border border-slate-200 shadow-2xs overflow-hidden cursor-grab active:cursor-grabbing touch-none"
    >
      <TwinTooltip data={hoverData} containerRef={containerRef} />

      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        className="w-full h-full"
        frameloop="always"
      >
        <color attach="background" args={BG_ARGS} />

        <PerspectiveCamera
          makeDefault
          position={ISOMETRIC_CAMERA.position}
          fov={ISOMETRIC_CAMERA.fov}
          near={0.5}
          far={140}
        />
        <CameraController
          viewMode={viewMode}
          resetTrigger={resetTrigger}
          fitTrigger={fitTrigger}
          focusTarget={focusTarget}
        />

        <hemisphereLight args={HEMI_ARGS} position={[0, 30, 0]} />

        <directionalLight
          position={KEY_LIGHT_POS}
          intensity={1.25}
          color="#FFFFFF"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.00015}
          shadow-normalBias={0.035}
          shadow-camera-near={1}
          shadow-camera-far={70}
          shadow-camera-left={-28}
          shadow-camera-right={28}
          shadow-camera-top={22}
          shadow-camera-bottom={-22}
        />

        <directionalLight position={FILL_LIGHT_POS} intensity={0.4} color="#FFF8F0" />

        <SubtleOverheadStrips />

        <StoreFloor />

        <HeatmapFloor3D showHeatmap={layers.heatmap} />

        <StoreShelves3D
          showShelfHealth={layers.shelfHealth}
          onSelectShelf={onSelectShelf}
          onHoverShelf={handleHover}
        />

        <CheckoutLanes3D
          showQueueStatus={layers.queueStatus}
          onSelectCheckout={onSelectCheckout}
          onHoverCheckout={handleHover}
        />

        <Shoppers3D
          showPositions={layers.shopperPositions}
          showTrails={false}
        />

        <StaffMarkers3D
          showStaff={layers.staff}
          onSelectStaff={onSelectStaff}
          onHoverStaff={handleHover}
        />

        <CameraCoverage3D
          showCoverage={layers.cameraCoverage}
          onSelectCamera={onSelectCamera}
          onHoverCamera={handleHover}
        />

        <IncidentBeacons3D
          showIncidents={layers.incidents}
          onSelectIncident={onSelectIncident}
          onHoverIncident={handleHover}
        />

        <ZoneLabels3D
          showZones={layers.productZones}
          onSelectZone={onSelectZone}
          onHoverZone={handleHover}
        />

        <TaskMarkers3D
          showTasks={layers.tasks}
          onSelectTask={onSelectTask}
          onHoverTask={handleHover}
        />

        <CustomerRequestMarkers3D
          showRequests={layers.customerRequests}
          onSelectRequest={onSelectCustomerRequest}
          onHoverRequest={handleHover}
        />
      </Canvas>
    </div>
  )
}
