import React, { useState } from 'react'
import {
  TrendingUp,
  ListOrdered,
  PackageCheck,
  Sparkles,
} from 'lucide-react'
import { FootfallTrendChart } from './charts/FootfallTrendChart'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

export const BottomIntelligenceGrid: React.FC = () => {
  const [refillTriggered, setRefillTriggered] = useState<Record<string, boolean>>({})

  // Live queue data from the model
  const queues = useAppStore((s) => s.queues)
  const activeQueues = Array.isArray(queues) ? queues.filter((l) => l.status !== 'CLOSED' && l.status !== 'STANDBY') : []
  const congestedLane = activeQueues.reduce(
    (prev, curr) => (curr.currentQueueLength > (prev?.currentQueueLength || 0) ? curr : prev),
    activeQueues[0] || null
  )

  const liveCurrentQ = congestedLane?.currentQueueLength || 0
  const liveWaitSec = congestedLane?.currentWaitTimeSeconds || 0
  const liveForecast5 = congestedLane ? Math.round(liveCurrentQ + liveCurrentQ * 0.6) : 0
  const liveForecast10 = congestedLane ? Math.round(liveCurrentQ + liveCurrentQ * 1.0) : 0
  const currentPct = Math.min(100, (liveCurrentQ / 20) * 100)
  const forecast5Pct = Math.min(100, (liveForecast5 / 20) * 100)
  const forecast10Pct = Math.min(100, (liveForecast10 / 20) * 100)
  const congestedCode = congestedLane ? `C${congestedLane.laneNumber}` : 'C1'

  const handleQuickRefill = (skuCode: string) => {
    setRefillTriggered((prev) => ({ ...prev, [skuCode]: true }))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 select-none font-sans">
      {/* 1. Footfall Trend Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <TrendingUp className="h-3.5 w-3.5 text-sky-600" />
            <span>Footfall Trend</span>
          </div>
          <span className="text-[10px] text-sky-600 font-mono font-semibold">
            Peak: 18:00 – 19:00
          </span>
        </div>

        <div className="my-1">
          <FootfallTrendChart />
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="font-sans">vs yesterday: +8.4%</span>
          <span className="text-slate-900 font-bold">2,006 Total</span>
        </div>
      </div>

      {/* 2. Queue Forecast Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <ListOrdered className="h-3.5 w-3.5 text-amber-600" />
            <span>Queue Forecast</span>
          </div>
          <span className="text-[10px] text-rose-700 font-mono font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
            SLA: 10 max
          </span>
        </div>

        <div className="my-2 space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 w-14">Current</span>
              <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500" style={{ width: `${currentPct}%` }} />
              </div>
            </div>
            <span className="text-slate-900 font-bold font-mono text-xs">{liveCurrentQ} shoppers</span>
          </div>

          <div className={`flex items-center justify-between p-2 rounded-lg border ${liveForecast5 >= 10 ? 'bg-amber-50/40 border-amber-200' : 'bg-slate-50 border-slate-200'} shadow-2xs`}>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] w-14 font-medium ${liveForecast5 >= 10 ? 'text-amber-800 font-semibold' : 'text-slate-500'}`}>+5 min</span>
              <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full ${liveForecast5 >= 10 ? 'bg-amber-500' : 'bg-slate-400'}`} style={{ width: `${forecast5Pct}%` }} />
              </div>
            </div>
            <span className={`font-bold font-mono text-xs ${liveForecast5 >= 10 ? 'text-amber-800' : 'text-slate-700'}`}>
              {liveForecast5} predicted
            </span>
          </div>

          <div className={`flex items-center justify-between p-2 rounded-lg border ${liveForecast10 >= 13 ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50 border-slate-200'} shadow-2xs`}>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] w-14 font-medium ${liveForecast10 >= 13 ? 'text-rose-800 font-semibold' : 'text-slate-500'}`}>+10 min</span>
              <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full ${liveForecast10 >= 13 ? 'bg-rose-500' : 'bg-slate-400'}`} style={{ width: `${forecast10Pct}%` }} />
              </div>
            </div>
            <span className={`font-bold font-mono text-xs ${liveForecast10 >= 13 ? 'text-rose-700' : 'text-slate-700'}`}>
              {liveForecast10} {liveForecast10 >= 13 ? '(unmanaged)' : 'projected'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Congested: {congestedCode} • {(liveWaitSec / 60).toFixed(1)} min wait</span>
          <span className="text-sky-600 font-semibold font-mono">Live Model</span>
        </div>
      </div>

      {/* 3. Stock-Out Risks Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <PackageCheck className="h-3.5 w-3.5 text-rose-600" />
            <span>Stock-Out Risks</span>
          </div>
          <span className="text-[10px] text-amber-700 font-mono font-semibold">
            3 Flagged
          </span>
        </div>

        <div className="my-2 space-y-2 text-xs">
          {/* 1. Zero Sugar Cola */}
          <div className="p-2 rounded-lg bg-rose-50/20 border border-rose-200 flex items-center justify-between shadow-2xs">
            <div>
              <span className="font-semibold text-slate-900 block">Zero Sugar Cola</span>
              <div className="text-[11px] text-slate-500 font-mono">
                Shelf B4 • <strong className="text-rose-600 font-semibold">17%</strong> (3 visible • 9m left)
              </div>
            </div>
            {refillTriggered['B4'] ? (
              <span className="text-emerald-700 text-[10px] font-bold">Refilling</span>
            ) : (
              <Button
                variant="action"
                size="xs"
                onClick={() => handleQuickRefill('B4')}
                className="text-[11px] h-6 px-2 font-medium bg-amber-600 hover:bg-amber-700 text-white"
              >
                Refill
              </Button>
            )}
          </div>

          {/* 2. Organic Whole Milk */}
          <div className="p-2 rounded-lg bg-rose-50/20 border border-rose-200 flex items-center justify-between shadow-2xs">
            <div>
              <span className="font-semibold text-slate-900 block">Organic Whole Milk</span>
              <div className="text-[11px] text-rose-600 font-mono font-medium">
                Shelf C2 • Stockout (12 in backroom)
              </div>
            </div>
            {refillTriggered['C2'] ? (
              <span className="text-emerald-700 text-[10px] font-bold">Refilling</span>
            ) : (
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleQuickRefill('C2')}
                className="text-[11px] h-6 px-2 text-slate-700 border-slate-200 bg-white hover:bg-slate-50"
              >
                Refill
              </Button>
            )}
          </div>

          {/* 3. Kettle Chips */}
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <span className="font-semibold text-slate-800 block">Kettle Chips</span>
              <div className="text-[11px] text-slate-500 font-mono">
                Shelf D4 • 34% (8 visible)
              </div>
            </div>
            {refillTriggered['D4'] ? (
              <span className="text-emerald-700 text-[10px] font-bold">Refilling</span>
            ) : (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleQuickRefill('D4')}
                className="text-[11px] h-6 px-2 text-slate-500 hover:text-slate-900"
              >
                Refill
              </Button>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Backroom stock</span>
          <span className="text-emerald-700 font-medium">Available</span>
        </div>
      </div>

      {/* 4. Recent Actions Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-sky-600" />
            <span>Recent Actions</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono font-bold">
            Live Stream
          </span>
        </div>

        <div className="my-2 space-y-1.5 text-xs">
          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5 shadow-2xs">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-mono font-bold">18:01</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">
                Completed
              </span>
            </div>
            <div className="text-xs font-medium text-slate-800">
              Marcus assigned to Counter C3
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5 shadow-2xs">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-mono font-bold">17:48</span>
              <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[9px] font-bold">
                In Progress
              </span>
            </div>
            <div className="text-xs font-medium text-slate-800">
              Shelf B4 restock assigned to Liam
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5 shadow-2xs">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-mono font-bold">17:32</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold">
                Acknowledged
              </span>
            </div>
            <div className="text-xs font-medium text-slate-800">
              Cooler 2 spill acknowledged
            </div>
          </div>

          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5 shadow-2xs">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-mono font-bold">17:15</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">
                Completed
              </span>
            </div>
            <div className="text-xs font-medium text-slate-800">
              Counter C2 opened
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Audit Log #409</span>
          <span className="text-emerald-700 font-semibold font-mono">100% SLA</span>
        </div>
      </div>
    </div>
  )
}
