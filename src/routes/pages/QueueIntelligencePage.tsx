import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ListOrdered,
  Clock,
  Zap,
  Sparkles,
  Radio,
  Camera,
  Users,
  BellRing,
  X,
  Compass,
} from 'lucide-react'
import { QueueKpiRow } from '@/components/queue-intelligence/QueueKpiRow'
import {
  OperationalCounterCards,
  getOperationalLanes,
} from '@/components/queue-intelligence/OperationalCounterCards'
import { LiveQueueVisionCard } from '@/components/queue-intelligence/LiveQueueVisionCard'
import { BackgroundCameraProcessor } from '@/components/queue-intelligence/BackgroundCameraProcessor'
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
import { Button } from '@/components/ui/button'

export const QueueIntelligencePage: React.FC = () => {
  const navigate = useNavigate()
  const storeInfo = useAppStore((s) => s.storeInfo)
  const ipCameraUrls = useAppStore((s) => s.ipCameraUrls)
  const queues = useAppStore((s) => s.queues)

  const dynamicLanes = React.useMemo(() => getOperationalLanes(ipCameraUrls, queues), [ipCameraUrls, queues])

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
    dynamicLanes.find((l) => l.code === selectedLaneCode) || dynamicLanes[0]

  // Queue Recommendation Notification Logic
  const [notification, setNotification] = useState<{ message: string, timestamp: number } | null>(null)

  useEffect(() => {
    const congestedLanes = dynamicLanes.filter(l => l.status !== 'CLOSED' && l.queueLength >= 5).sort((a, b) => b.queueLength - a.queueLength)
    const availableLanes = dynamicLanes.filter(l => l.status !== 'CLOSED' && l.queueLength <= 2).sort((a, b) => a.queueLength - b.queueLength)

    if (congestedLanes.length > 0 && availableLanes.length > 0) {
      const congested = congestedLanes[0]
      const available = availableLanes[0]
      
      if (congested.queueLength - available.queueLength >= 3) {
        const moveCount = Math.floor((congested.queueLength - available.queueLength) / 2)
        const congestedName = congested.name.split(' •')[0] || congested.code
        const availableName = available.name.split(' •')[0] || available.code
        const newMessage = `Move ${moveCount} customers from ${congestedName} to ${availableName} to minimize the queue time.`
        
        setNotification(prev => {
          if (prev && prev.message === newMessage && (Date.now() - prev.timestamp < 15000)) {
            return prev
          }
          return { message: newMessage, timestamp: Date.now() }
        })
      }
    }
  }, [dynamicLanes])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 8000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  return (
    <div className="space-y-4 select-none font-mono">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 font-sans">
            <ListOrdered className="h-4 w-4 text-sky-600" />
            <span>Queue Intelligence</span>
          </h1>
        </div>
      </div>

      {/* 1. Exactly 5 Top KPI Cards */}
      <QueueKpiRow />

      {/* 2. Large Operational Counter Cards (C1 Critical, C2 Healthy, C3 Closed, C4 Self) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
            Operational Checkout Registers (C1 — C4)
          </div>
          <Button
            variant="outline"
            size="xs"
            className="h-7 text-[11px] gap-1 border-slate-200 font-sans"
            onClick={() => {
              const laneId =
                selectedLaneCode === 'C1'
                  ? 'lane-1'
                  : selectedLaneCode === 'C2'
                    ? 'lane-2'
                    : selectedLaneCode === 'C3'
                      ? 'lane-3'
                      : 'lane-4'
              navigate(`/digital-twin?lane=${laneId}`)
            }}
          >
            <Compass className="h-3 w-3 text-teal-700" />
            Show {selectedLaneCode} on Twin
          </Button>
        </div>
        <OperationalCounterCards
          lanes={dynamicLanes}
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
          <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-full font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-amber-50 border border-amber-200 text-amber-600">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
                    Queue Length Progression Forecast (Now → +10m)
                  </h3>
                </div>
              </div>

              <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 animate-pulse">
                Threshold: 10
              </span>
            </div>

            <div className="my-1 flex-1 flex items-center">
              <QueueForecastChart threshold={10} activeLane={activeLane} />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
              <span className="text-rose-600 font-bold">Unmitigated Queue reaches {activeLane.forecast5Min} at +5m</span>
              <span className="text-emerald-700 font-bold">Mitigated: {Math.max(0, activeLane.forecast5Min - 8)} shoppers</span>
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

      {/* Background Processors for inactive cameras */}
      {Object.entries(ipCameraUrls).map(([code, url]) => {
        // Run background processor if it has a URL OR if it's the main laptop webcam (C1)
        if (code !== activeLane.code && (url || code === 'C1')) {
          return <BackgroundCameraProcessor key={`bg-cam-${code}`} laneCode={code} ipUrl={url} />
        }
        return null
      })}

      {/* Dynamic Recommendation Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 bg-white border border-sky-200 shadow-xl rounded-xl p-4 z-50 flex items-start gap-3 max-w-sm"
          >
            <div className="bg-sky-50 p-2 rounded-full border border-sky-200 text-sky-600 shrink-0 mt-0.5">
              <BellRing className="h-4 w-4" />
            </div>
            <div className="flex-1 pr-2">
              <h4 className="text-sky-700 font-bold text-[10px] uppercase tracking-wider mb-1">Queue Intelligence Alert</h4>
              <p className="text-slate-800 text-xs font-sans leading-relaxed">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
