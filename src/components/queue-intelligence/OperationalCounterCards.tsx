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
  const getQueue = (laneNum: number) => queues.find(q => q.laneNumber === laneNum)
  
  const q1 = getQueue(1)
  const q2 = getQueue(2)
  const q3 = getQueue(3)
  const q4 = getQueue(4)

  return [
  // 1. COUNTER C1 (CRITICAL)
  {
    id: 'lane-1',
    code: 'C1',
    name: 'Counter C1 • Express Billing',
    status: q1?.status === 'CONGESTED' ? 'CRITICAL' : 'HEALTHY',
    queueLength: q1?.currentQueueLength || 0,
    estimatedWaitMinutes: q1 ? Number((q1.currentWaitTimeSeconds / 60).toFixed(1)) : 0,
    arrivalRate: q1 ? Number(((q1.currentQueueLength * 0.25) + (q1.processingRateItemsPerMinute * 0.05)).toFixed(1)) : 2.8,
    serviceRate: q1 ? Number(((q1.processingRateItemsPerMinute * 0.08) - (q1.currentQueueLength * 0.05)).toFixed(1)) : 1.5,
    forecast3Min: q1 ? Math.round(q1.currentQueueLength + (q1.currentQueueLength * 0.3)) : 10,
    forecast5Min: q1 ? Math.round(q1.currentQueueLength + (q1.currentQueueLength * 0.6)) : 13,
    congestionProbability: q1 ? Math.min(100, Math.max(15, q1.currentQueueLength * 12)) : 15,
    cashierName: q1?.assignedStaffName || 'Elena Rostova (EMP-401)',
    aiRecommendation: 'Open Counter C3',
    cameraCode: 'CAM-06',
    whyData: {
      title: 'Counter C1 Congestion Prediction & Rate Breakdown',
      actionType: 'QUEUE',
      targetEntity: 'Checkout Counter C1',
      signals: [
        { label: 'Current Queue Depth', value: '8 shoppers', highlight: true },
        { label: 'Arrival Rate (Î»)', value: '2.8 / min' },
        { label: 'Service Rate (Î¼)', value: '1.5 / min' },
        { label: 'Forecast +3 min', value: '10 shoppers' },
        { label: 'Forecast +5 min', value: '13 shoppers', highlight: true },
        { label: 'Congestion Probability', value: '92%' },
      ],
      mathFormula: 'Q(t + 5) = Q(t) + 5 × (Î» - Î¼) = 8 + 5 × (2.8 - 1.5) = 14.5 ≈ 13 shoppers',
      threshold: '10 Shoppers Queue / 3.0 min Wait SLA',
      confidence: '92% (QueueSense-TemporalEdge)',
      conclusion: 'Open Standby Counter C3 and reallocate Marcus Vance (EMP-402)',
      edgeModel: 'QueueSense-Temporal-v2.4 (Jetson TensorRT)',
    },
  },
  // 2. COUNTER C2 (HEALTHY)
  {
    id: 'lane-2',
    code: 'C2',
    name: 'Counter C2 • Cash & Card',
    status: ipCameraUrls['C2'] ? (q2?.status === 'CONGESTED' ? 'CRITICAL' : 'HEALTHY') : 'CLOSED',
    queueLength: ipCameraUrls['C2'] ? (q2?.currentQueueLength || 0) : 0,
    estimatedWaitMinutes: ipCameraUrls['C2'] ? (q2 ? Number((q2.currentWaitTimeSeconds / 60).toFixed(1)) : 0) : 0,
    arrivalRate: q2 ? Number(((q2.currentQueueLength * 0.25) + (q2.processingRateItemsPerMinute * 0.05)).toFixed(1)) : 1.2,
    serviceRate: q2 ? Number(((q2.processingRateItemsPerMinute * 0.08) - (q2.currentQueueLength * 0.05)).toFixed(1)) : 1.8,
    forecast3Min: q2 ? Math.round(q2.currentQueueLength + (q2.currentQueueLength * 0.3)) : 3,
    forecast5Min: q2 ? Math.round(q2.currentQueueLength + (q2.currentQueueLength * 0.6)) : 3,
    congestionProbability: q2 ? Math.min(100, Math.max(12, q2.currentQueueLength * 12)) : 12,
    cashierName: q2?.assignedStaffName || 'Marcus Vance (EMP-402)',
    cameraCode: 'CAM-06',
  },
  // 3. COUNTER C3 (CLOSED / STANDBY)
  {
    id: 'lane-3',
    code: 'C3',
    name: 'Counter C3 • Standby Lane',
    status: ipCameraUrls['C3'] ? (q3?.status === 'CONGESTED' ? 'CRITICAL' : 'HEALTHY') : 'CLOSED',
    queueLength: ipCameraUrls['C3'] ? (q3?.currentQueueLength || 0) : 0,
    estimatedWaitMinutes: ipCameraUrls['C3'] ? (q3 ? Number((q3.currentWaitTimeSeconds / 60).toFixed(1)) : 0) : 0,
    arrivalRate: q3 ? Number(((q3.currentQueueLength * 0.25) + (q3.processingRateItemsPerMinute * 0.05)).toFixed(1)) : 0,
    serviceRate: q3 ? Number(((q3.processingRateItemsPerMinute * 0.08) - (q3.currentQueueLength * 0.05)).toFixed(1)) : 2.2,
    forecast3Min: q3 ? Math.round(q3.currentQueueLength + (q3.currentQueueLength * 0.3)) : 0,
    forecast5Min: q3 ? Math.round(q3.currentQueueLength + (q3.currentQueueLength * 0.6)) : 0,
    congestionProbability: q3 ? Math.min(100, Math.max(0, q3.currentQueueLength * 12)) : 0,
    cashierName: q3?.assignedStaffName || 'Unassigned (Standby)',
    aiRecommendation: 'Recommended to open within approximately 2 minutes.',
    cameraCode: 'CAM-06',
  },
  // 4. COUNTER C4 (SELF-CHECKOUT 1-4)
  {
    id: 'lane-4',
    code: 'C4',
    name: 'Counter C4 • Self-Checkout Hub',
    status: ipCameraUrls['C4'] ? (q4?.status === 'CONGESTED' ? 'CRITICAL' : 'HEALTHY') : 'CLOSED',
    queueLength: ipCameraUrls['C4'] ? (q4?.currentQueueLength || 0) : 0,
    estimatedWaitMinutes: ipCameraUrls['C4'] ? (q4 ? Number((q4.currentWaitTimeSeconds / 60).toFixed(1)) : 0) : 0,
    arrivalRate: q4 ? Number(((q4.currentQueueLength * 0.25) + (q4.processingRateItemsPerMinute * 0.05)).toFixed(1)) : 1.8,
    serviceRate: q4 ? Number(((q4.processingRateItemsPerMinute * 0.08) - (q4.currentQueueLength * 0.05)).toFixed(1)) : 2.5,
    forecast3Min: q4 ? Math.round(q4.currentQueueLength + (q4.currentQueueLength * 0.3)) : 5,
    forecast5Min: q4 ? Math.round(q4.currentQueueLength + (q4.currentQueueLength * 0.6)) : 6,
    congestionProbability: q4 ? Math.min(100, Math.max(18, q4.currentQueueLength * 12)) : 18,
    cashierName: q4?.assignedStaffName || 'Autonomous AI Supervisor',
    cameraCode: 'CAM-06',
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

  const handleActivateLane = (laneCode: string) => {
    setActivatedLanes((prev) => ({ ...prev, [laneCode]: true }))
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
              'rounded-lg border p-4 flex flex-col justify-between shadow-sm transition-all cursor-pointer group relative h-full min-h-[310px]',
              isSelected
                ? 'ring-2 ring-cyan-400 shadow-md'
                : '',
              isCritical
                ? 'bg-rose-950/25 border-rose-500/70 hover:border-rose-400'
                : isClosed
                ? 'bg-[#090D14] border-[#1E293B] opacity-85 hover:opacity-100'
                : 'bg-[#0F172A] border-emerald-500/40 hover:border-emerald-500/70'
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
                        ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                        : isClosed
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                    )}
                  >
                    {lane.code}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-sans truncate">
                      {lane.name}
                    </h4>
                    <span className="text-[9px] text-slate-400">
                      {lane.cashierName}
                    </span>
                  </div>
                </div>

                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold uppercase border',
                    isCritical
                      ? 'bg-rose-950 text-rose-300 border-rose-500/70 animate-pulse'
                      : isClosed
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                  )}
                >
                  {isClosed && isActivated ? 'OPENING' : isClosed ? 'CLOSED' : lane.status}
                </span>
              </div>

              {/* Main Queue & Wait Time Numbers */}
              {!isClosed ? (
                <div className="grid grid-cols-2 gap-2 my-2.5">
                  <div className="bg-[#090D14] p-2.5 rounded border border-[#1E293B]">
                    <span className="text-[10px] text-slate-500 block">Current Queue</span>
                    <span
                      className={cn(
                        'text-2xl font-bold font-mono',
                        isCritical ? 'text-rose-400' : 'text-white'
                      )}
                    >
                      {lane.queueLength} <span className="text-xs font-normal text-slate-400">people</span>
                    </span>
                  </div>

                  <div className="bg-[#090D14] p-2.5 rounded border border-[#1E293B]">
                    <span className="text-[10px] text-slate-500 block">Estimated Wait</span>
                    <span
                      className={cn(
                        'text-2xl font-bold font-mono',
                        isCritical ? 'text-amber-400' : 'text-emerald-400'
                      )}
                    >
                      {lane.estimatedWaitMinutes} <span className="text-xs font-normal text-slate-400">min</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#090D14] p-3 rounded border border-amber-500/40 my-2.5 space-y-1">
                  <div className="text-[10px] text-amber-300 font-bold uppercase flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>AI Standby Recommendation</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {lane.aiRecommendation}
                  </p>
                </div>
              )}

              {/* Rate & Forecast Details for Active Counters */}
              {!isClosed && (
                <div className="space-y-1.5 text-[10px] text-slate-300 bg-[#090D14] p-2.5 rounded border border-[#1E293B] mb-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Arrival Rate (Î»):</span>
                    <strong>{lane.arrivalRate} cust/min</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Rate (Î¼):</span>
                    <strong>{lane.serviceRate} cust/min</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#1E293B]">
                    <span className="text-slate-500">Forecast +3 min:</span>
                    <strong className={isCritical ? "text-amber-400" : "text-slate-400"}>{isCritical ? `${lane.forecast3Min} shoppers` : '--'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Forecast +5 min:</span>
                    <strong className={isCritical ? "text-rose-400" : "text-slate-400"}>{isCritical ? `${lane.forecast5Min} shoppers` : '--'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Congestion Prob:</span>
                    <strong className={cn("font-bold", isCritical ? "text-rose-400" : "text-slate-400")}>{isCritical ? `${lane.congestionProbability}%` : '--'}</strong>
                  </div>
                </div>
              )}

              {/* Recommendation row for C1 */}
              {lane.aiRecommendation && isCritical && (
                <div className="text-[11px] text-slate-300 mb-2.5 bg-rose-950/40 p-2 rounded border border-rose-500/40">
                  <span className="text-slate-400 font-semibold">AI Action: </span>
                  <strong className="text-emerald-400 uppercase">{lane.aiRecommendation}</strong>
                </div>
              )}
            </div>

            {/* Bottom Action Buttons */}
            <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between gap-1.5 flex-wrap">
              {isCritical && (
                <>
                  <div className="flex items-center gap-1">
                    {isActivated ? (
                      <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
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
                        className="text-[10px] h-6 px-2 gap-1"
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
                      className="text-[10px] h-6 px-1.5 text-cyan-400 border-cyan-500/40 hover:bg-cyan-950"
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
                    className="text-[10px] h-6 px-1.5 text-slate-400 hover:text-white"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </>
              )}

              {isClosed && (
                <div className="w-full flex items-center justify-between">
                  {isActivated ? (
                    <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
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
                      className="w-full text-[10px] h-7 gap-1"
                    >
                      <Zap className="h-3 w-3" /> Activate Counter C3
                    </Button>
                  )}
                </div>
              )}

              {!isCritical && !isClosed && (
                <div className="w-full flex items-center justify-between text-[10px] text-slate-400">
                  <span>Throughput: Normal</span>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenCamera(lane.cameraCode, lane.name)
                    }}
                    className="text-[10px] h-6 px-1.5 text-slate-400 hover:text-white"
                  >
                    <Camera className="h-3 w-3 mr-1 text-cyan-400" /> View Cam
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
