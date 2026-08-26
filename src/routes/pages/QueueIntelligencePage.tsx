import React, { useState } from 'react'
import {
  ListOrdered,
  Clock,
  Zap,
  Sparkles,
  Radio,
  Camera,
  Users,
} from 'lucide-react'
import { QueueKpiRow } from '@/components/queue-intelligence/QueueKpiRow'
import {
  OperationalCounterCards,
  OPERATIONAL_LANES,
} from '@/components/queue-intelligence/OperationalCounterCards'
import { LiveQueueVisionCard } from '@/components/queue-intelligence/LiveQueueVisionCard'
import { QueueForecastChart } from '@/components/queue-intelligence/QueueForecastChart'
import { WaitTimeTrendCard } from '@/components/queue-intelligence/WaitTimeTrendCard'
import { CounterThroughputCard } from '@/components/queue-intelligence/CounterThroughputCard'
import { AiActionImpactCard } from '@/components/queue-intelligence/AiActionImpactCard'
import {
  WhyRecommendationDialog,
  WhyDialogData,
} from '@/components/command-center/WhyRecommendationDialog'
import { ZoneCameraDrawer } from '@/components/shopper-analytics/ZoneCameraDrawer'
import { useAppStore } from '@/store/useAppStore'

export const QueueIntelligencePage: React.FC = () => {
  const storeInfo = useAppStore((s) => s.storeInfo)

  // Selected lane for deep camera / ROI inspection (defaults to C1)
  const [selectedLaneCode, setSelectedLaneCode] = useState<string>('C1')

  // Camera drawer state
  const [selectedCameraCode, setSelectedCameraCode] = useState<string | null>(null)
  const [selectedLaneName, setSelectedLaneName] = useState<string | null>(null)

  // Explainability "Why?" dialog state
  const [whyDialogData, setWhyDialogData] = useState<WhyDialogData | null>(null)
  const [isWhyDialogOpen, setIsWhyDialogOpen] = useState(false)

  const handleOpenWhy = (data: WhyDialogData) => {
    setWhyDialogData(data)
    setIsWhyDialogOpen(true)
  }

  const handleOpenCamera = (cameraCode: string, laneName: string) => {
    setSelectedCameraCode(cameraCode)
    setSelectedLaneName(laneName)
  }

  const activeLane =
    OPERATIONAL_LANES.find((l) => l.code === selectedLaneCode) || OPERATIONAL_LANES[0]

  return (
    <div className="space-y-4 select-none font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-cyan-400" />
              <span>Queue Intelligence</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-medium">
              QueueSense Live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 bg-[#0F172A] px-2.5 py-1 rounded border border-[#1E293B]">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span>Temporal Sync: <strong>1.5s Interval</strong></span>
          </div>
        </div>
      </div>

      {/* 1. Exactly 5 Top KPI Cards */}
      <QueueKpiRow />

      {/* 2. Large Operational Counter Cards (C1 Critical, C2 Healthy, C3 Closed, C4 Self) */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Operational Checkout Registers (C1 — C4)
        </div>
        <OperationalCounterCards
          selectedLaneCode={selectedLaneCode}
          onSelectLane={(code) => setSelectedLaneCode(code)}
          onOpenWhy={handleOpenWhy}
          onOpenCamera={handleOpenCamera}
        />
      </div>

      {/* 3. Live RTSP Camera AI Vision Overlay (Left) & Queue Forecast Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-6 flex flex-col">
          <LiveQueueVisionCard
            laneCode={activeLane.code}
            laneName={activeLane.name}
            queueCount={activeLane.queueLength}
            waitTime={`${activeLane.estimatedWaitMinutes} min`}
          />
        </div>

        <div className="lg:col-span-6 flex flex-col">
          <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none h-full">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-amber-950 border border-amber-500/40 text-amber-400">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Queue Length Progression Forecast (Now → +10m)
                  </h3>
                </div>
              </div>

              <span className="text-[10px] text-rose-400 font-bold bg-rose-950 px-2 py-0.5 rounded border border-rose-500/40 animate-pulse">
                Threshold: 10
              </span>
            </div>

            <div className="my-1 flex-1 flex items-center">
              <QueueForecastChart threshold={10} />
            </div>

            <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-400">
              <span className="text-rose-400 font-bold">Unmitigated Queue reaches 13 at +5m</span>
              <span className="text-emerald-400 font-bold">Mitigated: 5 shoppers</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Analytics Grid: Wait Time Trends (Col 1), Counter Throughput (Col 2), AI Action Impact (Col 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 items-stretch">
        <WaitTimeTrendCard />
        <CounterThroughputCard />
        <AiActionImpactCard />
      </div>

      {/* Explainability Dialog */}
      <WhyRecommendationDialog
        data={whyDialogData}
        open={isWhyDialogOpen}
        onOpenChange={setIsWhyDialogOpen}
      />

      {/* Slide-over RTSP Camera Drawer */}
      <ZoneCameraDrawer
        cameraCode={selectedCameraCode}
        zoneName={selectedLaneName}
        onClose={() => {
          setSelectedCameraCode(null)
          setSelectedLaneName(null)
        }}
      />
    </div>
  )
}
