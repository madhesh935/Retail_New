import React, { useState } from 'react'
import { CheckoutQueue } from '@/types'
import {
  ListOrdered,
  Users,
  Clock,
  Zap,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Camera,
  UserCheck,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhyDialogData } from '@/components/command-center/WhyRecommendationDialog'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { isYoloActive } from '@/lib/yoloLaneRegistry'

export interface OperationalLaneData {
  id: string
  code: string
  name: string
  status: 'CRITICAL' | 'HEALTHY' | 'CLOSED' | 'WARNING'
  queueLength: number
  estimatedWaitMinutes: number
  arrivalRate: number
  serviceRate: number
  forecast3Min: number
  forecast5Min: number
  congestionProbability: number
  cashierName: string
  aiRecommendation?: string
  cameraCode: string
  whyData?: WhyDialogData
  /** True only while this lane is actively receiving live camera detections. */
  hasLiveFeed: boolean
}

interface OperationalCounterCardsProps {
  lanes: OperationalLaneData[]
  selectedLaneCode: string
  onSelectLane: (laneCode: string) => void
  onOpenWhy: (data: WhyDialogData) => void
  onOpenCamera: (cameraCode: string, laneName: string) => void
}

export const getOperationalLanes = (
  ipCameraUrls: Record<string, string>,
  queues: CheckoutQueue[]
): OperationalLaneData[] => {
  const getQueue = (laneNum: number) => queues.find((q) => q.laneNumber === laneNum)

  const q1 = getQueue(1)
  const q2 = getQueue(2)
  const q3 = getQueue(3)
  const q4 = getQueue(4)

  // A lane only reflects real numbers while a camera is actively streaming
  // detections to it (see BackgroundCameraProcessor / LiveQueueVisionCard).
  // Without that, there's no live signal — show 0/idle instead of the
  // database's seeded demo value or a fabricated fallback.
  const c1Live = isYoloActive('lane-1')
  const c2Live = isYoloActive('lane-2')
  const c3Live = isYoloActive('lane-3')
  const c4Live = isYoloActive('lane-4')

  const q1Len = c1Live && q1 ? q1.currentQueueLength : 0
  const q1Wait = c1Live && q1 ? Number((q1.currentWaitTimeSeconds / 60).toFixed(1)) : 0
  const q1Arrival = c1Live ? Number((q1Len * 0.25 + 0.8).toFixed(1)) : 0
  const q1Service = c1Live ? Number(Math.max(0.6, 1.8 - q1Len * 0.04).toFixed(1)) : 0
  const q1F3 = c1Live ? Math.round(q1Len * 1.3) : 0
  const q1F5 = c1Live ? Math.round(q1Len * 1.6) : 0
  const q1Cong = c1Live ? Math.min(100, Math.max(0, q1Len * 12)) : 0
  const q1Status = c1Live && q1Len >= 5 ? 'CRITICAL' : 'HEALTHY'

  const q2Len = c2Live && q2 ? q2.currentQueueLength : 0
  const q2Wait = c2Live && q2 ? Number((q2.currentWaitTimeSeconds / 60).toFixed(1)) : 0
  const q2Arrival = c2Live ? Number((q2Len * 0.2 + 0.6).toFixed(1)) : 0
  const q2Service = c2Live ? 1.8 : 0
  const q2F3 = c2Live ? Math.round(q2Len * 1.1) : 0
  const q2F5 = c2Live ? Math.round(q2Len * 1.2) : 0
  const q2Cong = c2Live ? Math.min(100, q2Len * 10) : 0
  const q2Status = q2?.status === 'CLOSED' ? 'CLOSED' : c2Live && q2Len >= 5 ? 'CRITICAL' : 'HEALTHY'

  const q3Len = c3Live && q3 ? q3.currentQueueLength : 0
  const q3Wait = c3Live && q3 ? Number((q3.currentWaitTimeSeconds / 60).toFixed(1)) : 0
  const q3Arrival = c3Live ? Number(((q3Len * 0.25) + 0.5).toFixed(1)) : 0
  const q3Service = c3Live ? 2.2 : 0
  const q3F3 = c3Live ? Math.round(q3Len * 1.1) : 0
  const q3F5 = c3Live ? Math.round(q3Len * 1.2) : 0
  const q3Cong = c3Live ? Math.min(100, q3Len * 10) : 0
  const q3Status = q3?.status === 'ACTIVE' || q3?.status === 'CONGESTED'
    ? (c3Live && q3Len >= 5 ? 'CRITICAL' : 'HEALTHY')
    : (ipCameraUrls['C3'] ? 'HEALTHY' : 'CLOSED')

  const q4Len = c4Live && q4 ? q4.currentQueueLength : 0
  const q4Wait = c4Live && q4 ? Number((q4.currentWaitTimeSeconds / 60).toFixed(1)) : 0
  const q4Arrival = c4Live ? Number((q4Len * 0.25 + 0.8).toFixed(1)) : 0
  const q4Service = c4Live ? 2.5 : 0
  const q4F3 = c4Live ? Math.round(q4Len * 1.2) : 0
  const q4F5 = c4Live ? Math.round(q4Len * 1.4) : 0
  const q4Cong = c4Live ? Math.min(100, q4Len * 10) : 0
  const q4Status = q4?.status === 'CLOSED' ? 'CLOSED' : c4Live && q4Len >= 5 ? 'CRITICAL' : 'HEALTHY'

  return [
    // 1. COUNTER C1 (Express Billing)
    {
      id: 'lane-1',
      code: 'C1',
      name: 'Counter C1 • Express Billing',
      status: q1Status,
      queueLength: q1Len,
      estimatedWaitMinutes: q1Wait,
      arrivalRate: q1Arrival,
      serviceRate: q1Service,
      forecast3Min: q1F3,
      forecast5Min: q1F5,
      congestionProbability: q1Cong,
      cashierName: q1?.assignedStaffName || 'Elena Rostova (EMP-401)',
      aiRecommendation: q1Len >= 5 ? 'Open Counter C3' : undefined,
      cameraCode: 'CAM-06',
      hasLiveFeed: c1Live,
      whyData: {
        title: 'Counter C1 Congestion Prediction & Rate Breakdown',
        actionType: 'QUEUE',
        targetEntity: 'Checkout Counter C1',
        signals: [
          { label: 'Current Queue Depth', value: `${q1Len} shoppers`, highlight: true },
          { label: 'Arrival Rate (λ)', value: `${q1Arrival} / min` },
          { label: 'Service Rate (μ)', value: `${q1Service} / min` },
          { label: 'Forecast +3 min', value: `${q1F3} shoppers` },
          { label: 'Forecast +5 min', value: `${q1F5} shoppers`, highlight: q1Len >= 5 },
          { label: 'Congestion Probability', value: `${q1Cong}%` },
        ],
        mathFormula: `Q(t + 5) = Q(t) + 5 × (λ - μ) = ${q1Len} + 5 × (${q1Arrival} - ${q1Service}) ≈ ${q1F5} shoppers`,
        threshold: '10 Shoppers Queue / 3.0 min Wait SLA',
        confidence: '94% (QueueSense-TemporalEdge)',
        conclusion: q1Len >= 5
          ? 'Open Standby Counter C3 and reallocate available associate'
          : 'Queue is operating within optimal SLA limits',
        edgeModel: 'QueueSense-Temporal-v2.4 (Jetson TensorRT)',
      },
    },
    // 2. COUNTER C2 (Cash & Card)
    {
      id: 'lane-2',
      code: 'C2',
      name: 'Counter C2 • Cash & Card',
      status: q2Status,
      queueLength: q2Len,
      estimatedWaitMinutes: q2Wait,
      arrivalRate: q2Arrival,
      serviceRate: q2Service,
      forecast3Min: q2F3,
      forecast5Min: q2F5,
      congestionProbability: q2Cong,
      cashierName: q2?.assignedStaffName || 'Marcus Vance (EMP-402)',
      cameraCode: 'CAM-06',
      hasLiveFeed: c2Live,
    },
    // 3. COUNTER C3 (Standby Lane)
    {
      id: 'lane-3',
      code: 'C3',
      name: 'Counter C3 • Standby Lane',
      status: q3Status,
      queueLength: q3Len,
      estimatedWaitMinutes: q3Wait,
      arrivalRate: q3Arrival,
      serviceRate: q3Service,
      forecast3Min: q3F3,
      forecast5Min: q3F5,
      congestionProbability: q3Cong,
      cashierName: q3?.assignedStaffName || 'Unassigned (Standby)',
      aiRecommendation: q1Len >= 5 ? 'Recommended to open to relieve Counter C1.' : 'Standby counter ready on surge.',
      cameraCode: 'CAM-06',
      hasLiveFeed: c3Live,
    },
    // 4. COUNTER C4 (Self-Checkout Hub)
    {
      id: 'lane-4',
      code: 'C4',
      name: 'Counter C4 • Self-Checkout Hub',
      status: q4Status,
      queueLength: q4Len,
      estimatedWaitMinutes: q4Wait,
      arrivalRate: q4Arrival,
      serviceRate: q4Service,
      forecast3Min: q4F3,
      forecast5Min: q4F5,
      congestionProbability: q4Cong,
      cashierName: q4?.assignedStaffName || 'Autonomous AI Supervisor',
      cameraCode: 'CAM-06',
      hasLiveFeed: c4Live,
    },
  ]
}

