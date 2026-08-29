import React, { useState } from 'react'
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { REPORT_ACTION_HISTORY, ReportActionRecord } from '@/lib/reportStaticData'

export const ActionHistoryBeforeAfter: React.FC = () => {
  const liveActionLog = useAppStore((s) => s.queueActionLog)

  // Merge live log with canonical action records
  const allRecords: ReportActionRecord[] = React.useMemo(() => {
    const liveMapped: ReportActionRecord[] = liveActionLog.map((l) => ({
      id: l.id,
      time: l.time,
      actionTitle: l.actionTitle,
      targetEntity: l.targetEntity,
      category: l.category as ReportActionRecord['category'],
      summaryResult: l.summaryResult || l.operationalGain || 'Action Executed',
      assignedStaff: l.assignedStaff || 'Unassigned',
      beforeMetricLabel: l.beforeMetricLabel || 'Before',
      beforeValue: l.beforeValue || '—',
      afterMetricLabel: l.afterMetricLabel || 'After',
      afterValue: l.afterValue || '—',
      operationalGain: l.operationalGain || 'Operational efficiency gain',
      verificationMethod: l.verificationMethod || 'AI Camera Verification',
    }))

    const combined = [...liveMapped, ...REPORT_ACTION_HISTORY]
    const seen = new Set<string>()
    return combined.filter((r) => {
      const key = `${r.actionTitle}-${r.targetEntity}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [liveActionLog])

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filteredRecords = React.useMemo(() => {
    if (selectedCategory === 'ALL') return allRecords
    return allRecords.filter((r) => r.category === selectedCategory)
  }, [allRecords, selectedCategory])

  const activeRecord =
    filteredRecords.find((r) => r.id === selectedId) || filteredRecords[0] || allRecords[0] || null

  const categories = [
    { id: 'ALL', label: 'All Actions' },
    { id: 'QUEUE', label: 'Queue Relief' },
    { id: 'INVENTORY', label: 'Restock' },
    { id: 'STAFF', label: 'Staff Reallocation' },
    { id: 'SAFETY', label: 'Safety' },
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-sans h-full min-h-[440px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 shadow-2xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <span>AI Action History &amp; Measurable Operational Effect</span>
              <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 font-semibold font-mono">
                Verified Interventions
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Before vs. after metrics proving autonomous and assisted workforce gains
            </p>
          </div>
        </div>

        <span className="text-[10px] text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 font-bold font-mono shadow-2xs">
          {filteredRecords.length} Documented Gains
        </span>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setSelectedCategory(cat.id)
              setSelectedId(null)
            }}
            className={cn(
              'px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer border',
              selectedCategory === cat.id
                ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Action Buttons / Right Before & After Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 flex-1 items-stretch">
        {/* Left 6 cols: Action Log List */}
        <div className="md:col-span-6 space-y-2 flex flex-col justify-start">
          {filteredRecords.length === 0 && (
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-400">
              No actions recorded in this category yet.
            </div>
          )}
          {filteredRecords.map((rec) => {
            const isSelected = activeRecord?.id === rec.id

            return (
              <button
                key={rec.id}
                type="button"
                onClick={() => setSelectedId(rec.id)}
                className={cn(
                  'w-full p-3 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between space-y-1 shadow-2xs',
                  isSelected
                    ? 'bg-sky-50/60 border-sky-400 ring-2 ring-sky-300/80 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 truncate">
                    <span className="text-sky-700 font-mono text-[11px] px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200 shrink-0">
                      {rec.time}
                    </span>
                    <span className="truncate">{rec.actionTitle}</span>
                  </div>
                </div>

                <div className="text-[10.5px] text-emerald-700 font-semibold flex items-center justify-between w-full font-sans pt-0.5">
                  <span className="truncate">{rec.summaryResult}</span>
                  <span className="text-slate-500 font-mono text-[10px] shrink-0 ml-1">
                    {rec.assignedStaff.split(' ').slice(0, 2).join(' ')}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Right 6 cols: Before vs After Measurable Effect Card */}
        <div className="md:col-span-6 p-3.5 rounded-xl bg-gradient-to-b from-slate-50 via-white to-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs">
          {!activeRecord ? (
            <div className="flex-1 flex items-center justify-center text-center text-xs text-slate-400 py-8">
              Select an action to inspect its effect
            </div>
          ) : (
            <>
              <div className="space-y-2.5">
                {/* Header with Title & Category */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {activeRecord.actionTitle}
                    </h4>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      Target: <strong className="text-slate-700">{activeRecord.targetEntity}</strong> • {activeRecord.time}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[9.5px] font-bold font-mono uppercase shadow-2xs shrink-0">
                    {activeRecord.category}
                  </span>
                </div>

                {/* Assigned Staff Info */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/90 shadow-2xs text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5 text-sky-600" />
                    <span>Assigned Associate:</span>
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {activeRecord.assignedStaff}
                  </span>
                </div>

                {/* Before vs After Visualizer */}
                <div className="grid grid-cols-2 gap-2 my-1">
                  {/* BEFORE */}
                  <div className="p-2.5 rounded-xl bg-rose-50/40 border border-rose-200/90 space-y-1 text-center shadow-2xs">
                    <span className="text-[9px] text-rose-700 font-bold uppercase tracking-wider block font-mono">
                      BEFORE ACTION
                    </span>
                    <div className="text-sm font-bold text-rose-700 font-mono">
                      {activeRecord.beforeValue}
                    </div>
                    <span className="text-[9px] text-slate-500 font-sans block truncate">
                      {activeRecord.beforeMetricLabel}
                    </span>
                  </div>

                  {/* AFTER */}
                  <div className="p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200/90 space-y-1 text-center shadow-2xs">
                    <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider block font-mono">
                      AFTER INTERVENTION
                    </span>
                    <div className="text-sm font-bold text-emerald-700 font-mono">
                      {activeRecord.afterValue}
                    </div>
                    <span className="text-[9px] text-slate-500 font-sans block truncate">
                      {activeRecord.afterMetricLabel}
                    </span>
                  </div>
                </div>

                {/* Operational Gain Banner */}
                <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1 text-xs shadow-2xs">
                  <span className="text-[10px] text-emerald-800 block font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                    <span>Measurable Operational Effect</span>
                  </span>
                  <div className="text-emerald-900 text-xs font-bold font-sans">
                    {activeRecord.operationalGain}
                  </div>
                </div>
              </div>

              {/* Verification Footer */}
              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-600 truncate">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{activeRecord.verificationMethod}</span>
                </span>
                <span className="text-emerald-700 font-bold font-mono shrink-0 ml-1">
                  Verified
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
