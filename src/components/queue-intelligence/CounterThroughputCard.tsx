import React from 'react'
import { Zap, Activity, Users, ArrowUpRight } from 'lucide-react'

export const CounterThroughputCard: React.FC = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-sky-50 border border-sky-200 text-sky-600">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
              Register Throughput &amp; Service Velocity
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
          3.2 Cust / Min Total
        </span>
      </div>

      {/* 3 Metrics */}
      <div className="grid grid-cols-3 gap-2 my-2 text-xs">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 block font-sans">Served / Hour</span>
          <div className="text-xl font-bold text-slate-900">128</div>
          <span className="text-[9px] text-emerald-700 font-semibold">+14 vs avg</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 block font-sans">Avg Service Time</span>
          <div className="text-xl font-bold text-sky-700">42.5 s</div>
          <span className="text-[9px] text-slate-500 font-sans">Per Basket</span>
        </div>

        <div className="bg-amber-50/40 p-2.5 rounded-lg border border-amber-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 block font-sans">Arrival Rate (λ)</span>
          <div className="text-xl font-bold text-amber-700">2.8/min</div>
          <span className="text-[9px] text-amber-800 font-semibold font-sans">Rush Inflow</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <span className="font-sans">Assisted POS Scan Efficiency: 96.2%</span>
        <span className="text-sky-700 font-semibold">Self-Checkout: 2.5/min</span>
      </div>
    </div>
  )
}
