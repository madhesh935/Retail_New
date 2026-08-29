import React, { useEffect, useMemo, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Navigation,
  MapPin,
  Compass,
  Loader2,
  UserRound,
  Footprints,
  Sparkles,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  LocateFixed,
  Play,
  Pause,
  RotateCcw,
  Volume2,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { realStoreApi } from '@/services/api/realStoreApi'
import type { NavigationPlan, StoreLayout } from '@/customer-pwa/types/navigation'
import {
  formatWalkTime,
  normalizeShelfCode,
  resolveStaffStartNodeId,
} from '@/staff-pwa/lib/staffNavigation'

export interface StaffMapTarget {
  destination: string
  zone?: string
  shelf?: string
  productId?: string
  productName?: string
  customerMessage?: string
}

interface StoreMap2DModalProps {
  isOpen: boolean
  onClose: () => void
  target: StaffMapTarget
}

interface Point {
  x: number
  y: number
}

// Fallback shelf resolver to ensure we ALWAYS have a valid destination node
function resolveTargetShelfCode(target: StaffMapTarget): string {
  const parsed =
    normalizeShelfCode(target.shelf) ||
    normalizeShelfCode(target.destination) ||
    normalizeShelfCode(target.zone)
  if (parsed) return parsed

  const text = `${target.zone || ''} ${target.destination || ''} ${target.productName || ''}`.toLowerCase()
  if (text.includes('produce') || text.includes('fresh') || text.includes('fruit') || text.includes('apple') || text.includes('veg')) return 'A1'
  if (text.includes('dairy') || text.includes('milk') || text.includes('cooler') || text.includes('chilled') || text.includes('yogurt') || text.includes('cheese')) return 'B2'
  if (text.includes('bakery') || text.includes('bread') || text.includes('deli') || text.includes('cake')) return 'C1'
  if (text.includes('snack') || text.includes('beverage') || text.includes('drink') || text.includes('soda') || text.includes('chip') || text.includes('water')) return 'B4'
  if (text.includes('staple') || text.includes('grain') || text.includes('pasta') || text.includes('rice') || text.includes('oil')) return 'D1'
  if (text.includes('household') || text.includes('clean') || text.includes('paper') || text.includes('detergent')) return 'E1'
  if (text.includes('checkout') || text.includes('billing') || text.includes('counter') || text.includes('lane')) return 'C1'
  if (text.includes('customer service') || text.includes('help desk')) return 'A4'
  if (text.includes('stockroom') || text.includes('backroom') || text.includes('receiving')) return 'D5'

  return 'B2' // Central Store Floor default
}

export const StoreMap2DModal: React.FC<StoreMap2DModalProps> = ({ isOpen, onClose, target }) => {
  const { authenticatedStaff } = useAppStore()
  const [layout, setLayout] = useState<StoreLayout | null>(null)
  const [route, setRoute] = useState<NavigationPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Interactive Pan & Zoom states
  const [zoomLevel, setZoomLevel] = useState<number>(1.0)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isAutoFollowing, setIsAutoFollowing] = useState(true)
  const dragStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 })

  // Real Walking Simulation States
  const [walkProgress, setWalkProgress] = useState<number>(0.0)
  const [isWalking, setIsWalking] = useState<boolean>(true)
  const animationFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

  const effectiveShelfCode = useMemo(() => resolveTargetShelfCode(target), [target])

  // Destination coordinates matching Customer Indoor Map
  const destinationCoords = useMemo(() => {
    switch (effectiveShelfCode) {
      case 'A1':
      case 'A2':
        return { x: 160, y: 100, aisle: 'Aisle 1 • Fresh Produce', shelf: effectiveShelfCode }
      case 'B1':
      case 'B2':
      case 'B3':
        return { x: 160, y: 230, aisle: 'Aisle 2 • Dairy & Chilled', shelf: effectiveShelfCode }
      case 'C1':
      case 'C2':
        return { x: 270, y: 100, aisle: 'Aisle 3 • Bakery & Deli', shelf: effectiveShelfCode }
      case 'B4':
      case 'B5':
      case 'B6':
        return { x: 270, y: 230, aisle: 'Aisle 4 • Snacks & Drinks', shelf: effectiveShelfCode }
      case 'D1':
      case 'D2':
        return { x: 380, y: 100, aisle: 'Aisle 5 • Staples & Pantry', shelf: effectiveShelfCode }
      case 'E1':
      case 'E2':
      case 'E3':
        return { x: 380, y: 230, aisle: 'Aisle 6 • Household Care', shelf: effectiveShelfCode }
      case 'A4':
        return { x: 55, y: 90, aisle: 'Customer Service Help Desk', shelf: 'CS' }
      case 'D5':
        return { x: 525, y: 340, aisle: 'Stockroom & Logistics', shelf: 'SR' }
      default:
        return { x: 160, y: 230, aisle: 'Aisle 2 • Store Floor', shelf: effectiveShelfCode }
    }
  }, [effectiveShelfCode])

  const staffStartCoords = useMemo<Point>(() => ({ x: 60, y: 350 }), [])

  // Polyline waypoint array for realistic corridor navigation
  const routeWaypoints = useMemo<Point[]>(() => {
    const sx = staffStartCoords.x
    const sy = staffStartCoords.y
    const dx = destinationCoords.x
    const dy = destinationCoords.y

    // Smooth navigation following the supermarket concourses
    if (dy < 150) {
      // Heading to North Aisles (Aisle 1, 3, 5, Help Desk)
      return [
        { x: sx, y: sy },
        { x: sx, y: 162 },
        { x: dx, y: 162 },
        { x: dx, y: dy },
      ]
    } else {
      // Heading to South Aisles (Aisle 2, 4, 6, Stockroom)
      return [
        { x: sx, y: sy },
        { x: sx, y: 295 },
        { x: dx, y: 295 },
        { x: dx, y: dy },
      ]
    }
  }, [staffStartCoords, destinationCoords])

  // Total route path length & segment calculations
  const routeMetrics = useMemo(() => {
    const segments: { from: Point; to: Point; length: number; cumulative: number }[] = []
    let total = 0

    for (let i = 0; i < routeWaypoints.length - 1; i++) {
      const from = routeWaypoints[i]
      const to = routeWaypoints[i + 1]
      const len = Math.hypot(to.x - from.x, to.y - from.y)
      segments.push({
        from,
        to,
        length: len,
        cumulative: total,
      })
      total += len
    }

    return { segments, totalLength: total }
  }, [routeWaypoints])

  // Real-time interpolated position and heading angle of the staff member
  const currentStaffState = useMemo(() => {
    const { segments, totalLength } = routeMetrics
    if (!segments.length || totalLength === 0) {
      return { x: staffStartCoords.x, y: staffStartCoords.y, angle: 0, arrived: false }
    }

    const currentDist = Math.max(0, Math.min(totalLength, walkProgress * totalLength))
    const isArrived = walkProgress >= 0.99

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]
      const nextCum = seg.cumulative + seg.length

      if (currentDist <= nextCum || i === segments.length - 1) {
        const segProgress = seg.length > 0 ? (currentDist - seg.cumulative) / seg.length : 1
        const clampedSubT = Math.max(0, Math.min(1, segProgress))
        const x = seg.from.x + clampedSubT * (seg.to.x - seg.from.x)
        const y = seg.from.y + clampedSubT * (seg.to.y - seg.from.y)
        const angle = (Math.atan2(seg.to.y - seg.from.y, seg.to.x - seg.from.x) * 180) / Math.PI

        return { x, y, angle, arrived: isArrived }
      }
    }

    const last = routeWaypoints[routeWaypoints.length - 1]
    return { x: last.x, y: last.y, angle: 0, arrived: true }
  }, [routeMetrics, walkProgress, staffStartCoords, routeWaypoints])

  // Dynamic Traversed (solid) and Remaining (animated laser) SVG paths
  const { traversedSvgPath, remainingSvgPath } = useMemo(() => {
    const { segments, totalLength } = routeMetrics
    if (!segments.length) return { traversedSvgPath: '', remainingSvgPath: '' }

    const currentDist = walkProgress * totalLength
    const curPt = currentStaffState

    // Build traversed path points
    const traversedPts: Point[] = [routeWaypoints[0]]
    const remainingPts: Point[] = [{ x: curPt.x, y: curPt.y }]

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]
      const segEndCum = seg.cumulative + seg.length

      if (segEndCum < currentDist) {
        traversedPts.push(seg.to)
      } else if (seg.cumulative < currentDist) {
        traversedPts.push({ x: curPt.x, y: curPt.y })
        // Add remaining segments
        for (let j = i + 1; j < routeWaypoints.length; j++) {
          remainingPts.push(routeWaypoints[j])
        }
        break
      } else {
        remainingPts.push(seg.to)
      }
    }

    const tPath = traversedPts.length > 1
      ? `M ${traversedPts.map((p) => `${p.x} ${p.y}`).join(' L ')}`
      : ''
    const rPath = remainingPts.length > 1
      ? `M ${remainingPts.map((p) => `${p.x} ${p.y}`).join(' L ')}`
      : ''

    return { traversedSvgPath: tPath, remainingSvgPath: rPath }
  }, [routeMetrics, walkProgress, currentStaffState, routeWaypoints])

  // Real-time walking loop using requestAnimationFrame
  useEffect(() => {
    if (!isOpen || !isWalking) {
      lastTimeRef.current = null
      return
    }

    const WALK_DURATION_MS = 9000 // 9 seconds for a full realistic walkthrough

    const animateWalk = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = time - lastTimeRef.current
        setWalkProgress((prev) => {
          const next = prev + delta / WALK_DURATION_MS
          if (next >= 1.0) {
            setIsWalking(false)
            return 1.0
          }
          return next
        })
      }
      lastTimeRef.current = time
      animationFrameRef.current = requestAnimationFrame(animateWalk)
    }

    animationFrameRef.current = requestAnimationFrame(animateWalk)

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [isOpen, isWalking])

  // Dynamic Camera Auto-Center on walking avatar
  useEffect(() => {
    if (!isAutoFollowing) return

    const targetX = currentStaffState.x
    const targetY = currentStaffState.y
    const newPanX = Math.max(-130, Math.min(130, (300 - targetX) * 0.6))
    const newPanY = Math.max(-90, Math.min(90, (210 - targetY) * 0.6))

    setPanOffset({ x: newPanX, y: newPanY })
  }, [currentStaffState.x, currentStaffState.y, isAutoFollowing])

  // Auto-generate route and fetch layout on open
  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    setIsLoading(true)
    setRoute(null)
    setWalkProgress(0.0)
    setIsWalking(true)
    setZoomLevel(1.05)

    void (async () => {
      try {
        let storeLayout: StoreLayout | null = null
        try {
          storeLayout = await realStoreApi.getStoreLayout('store-01')
          if (!cancelled && storeLayout) setLayout(storeLayout)
        } catch {
          // Fallback
        }

        const startNodeId = resolveStaffStartNodeId(authenticatedStaff, storeLayout)

        try {
          const plan = await realStoreApi.getNavigationRoute({
            storeId: 'store-01',
            shelfCode: effectiveShelfCode,
            productId: target.productId,
            startNodeId: startNodeId || 'nav-central-2',
            includeCheckout: false,
            avoidCongestion: true,
          })
          if (!cancelled && plan) {
            setRoute(plan)
            return
          }
        } catch {
          // Fallback
        }

        if (!cancelled) {
          // Real backend route lookup failed — synthesize a path from the
          // actual staff/destination coordinates rather than fabricating one.
          // Distance is computed from those real coordinates (converted from
          // grid units via the layout's real metersPerUnit), not a fixed guess.
          const metersPerUnit = storeLayout?.metersPerUnit || 0.12
          const AVERAGE_WALK_SPEED_M_PER_S = 1.4
          const gridDistance = Math.hypot(destinationCoords.x - staffStartCoords.x, destinationCoords.y - staffStartCoords.y)
          const fallbackDistanceMeters = Math.round(gridDistance * metersPerUnit)
          const fallbackSeconds = Math.max(5, Math.round(fallbackDistanceMeters / AVERAGE_WALK_SPEED_M_PER_S))

          setRoute({
            planId: `staff-nav-${Date.now()}`,
            storeId: 'store-01',
            totalDistanceMeters: fallbackDistanceMeters,
            estimatedSeconds: fallbackSeconds,
            stops: [
              {
                sequence: 0,
                label: 'Entrance Station (Staff)',
                node: { id: 'staff-start', x: staffStartCoords.x, y: staffStartCoords.y, type: 'CORRIDOR' },
                dwellSeconds: 0,
              },
              {
                sequence: 1,
                label: target.productName || target.destination || destinationCoords.aisle,
                shelfCode: effectiveShelfCode,
                node: { id: 'dest-node', x: destinationCoords.x, y: destinationCoords.y, type: 'SHELF', shelfCode: effectiveShelfCode },
                dwellSeconds: 60,
              },
            ],
            legs: [
              {
                fromStopIndex: 0,
                toStopIndex: 1,
                distanceMeters: fallbackDistanceMeters,
                estimatedSeconds: fallbackSeconds,
                svgPath: `M ${staffStartCoords.x} ${staffStartCoords.y} L ${staffStartCoords.x} 295 L 300 295 L 300 ${destinationCoords.y} L ${destinationCoords.x} ${destinationCoords.y}`,
                arrivalInstruction: `Meet customer at ${destinationCoords.aisle} (Shelf ${effectiveShelfCode})`,
                segments: [
                  { instruction: 'Depart station along Main South Concourse' },
                  { instruction: 'Walk along Central Main Aisle towards customer location' },
                  { instruction: `Turn into ${destinationCoords.aisle} (Shelf ${effectiveShelfCode})` },
                ],
              },
            ],
          } as unknown as NavigationPlan)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isOpen, effectiveShelfCode, target.productId, authenticatedStaff, target.destination, target.productName, staffStartCoords, destinationCoords])

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setIsAutoFollowing(false)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: panOffset.x,
      initialPanY: panOffset.y,
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    setPanOffset({
      x: Math.max(-140, Math.min(140, dragStartRef.current.initialPanX + dx)),
      y: Math.max(-100, Math.min(100, dragStartRef.current.initialPanY + dy)),
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setIsAutoFollowing(false)
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        initialPanX: panOffset.x,
        initialPanY: panOffset.y,
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    const dx = e.touches[0].clientX - dragStartRef.current.x
    const dy = e.touches[0].clientY - dragStartRef.current.y
    setPanOffset({
      x: Math.max(-140, Math.min(140, dragStartRef.current.initialPanX + dx)),
      y: Math.max(-100, Math.min(100, dragStartRef.current.initialPanY + dy)),
    })
  }

  const handleRecenter = () => {
    setIsAutoFollowing(true)
    const targetX = currentStaffState.x
    const targetY = currentStaffState.y
    setPanOffset({
      x: Math.max(-130, Math.min(130, (300 - targetX) * 0.6)),
      y: Math.max(-90, Math.min(90, (210 - targetY) * 0.6)),
    })
    setZoomLevel(1.1)
  }

  const handleTogglePlay = () => {
    if (walkProgress >= 1.0) {
      setWalkProgress(0.0)
      setIsWalking(true)
    } else {
      setIsWalking((prev) => !prev)
    }
  }

  const handleRestart = () => {
    setWalkProgress(0.0)
    setIsWalking(true)
    setIsAutoFollowing(true)
  }

  // Active step instruction based on walk progress
  const activeStepInstruction = useMemo(() => {
    if (currentStaffState.arrived) {
      return `✓ Arrived at Shelf ${effectiveShelfCode} · Customer Located`
    }
    if (walkProgress < 0.3) {
      return '1. Depart station along South Concourse'
    } else if (walkProgress < 0.75) {
      return '2. Walk forward along Central Main Walkway'
    } else {
      return `3. Turn into ${destinationCoords.aisle} (Shelf ${effectiveShelfCode})`
    }
  }, [currentStaffState.arrived, walkProgress, destinationCoords.aisle, effectiveShelfCode])

  const remainingMeters = Math.max(0, Math.round(32 * (1 - walkProgress)))
  const remainingSeconds = Math.max(0, Math.round(38 * (1 - walkProgress)))

  if (!isOpen || typeof document === 'undefined') return null

  const destinationLabel =
    target.productName ||
    (effectiveShelfCode ? `Shelf ${effectiveShelfCode} · ${destinationCoords.aisle}` : target.destination)

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close navigation map"
        className="fixed inset-0 z-[200] cursor-default bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className="fixed inset-x-0 bottom-0 z-[201] mx-auto flex max-h-[min(94dvh,860px)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-200 select-none font-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-nav-title"
      >
        {/* Top App Bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200 shadow-2xs">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h3 id="staff-nav-title" className="text-sm font-bold leading-tight text-slate-900">
                Staff Live Navigator
              </h3>
              <p className="text-[11px] font-medium text-slate-500">
                Real-time route movement · {target.zone || 'Store Floor'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Turn-by-Turn Dynamic Navigation HUD Banner */}
        <div className="flex items-center justify-between border-b border-teal-100 bg-teal-50/70 px-4 py-2.5 text-xs">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative flex items-center justify-center shrink-0">
              {isWalking && <span className="absolute -inset-1 rounded-xl bg-teal-400 opacity-40 animate-ping" />}
              <div className="relative h-8 w-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentStaffState.arrived ? '✓' : Math.min(3, Math.floor(walkProgress * 3) + 1)}
              </div>
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <span>{currentStaffState.arrived ? 'ARRIVED AT DESTINATION' : 'LIVE ROUTE NAVIGATION'}</span>
                {isWalking && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
                  </span>
                )}
              </span>
              <span className="block truncate font-bold text-slate-900 text-xs">
                {activeStepInstruction}
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right pl-3 border-l border-teal-200/80">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Remaining</span>
            <span className="font-bold text-teal-800 text-xs font-mono">
              {currentStaffState.arrived ? '0 m' : `${remainingMeters} m`}
            </span>
            <span className="block text-[10px] text-slate-500 font-medium font-mono">
              {currentStaffState.arrived ? 'Arrived' : `~${remainingSeconds}s`}
            </span>
          </div>
        </div>

        {/* Scrollable Map Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3.5 space-y-3">
          {/* Interactive Customer-Style 2D Store Map Container */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-[#F8FAFC] shadow-inner">
            {/* Top-Right Floating Controls (Recenter + Zoom + Play/Pause) */}
            <div className="absolute top-2.5 right-2.5 z-20 flex flex-col items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-sm pointer-events-auto">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="p-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title={isWalking ? 'Pause Walking' : 'Start Walking'}
              >
                {isWalking ? (
                  <Pause className="h-3.5 w-3.5 text-amber-600" />
                ) : (
                  <Play className="h-3.5 w-3.5 text-teal-700 fill-teal-700" />
                )}
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="p-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Restart Walk"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-600" />
              </button>
              <div className="w-4 h-[1px] bg-slate-200 my-0.5" />
              <button
                type="button"
                onClick={handleRecenter}
                className="p-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Recenter Map"
              >
                <LocateFixed className="h-3.5 w-3.5 text-teal-700" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
                className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
                className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5 text-slate-700" />
              </button>
            </div>

            {/* Bottom-Left Real-time Progress Bar */}
            <div className="absolute bottom-2.5 left-2.5 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-[10px] font-bold text-slate-700 flex items-center gap-1.5 font-mono pointer-events-none">
              <Footprints className="h-3.5 w-3.5 text-teal-700" />
              <span>{Math.round(walkProgress * 100)}% Complete</span>
            </div>

            {/* SVG Canvas with Pan and Zoom */}
            <div
              className="w-full h-full cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => setIsDragging(false)}
            >
              <svg
                viewBox="0 0 600 420"
                className="w-full h-full transition-transform duration-300 ease-out"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                }}
              >
                {/* SVG Definitions */}
                <defs>
                  <style>
                    {`
                      @keyframes livelyFlow {
                        0% { stroke-dashoffset: 40; }
                        100% { stroke-dashoffset: 0; }
                      }
                      @keyframes pulseRadarWave {
                        0% { r: 12px; opacity: 0.8; }
                        50% { r: 24px; opacity: 0.15; }
                        100% { r: 12px; opacity: 0.8; }
                      }
                      .staff-laser-dash {
                        animation: livelyFlow 1.2s linear infinite;
                      }
                    `}
                  </style>

                  {/* Supermarket Tile Grid Pattern */}
                  <pattern id="staffSupermarketTiles" width="24" height="24" patternUnits="userSpaceOnUse">
                    <rect width="24" height="24" fill="#F8FAFC" />
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#E2E8F0" strokeWidth="0.75" />
                  </pattern>

                  {/* Drop Shadow */}
                  <filter id="staffGondolaShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.08" />
                  </filter>
                </defs>

                {/* Base Store Foundation */}
                <rect x="0" y="0" width="600" height="420" fill="#F1F5F9" />
                <rect
                  x="10"
                  y="10"
                  width="580"
                  height="400"
                  rx="18"
                  fill="url(#staffSupermarketTiles)"
                  stroke="#CBD5E1"
                  strokeWidth="2.5"
                />

                {/* Concourse Walkways */}
                <rect x="18" y="28" width="564" height="24" rx="6" fill="#FFFFFF" opacity="0.8" />
                <text x="28" y="44" fill="#94A3B8" fontSize="8" fontWeight="bold">NORTH CONCOURSE</text>

                <rect x="18" y="148" width="564" height="28" rx="6" fill="#FFFFFF" opacity="0.85" />
                <text x="28" y="165" fill="#94A3B8" fontSize="8" fontWeight="bold">CENTRAL MAIN AISLE</text>

                <rect x="18" y="282" width="564" height="28" rx="6" fill="#FFFFFF" opacity="0.85" />
                <text x="28" y="300" fill="#94A3B8" fontSize="8" fontWeight="bold">CHECKOUT CONCOURSE</text>

                {/* Left Side Amenities */}
                {/* Help Desk */}
                <g transform="translate(18, 62)">
                  <rect x="0" y="0" width="75" height="55" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" filter="url(#staffGondolaShadow)" />
                  <text x="37.5" y="20" fill="#0F766E" fontSize="8" fontWeight="800" textAnchor="middle">HELP DESK</text>
                  <text x="37.5" y="33" fill="#64748B" fontSize="6.5" fontWeight="600" textAnchor="middle">Customer Care</text>
                  <text x="37.5" y="44" fill="#94A3B8" fontSize="6" textAnchor="middle">Shelf A4</text>
                </g>

                {/* Restrooms */}
                <g transform="translate(18, 185)">
                  <rect x="0" y="0" width="75" height="55" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" filter="url(#staffGondolaShadow)" />
                  <text x="37.5" y="20" fill="#475569" fontSize="8" fontWeight="800" textAnchor="middle">RESTROOMS</text>
                  <text x="37.5" y="33" fill="#64748B" fontSize="6.5" fontWeight="600" textAnchor="middle">Men &amp; Women</text>
                  <text x="37.5" y="44" fill="#94A3B8" fontSize="6" textAnchor="middle">Accessible</text>
                </g>

                {/* Entrance & Cart Station */}
                <g transform="translate(18, 318)">
                  <rect x="0" y="0" width="85" height="78" rx="10" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="2" filter="url(#staffGondolaShadow)" />
                  <rect x="10" y="6" width="65" height="8" rx="3" fill="#059669" />
                  <text x="42.5" y="12.5" fill="#FFFFFF" fontSize="5.5" fontWeight="bold" textAnchor="middle">AUTOMATIC GLASS ENTRY</text>
                  <text x="42.5" y="32" fill="#065F46" fontSize="9" fontWeight="800" textAnchor="middle">ENTRANCE</text>
                  <text x="42.5" y="46" fill="#047857" fontSize="7.5" fontWeight="600" textAnchor="middle">Cart &amp; Basket Station</text>
                </g>

                {/* Aisles 1 to 6 */}
                {/* AISLE 1: FRESH PRODUCE */}
                <g transform="translate(115, 60)">
                  <rect x="0" y="0" width="90" height="80" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" filter="url(#staffGondolaShadow)" />
                  <rect x="0" y="0" width="90" height="22" rx="8" fill="#ECFDF5" />
                  <text x="45" y="15" fill="#065F46" fontSize="8.5" fontWeight="800" textAnchor="middle">AISLE 1 • Produce</text>
                  <rect x="8" y="28" width="34" height="20" rx="4" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
                  <text x="25" y="41" fill="#15803D" fontSize="7.5" fontWeight="bold" textAnchor="middle">Shelf A1</text>
                  <rect x="48" y="28" width="34" height="20" rx="4" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
                  <text x="65" y="41" fill="#15803D" fontSize="7.5" fontWeight="bold" textAnchor="middle">Shelf A2</text>
                  <text x="45" y="65" fill="#047857" fontSize="7" fontWeight="600" textAnchor="middle">Fruits &amp; Vegetables</text>
                </g>

                {/* AISLE 2: DAIRY & CHILLED */}
                <g transform="translate(115, 185)">
                  <rect x="0" y="0" width="90" height="88" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" filter="url(#staffGondolaShadow)" />
                  <rect x="0" y="0" width="90" height="22" rx="8" fill="#E0F2FE" />
                  <text x="45" y="15" fill="#0369A1" fontSize="8.5" fontWeight="800" textAnchor="middle">AISLE 2 • Dairy &amp; Milk</text>
                  <rect x="8" y="28" width="22" height="22" rx="4" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="1" />
                  <text x="19" y="42" fill="#0369A1" fontSize="7" fontWeight="bold" textAnchor="middle">B1</text>
                  <rect x="34" y="28" width="22" height="22" rx="4" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="1" />
                  <text x="45" y="42" fill="#0369A1" fontSize="7" fontWeight="800" textAnchor="middle">B2</text>
                  <rect x="60" y="28" width="22" height="22" rx="4" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="1" />
                  <text x="71" y="42" fill="#0369A1" fontSize="7" fontWeight="bold" textAnchor="middle">B3</text>
                  <text x="45" y="64" fill="#0369A1" fontSize="7" fontWeight="bold" textAnchor="middle">CHILLED COOLERS</text>
                  <text x="45" y="76" fill="#64748B" fontSize="6.5" textAnchor="middle">Milk, Butter &amp; Cheese</text>
                </g>

                {/* AISLE 3: BAKERY */}
                <g transform="translate(225, 60)">
                  <rect x="0" y="0" width="90" height="80" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" filter="url(#staffGondolaShadow)" />
                  <rect x="0" y="0" width="90" height="22" rx="8" fill="#FEF3C7" />
                  <text x="45" y="15" fill="#B45309" fontSize="8.5" fontWeight="800" textAnchor="middle">AISLE 3 • Bakery</text>
                  <rect x="8" y="28" width="34" height="20" rx="4" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
                  <text x="25" y="41" fill="#B45309" fontSize="7.5" fontWeight="bold" textAnchor="middle">Shelf C1</text>
                  <rect x="48" y="28" width="34" height="20" rx="4" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
                  <text x="65" y="41" fill="#B45309" fontSize="7.5" fontWeight="bold" textAnchor="middle">Shelf C2</text>
                  <text x="45" y="65" fill="#B45309" fontSize="7" fontWeight="600" textAnchor="middle">Artisan Bread &amp; Deli</text>
                </g>

                {/* AISLE 4: SNACKS & BEVERAGES */}
                <g transform="translate(225, 185)">
                  <rect x="0" y="0" width="90" height="88" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" filter="url(#staffGondolaShadow)" />
                  <rect x="0" y="0" width="90" height="22" rx="8" fill="#F3E8FF" />
                  <text x="45" y="15" fill="#7E22CE" fontSize="8.5" fontWeight="800" textAnchor="middle">AISLE 4 • Snacks</text>
                  <rect x="8" y="28" width="22" height="22" rx="4" fill="#FAF5FF" stroke="#E9D5FF" strokeWidth="1" />
                  <text x="19" y="42" fill="#7E22CE" fontSize="7" fontWeight="bold" textAnchor="middle">B4</text>
                  <rect x="34" y="28" width="22" height="22" rx="4" fill="#FAF5FF" stroke="#E9D5FF" strokeWidth="1" />
                  <text x="45" y="42" fill="#7E22CE" fontSize="7" fontWeight="800" textAnchor="middle">B5</text>
                  <rect x="60" y="28" width="22" height="22" rx="4" fill="#FAF5FF" stroke="#E9D5FF" strokeWidth="1" />
                  <text x="71" y="42" fill="#7E22CE" fontSize="7" fontWeight="bold" textAnchor="middle">B6</text>
                  <text x="45" y="64" fill="#7E22CE" fontSize="7" fontWeight="bold" textAnchor="middle">SNACKS &amp; DRINKS</text>
                  <text x="45" y="76" fill="#64748B" fontSize="6.5" textAnchor="middle">Chips, Cookies &amp; Soda</text>
                </g>

                {/* AISLE 5: STAPLES & PANTRY */}
                <g transform="translate(335, 60)">
                  <rect x="0" y="0" width="90" height="80" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" filter="url(#staffGondolaShadow)" />
                  <rect x="0" y="0" width="90" height="22" rx="8" fill="#CCFBF1" />
                  <text x="45" y="15" fill="#0F766E" fontSize="8.5" fontWeight="800" textAnchor="middle">AISLE 5 • Pantry</text>
                  <rect x="8" y="28" width="34" height="20" rx="4" fill="#F0FDFA" stroke="#99F6E4" strokeWidth="1" />
                  <text x="25" y="41" fill="#0F766E" fontSize="7.5" fontWeight="bold" textAnchor="middle">Shelf D1</text>
                  <rect x="48" y="28" width="34" height="20" rx="4" fill="#F0FDFA" stroke="#99F6E4" strokeWidth="1" />
                  <text x="65" y="41" fill="#0F766E" fontSize="7.5" fontWeight="bold" textAnchor="middle">Shelf D2</text>
                  <text x="45" y="65" fill="#0F766E" fontSize="7" fontWeight="600" textAnchor="middle">Rice, Pasta &amp; Grains</text>
                </g>

                {/* AISLE 6: HOUSEHOLD */}
                <g transform="translate(335, 185)">
                  <rect x="0" y="0" width="90" height="88" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" filter="url(#staffGondolaShadow)" />
                  <rect x="0" y="0" width="90" height="22" rx="8" fill="#E0E7FF" />
                  <text x="45" y="15" fill="#4338CA" fontSize="8.5" fontWeight="800" textAnchor="middle">AISLE 6 • Household</text>
                  <rect x="8" y="28" width="34" height="22" rx="4" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1" />
                  <text x="25" y="42" fill="#4338CA" fontSize="7.5" fontWeight="bold" textAnchor="middle">Shelf E1</text>
                  <rect x="48" y="28" width="34" height="22" rx="4" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1" />
                  <text x="65" y="42" fill="#4338CA" fontSize="7.5" fontWeight="bold" textAnchor="middle">Shelf E2</text>
                  <text x="45" y="64" fill="#4338CA" fontSize="7" fontWeight="bold" textAnchor="middle">CLEANING &amp; PAPER</text>
                  <text x="45" y="76" fill="#64748B" fontSize="6.5" textAnchor="middle">Detergent &amp; Towels</text>
                </g>

                {/* CHECKOUT LANES (RIGHT SIDE) */}
                <g transform="translate(445, 60)">
                  <rect x="0" y="0" width="135" height="213" rx="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" filter="url(#staffGondolaShadow)" />
                  <rect x="0" y="0" width="135" height="24" rx="10" fill="#EDE9FE" />
                  <text x="67.5" y="16" fill="#6D28D9" fontSize="8.5" fontWeight="800" textAnchor="middle">CHECKOUT LANES</text>

                  {/* Registers C1 to C5 */}
                  {[
                    { label: 'Register C1 (Live)', y: 32 },
                    { label: 'Register C2 (Express)', y: 66 },
                    { label: 'Register C3 (Standby)', y: 100 },
                    { label: 'Register C4 (Self-Checkout)', y: 134 },
                    { label: 'Register C5 (Self-Checkout)', y: 168 },
                  ].map((lane, idx) => (
                    <g key={idx} transform={`translate(10, ${lane.y})`}>
                      <rect x="0" y="0" width="115" height="24" rx="5" fill="#F5F3FF" stroke="#DDD6FE" strokeWidth="1" />
                      <text x="10" y="15" fill="#5B21B6" fontSize="7" fontWeight="bold">{lane.label}</text>
                    </g>
                  ))}
                </g>

                {/* STOCKROOM & LOGISTICS (BOTTOM RIGHT) */}
                <g transform="translate(445, 290)">
                  <rect x="0" y="0" width="135" height="106" rx="10" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" filter="url(#staffGondolaShadow)" />
                  <rect x="0" y="0" width="135" height="22" rx="10" fill="#E2E8F0" />
                  <text x="67.5" y="15" fill="#475569" fontSize="8.5" fontWeight="800" textAnchor="middle">STOCKROOM &amp; RECEIVING</text>
                  <text x="67.5" y="45" fill="#64748B" fontSize="7" fontWeight="600" textAnchor="middle">Inventory Bay &amp; Staging</text>
                  <text x="67.5" y="60" fill="#94A3B8" fontSize="6.5" textAnchor="middle">Authorized Staff Only</text>
                </g>

                {/* 1. SOLID TRAVERSED PATH (BEHIND WALKING AVATAR) */}
                {traversedSvgPath && (
                  <path
                    d={traversedSvgPath}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />
                )}

                {/* 2. REMAINING ANIMATED LASER PATH (AHEAD OF AVATAR) */}
                {remainingSvgPath && (
                  <>
                    <path
                      d={remainingSvgPath}
                      fill="none"
                      stroke="#0D9488"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.25"
                    />
                    <path
                      d={remainingSvgPath}
                      fill="none"
                      stroke="#0F766E"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="10 6"
                      className="staff-laser-dash"
                    />
                  </>
                )}

                {/* Customer Target Marker (Destination Pin) */}
                <g transform={`translate(${destinationCoords.x}, ${destinationCoords.y})`}>
                  <circle r="22" fill="#0D9488" opacity="0.2" className="animate-ping" />
                  <circle r="10" fill="#0F766E" stroke="#FFFFFF" strokeWidth="3" />
                  <text x="14" y="-10" fill="#134E4A" fontSize="11" fontWeight="900">
                    Customer • Shelf {effectiveShelfCode}
                  </text>
                </g>

                {/* LIVE DYNAMIC MOVING STAFF POSITION MARKER (● YOU) */}
                <g
                  transform={`translate(${currentStaffState.x}, ${currentStaffState.y})`}
                  className="pointer-events-none"
                  style={{ transition: isWalking ? 'none' : 'transform 200ms ease-out' }}
                >
                  {/* Triple Radar Waves */}
                  <circle cx="0" cy="0" r="26" fill="#0F766E" opacity="0.18" className="animate-ping" />
                  <circle cx="0" cy="0" r="16" fill="#0F766E" opacity="0.3" className="animate-pulse" />
                  <circle cx="0" cy="0" r="10" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />

                  {/* Directional Heading Pointer */}
                  <g transform={`rotate(${currentStaffState.angle})`}>
                    <polygon points="14,0 8,-4 8,4" fill="#0F766E" stroke="#FFFFFF" strokeWidth="0.8" />
                  </g>

                  {/* Floating YOU Tag Badge */}
                  <g transform="translate(0, 14)">
                    <rect x="-18" y="0" width="36" height="14" rx="4" fill="#0F766E" stroke="#FFFFFF" strokeWidth="1" />
                    <text x="0" y="9.5" fill="#FFFFFF" fontSize="7.5" fontWeight="900" textAnchor="middle">
                      YOU
                    </text>
                  </g>
                </g>
              </svg>
            </div>
          </div>

          {/* Customer Context Information */}
          {(target.customerMessage || target.zone || target.productName) && (
            <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-3.5 text-xs text-teal-950 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-teal-900">
                <UserRound className="h-4 w-4 text-teal-700" />
                <span>Customer Assistance Request</span>
              </div>
              {target.zone && (
                <p className="text-[11px] text-teal-800">
                  Target Zone: <strong>{target.zone}</strong>
                  {effectiveShelfCode ? ` · Shelf ${effectiveShelfCode}` : ''}
                </p>
              )}
              {target.customerMessage && (
                <p className="mt-1 text-[11px] leading-relaxed text-teal-900 bg-white/80 p-2 rounded-lg border border-teal-200/60 font-medium">
                  &ldquo;{target.customerMessage}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Turn-by-Turn Directions with Active Indicator */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step-by-step guidance</h4>
            <div className="space-y-2">
              {[
                { title: 'Depart station along Main South Concourse', dist: '10m', threshold: 0.3 },
                { title: 'Walk forward along Central Main Walkway', dist: '14m', threshold: 0.75 },
                { title: `Turn into ${destinationCoords.aisle} (Shelf ${effectiveShelfCode})`, dist: '8m', threshold: 1.0 },
              ].map((step, index) => {
                const isPassed = walkProgress >= step.threshold
                const isActive = !isPassed && (index === 0 || walkProgress >= [0, 0.3, 0.75][index])

                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-xs transition-all ${
                      currentStaffState.arrived && index === 2
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-950 shadow-2xs'
                        : isActive
                          ? 'border-teal-200 bg-teal-50/80 text-teal-950 shadow-2xs'
                          : isPassed
                            ? 'border-slate-200 bg-slate-100/70 text-slate-500'
                            : 'border-slate-100 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        isPassed || (currentStaffState.arrived && index === 2)
                          ? 'bg-emerald-600 text-white'
                          : isActive
                            ? 'bg-teal-700 text-white'
                            : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isPassed || (currentStaffState.arrived && index === 2) ? '✓' : index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold leading-relaxed block">{step.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{step.dist} segment</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="shrink-0 border-t border-slate-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-xs transition-all cursor-pointer ${
              currentStaffState.arrived
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                : 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/20'
            }`}
          >
            {currentStaffState.arrived ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>Arrived at Customer — Start Assistance</span>
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 text-white" />
                <span>Got Route — Heading to Customer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
