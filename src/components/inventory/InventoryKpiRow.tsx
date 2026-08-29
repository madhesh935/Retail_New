import React from 'react'
import { useAppStore } from '@/store/useAppStore'

export const InventoryKpiRow: React.FC = () => {
  const shelfItems = useAppStore((s) => s.shelfItems)
  const inventoryAnalytics = useAppStore((s) => s.inventoryAnalytics)
  const pendingTasks = useAppStore((s) => s.pendingTasks)

  const avgAvailability = shelfItems.length > 0
    ? Math.round(
        shelfItems.reduce((acc, s) => acc + (s.capacityCount > 0 ? s.currentCount / s.capacityCount : 0), 0) /
          shelfItems.length *
          100
      )
    : 0

  const criticalShelves = shelfItems.filter((s) => s.status === 'CRITICAL')
  const criticalCodes = criticalShelves.slice(0, 3).map((s) => s.shelfId).join(', ') || 'None'

  const outOfStockShelves = shelfItems.filter((s) => s.status === 'OUT_OF_STOCK')
  const outOfStockWithBackroom = outOfStockShelves.filter((s) => (s.backroomUnits || 0) > 0)

  const soonToStockout = inventoryAnalytics.topVulnerableSkus.filter((s) => s.minutesUntilStockout < 30)
  const nextStockout = [...inventoryAnalytics.topVulnerableSkus].sort(
    (a, b) => a.minutesUntilStockout - b.minutesUntilStockout
  )[0]

  const restockTasks = pendingTasks.filter(
    (t) => t.category === 'RESTOCK' || t.category === 'STOCK_ROTATION'
  )
  const assignedRestockTasks = restockTasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ACCEPTED')
  const waitingRestockTasks = restockTasks.filter((t) => t.status === 'PENDING' || t.status === 'DISPATCHED' || t.status === 'ASSIGNED')

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 select-none font-sans">
      {/* 1. Overall Shelf Availability */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Shelf Availability</span>
          <span className={`h-2 w-2 rounded-full ${avgAvailability >= 80 ? 'bg-emerald-500' : avgAvailability >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{avgAvailability}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Target: 95%</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-[11px] text-slate-600 font-semibold">
          <span>{shelfItems.length} shelves monitored</span>
        </div>
      </div>

      {/* 2. Critical Shelves */}
      <div className="rounded-xl bg-white border border-rose-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Critical Shelves</span>
          <span className="h-2 w-2 rounded-full bg-rose-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-rose-700 tracking-tight">{criticalShelves.length}</div>
          <div className="text-[11px] text-slate-600 font-mono mt-0.5 font-semibold">{criticalCodes}</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-rose-100 text-[11px] text-rose-700 font-semibold">
          {criticalShelves.length > 0 ? 'Action required' : 'None critical'}
        </div>
      </div>

      {/* 3. Out of Stock */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Out of Stock</span>
          <span className="h-2 w-2 rounded-full bg-amber-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{outOfStockShelves.length} SKUs</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{outOfStockWithBackroom.length} has backroom stock</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-amber-800 font-semibold">
          {outOfStockWithBackroom.length > 0 ? 'Ready to restock' : 'No backroom coverage'}
        </div>
      </div>

      {/* 4. Stock-Out Risk <30 min */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Stock-Out Risk &lt;30 min</span>
          <span className="h-2 w-2 rounded-full bg-amber-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{soonToStockout.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {nextStockout ? (
              <>Next: <span className="font-mono text-slate-800 font-semibold">{nextStockout.sku}</span> in {nextStockout.minutesUntilStockout} min</>
            ) : (
              'No imminent stockouts'
            )}
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-amber-800 font-semibold">
          {soonToStockout.length > 0 ? 'Depleting fast' : 'Stable'}
        </div>
      </div>

      {/* 5. Replenishment Tasks */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Replenishment Tasks</span>
          <span className="h-2 w-2 rounded-full bg-sky-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{restockTasks.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {assignedRestockTasks.length} assigned · {waitingRestockTasks.length} waiting
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-sky-700 font-semibold">
          {restockTasks.length > 0 ? 'Staff active' : 'No open tasks'}
        </div>
      </div>

      {/* 6. Planogram Compliance */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Planogram Compliance</span>
          <span className={`h-2 w-2 rounded-full ${inventoryAnalytics.overallPlanogramCompliance >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{inventoryAnalytics.overallPlanogramCompliance}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{inventoryAnalytics.misplacedItemsCount} issues</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold">
          {inventoryAnalytics.overallPlanogramCompliance >= 85 ? 'High accuracy' : 'Needs review'}
        </div>
      </div>
    </div>
  )
}
