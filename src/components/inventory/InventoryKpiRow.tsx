import React from 'react'
import {
  PackageCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckSquare,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'

export const InventoryKpiRow: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 select-none font-sans">
      {/* 1. Overall Shelf Availability */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Shelf Availability</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">86%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Target: 95%</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center text-[11px] text-emerald-700 font-semibold gap-0.5">
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span>+2.1% vs yesterday</span>
        </div>
      </div>

      {/* 2. Critical Shelves */}
      <div className="rounded-xl bg-white border border-rose-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Critical Shelves</span>
          <span className="h-2 w-2 rounded-full bg-rose-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-rose-700 tracking-tight">3</div>
          <div className="text-[11px] text-slate-600 font-mono mt-0.5 font-semibold">B4, B2, C2</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-rose-100 text-[11px] text-rose-700 font-semibold">
          Action required
        </div>
      </div>

      {/* 3. Out of Stock */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Out of Stock</span>
          <span className="h-2 w-2 rounded-full bg-amber-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">2 SKUs</div>
          <div className="text-[11px] text-slate-500 mt-0.5">1 has backroom stock</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-amber-800 font-semibold">
          Ready to restock
        </div>
      </div>

      {/* 4. Stock-Out Risk <30 min */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Stock-Out Risk &lt;30 min</span>
          <span className="h-2 w-2 rounded-full bg-amber-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">6</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Next: <span className="font-mono text-slate-800 font-semibold">B4</span> in 9 min</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-amber-800 font-semibold">
          Depleting fast
        </div>
      </div>

      {/* 5. Replenishment Tasks */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Replenishment Tasks</span>
          <span className="h-2 w-2 rounded-full bg-sky-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">4</div>
          <div className="text-[11px] text-slate-500 mt-0.5">2 assigned · 2 waiting</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-sky-700 font-semibold">
          Staff active
        </div>
      </div>

      {/* 6. Planogram Compliance */}
      <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-500">Planogram Compliance</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">93%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">3 issues</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold">
          High accuracy
        </div>
      </div>
    </div>
  )
}
