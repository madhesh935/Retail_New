import React from 'react'
import { Clock } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export const WaitTimeTrendCard: React.FC = () => {
  const queues = useAppStore((s) => s.queues)
  const systemAvgWaitSec = useAppStore((s) => s.systemAverageWaitTimeSeconds)

  const activeQueues = Array.isArray(queues) ? queues.filter((l) => l.status !== 'CLOSED' && l.status !== 'STANDBY') : []

  // Current average wait in minutes (from live model)
  const currentWaitMin = systemAvgWaitSec ? (systemAvgWaitSec / 60).toFixed(1) : '0.0'

  // Find the highest wait queue (congested lane peak)
  const peakQueue = activeQueues.length > 0
    ? activeQueues.reduce((prev, curr) => curr.currentWaitTimeSeconds > prev.currentWaitTimeSeconds ? curr : prev, activeQueues[0])
    : null
  const peakWaitMin = peakQueue ? (peakQueue.currentWaitTimeSeconds / 60).toFixed(1) : '0.0'
  const peakLane = peakQueue ? `C${peakQueue.laneNumber}` : '—'

  // SLA compliance: % of active queues below 3min SLA
  const SLA_MAX_SEC = 180
  const slaMetCount = activeQueues.filter((q) => q.currentWaitTimeSeconds <= SLA_MAX_SEC).length
  const slaPct = activeQueues.length > 0 ? Math.round((slaMetCount / activeQueues.length) * 100) : 100
  const isSlaBreached = Number(currentWaitMin) > 3.0

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-600">
            <Clock className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
              Wait Time Trends &amp; SLA Compliance
            </h3>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
          isSlaBreached
            ? 'text-rose-700 bg-rose-50 border-rose-200 animate-pulse'
            : 'text-emerald-700 bg-emerald-50 border-emerald-200'
        }`}>
          {slaPct}% SLA Met
        </span>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2 my-2 text-xs">
        <div className={`bg-slate-50 p-2.5 rounded-lg border shadow-2xs ${isSlaBreached ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'}`}>
          <span className="text-[10px] text-slate-500 block font-sans">Current Wait</span>
          <div className={`text-xl font-bold ${isSlaBreached ? 'text-rose-600' : 'text-slate-900'}`}>{currentWaitMin} min</div>
          <span className={`text-[9px] font-semibold ${isSlaBreached ? 'text-rose-600' : 'text-emerald-700'}`}>
            {isSlaBreached ? 'SLA Breached' : 'Within SLA'}
          </span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 block font-sans">Active Counters</span>
          <div className="text-xl font-bold text-slate-900">{activeQueues.length}</div>
          <span className="text-[9px] text-slate-500 font-sans">Serving customers</span>
        </div>

        <div className={`bg-slate-50 p-2.5 rounded-lg border shadow-2xs ${Number(peakWaitMin) > 3 ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'}`}>
          <span className="text-[10px] text-slate-500 block font-sans">Peak Wait</span>
          <div className={`text-xl font-bold ${Number(peakWaitMin) > 3 ? 'text-rose-600' : 'text-slate-900'}`}>{peakWaitMin} min</div>
          <span className="text-[9px] text-rose-600 font-semibold font-sans">at {peakLane}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <span className="font-sans">Customer SLA: Maximum 3.0 min Wait</span>
        <span className="text-sky-700 font-semibold">Live YOLO Model</span>
      </div>
    </div>
  )
}
