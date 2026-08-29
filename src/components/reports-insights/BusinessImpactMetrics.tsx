import React from 'react'
import { Sparkles } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export const BusinessImpactMetrics: React.FC = () => {
  const pendingTasks = useAppStore((s) => s.pendingTasks)
  const queueActionLog = useAppStore((s) => s.queueActionLog)
  const queues = useAppStore((s) => s.queues)
  const wasteRecords = useAppStore((s) => s.wasteRecords)
  const inventoryBatches = useAppStore((s) => s.inventoryBatches)
  const expiryAnalyticsSummary = useAppStore((s) => s.expiryAnalyticsSummary)

  const restocksCompleted = pendingTasks.filter(
    (t) => (t.category === 'RESTOCK' || t.category === 'STOCK_ROTATION') && (t.status === 'COMPLETED' || t.status === 'VERIFIED')
  ).length

  const activeLanes = Array.isArray(queues) ? queues.filter((q) => q.status !== 'CLOSED') : []
  const laneSlaPct = activeLanes.length > 0
    ? Math.round(((activeLanes.length - activeLanes.filter((l) => l.status === 'CONGESTED').length) / activeLanes.length) * 100)
    : 100

  const avgUnitCost = inventoryBatches.length > 0
    ? inventoryBatches.reduce((acc, b) => acc + (b.unitCost || 0), 0) / inventoryBatches.length
    : 0
  const wasteAvoidedValue = Math.round((expiryAnalyticsSummary.wasteAvoidedUnits || 0) * avgUnitCost)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-600">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Live Operational Impact
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          From Store DB
        </span>
      </div>

      {/* 5 Impact Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* 1. Restocks Completed */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase tracking-tight block font-bold">
            Restocks Completed
          </span>
          <div className="text-2xl font-bold text-emerald-700 font-mono">{restocksCompleted}</div>
          <span className="text-[9px] text-slate-500 font-sans">Staff-verified today</span>
        </div>

        {/* 2. Queue Interventions */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase tracking-tight block font-bold">
            Queue Interventions
          </span>
          <div className="text-2xl font-bold text-sky-700 font-mono">{queueActionLog.length}</div>
          <span className="text-[9px] text-slate-500 font-sans">Counter activations this session</span>
        </div>

        {/* 3. Lane SLA Compliance */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase tracking-tight block font-bold">
            Lanes Within SLA
          </span>
          <div className="text-2xl font-bold text-purple-700 font-mono">{laneSlaPct}%</div>
          <span className="text-[9px] text-slate-500 font-sans">{activeLanes.length} active lanes</span>
        </div>

        {/* 4. Waste Records */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase tracking-tight block font-bold">
            Waste Records Logged
          </span>
          <div className="text-2xl font-bold text-blue-700 font-mono">{wasteRecords.length}</div>
          <span className="text-[9px] text-slate-500 font-sans">Store-DB tracked</span>
        </div>

        {/* 5. Waste Avoided */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-1 col-span-2 md:col-span-1 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase tracking-tight block font-bold">
            Waste Avoided (Units)
          </span>
          <div className="text-2xl font-bold text-rose-700 font-mono">{expiryAnalyticsSummary.wasteAvoidedUnits || 0}</div>
          <span className="text-[9px] text-amber-800 font-bold font-sans">~₹{wasteAvoidedValue} est. saved</span>
        </div>
      </div>
    </div>
  )
}