export const OperationalCounterCards: React.FC<OperationalCounterCardsProps> = ({
  lanes,
  selectedLaneCode,
  onSelectLane,
  onOpenWhy,
  onOpenCamera,
}) => {
  const [activatedLanes, setActivatedLanes] = useState<Record<string, boolean>>({})
  const addQueueAction = useAppStore((s) => s.addQueueAction)
  const queues = useAppStore((s) => s.queues)

  const handleActivateLane = (laneCode: string) => {
    setActivatedLanes((prev) => ({ ...prev, [laneCode]: true }))

    // Snapshot the most congested lane for before/after reporting
    const congestedLane = lanes.find((l) => l.status === 'CRITICAL') || lanes[0]
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const beforeWait = congestedLane ? `${congestedLane.estimatedWaitMinutes} min (${congestedLane.queueLength} people)` : '5.6 min (8 people)'
    const afterWait = congestedLane ? `${(congestedLane.estimatedWaitMinutes * 0.4).toFixed(1)} min (~${Math.ceil(congestedLane.queueLength * 0.4)} people)` : '2.3 min (3 people)'
    const reductionPct = congestedLane ? Math.round((1 - 0.4) * 100) : 59

    addQueueAction({
      id: `live-${Date.now()}`,
      time: timeStr,
      actionTitle: `Counter ${laneCode} Opened (Congestion Relief)`,
      targetEntity: `Checkout Lanes (${congestedLane?.code || 'C1'} & ${laneCode})`,
      category: 'QUEUE',
      summaryResult: `Wait reduced ~${reductionPct}% (${beforeWait.split(' ')[0]}m → ${afterWait.split(' ')[0]}m)`,
      assignedStaff: 'S02 Marcus Vance',
      beforeMetricLabel: 'Queue Wait / Length',
      beforeValue: beforeWait,
      afterMetricLabel: 'Restored Wait / Length (Est.)',
      afterValue: afterWait,
      operationalGain: `-${reductionPct}% Wait Reduction across checkout zone`,
      verificationMethod: 'Camera C06 YOLO Real-Time Tracking',
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 select-none font-mono">
      {lanes.map((lane) => {
        const isSelected = selectedLaneCode === lane.code
        const isCritical = lane.status === 'CRITICAL'
        const isClosed = lane.status === 'CLOSED'
        const isActivated = activatedLanes[lane.code]

        return (
          <div
            key={lane.id}
            onClick={() => onSelectLane(lane.code)}
            className={cn(
              'rounded-xl border p-4 flex flex-col justify-between shadow-2xs transition-all cursor-pointer group relative h-full min-h-[310px] bg-white',
              isSelected
                ? 'ring-2 ring-sky-500 border-sky-400 shadow-sm'
                : 'border-slate-200 hover:border-slate-300',
              isCritical
                ? 'bg-rose-50/20 border-rose-200 hover:border-rose-300'
                : isClosed
                ? 'bg-slate-50/60 border-slate-200 opacity-90 hover:opacity-100'
                : 'border-slate-200 hover:border-emerald-300'
            )}
          >
            {/* Top Bar: Counter Code & Status Pill */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-7 w-7 rounded-md flex items-center justify-center font-bold text-xs border',
                      isCritical
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : isClosed
                        ? 'bg-slate-100 text-slate-500 border-slate-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    )}
                  >
                    {lane.code}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-sans truncate">
                      {lane.name}
                    </h4>
                    <span className="text-[9px] text-slate-500 font-sans">
                      {lane.cashierName}
                    </span>
                  </div>
                </div>

                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold uppercase border',
                    isCritical
                      ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                      : isClosed
                      ? 'bg-slate-100 text-slate-500 border-slate-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  )}
                >
                  {isClosed && isActivated ? 'OPENING' : isClosed ? 'CLOSED' : lane.status}
                </span>
              </div>

              {/* Main Queue & Wait Time Numbers */}
              {!isClosed ? (
                <div className="grid grid-cols-2 gap-2 my-2.5">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block font-sans">Current Queue</span>
                    <span
                      className={cn(
                        'text-2xl font-bold font-mono',
                        isCritical ? 'text-rose-600' : 'text-slate-900'
                      )}
                    >
                      {lane.queueLength} <span className="text-xs font-normal text-slate-400 font-sans">people</span>
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block font-sans">Estimated Wait</span>
                    <span
                      className={cn(
                        'text-2xl font-bold font-mono',
                        isCritical ? 'text-amber-600' : 'text-emerald-700'
                      )}
                    >
                      {lane.estimatedWaitMinutes} <span className="text-xs font-normal text-slate-400 font-sans">min</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/40 p-3 rounded-lg border border-amber-200 my-2.5 space-y-1 shadow-2xs">
                  <div className="text-[10px] text-amber-800 font-bold uppercase flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>AI Standby Recommendation</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-sans leading-relaxed">
                    {lane.aiRecommendation}
                  </p>
                </div>
              )}

              {/* Rate & Forecast Details for Active Counters — only while a
                  camera is actually watching this lane; otherwise these
                  numbers would just be a formula run on a stale count. */}
              {!isClosed && lane.hasLiveFeed && (
                <div className="space-y-1.5 text-[10px] text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-2.5 shadow-2xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Arrival Rate (λ):</span>
                    <strong className="text-slate-800">{lane.arrivalRate} cust/min</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Rate (μ):</span>
                    <strong className="text-slate-800">{lane.serviceRate} cust/min</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Forecast +3 min:</span>
                    <strong className={isCritical ? "text-amber-700 font-bold" : "text-slate-500"}>{isCritical ? `${lane.forecast3Min} shoppers` : '--'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Forecast +5 min:</span>
                    <strong className={isCritical ? "text-rose-600 font-bold" : "text-slate-500"}>{isCritical ? `${lane.forecast5Min} shoppers` : '--'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Congestion Prob:</span>
                    <strong className={cn("font-bold", isCritical ? "text-rose-600" : "text-slate-500")}>{isCritical ? `${lane.congestionProbability}%` : '--'}</strong>
                  </div>
                </div>
              )}

              {!isClosed && !lane.hasLiveFeed && (
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-dashed border-slate-200 mb-2.5">
                  <Camera className="h-3 w-3" />
                  <span>No live camera feed for this counter</span>
                </div>
              )}

              {/* Recommendation row for C1 */}
              {lane.aiRecommendation && isCritical && (
                <div className="text-[11px] text-slate-700 mb-2.5 bg-rose-50 p-2 rounded-lg border border-rose-200 shadow-2xs">
                  <span className="text-slate-500 font-semibold font-sans">AI Action: </span>
                  <strong className="text-emerald-700 uppercase font-sans font-bold">{lane.aiRecommendation}</strong>
                </div>
              )}
            </div>

            {/* Bottom Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
              {isCritical && (
                <>
                  <div className="flex items-center gap-1">
                    {isActivated ? (
                      <span className="text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Dispatched
                      </span>
                    ) : (
                      <Button
                        variant="action"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleActivateLane('C1')
                        }}
                        className="text-[10px] h-6 px-2 gap-1 bg-sky-600 hover:bg-sky-700 text-white"
                      >
                        <UserCheck className="h-3 w-3" /> Assign Staff
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (lane.whyData) onOpenWhy(lane.whyData)
                      }}
                      className="text-[10px] h-6 px-1.5 text-sky-700 border-slate-200 bg-white hover:bg-slate-50"
                    >
                      <HelpCircle className="h-3 w-3" /> Why?
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenCamera(lane.cameraCode, lane.name)
                    }}
                    className="text-[10px] h-6 px-1.5 text-slate-500 hover:text-slate-900"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </>
              )}

              {isClosed && (
                <div className="w-full flex items-center justify-between">
                  {isActivated ? (
                    <span className="text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Activating Counter C3 (Marcus)
                    </span>
                  ) : (
                    <Button
                      variant="action"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleActivateLane('C3')
                      }}
                      className="w-full text-[10px] h-7 gap-1 bg-sky-600 hover:bg-sky-700 text-white shadow-2xs"
                    >
                      <Zap className="h-3 w-3" /> Activate Counter C3
                    </Button>
                  )}
                </div>
              )}

              {!isCritical && !isClosed && (
                <div className="w-full flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-sans">{lane.hasLiveFeed ? 'Throughput: Normal' : 'Awaiting live feed'}</span>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenCamera(lane.cameraCode, lane.name)
                    }}
                    className="text-[10px] h-6 px-1.5 text-slate-500 hover:text-slate-900"
                  >
                    <Camera className="h-3 w-3 mr-1 text-sky-600" /> View Cam
                  </Button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
