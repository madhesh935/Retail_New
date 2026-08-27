import React, { useState } from 'react'
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

export interface ActionHistoryRecord {
  id: string
  time: string
  actionTitle: string
  targetEntity: string
  category: 'QUEUE' | 'INVENTORY' | 'STAFF' | 'SAFETY'
  summaryResult: string
  assignedStaff: string
  beforeMetricLabel: string
  beforeValue: string
  afterMetricLabel: string
  afterValue: string
  operationalGain: string
  verificationMethod: string
}

export const ACTION_HISTORY_RECORDS: ActionHistoryRecord[] = [
  {
    id: 'act-01',
    time: '18:42',
    actionTitle: 'Counter C3 Opened (Congestion Relief)',
    targetEntity: 'Checkout Lanes (C1 & C3)',
    category: 'QUEUE',
    summaryResult: 'Wait reduced 59% (5.6m → 2.3m)',
    assignedStaff: 'S02 Marcus Vance',
    beforeMetricLabel: 'Queue Wait / Length',
    beforeValue: '5.6 min (8 people)',
    afterMetricLabel: 'Restored Wait / Length',
    afterValue: '2.3 min (3 people)',
    operationalGain: '-59% Wait Reduction across checkout zone',
    verificationMethod: 'Camera C06 DeepStream Video Timing',
  },
  {
    id: 'act-02',
    time: '18:38',
    actionTitle: 'Shelf B4 Replenished (Cola 12pk)',
    targetEntity: 'Beverage Gondola B4',
    category: 'INVENTORY',
    summaryResult: 'Availability 17% → 79% (+62%)',
    assignedStaff: 'S03 Liam O\'Connor',
    beforeMetricLabel: 'Shelf Visible Count',
    beforeValue: '17% (3 units visible)',
    afterMetricLabel: 'Restocked Count',
    afterValue: '79% (24 units full)',
    operationalGain: 'Prevented $240/hr out-of-stock revenue loss',
    verificationMethod: 'Camera C04 ShelfEye Bounding Box Scan',
  },
  {
    id: 'act-03',
    time: '17:55',
    actionTitle: 'Staff Redeployed to Electronics Hub',
    targetEntity: 'Electronics Hub & Gadgets',
    category: 'STAFF',
    summaryResult: 'Assistance response reduced to 1.8 min',
    assignedStaff: 'S05 David Kim',
    beforeMetricLabel: 'Shopper Dwell without Assistance',
    beforeValue: '4.2 min (Unassisted)',
    afterMetricLabel: 'Response Time',
    afterValue: '1.8 min (Staff Assigned)',
    operationalGain: '+28% customer engagement & basket conversion',
    verificationMethod: 'Spatial Tracking Trajectory Match',
  },
  {
    id: 'act-04',
    time: '17:10',
    actionTitle: 'Liquid Spill Hazard Cleared (Aisle 2)',
    targetEntity: 'Produce Perimeter Floor',
    category: 'SAFETY',
    summaryResult: 'Slip hazard removed in 1m 40s',
    assignedStaff: 'S04 Sarah Jenkins',
    beforeMetricLabel: 'Hazard Area Surface',
    beforeValue: '1.2m² Liquid Area',
    afterMetricLabel: 'Post-Clean Surface',
    afterValue: '0m² (Dry Floor)',
    operationalGain: '100% Slip Safety SLA Compliance (<2m)',
    verificationMethod: 'Camera C02 FloorNet Segmentation',
  },
]

export const ActionHistoryBeforeAfter: React.FC = () => {
  // Merge live action log (from store) with static historical records
  // Live entries appear first — they are created when managers activate counters
  const liveActionLog = useAppStore((s) => s.queueActionLog)

  const allRecords: ActionHistoryRecord[] = [
    ...liveActionLog,   // real-time entries prepended
    ...ACTION_HISTORY_RECORDS,
  ]

  const [selectedId, setSelectedId] = useState<string>(allRecords[0]?.id || 'act-01')

  const activeRecord =
    allRecords.find((r) => r.id === selectedId) || allRecords[0]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-sans h-full min-h-[440px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-purple-50 border border-purple-200 text-purple-600">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              AI Action History & Measurable Operational Effect
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 font-bold">
          Click Action to Inspect Effect
        </span>
      </div>

      {/* Main Grid: Left Action Buttons / Right Before & After Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Left 6 cols: Action Log List */}
        <div className="md:col-span-6 space-y-2">
          {allRecords.map((rec) => {
            const isSelected = rec.id === selectedId

            return (
              <button
                key={rec.id}
                onClick={() => setSelectedId(rec.id)}
                className={cn(
                  'w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between space-y-1 shadow-2xs',
                  isSelected
                    ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <span className="text-sky-700 font-mono">{rec.time}</span>
                    <span className="text-xs">{rec.actionTitle}</span>
                  </div>
                </div>

                <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-between w-full font-sans">
                  <span>{rec.summaryResult}</span>
                  <span className="text-slate-500 font-normal">{rec.assignedStaff}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right 6 cols: Before vs After Measurable Effect Card */}
        <div className="md:col-span-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {activeRecord.actionTitle}
                </h4>
                <span className="text-[10px] text-slate-500">
                  Target: {activeRecord.targetEntity} • {activeRecord.time}
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded-md bg-white text-sky-700 border border-slate-200 text-[9px] font-bold uppercase shadow-2xs">
                {activeRecord.category}
              </span>
            </div>

            {/* Before vs After Visualizer */}
            <div className="grid grid-cols-2 gap-2 my-2.5">
              {/* BEFORE */}
              <div className="p-2.5 rounded-lg bg-white border border-rose-200 space-y-0.5 text-center shadow-2xs">
                <span className="text-[9px] text-rose-700 font-bold uppercase block">
                  BEFORE INTERVENTION
                </span>
                <div className="text-base font-bold text-rose-700 font-mono">
                  {activeRecord.beforeValue}
                </div>
                <span className="text-[9px] text-slate-500 font-sans">{activeRecord.beforeMetricLabel}</span>
              </div>

              {/* AFTER */}
              <div className="p-2.5 rounded-lg bg-white border border-emerald-200 space-y-0.5 text-center shadow-2xs">
                <span className="text-[9px] text-emerald-700 font-bold uppercase block">
                  AFTER INTERVENTION
                </span>
                <div className="text-base font-bold text-emerald-700 font-mono">
                  {activeRecord.afterValue}
                </div>
                <span className="text-[9px] text-slate-500 font-sans">{activeRecord.afterMetricLabel}</span>
              </div>
            </div>

            {/* Operational Gain Banner */}
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200 space-y-1 text-xs shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-bold uppercase">
                Measurable Operational Effect:
              </span>
              <div className="text-emerald-800 text-xs font-bold font-sans">
                {activeRecord.operationalGain}
              </div>
            </div>
          </div>

          {/* Verification Footer */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
            <span className="flex items-center gap-1 text-slate-700 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
              <span>{activeRecord.verificationMethod}</span>
            </span>
            <span className="text-emerald-700 font-bold">Closed-Loop Verified</span>
          </div>
        </div>
      </div>
    </div>
  )
}
