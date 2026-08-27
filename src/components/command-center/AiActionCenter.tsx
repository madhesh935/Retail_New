import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  CheckCircle2,
  HelpCircle,
  UserCheck,
  PackageCheck,
  Eye,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhyDialogData } from './WhyRecommendationDialog'
import { SelectedEntity } from './StoreMapDigitalTwin'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

interface AiActionCenterProps {
  onOpenWhy: (data: WhyDialogData) => void
  onViewEntity: (entity: SelectedEntity) => void
}

export const AiActionCenter: React.FC<AiActionCenterProps> = ({
  onOpenWhy,
  onViewEntity,
}) => {
  const navigate = useNavigate()
  const [dispatchedActions, setDispatchedActions] = useState<Record<string, boolean>>({})

  // ── Live queue data from YOLO model via Zustand store ──────────────────────
  const queues = useAppStore((s) => s.queues)
  const activeQueues = Array.isArray(queues) ? queues.filter((l) => l.status !== 'CLOSED' && l.status !== 'STANDBY') : []
  const congestedLane = activeQueues.reduce(
    (prev, curr) => (curr.currentQueueLength > (prev?.currentQueueLength || 0) ? curr : prev),
    activeQueues[0] || null
  )

  const liveQ = congestedLane?.currentQueueLength || 8
  const liveWaitMin = congestedLane ? (congestedLane.currentWaitTimeSeconds / 60).toFixed(1) : '5.4'
  const liveForecast5 = congestedLane ? Math.round(liveQ + liveQ * 0.6) : 13
  const liveArrivalRate = congestedLane
    ? Number(((congestedLane.currentQueueLength * 0.25) + (congestedLane.processingRateItemsPerMinute * 0.05)).toFixed(1))
    : 2.8
  const liveServiceRate = congestedLane
    ? Number(((congestedLane.processingRateItemsPerMinute * 0.08) - (congestedLane.currentQueueLength * 0.05)).toFixed(1))
    : 1.5
  const liveCongestedCode = congestedLane ? `C${congestedLane.laneNumber}` : 'C1'
  const congestionPct = congestedLane ? Math.min(99, Math.max(15, liveQ * 12)) : 92
  const isCongested = liveQ >= 5

  const handleActionDispatch = (actionKey: string) => {
    setDispatchedActions((prev) => ({ ...prev, [actionKey]: true }))
  }

  // ACTION 1 WHY DATA (Queue) — built from live metrics
  const queueWhyData: WhyDialogData = {
    title: `Checkout Congestion (Counter ${liveCongestedCode})`,
    actionType: 'QUEUE',
    targetEntity: `Counter ${liveCongestedCode}`,
    signals: [
      { label: 'Current Queue', value: `${liveQ} shoppers`, highlight: true },
      { label: 'Arrival Rate (λ)', value: `${liveArrivalRate} / min` },
      { label: 'Service Rate (μ)', value: `${liveServiceRate} / min` },
      { label: 'Predicted +5min', value: `${liveForecast5} shoppers`, highlight: true },
      { label: 'Wait Time Forecast', value: `${liveWaitMin} min` },
      { label: 'Congestion Probability', value: `${congestionPct}%` },
    ],
    mathFormula: `Q(t + 5) = Q(t) + 5 × (λ - μ) = ${liveQ} + 5 × (${liveArrivalRate} - ${liveServiceRate}) = ${liveForecast5} shoppers`,
    threshold: '10 Shoppers Queue / 3.0 min Wait SLA',
    confidence: `${congestionPct}%`,
    conclusion: 'Opening Counter C3 is recommended before queue depth exceeds threshold.',
    edgeModel: 'Queue Inference Engine (YOLO)',
  }

  // ACTION 2 WHY DATA (Shelf B4)
  const shelfWhyData: WhyDialogData = {
    title: 'Stock-Out Risk (Shelf B4)',
    actionType: 'STOCKOUT',
    targetEntity: 'Shelf B4',
    signals: [
      { label: 'Current Visible Units', value: '3 units', highlight: true },
      { label: 'Scan Depletion Rate', value: '0.33 units / min' },
      { label: 'POS Backroom Stock', value: '14 units' },
      { label: 'Predicted Zero Stock', value: '9.1 min', highlight: true },
      { label: 'Zone Traffic Velocity', value: 'High' },
      { label: 'Facing Capacity', value: '24 units (17% left)' },
    ],
    mathFormula: 'T_depletion = Visible_Units / Depletion_Rate = 3 / 0.33 = 9.09 mins',
    threshold: '< 15 mins to Stockout Threshold',
    confidence: '94%',
    conclusion: 'Replenish immediately from Backroom Rack 3B (14 units available).',
    edgeModel: 'Shelf Vision Pipeline',
  }

  // ACTION 3 WHY DATA (Spill)
  const spillWhyData: WhyDialogData = {
    title: 'Floor Hazard (Cooler 2)',
    actionType: 'SPILL',
    targetEntity: 'Cooler 2 Floor',
    signals: [
      { label: 'Anomaly Type', value: 'Liquid Spill', highlight: true },
      { label: 'Area Dimensions', value: '0.8m × 0.5m puddle' },
      { label: 'Camera Confirmation', value: 'CAM-04 (Confidence 0.91)' },
      { label: 'Zone Traffic', value: 'High Footfall' },
    ],
    threshold: 'Zero Slip Liability SLA',
    confidence: '91%',
    conclusion: 'Deploy caution cone and clean spill immediately.',
    edgeModel: 'Safety Vision Model',
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-full min-h-[560px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-sky-50 text-sky-600 border border-sky-200">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Recommended Actions
          </h3>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold shrink-0">
          2 Urgent
        </span>
      </div>

      {/* Action Cards List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
        {/* ACTION 1: CRITICAL - CHECKOUT CONGESTION */}
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider bg-rose-100/80 px-1.5 py-0.5 rounded border border-rose-200 font-mono">
                CRITICAL
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Risk: <strong className="text-rose-600">92%</strong>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900">
              Checkout C1
            </h4>
            <span className="text-[11px] text-amber-700 font-semibold">Congestion in 5m</span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-slate-200 text-center font-mono shadow-2xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Queue</span>
              <span className="text-slate-900 font-bold text-xs">{liveQ} → {liveForecast5}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Wait Time</span>
              <span className={`font-bold text-xs ${Number(liveWaitMin) > 3 ? 'text-amber-600' : 'text-emerald-700'}`}>{liveWaitMin} min</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Confidence</span>
              <span className={`font-bold text-xs ${congestionPct >= 80 ? 'text-rose-600' : 'text-amber-600'}`}>{congestionPct}%</span>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-[11px] text-slate-700">
              <span className="text-slate-500">ACTION: </span>
              <strong className="text-emerald-700 font-semibold">Open Counter C3</strong>
            </div>
            <div className="text-[11px] text-slate-500">
              <span>Suggested Staff: </span>
              <strong className="text-slate-800">S02 Marcus Vance</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-rose-100 flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              {dispatchedActions['action-1'] ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Staff Assigned (C3)
                </span>
              ) : (
                <Button
                  variant="action"
                  size="xs"
                  onClick={() => handleActionDispatch('action-1')}
                  className="gap-1 text-xs h-7 font-medium bg-sky-600 hover:bg-sky-700 text-white shadow-2xs"
                >
                  <UserCheck className="h-3 w-3" /> Assign Staff
                </Button>
              )}

              <Button
                variant="outline"
                size="xs"
                onClick={() =>
                  onViewEntity({
                    type: 'checkout',
                    id: `lane-${congestedLane?.laneNumber || 1}`,
                    name: `Counter ${liveCongestedCode}`,
                    code: liveCongestedCode,
                    data: {
                      queueLength: liveQ,
                      waitTime: `${liveWaitMin} min`,
                      predictedIn5m: liveForecast5,
                      risk: `${congestionPct}%`,
                      staffName: congestedLane?.assignedStaffName || 'Elena Rostova',
                      status: isCongested ? 'CONGESTED' : 'ACTIVE',
                    },
                  })
                }
                className="gap-1 text-xs h-7 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
              >
                <Eye className="h-3 w-3" /> View
              </Button>
            </div>

            <Button
              variant="ghost"
              size="xs"
              onClick={() => onOpenWhy(queueWhyData)}
              className="text-sky-600 hover:text-sky-800 hover:bg-sky-50 gap-1 text-xs h-7 px-2 font-medium"
            >
              <HelpCircle className="h-3 w-3" /> Why?
            </Button>
          </div>
        </div>

        {/* ACTION 2: HIGH - SHELF STOCK-OUT */}
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200 font-mono">
                HIGH
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Empty in: <strong className="text-rose-600 font-bold">9 min</strong>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900">
              B4 Zero Cola
            </h4>
            <span className="text-[11px] text-rose-600 font-semibold">Stock-out predicted</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 bg-white p-2 rounded-lg border border-slate-200 text-center font-mono shadow-2xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Stock</span>
              <span className="text-rose-600 font-bold text-xs">17%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Visible</span>
              <span className="text-rose-600 font-bold text-xs">3</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Backroom</span>
              <span className="text-emerald-700 font-bold text-xs">14</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Time</span>
              <span className="text-rose-600 font-bold text-xs">9m</span>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-[11px] text-slate-700">
              <span className="text-slate-500">ACTION: </span>
              <strong className="text-amber-700 font-semibold">Restock 24 units from Rack 3B</strong>
            </div>
            <div className="text-[11px] text-slate-500">
              <span>Suggested Staff: </span>
              <strong className="text-slate-800">S03 Liam O&apos;Connor</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-100 flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              {dispatchedActions['action-2'] ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Refill Dispatched (Liam)
                </span>
              ) : (
                <Button
                  variant="action"
                  size="xs"
                  onClick={() => handleActionDispatch('action-2')}
                  className="gap-1 text-xs h-7 font-medium bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
                >
                  <PackageCheck className="h-3 w-3" /> Assign Staff
                </Button>
              )}

              <Button
                variant="outline"
                size="xs"
                onClick={() =>
                  onViewEntity({
                    type: 'shelf',
                    id: 'shelf-b4',
                    name: 'B4 Zero Cola',
                    code: 'B4',
                    data: {
                      sku: 'Zero Sugar Cola',
                      availability: '17%',
                      visibleUnits: 3,
                      posStock: 14,
                      predictedStockout: '9 min',
                      status: 'CRITICAL',
                    },
                  })
                }
                className="gap-1 text-xs h-7 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
              >
                <Eye className="h-3 w-3" /> View
              </Button>
            </div>

            <Button
              variant="ghost"
              size="xs"
              onClick={() => onOpenWhy(shelfWhyData)}
              className="text-sky-600 hover:text-sky-800 hover:bg-sky-50 gap-1 text-xs h-7 px-2 font-medium"
            >
              <HelpCircle className="h-3 w-3" /> Why?
            </Button>
          </div>
        </div>

        {/* COMPACT EXPIRY RISK NOTICE */}
        <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-amber-600 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-slate-900 block">Expiry Risk</span>
              <span className="text-[11px] text-amber-800">
                12 SKUs &lt;72h • 38 units at risk
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="xs"
            onClick={() => navigate('/inventory')}
            className="text-xs h-7 px-2 text-slate-700 border-slate-200 bg-white hover:bg-slate-100 gap-1 shadow-2xs shrink-0"
          >
            <span>Open Inventory</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
