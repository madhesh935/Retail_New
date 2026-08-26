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
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400">
            <Clock className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Wait Time Trends &amp; SLA Compliance
            </h3>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
          isSlaBreached
            ? 'text-rose-400 bg-rose-950 border-rose-500/40 animate-pulse'
            : 'text-emerald-400 bg-emerald-950 border-emerald-500/40'
        }`}>
          {slaPct}% SLA Met
        </span>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2 my-2 text-xs">
        <div className={`bg-[#090D14] p-2.5 rounded border ${isSlaBreached ? 'border-rose-500/40' : 'border-[#1E293B]'}`}>
          <span className="text-[10px] text-slate-500 block">Current Wait</span>
          <div className={`text-xl font-bold ${isSlaBreached ? 'text-rose-400' : 'text-white'}`}>{currentWaitMin} min</div>
          <span className={`text-[9px] font-semibold ${isSlaBreached ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isSlaBreached ? 'SLA Breached' : 'Within SLA'}
          </span>
        </div>

        <div className="bg-[#090D14] p-2.5 rounded border border-[#1E293B]">
          <span className="text-[10px] text-slate-500 block">Active Counters</span>
          <div className="text-xl font-bold text-slate-200">{activeQueues.length}</div>
          <span className="text-[9px] text-slate-500">Serving customers</span>
        </div>

        <div className={`bg-[#090D14] p-2.5 rounded border ${Number(peakWaitMin) > 3 ? 'border-rose-500/40' : 'border-[#1E293B]'}`}>
          <span className="text-[10px] text-slate-500 block">Peak Wait</span>
          <div className={`text-xl font-bold ${Number(peakWaitMin) > 3 ? 'text-rose-400' : 'text-slate-300'}`}>{peakWaitMin} min</div>
          <span className="text-[9px] text-rose-300">at {peakLane}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-400">
        <span>Customer SLA: Maximum 3.0 min Wait</span>
        <span className="text-cyan-400">Live YOLO Model</span>
      </div>
    </div>
  )
}
