import React, { useState } from 'react'
import {
  Sparkles,
  UserCheck,
  CheckCircle2,
  Route,
  ArrowRight,
  Clock,
  Zap,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

export interface StaffAiRecommendation {
  id: string
  title: string
  category: 'QUEUE_RELIEF' | 'INVENTORY_RESTOCK' | 'CUSTOMER_ASSIST' | 'SAFETY_PATROL'
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  staffId: string
  staffName: string
  staffRole: string
  currentZone: string
  targetZone: string
  distanceMeters: number
  etaSeconds: number
  confidenceScore: number
  operationalImpact: string
  estimatedGain: string
  reasons: string[]
}

export const STAFF_AI_RECOMMENDATIONS: StaffAiRecommendation[] = [
  {
    id: 'rec-staff-01',
    title: 'Deploy Support to Checkout C1 & C2 (Rush Surge)',
    category: 'QUEUE_RELIEF',
    priority: 'CRITICAL',
    staffId: 'EMP-405',
    staffName: 'Sarah Jenkins',
    staffRole: 'Floor Associate (Cashier Certified)',
    currentZone: 'Household & Personal Care (Low Traffic)',
    targetZone: 'Checkout Lanes (Counter C1 / C2)',
    distanceMeters: 28,
    etaSeconds: 35,
    confidenceScore: 96,
    operationalImpact: 'Prevents queue wait from exceeding 180s SLA during rush',
    estimatedGain: '-48% Wait Time Reduction (~1.8m average)',
    reasons: ['Nearest cashier-certified associate', 'Household zone currently below 20% traffic density'],
  },
  {
    id: 'rec-staff-02',
    title: 'Urgent Restock Dispatch to Shelf A1 Produce Island',
    category: 'INVENTORY_RESTOCK',
    priority: 'HIGH',
    staffId: 'EMP-404',
    staffName: "Liam O'Connor",
    staffRole: 'Inventory Restocker',
    currentZone: 'Backroom Storage (Bay 2)',
    targetZone: 'Fresh Produce (Shelf A1)',
    distanceMeters: 34,
    etaSeconds: 45,
    confidenceScore: 94,
    operationalImpact: 'Restocks Gala Apples before stockout deadline at 18:15',
    estimatedGain: 'Protects $280/hr high-velocity produce revenue',
    reasons: ['Highest priority depletion rate (18 units/hr)', 'Cart pre-loaded in backroom rack 3B'],
  },
  {
    id: 'rec-staff-03',
    title: 'Proactive Customer Assistance in Electronics & Care',
    category: 'CUSTOMER_ASSIST',
    priority: 'MEDIUM',
    staffId: 'EMP-406',
    staffName: 'Tariq Al-Mansoor',
    staffRole: 'Senior Associate / Supervisor',
    currentZone: 'Main Lobby (Zone 1)',
    targetZone: 'Electronics & Personal Care (Zone 5)',
    distanceMeters: 42,
    etaSeconds: 55,
    confidenceScore: 91,
    operationalImpact: 'Engages high-dwell shoppers comparing premium items',
    estimatedGain: '+22% Basket Conversion on premium SKUs',
    reasons: ['Extended dwell time > 4.5 min detected by CAM-05', 'High basket value category'],
  },
]

export const StaffOperationsAiRecommendations: React.FC = () => {
  const [dispatchedIds, setDispatchedIds] = useState<Record<string, boolean>>({})
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null)
  const addQueueAction = useAppStore((s) => s.addQueueAction)

  const handleDispatch = (rec: StaffAiRecommendation) => {
    setDispatchedIds((prev) => ({ ...prev, [rec.id]: true }))
    setActiveFeedback(`Dispatched ${rec.staffName} to ${rec.targetZone}`)

    // Record action into the live timeline
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    addQueueAction({
      id: `live-rec-${Date.now()}`,
      time: timeStr,
      actionTitle: rec.title,
      targetEntity: rec.targetZone,
      category: rec.category === 'QUEUE_RELIEF' ? 'QUEUE' : rec.category === 'INVENTORY_RESTOCK' ? 'INVENTORY' : 'STAFF',
      summaryResult: rec.operationalImpact,
      assignedStaff: `${rec.staffId} ${rec.staffName}`,
      beforeMetricLabel: 'Baseline State',
      beforeValue: `Staff at ${rec.currentZone}`,
      afterMetricLabel: 'AI Optimized State',
      afterValue: `Active at ${rec.targetZone}`,
      operationalGain: rec.estimatedGain,
      verificationMethod: 'Floor Camera AI & Task Confirmation',
    })

    setTimeout(() => {
      setActiveFeedback(null)
    }, 4000)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <span>AI Staff Operations &amp; Workforce Recommendations</span>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-semibold font-mono">
                Real-Time Predictive
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Autonomous workforce reallocation engine based on footfall trajectory, queue surge, and shelf depletion SLA
            </p>
          </div>
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          {STAFF_AI_RECOMMENDATIONS.length - Object.keys(dispatchedIds).length} pending recommendations
        </span>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {STAFF_AI_RECOMMENDATIONS.map((rec) => {
          const isDispatched = dispatchedIds[rec.id]
          const isCritical = rec.priority === 'CRITICAL'
          const isHigh = rec.priority === 'HIGH'

          return (
            <div
              key={rec.id}
              className={cn(
                'p-3.5 rounded-xl border flex flex-col justify-between transition-all shadow-2xs space-y-3',
                isDispatched
                  ? 'bg-emerald-50/30 border-emerald-300'
                  : isCritical
                  ? 'bg-rose-50/20 border-rose-200 hover:border-rose-300'
                  : isHigh
                  ? 'bg-amber-50/20 border-amber-200 hover:border-amber-300'
                  : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
              )}
            >
              {/* Card Header: Priority & Confidence */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border font-mono',
                      isCritical
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : isHigh
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-sky-50 text-sky-700 border-sky-200'
                    )}
                  >
                    {rec.priority} PRIORITY
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold font-mono">
                    {rec.confidenceScore}% Confidence
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-xs pt-1 leading-snug">
                  {rec.title}
                </h4>
              </div>

              {/* Staff Reallocation Box */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold font-mono">
                      {rec.staffId}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{rec.staffName}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{rec.distanceMeters}m · ~{rec.etaSeconds}s</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  Role: <strong className="text-slate-700">{rec.staffRole}</strong>
                </div>

                {/* Zone Movement */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-600 font-mono">
                  <span className="text-slate-500 truncate">{rec.currentZone.split(' (')[0]}</span>
                  <ArrowRight className="h-3 w-3 text-sky-600 shrink-0" />
                  <span className="text-sky-700 font-bold truncate">{rec.targetZone.split(' (')[0]}</span>
                </div>
              </div>

              {/* Expected Gain & Impact */}
              <div className="space-y-1 text-[11px]">
                <div className="text-emerald-700 font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 shrink-0" />
                  <span className="truncate">{rec.estimatedGain}</span>
                </div>
                <div className="text-slate-500 text-[10px]">
                  {rec.operationalImpact}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  Auto-trigger ready
                </span>

                {isDispatched ? (
                  <span className="text-emerald-700 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Dispatched
                  </span>
                ) : (
                  <Button
                    variant="action"
                    size="xs"
                    onClick={() => handleDispatch(rec)}
                    className="text-[11px] h-7 px-3 gap-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold cursor-pointer shadow-xs"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Dispatch</span>
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Toast confirmation */}
      {activeFeedback && (
        <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{activeFeedback}</span>
        </div>
      )}
    </div>
  )
}
