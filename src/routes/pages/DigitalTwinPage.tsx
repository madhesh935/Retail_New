import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Layers,
  Search,
  X,
} from 'lucide-react'
import { DigitalTwinViewport } from '@/components/digital-twin/DigitalTwinViewport'
import {
  LayerControlPanel,
  TwinLayerState,
} from '@/components/digital-twin/controls/LayerControlPanel'
import {
  TopViewportControls,
  TwinMode,
  TwinViewMode,
} from '@/components/digital-twin/controls/TopViewportControls'
import { TwinShelfDrawer } from '@/components/digital-twin/drawers/TwinShelfDrawer'
import { TwinCheckoutDrawer } from '@/components/digital-twin/drawers/TwinCheckoutDrawer'
import { TwinZoneDrawer } from '@/components/digital-twin/drawers/TwinZoneDrawer'
import { TwinCameraDrawer } from '@/components/digital-twin/drawers/TwinCameraDrawer'
import { Shelf3DData } from '@/components/digital-twin/scene/StoreShelves3D'
import { Checkout3DData } from '@/components/digital-twin/scene/CheckoutLanes3D'
import { Zone3DData } from '@/components/digital-twin/scene/ZoneLabels3D'
import { Camera3DData } from '@/components/digital-twin/scene/CameraCoverage3D'
import { Staff3DData } from '@/components/digital-twin/scene/StaffMarkers3D'
import {
  WhyRecommendationDialog,
  WhyDialogData,
} from '@/components/command-center/WhyRecommendationDialog'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { resolveEntityFocus, SHELF_FOCUS, CHECKOUT_FOCUS, CAMERA_FOCUS, resolveZonePosition } from '@/components/digital-twin/layout/storeLayout'
import { cn } from '@/lib/utils'

const LAYERS_STORAGE_KEY = 'retail-edge-twin-layers'

const DEFAULT_LAYERS: TwinLayerState = {
  shopperPositions: true,
  shopperTrails: false,
  heatmap: false,
  shelfHealth: true,
  queueStatus: true,
  staff: true,
  incidents: true,
  cameraCoverage: true,
  productZones: true,
  tasks: true,
  customerRequests: true,
}

