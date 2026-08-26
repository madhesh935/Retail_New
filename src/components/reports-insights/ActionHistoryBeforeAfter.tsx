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
  const [selectedId, setSelectedId] = useState<string>('act-01')

  const activeRecord =
    ACTION_HISTORY_RECORDS.find((r) => r.id === selectedId) || ACTION_HISTORY_RECORDS[0]

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none font-mono h-full min-h-[440px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-purple-950 border border-purple-500/40 text-purple-400">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              AI Action History & Measurable Operational Effect
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40 font-bold">
          Click Action to Inspect Effect
        </span>
      </div>

      {/* Main Grid: Left Action Buttons / Right Before & After Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Left 6 cols: Action Log List */}
        <div className="md:col-span-6 space-y-2">
          {ACTION_HISTORY_RECORDS.map((rec) => {
            const isSelected = rec.id === selectedId

            return (
              <button
                key={rec.id}
                onClick={() => setSelectedId(rec.id)}
                className={cn(
                  'w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer group flex flex-col justify-between space-y-1',
                  isSelected
                    ? 'bg-[#131D31] border-cyan-400 shadow-md ring-1 ring-cyan-400'
                    : 'bg-[#090D14] border-[#1E293B] hover:bg-[#0F172A]'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <span className="text-cyan-400 font-mono">{rec.time}</span>
                    <span className="font-sans text-xs">{rec.actionTitle}</span>
                  </div>
                </div>

                <div className="text-[10px] text-emerald-400 font-semibold flex items-center justify-between w-full">
                  <span>{rec.summaryResult}</span>
                  <span className="text-slate-400 font-normal">{rec.assignedStaff}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right 6 cols: Before vs After Measurable Effect Card */}
        <div className="md:col-span-6 p-3.5 rounded-lg bg-[#090D14] border border-cyan-500/30 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
              <div>
                <h4 className="text-xs font-bold text-white font-sans">
                  {activeRecord.actionTitle}
                </h4>
                <span className="text-[10px] text-slate-400">
                  Target: {activeRecord.targetEntity} • {activeRecord.time}
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold uppercase">
                {activeRecord.category}
              </span>
            </div>

            {/* Before vs After Visualizer */}
            <div className="grid grid-cols-2 gap-2 my-2.5">
              {/* BEFORE */}
              <div className="p-2.5 rounded bg-rose-950/20 border border-rose-500/40 space-y-0.5 text-center">
                <span className="text-[9px] text-rose-400 font-bold uppercase block">
                  BEFORE INTERVENTION
                </span>
                <div className="text-base font-bold text-rose-400 font-mono">
                  {activeRecord.beforeValue}
                </div>
                <span className="text-[9px] text-slate-400">{activeRecord.beforeMetricLabel}</span>
              </div>

              {/* AFTER */}
              <div className="p-2.5 rounded bg-emerald-950/25 border border-emerald-500/50 space-y-0.5 text-center">
                <span className="text-[9px] text-emerald-400 font-bold uppercase block">
                  AFTER INTERVENTION
                </span>
                <div className="text-base font-bold text-emerald-400 font-mono">
                  {activeRecord.afterValue}
                </div>
                <span className="text-[9px] text-emerald-300">{activeRecord.afterMetricLabel}</span>
              </div>
            </div>

            {/* Operational Gain Banner */}
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/50 space-y-1 text-xs">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">
                Measurable Operational Effect:
              </span>
              <div className="text-emerald-300 font-sans text-xs font-semibold">
                {activeRecord.operationalGain}
              </div>
            </div>
          </div>

          {/* Verification Footer */}
          <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[9px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="h-3 w-3 text-cyan-400" />
              <span>{activeRecord.verificationMethod}</span>
            </span>
            <span className="text-emerald-400 font-bold">Closed-Loop Verified</span>
          </div>
        </div>
      </div>
    </div>
  )
}
