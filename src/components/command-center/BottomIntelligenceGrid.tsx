import React, { useState } from 'react'
import {
  TrendingUp,
  ListOrdered,
  PackageCheck,
  Sparkles,
} from 'lucide-react'
import { FootfallTrendChart } from './charts/FootfallTrendChart'
import { Button } from '@/components/ui/button'

export const BottomIntelligenceGrid: React.FC = () => {
  const [refillTriggered, setRefillTriggered] = useState<Record<string, boolean>>({})

  const handleQuickRefill = (skuCode: string) => {
    setRefillTriggered((prev) => ({ ...prev, [skuCode]: true }))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 select-none font-sans">
      {/* 1. Footfall Trend Panel */}
      <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
            <span>Footfall Trend</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">
            Peak: 18:00 – 19:00
          </span>
        </div>

        <div className="my-1">
          <FootfallTrendChart />
        </div>

        <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="font-sans">vs yesterday: +8.4%</span>
          <span className="text-white font-bold">2,006 Total</span>
        </div>
      </div>

      {/* 2. Queue Forecast Panel */}
      <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
            <ListOrdered className="h-3.5 w-3.5 text-amber-400" />
            <span>Queue Forecast</span>
          </div>
          <span className="text-[10px] text-rose-400 font-mono font-bold bg-rose-950 px-1.5 py-0.5 rounded border border-rose-500/40">
            SLA: 10 max
          </span>
        </div>

        <div className="my-2 space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded bg-[#090D14] border border-[#1E293B]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 w-14">Current</span>
              <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: '80%' }} />
              </div>
            </div>
            <span className="text-white font-bold font-mono text-xs">8 shoppers</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#15110A] border border-amber-500/40">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-amber-300 w-14 font-medium">+5 min</span>
              <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: '100%' }} />
              </div>
            </div>
            <span className="text-amber-300 font-bold font-mono text-xs">13 predicted</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#150A0E] border border-rose-500/40">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-rose-300 w-14 font-medium">+10 min</span>
              <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: '100%' }} />
              </div>
            </div>
            <span className="text-rose-400 font-bold font-mono text-xs">16 (unmanaged)</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#1E293B] text-[11px] text-slate-400 flex items-center justify-between">
          <span>Action: Open Counter C3</span>
          <span className="text-cyan-400 font-semibold font-mono">Staff: S02</span>
        </div>
      </div>

      {/* 3. Stock-Out Risks Panel */}
      <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
            <PackageCheck className="h-3.5 w-3.5 text-rose-400" />
            <span>Stock-Out Risks</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono">
            3 Flagged
          </span>
        </div>

        <div className="my-2 space-y-2 text-xs">
          {/* 1. Zero Sugar Cola */}
          <div className="p-2 rounded bg-[#090D14] border border-rose-500/40 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white block">Zero Sugar Cola</span>
              <div className="text-[11px] text-slate-400 font-mono">
                Shelf B4 • <strong className="text-rose-400 font-semibold">17%</strong> (3 visible • 9m left)
              </div>
            </div>
            {refillTriggered['B4'] ? (
              <span className="text-emerald-400 text-[10px] font-bold">Refilling</span>
            ) : (
              <Button
                variant="action"
                size="xs"
                onClick={() => handleQuickRefill('B4')}
                className="text-[11px] h-6 px-2 font-medium"
              >
                Refill
              </Button>
            )}
          </div>

          {/* 2. Organic Whole Milk */}
          <div className="p-2 rounded bg-[#090D14] border border-rose-500/50 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white block">Organic Whole Milk</span>
              <div className="text-[11px] text-rose-400 font-mono font-medium">
                Shelf C2 • Stockout (12 in backroom)
              </div>
            </div>
            {refillTriggered['C2'] ? (
              <span className="text-emerald-400 text-[10px] font-bold">Refilling</span>
            ) : (
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleQuickRefill('C2')}
                className="text-[11px] h-6 px-2 text-slate-200 border-[#1E293B]"
              >
                Refill
              </Button>
            )}
          </div>

          {/* 3. Kettle Chips */}
          <div className="p-2 rounded bg-[#090D14] border border-[#1E293B] flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-200 block">Kettle Chips</span>
              <div className="text-[11px] text-slate-400 font-mono">
                Shelf D4 • 34% (8 visible)
              </div>
            </div>
            {refillTriggered['D4'] ? (
              <span className="text-emerald-400 text-[10px] font-bold">Refilling</span>
            ) : (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleQuickRefill('D4')}
                className="text-[11px] h-6 px-2 text-slate-400 hover:text-white"
              >
                Refill
              </Button>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
          <span>Backroom stock</span>
          <span className="text-emerald-400 font-medium">Available</span>
        </div>
      </div>

      {/* 4. Recent Actions Panel */}
      <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Recent Actions</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">
            Live Stream
          </span>
        </div>

        <div className="my-2 space-y-1.5 text-xs">
          <div className="p-1.5 rounded bg-[#090D14] border border-[#1E293B] space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-mono font-bold">18:01</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                Completed
              </span>
            </div>
            <div className="text-xs font-medium text-white">
              Marcus assigned to Counter C3
            </div>
          </div>

          <div className="p-1.5 rounded bg-[#090D14] border border-[#1E293B] space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-mono font-bold">17:48</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold">
                In Progress
              </span>
            </div>
            <div className="text-xs font-medium text-white">
              Shelf B4 restock assigned to Liam
            </div>
          </div>

          <div className="p-1.5 rounded bg-[#090D14] border border-[#1E293B] space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-mono font-bold">17:32</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                Acknowledged
              </span>
            </div>
            <div className="text-xs font-medium text-white">
              Cooler 2 spill acknowledged
            </div>
          </div>

          <div className="p-1.5 rounded bg-[#090D14] border border-[#1E293B] space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-mono font-bold">17:15</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                Completed
              </span>
            </div>
            <div className="text-xs font-medium text-white">
              Counter C2 opened
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
          <span>Audit Log #409</span>
          <span className="text-emerald-400 font-semibold font-mono">100% SLA</span>
        </div>
      </div>
    </div>
  )
}