function loadLayers(): TwinLayerState {
  try {
    const raw = localStorage.getItem(LAYERS_STORAGE_KEY)
    if (!raw) return DEFAULT_LAYERS
    return { ...DEFAULT_LAYERS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_LAYERS
  }
}

export const DigitalTwinPage: React.FC = () => {
  const storeName = useAppStore((s) => s.storeInfo?.name)
  const activeShopperCount = useAppStore((s) => s.currentOccupancy)
  const zoneMetricCount = useAppStore((s) => s.zoneMetrics.length)
  const queueCount = useAppStore((s) => s.queues.length)
  const staffCount = useAppStore((s) =>
    s.staffMembers.filter((m) => m.status !== 'OFF_DUTY' && m.status !== 'ON_BREAK').length
  )
  const taskCount = useAppStore((s) =>
    s.pendingTasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length
  )
  const incidentCount = useAppStore((s) =>
    s.incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'DISMISSED').length
  )
  const requestCount = useAppStore((s) =>
    s.customerRequests.filter((r) => !['COMPLETED', 'CANCELLED', 'UNAVAILABLE'].includes(r.status))
      .length
  )
  const cameraCount = useAppStore((s) => s.cameras.length)
  const staffMembers = useAppStore((s) => s.staffMembers)
  const queues = useAppStore((s) => s.queues)

  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const viewportWrapRef = useRef<HTMLDivElement>(null)

  const [layers, setLayers] = useState<TwinLayerState>(loadLayers)
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false)
  const [mode, setMode] = useState<TwinMode>('LIVE')
  const [viewMode, setViewMode] = useState<TwinViewMode>('3D')
  const [resetTrigger, setResetTrigger] = useState(0)
  const [fitTrigger, setFitTrigger] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const [focusTarget, setFocusTarget] = useState<{
    position: [number, number, number]
    distance?: number
  } | null>(null)
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)

  const [selectedShelf, setSelectedShelf] = useState<Shelf3DData | null>(null)
  const [selectedCheckout, setSelectedCheckout] = useState<Checkout3DData | null>(null)
  const [selectedZone, setSelectedZone] = useState<Zone3DData | null>(null)
  const [selectedCamera, setSelectedCamera] = useState<Camera3DData | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff3DData | null>(null)

  const [whyDialogData, setWhyDialogData] = useState<WhyDialogData | null>(null)
  const [isWhyDialogOpen, setIsWhyDialogOpen] = useState(false)

  // Persist layer prefs
  useEffect(() => {
    localStorage.setItem(LAYERS_STORAGE_KEY, JSON.stringify(layers))
  }, [layers])

  // Esc closes layer panel / search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLayerPanelOpen(false)
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Deep-link focus from URL: ?shelf= ?cam= ?lane= ?zone= ?focus=
  useEffect(() => {
    const shelf = searchParams.get('shelf')
    const cam = searchParams.get('cam')
    const lane = searchParams.get('lane') || searchParams.get('checkout')
    const zone = searchParams.get('zone')
    const focus = searchParams.get('focus')

    let pos: [number, number, number] | null = null
    let id: string | null = null

    if (shelf) {
      pos = resolveEntityFocus('shelf', shelf) || SHELF_FOCUS[shelf]
      id = shelf
    } else if (lane) {
      pos = resolveEntityFocus('checkout', lane) || CHECKOUT_FOCUS[lane]
      id = lane
    } else if (cam) {
      pos = resolveEntityFocus('camera', cam) || CAMERA_FOCUS[cam]
      id = cam
    } else if (zone) {
      pos = resolveZonePosition(zone)
      id = zone
    } else if (focus) {
      pos =
        resolveEntityFocus('shelf', focus) ||
        resolveEntityFocus('checkout', focus) ||
        resolveEntityFocus('camera', focus) ||
        resolveZonePosition(focus)
      id = focus
    }

    if (pos) {
      setFocusTarget({ position: pos, distance: 11 })
      setSelectedEntityId(id)
    }
  }, [searchParams])

  const clearSelection = useCallback(() => {
    setSelectedShelf(null)
    setSelectedCheckout(null)
    setSelectedZone(null)
    setSelectedCamera(null)
    setSelectedStaff(null)
    setSelectedEntityId(null)
  }, [])

  const focusOn = useCallback((id: string, position: [number, number, number], distance = 11) => {
    setFocusTarget({ position, distance })
    setSelectedEntityId(id)
  }, [])

  const onSelectShelf = useCallback(
    (shelf: Shelf3DData) => {
      clearSelection()
      setSelectedShelf(shelf)
      const p = SHELF_FOCUS[shelf.id]
      if (p) focusOn(shelf.id, p)
    },
    [clearSelection, focusOn]
  )

  const onSelectCheckout = useCallback(
    (checkout: Checkout3DData) => {
      clearSelection()
      setSelectedCheckout(checkout)
      const p = CHECKOUT_FOCUS[checkout.id]
      if (p) focusOn(checkout.id, p)
    },
    [clearSelection, focusOn]
  )

  const onSelectZone = useCallback(
    (zone: Zone3DData) => {
      clearSelection()
      setSelectedZone(zone)
      focusOn(zone.id, zone.position, 14)
    },
    [clearSelection, focusOn]
  )

  const onSelectCamera = useCallback(
    (cam: Camera3DData) => {
      clearSelection()
      setSelectedCamera(cam)
      focusOn(cam.id, cam.position, 10)
    },
    [clearSelection, focusOn]
  )

  const onSelectStaff = useCallback(
    (staff: Staff3DData) => {
      clearSelection()
      setSelectedStaff(staff)
      focusOn(staff.id, staff.position, 9)
    },
    [clearSelection, focusOn]
  )

  const onSelectTask = useCallback(
    (task: { id?: string; position?: [number, number, number] }) => {
      if (task?.position && task.id) focusOn(task.id, task.position, 10)
      navigate('/staff-operations')
    },
    [focusOn, navigate]
  )

  const onSelectCustomerRequest = useCallback(() => navigate('/staff-operations'), [navigate])
  const onSelectIncident = useCallback(() => navigate('/incidents'), [navigate])

  const handleToggleLayer = (layerKey: keyof TwinLayerState) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }))
  }

  const handleEnableAllLayers = () => {
    setLayers({
      shopperPositions: true,
      shopperTrails: false,
      heatmap: true,
      shelfHealth: true,
      queueStatus: true,
      staff: true,
      incidents: true,
      cameraCoverage: true,
      productZones: true,
      tasks: true,
      customerRequests: true,
    })
  }

  const handleDisableAllLayers = () => {
    setLayers({
      shopperPositions: false,
      shopperTrails: false,
      heatmap: false,
      shelfHealth: false,
      queueStatus: false,
      staff: false,
      incidents: false,
      cameraCoverage: false,
      productZones: false,
      tasks: false,
      customerRequests: false,
    })
  }

  const handleExplainCheckout = (checkout: Checkout3DData) => {
    const standbyLane = queues.find((q) => q.status === 'STANDBY' && q.id !== checkout.id)
    const availableStaff = staffMembers.find((m) => m.status === 'ON_DUTY_AVAILABLE')
    const confidencePct = Math.min(99, Math.max(15, checkout.queueLength * 12))
    const conclusion = standbyLane
      ? `Activate Standby Counter C${standbyLane.laneNumber}${
          availableStaff ? ` & assign ${availableStaff.name} (${availableStaff.employeeId}) immediately` : ' immediately'
        }`
      : availableStaff
        ? `Reallocate ${availableStaff.name} (${availableStaff.employeeId}) to ${checkout.name} immediately`
        : 'Escalate to a supervisor — no standby counter or available associate found'

    setWhyDialogData({
      title: `Queue Congestion Prediction (${checkout.name})`,
      actionType: 'QUEUE',
      targetEntity: checkout.name,
      signals: [
        { label: 'Current Queue Depth', value: `${checkout.queueLength} shoppers`, highlight: true },
        { label: 'Arrival Rate (λ)', value: `${checkout.arrivalRate} / min` },
        { label: 'Service Rate (μ)', value: `${checkout.serviceRate} / min` },
        { label: 'Predicted at +5min', value: `${checkout.forecast5Min} shoppers`, highlight: true },
        { label: 'Congestion Risk', value: checkout.congestionRisk },
        { label: 'Average Wait Time', value: `${checkout.waitTimeMinutes} min` },
      ],
      mathFormula: `Q(t + 5) = Q(t) + 5 × (λ - μ) = ${checkout.queueLength} + 5 × (${checkout.arrivalRate} - ${checkout.serviceRate}) = ${checkout.forecast5Min} shoppers`,
      threshold: '10 Shoppers Queue / 3.0 min Wait SLA',
      confidence: `${confidencePct}% (QueueSense-TemporalEdge)`,
      conclusion,
      edgeModel: 'QueueSense-Temporal-v2.4 (Jetson TensorRT)',
    })
    setIsWhyDialogOpen(true)
  }

  const toggleFullscreen = async () => {
    const el = viewportWrapRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const activeLayerCount = Object.values(layers).filter(Boolean).length

  const layerCounts = useMemo(
    () => ({
      shopperPositions: activeShopperCount || null,
      heatmap: zoneMetricCount || null,
      queueStatus: queueCount || null,
      staff: staffCount || null,
      tasks: taskCount || null,
      incidents: incidentCount || null,
      customerRequests: requestCount || null,
      cameraCoverage: cameraCount || null,
    }),
    [
      activeShopperCount,
      zoneMetricCount,
      queueCount,
      staffCount,
      taskCount,
      incidentCount,
      requestCount,
      cameraCount,
    ]
  )

  // Search index
  const searchHits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return [] as { id: string; label: string; type: string; position: [number, number, number] }[]
    const hits: { id: string; label: string; type: string; position: [number, number, number] }[] = []

    Object.entries(SHELF_FOCUS).forEach(([id, pos]) => {
      if (id.includes(q) || id.replace('shelf-', '').includes(q)) {
        hits.push({ id, label: id.replace('shelf-', '').toUpperCase(), type: 'shelf', position: pos })
      }
    })
    Object.entries(CHECKOUT_FOCUS).forEach(([id, pos]) => {
      const code = `C${id.replace('lane-', '')}`
      if (id.includes(q) || code.toLowerCase().includes(q)) {
        hits.push({ id, label: code, type: 'checkout', position: pos })
      }
    })
    Object.entries(CAMERA_FOCUS).forEach(([id, pos]) => {
      if (id.includes(q) || id.replace('cam-', 'cam-').includes(q)) {
        hits.push({ id, label: id.toUpperCase(), type: 'camera', position: pos })
      }
    })
    staffMembers?.forEach((m) => {
      if (m.name.toLowerCase().includes(q) || m.id.includes(q)) {
        const pos = resolveZonePosition(m.currentZoneId)
        if (pos) hits.push({ id: m.id, label: m.name, type: 'staff', position: pos })
      }
    })
    return hits.slice(0, 8)
  }, [searchQuery, staffMembers])

  const resetView = () => {
    setFocusTarget(null)
    setSelectedEntityId(null)
    setResetTrigger((t) => t + 1)
    setSearchParams({})
  }

  return (
    <div
      className={cn(
        'flex flex-col space-y-2 select-none',
        isFullscreen ? 'h-screen p-2 bg-slate-100' : 'h-[calc(100vh-7rem)] min-h-[640px]'
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Box className="h-4 w-4 text-teal-700" />
            Digital Twin
          </h1>
          <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
            Live spatial view of store operations
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
            {storeName || 'Store 01'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Search */}
          <div className="relative">
            {searchOpen ? (
              <div className="flex items-center gap-1">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search B4, C1, Liam…"
                    className="h-8 w-48 sm:w-56 pl-7 pr-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                  />
                  {searchHits.length > 0 && (
                    <div className="absolute top-9 left-0 right-0 z-30 rounded-lg border border-slate-200 bg-white shadow-xl overflow-hidden">
                      {searchHits.map((hit) => (
                        <button
                          key={`${hit.type}-${hit.id}`}
                          type="button"
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex justify-between"
                          onClick={() => {
                            focusOn(hit.id, hit.position)
                            setSearchOpen(false)
                            setSearchQuery('')
                          }}
                        >
                          <span className="font-medium text-slate-800">{hit.label}</span>
                          <span className="text-slate-400 uppercase text-[10px]">{hit.type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon-xs" onClick={() => setSearchOpen(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="xs"
                className="h-8 gap-1 border-slate-200 bg-white"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-3.5 w-3.5" />
                Search
              </Button>
            )}
          </div>

          <TopViewportControls
            mode={mode}
            onModeChange={setMode}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFitStore={() => {
              setFocusTarget(null)
              setFitTrigger((t) => t + 1)
            }}
            onResetCamera={resetView}
            showReplay={false}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
        </div>
      </div>

      <div
        ref={viewportWrapRef}
        className="relative flex-1 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
      >
        {/* Floating Layers button — top-right */}
        <div className="absolute top-3 right-3 z-20">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsLayerPanelOpen((prev) => !prev)}
            className="h-8 px-2.5 bg-white/95 backdrop-blur-md border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-sans flex items-center gap-1.5 shadow-lg"
          >
            <Layers className="h-3.5 w-3.5 text-teal-700" />
            <span>Layers</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200 font-medium">
              {activeLayerCount} Active
            </span>
          </Button>

          {isLayerPanelOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsLayerPanelOpen(false)}
                aria-hidden
              />
              <div className="mt-1.5 relative z-20 animate-in fade-in slide-in-from-top-1 duration-150 max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:mt-0 max-sm:rounded-t-2xl">
                <LayerControlPanel
                  layers={layers}
                  onToggleLayer={handleToggleLayer}
                  onEnableAll={handleEnableAllLayers}
                  onDisableAll={handleDisableAllLayers}
                  onClose={() => setIsLayerPanelOpen(false)}
                  counts={layerCounts}
                />
              </div>
            </>
          )}
        </div>

        <DigitalTwinViewport
          layers={layers}
          viewMode={viewMode}
          resetTrigger={resetTrigger}
          fitTrigger={fitTrigger}
          replaySpeed={1}
          focusTarget={focusTarget}
          selectedEntityId={selectedEntityId}
          onSelectShelf={onSelectShelf}
          onSelectCheckout={onSelectCheckout}
          onSelectZone={onSelectZone}
          onSelectCamera={onSelectCamera}
          onSelectStaff={onSelectStaff}
          onSelectTask={onSelectTask}
          onSelectCustomerRequest={onSelectCustomerRequest}
          onSelectIncident={onSelectIncident}
        />
      </div>

      <TwinShelfDrawer shelf={selectedShelf} onClose={() => setSelectedShelf(null)} />
      <TwinCheckoutDrawer
        checkout={selectedCheckout}
        onClose={() => setSelectedCheckout(null)}
        onExplain={handleExplainCheckout}
      />
      <TwinZoneDrawer zone={selectedZone} onClose={() => setSelectedZone(null)} />
      <TwinCameraDrawer camera={selectedCamera} onClose={() => setSelectedCamera(null)} />

      {/* Compact staff detail drawer */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSelectedStaff(null)} />
          <div className="relative w-full max-w-sm h-full bg-white border-l border-slate-200 z-10 flex flex-col shadow-2xl p-4 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {selectedStaff.code} {selectedStaff.name}
                </h3>
                <p className="text-[11px] text-slate-500">{selectedStaff.role}</p>
              </div>
              <Button variant="ghost" size="icon-xs" onClick={() => setSelectedStaff(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="py-3 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="font-medium">{selectedStaff.status}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Zone</span><span className="font-medium">{selectedStaff.zoneName || '—'}</span></div>
              <div className="flex justify-between gap-2"><span className="text-slate-500 shrink-0">Task</span><span className="font-medium text-right">{selectedStaff.currentTask}</span></div>
            </div>
            <Button
              className="mt-auto"
              onClick={() => {
                setSelectedStaff(null)
                navigate('/staff-operations')
              }}
            >
              View Staff Operations
            </Button>
          </div>
        </div>
      )}

      <WhyRecommendationDialog
        data={whyDialogData}
        open={isWhyDialogOpen}
        onOpenChange={setIsWhyDialogOpen}
      />
    </div>
  )
}
