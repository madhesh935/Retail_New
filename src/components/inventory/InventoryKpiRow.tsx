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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 select-none">
      {/* 1. Overall Shelf Availability */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Shelf Availability</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">86%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Target: 95%</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] flex items-center text-[11px] text-emerald-400 font-medium gap-0.5">
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span>+2.1% vs yesterday</span>
        </div>
      </div>

      {/* 2. Critical Shelves */}
      <div className="rounded-lg bg-[#0F172A] border border-rose-500/40 p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Critical Shelves</span>
          <span className="h-2 w-2 rounded-full bg-rose-500" />
        </div>
        <div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">3</div>
          <div className="text-[11px] text-slate-300 font-mono mt-0.5">B4, B2, C2</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-rose-400 font-medium">
          Action required
        </div>
      </div>

      {/* 3. Out of Stock */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Out of Stock</span>
          <span className="h-2 w-2 rounded-full bg-amber-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">2 SKUs</div>
          <div className="text-[11px] text-slate-400 mt-0.5">1 has backroom stock</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-amber-400 font-medium">
          Ready to restock
        </div>
      </div>

      {/* 4. Stock-Out Risk <30 min */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Stock-Out Risk &lt;30 min</span>
          <span className="h-2 w-2 rounded-full bg-amber-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">6</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Next: <span className="font-mono text-slate-200">B4</span> in 9 min</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-amber-400 font-medium">
          Depleting fast
        </div>
      </div>

      {/* 5. Replenishment Tasks */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Replenishment Tasks</span>
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">4</div>
          <div className="text-[11px] text-slate-400 mt-0.5">2 assigned · 2 waiting</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-cyan-400 font-medium">
          Staff active
        </div>
      </div>

      {/* 6. Planogram Compliance */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Planogram Compliance</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">93%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">3 issues</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-emerald-400 font-medium">
          Within SLA
        </div>
      </div>
    </div>
  )
}
