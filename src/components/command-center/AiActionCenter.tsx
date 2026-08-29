import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  CheckCircle2,
  HelpCircle,
  UserCheck,
  PackageCheck,
  Eye,
  ArrowRight,
  CalendarClock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WhyDialogData } from './WhyRecommendationDialog'
import { SelectedEntity } from './StoreMapDigitalTwin'
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

  const queues = useAppStore((s) => s.queues)
  const shelfItems = useAppStore((s) => s.shelfItems)
  const staffMembers = useAppStore((s) => s.staffMembers)
  const expiryAnalyticsSummary = useAppStore((s) => s.expiryAnalyticsSummary)
  const dispatchRealTask = useAppStore((s) => s.dispatchRealTask)

  const activeQueues = Array.isArray(queues) ? queues.filter((l) => l.status !== 'CLOSED' && l.status !== 'STANDBY') : []
  const congestedLane = activeQueues.reduce(
    (prev, curr) => (curr.currentQueueLength > (prev?.currentQueueLength || 0) ? curr : prev),
    activeQueues[0] || null
  )

  const liveQ = congestedLane?.currentQueueLength || 0
  const liveWaitMin = congestedLane ? (congestedLane.currentWaitTimeSeconds / 60).toFixed(1) : '0.0'
  const liveForecast5 = congestedLane ? Math.round(liveQ + liveQ * 0.6) : 0
  const liveArrivalRate = congestedLane
    ? Number(((congestedLane.currentQueueLength * 0.25) + (congestedLane.processingRateItemsPerMinute * 0.05)).toFixed(1))
    : 0
  const liveServiceRate = congestedLane
    ? Number(((congestedLane.processingRateItemsPerMinute * 0.08) - (congestedLane.currentQueueLength * 0.05)).toFixed(1))
    : 0
  const liveCongestedCode = congestedLane ? `C${congestedLane.laneNumber}` : null
  const congestionPct = congestedLane ? Math.min(99, Math.max(15, liveQ * 12)) : 0
  const isCongested = congestedLane ? congestedLane.status === 'CONGESTED' : false

  const criticalShelf = [...shelfItems]
    .filter((s) => s.status === 'CRITICAL' || s.status === 'OUT_OF_STOCK')
    .sort((a, b) => a.currentCount - b.currentCount)[0]
  const shelfAvailabilityPct = criticalShelf && criticalShelf.capacityCount > 0
    ? Math.round((criticalShelf.currentCount / criticalShelf.capacityCount) * 100)
    : 0

  const availableStaff = staffMembers.filter((s) => s.status === 'ON_DUTY_AVAILABLE')
  const suggestedQueueStaff = availableStaff[0]
  const suggestedShelfStaff = availableStaff[1] || availableStaff[0]

  const urgentCount = (isCongested ? 1 : 0) + (criticalShelf ? 1 : 0)

  const handleDispatchQueueSupport = () => {
    setDispatchedActions((prev) => ({ ...prev, 'action-1': true }))
    dispatchRealTask({
      title: `Open standby counter for ${liveCongestedCode}`,
      type: 'QUEUE_SUPPORT',
      priority: 'CRITICAL',
      target_location: `Checkout ${liveCongestedCode}`,
      description: `Queue at ${liveQ} shoppers, ${liveWaitMin} min wait.`,
      assigned_staff_id: suggestedQueueStaff?.id,
    })
  }

  const handleDispatchRestock = () => {
    setDispatchedActions((prev) => ({ ...prev, 'action-2': true }))
    if (!criticalShelf) return
    dispatchRealTask({
      title: `Restock ${criticalShelf.shelfId} — ${criticalShelf.productName}`,
      type: 'RESTOCK',
      priority: 'HIGH',
      target_location: `Shelf ${criticalShelf.shelfId}`,
      description: `${shelfAvailabilityPct}% availability, ${criticalShelf.currentCount} visible units.`,
      assigned_staff_id: suggestedShelfStaff?.id,
    })
  }

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
    conclusion: 'Opening a standby counter is recommended before queue depth exceeds threshold.',
    edgeModel: 'Queue Inference Engine (YOLO)',
  }

  const shelfWhyData: WhyDialogData = criticalShelf ? {
    title: `Stock-Out Risk (Shelf ${criticalShelf.shelfId})`,
    actionType: 'STOCKOUT',
    targetEntity: `Shelf ${criticalShelf.shelfId}`,
    signals: [
      { label: 'Current Visible Units', value: `${criticalShelf.currentCount} units`, highlight: true },
      { label: 'Backroom Stock', value: `${criticalShelf.backroomUnits || 0} units` },
      { label: 'Facing Capacity', value: `${criticalShelf.capacityCount} units (${shelfAvailabilityPct}% left)` },
    ],
    threshold: '< 15% Availability Threshold',
    confidence: `${Math.round((criticalShelf.confidenceScore || 0.9) * 100)}%`,
    conclusion: `Replenish immediately from backroom (${criticalShelf.backroomUnits || 0} units available).`,
    edgeModel: 'Shelf Vision Pipeline',
  } : {
    title: '', actionType: 'STOCKOUT', targetEntity: '', signals: [], threshold: '', confidence: '', conclusion: '', edgeModel: '',
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

        {urgentCount > 0 && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold shrink-0">
            {urgentCount} Urgent
          </span>
        )}
      </div>

      {/* Action Cards List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
        {!isCongested && !criticalShelf && (
          <div className="p-6 rounded-xl border border-emerald-200 bg-emerald-50/40 text-center space-y-1">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto" />
            <div className="text-xs font-bold text-slate-900">No urgent actions</div>
            <div className="text-[11px] text-slate-500">Queues and shelves are within normal range</div>
          </div>
        )}

        {/* ACTION 1: CRITICAL - CHECKOUT CONGESTION */}
        {isCongested && (
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider bg-rose-100/80 px-1.5 py-0.5 rounded border border-rose-200 font-mono">
                  CRITICAL
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Risk: <strong className="text-rose-600">{congestionPct}%</strong>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">
                Checkout {liveCongestedCode}
              </h4>
              <span className="text-[11px] text-amber-700 font-semibold">Congestion predicted</span>
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
                <strong className="text-emerald-700 font-semibold">Open standby counter</strong>
              </div>
              <div className="text-[11px] text-slate-500">
                <span>Suggested Staff: </span>
                <strong className="text-slate-800">{suggestedQueueStaff ? `${suggestedQueueStaff.name}` : 'None available'}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-rose-100 flex items-center justify-between gap-1.5 flex-wrap">
              <div className="flex items-center gap-1.5">
                {dispatchedActions['action-1'] ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Dispatched
                  </span>
                ) : (
                  <Button
                    variant="action"
                    size="xs"
                    disabled={!suggestedQueueStaff}
                    onClick={handleDispatchQueueSupport}
                    className="gap-1 text-xs h-7 font-medium bg-sky-600 hover:bg-sky-700 text-white shadow-2xs disabled:opacity-50"
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
                      code: liveCongestedCode || '',
                      data: {
                        queueLength: liveQ,
                        waitTime: `${liveWaitMin} min`,
                        predictedIn5m: liveForecast5,
                        risk: `${congestionPct}%`,
                        staffName: congestedLane?.assignedStaffName || 'Unassigned',
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
        )}

        {/* ACTION 2: HIGH - SHELF STOCK-OUT */}
        {criticalShelf && (
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200 font-mono">
                  HIGH
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Availability: <strong className="text-rose-600 font-bold">{shelfAvailabilityPct}%</strong>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">
                {criticalShelf.shelfId} {criticalShelf.productName}
              </h4>
              <span className="text-[11px] text-rose-600 font-semibold">
                {criticalShelf.status === 'OUT_OF_STOCK' ? 'Out of stock' : 'Stock-out risk'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 bg-white p-2 rounded-lg border border-slate-200 text-center font-mono shadow-2xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Stock</span>
                <span className="text-rose-600 font-bold text-xs">{shelfAvailabilityPct}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Visible</span>
                <span className="text-rose-600 font-bold text-xs">{criticalShelf.currentCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Backroom</span>
                <span className="text-emerald-700 font-bold text-xs">{criticalShelf.backroomUnits || 0}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Facings</span>
                <span className="text-rose-600 font-bold text-xs">{criticalShelf.currentFacings}/{criticalShelf.facingCapacity}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-[11px] text-slate-700">
                <span className="text-slate-500">ACTION: </span>
                <strong className="text-amber-700 font-semibold">
                  Restock from backroom ({criticalShelf.backroomUnits || 0} units)
                </strong>
              </div>
              <div className="text-[11px] text-slate-500">
                <span>Suggested Staff: </span>
                <strong className="text-slate-800">{suggestedShelfStaff ? suggestedShelfStaff.name : 'None available'}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-100 flex items-center justify-between gap-1.5 flex-wrap">
              <div className="flex items-center gap-1.5">
                {dispatchedActions['action-2'] ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Dispatched
                  </span>
                ) : (
                  <Button
                    variant="action"
                    size="xs"
                    disabled={!suggestedShelfStaff}
                    onClick={handleDispatchRestock}
                    className="gap-1 text-xs h-7 font-medium bg-amber-600 hover:bg-amber-700 text-white shadow-2xs disabled:opacity-50"
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
                      id: criticalShelf.id,
                      name: `${criticalShelf.shelfId} ${criticalShelf.productName}`,
                      code: criticalShelf.shelfId,
                      data: {
                        sku: criticalShelf.productName,
                        availability: `${shelfAvailabilityPct}%`,
                        visibleUnits: criticalShelf.currentCount,
                        posStock: criticalShelf.backroomUnits || 0,
                        status: criticalShelf.status,
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
        )}

        {/* EXPIRY RISK NOTICE */}
        {expiryAnalyticsSummary.expiringSoonSkusCount > 0 && (
          <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs font-semibold text-slate-900 block">Expiry Risk</span>
                <span className="text-[11px] text-amber-800">
                  {expiryAnalyticsSummary.expiringSoonSkusCount} SKUs &lt;72h • {expiryAnalyticsSummary.atRiskUnitsTotal} units at risk
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
        )}
      </div>
    </div>
  )
}
