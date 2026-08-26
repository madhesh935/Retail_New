import React, { useState, useEffect } from 'react'
import {
  Box,
  Layers,
  ChevronDown,
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
import { TimelineReplayBar } from '@/components/digital-twin/controls/TimelineReplayBar'
import { TwinShelfDrawer } from '@/components/digital-twin/drawers/TwinShelfDrawer'
import { TwinCheckoutDrawer } from '@/components/digital-twin/drawers/TwinCheckoutDrawer'
import { TwinZoneDrawer } from '@/components/digital-twin/drawers/TwinZoneDrawer'
import { TwinCameraDrawer } from '@/components/digital-twin/drawers/TwinCameraDrawer'
import { Shelf3DData } from '@/components/digital-twin/scene/StoreShelves3D'
import { Checkout3DData } from '@/components/digital-twin/scene/CheckoutLanes3D'
import { Zone3DData } from '@/components/digital-twin/scene/ZoneLabels3D'
import { Camera3DData } from '@/components/digital-twin/scene/CameraCoverage3D'
import {
  WhyRecommendationDialog,
  WhyDialogData,
} from '@/components/command-center/WhyRecommendationDialog'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'

export const DigitalTwinPage: React.FC = () => {
  const storeInfo = useAppStore((s) => s.storeInfo)

  // 9 Layer Toggles State
  const [layers, setLayers] = useState<TwinLayerState>({
    shopperPositions: true,
    shopperTrails: false,
    heatmap: false,
    shelfHealth: true,
    queueStatus: true,
    staff: true,
    incidents: true,
    cameraCoverage: false,
    productZones: true,
  })

  // Layer Popover Visibility State
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false)

  // Mode & Camera States
  const [mode, setMode] = useState<TwinMode>('LIVE')
  const [viewMode, setViewMode] = useState<TwinViewMode>('3D')
  const [resetTrigger, setResetTrigger] = useState(0)
  const [fitTrigger, setFitTrigger] = useState(0)

  // Replay timeline states
  const [isPlaying, setIsPlaying] = useState(false)
  const [replaySpeed, setReplaySpeed] = useState(1)
  const [replayProgress, setReplayProgress] = useState(35)

  // Selected Entity Drawers State
  const [selectedShelf, setSelectedShelf] = useState<Shelf3DData | null>(null)
  const [selectedCheckout, setSelectedCheckout] = useState<Checkout3DData | null>(null)
  const [selectedZone, setSelectedZone] = useState<Zone3DData | null>(null)
  const [selectedCamera, setSelectedCamera] = useState<Camera3DData | null>(null)

  // Explainability dialog state
  const [whyDialogData, setWhyDialogData] = useState<WhyDialogData | null>(null)
  const [isWhyDialogOpen, setIsWhyDialogOpen] = useState(false)

  // Replay playback timer loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (mode === 'REPLAY' && isPlaying) {
      interval = setInterval(() => {
        setReplayProgress((prev) => (prev >= 100 ? 0 : prev + 0.5 * replaySpeed))
      }, 200)
    }
    return () => clearInterval(interval)
  }, [mode, isPlaying, replaySpeed])

  const handleToggleLayer = (layerKey: keyof TwinLayerState) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }))
  }

  const handleEnableAllLayers = () => {
    setLayers({
      shopperPositions: true,
      shopperTrails: true,
      heatmap: true,
      shelfHealth: true,
      queueStatus: true,
      staff: true,
      incidents: true,
      cameraCoverage: true,
      productZones: true,
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
    })
  }

  const handleExplainCheckout = (checkout: Checkout3DData) => {
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
      confidence: '92% (QueueSense-TemporalEdge)',
      conclusion: 'Activate Standby Counter C3 & assign Associate Marcus Vance immediately',
      edgeModel: 'QueueSense-Temporal-v2.4 (Jetson TensorRT)',
    })
    setIsWhyDialogOpen(true)
  }

  const activeLayerCount = Object.values(layers).filter(Boolean).length

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] min-h-[640px] space-y-2 select-none">
      {/* Top Controls Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-white font-mono uppercase tracking-tight flex items-center gap-2">
            <Box className="h-4 w-4 text-cyan-400" />
            <span>3D Digital Twin</span>
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold">
            {storeInfo?.name || 'Store 01 — Chennai Central'}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Top Viewport Controls */}
        <TopViewportControls
          mode={mode}
          onModeChange={setMode}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onFitStore={() => setFitTrigger((t) => t + 1)}
          onResetCamera={() => setResetTrigger((t) => t + 1)}
        />
      </div>

      {/* Main 3D Viewport Area */}
      <div className="relative flex-1 w-full rounded-lg overflow-hidden border border-[#1E293B] shadow-inner bg-[#070A0F]">
        {/* Floating Layer Popover Button & Panel */}
        <div className="absolute top-3 left-3 z-20">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsLayerPanelOpen((prev) => !prev)}
            className="h-8 px-2.5 bg-[#090D14]/90 backdrop-blur-md border-[#1E293B] hover:bg-[#131D31] text-white text-xs font-mono flex items-center gap-1.5 shadow-xl"
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Layers</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
              {activeLayerCount}
            </span>
            <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isLayerPanelOpen ? 'rotate-180' : ''}`} />
          </Button>

          {isLayerPanelOpen && (
            <div className="mt-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <LayerControlPanel
                layers={layers}
                onToggleLayer={handleToggleLayer}
                onEnableAll={handleEnableAllLayers}
                onDisableAll={handleDisableAllLayers}
              />
            </div>
          )}
        </div>

        {/* 3D Canvas Viewport */}
        <DigitalTwinViewport
          layers={layers}
          viewMode={viewMode}
          resetTrigger={resetTrigger}
          fitTrigger={fitTrigger}
          replaySpeed={mode === 'REPLAY' ? replaySpeed : 1}
          onSelectShelf={(shelf) => setSelectedShelf(shelf)}
          onSelectCheckout={(checkout) => setSelectedCheckout(checkout)}
          onSelectZone={(zone) => setSelectedZone(zone)}
          onSelectCamera={(cam) => setSelectedCamera(cam)}
        />

        {/* Bottom Historical Replay Timeline Bar (if in REPLAY mode) */}
        {mode === 'REPLAY' && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-64 sm:right-6 z-10">
            <TimelineReplayBar
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              replaySpeed={replaySpeed}
              onChangeSpeed={setReplaySpeed}
              currentProgress={replayProgress}
              onSeek={setReplayProgress}
            />
          </div>
        )}
      </div>

      {/* Entity Inspection Drawers */}
      <TwinShelfDrawer
        shelf={selectedShelf}
        onClose={() => setSelectedShelf(null)}
      />

      <TwinCheckoutDrawer
        checkout={selectedCheckout}
        onClose={() => setSelectedCheckout(null)}
        onExplain={handleExplainCheckout}
      />

      <TwinZoneDrawer
        zone={selectedZone}
        onClose={() => setSelectedZone(null)}
      />

      <TwinCameraDrawer
        camera={selectedCamera}
        onClose={() => setSelectedCamera(null)}
      />

      {/* Decision Explainability Dialog */}
      <WhyRecommendationDialog
        data={whyDialogData}
        open={isWhyDialogOpen}
        onOpenChange={setIsWhyDialogOpen}
      />
    </div>
  )
}
