import React from 'react'
import { Zap, Activity, Users, ArrowUpRight } from 'lucide-react'

export const CounterThroughputCard: React.FC = () => {
  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-950 border border-blue-500/40 text-blue-400">
            <Zap className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Register Throughput & Service Velocity
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-blue-300 font-bold bg-blue-950 px-2 py-0.5 rounded border border-blue-500/40">
          3.2 Cust / Min Total
        </span>
      </div>

      {/* 3 Metrics */}
      <div className="grid grid-cols-3 gap-2 my-2 text-xs">
        <div className="bg-[#090D14] p-2.5 rounded border border-[#1E293B]">
          <span className="text-[10px] text-slate-500 block">Served / Hour</span>
          <div className="text-xl font-bold text-white">128</div>
          <span className="text-[9px] text-emerald-400 font-semibold">+14 vs avg</span>
        </div>

        <div className="bg-[#090D14] p-2.5 rounded border border-[#1E293B]">
          <span className="text-[10px] text-slate-500 block">Avg Service Time</span>
          <div className="text-xl font-bold text-cyan-300">42.5 s</div>
          <span className="text-[9px] text-slate-400">Per Basket</span>
        </div>

        <div className="bg-[#090D14] p-2.5 rounded border border-amber-500/40">
          <span className="text-[10px] text-slate-500 block">Arrival Rate (Î»)</span>
          <div className="text-xl font-bold text-amber-400">2.8/min</div>
          <span className="text-[9px] text-amber-300">Rush Inflow</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-400">
        <span>Assisted POS Scan Efficiency: 96.2%</span>
        <span className="text-cyan-400">Self-Checkout: 2.5/min</span>
      </div>
    </div>
  )
}
