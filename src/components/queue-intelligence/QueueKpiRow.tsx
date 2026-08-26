import React from 'react'
import {
  ListOrdered,
  Users,
  Clock,
  Zap,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export const QueueKpiRow: React.FC = () => {
  const queues = useAppStore((s) => s.queues)
  const systemAvgWaitSec = useAppStore((s) => s.systemAverageWaitTimeSeconds)

  const activeQueues = Array.isArray(queues) ? queues.filter((l) => l.status !== 'CLOSED') : []
  const activeCount = activeQueues.length
  const totalCount = Array.isArray(queues) && queues.length > 0 ? queues.length : 4
  const avgWaitMin = systemAvgWaitSec ? (systemAvgWaitSec / 60).toFixed(1) : '0.0'

  const assistedCount = activeQueues.filter(q => q.laneType !== 'SELF_CHECKOUT').length
  const selfCount = activeQueues.filter(q => q.laneType === 'SELF_CHECKOUT').length
  const openLaneCodes = activeQueues.map(q => `C${q.laneNumber}`).join(', ')
  const closedLanes = Array.isArray(queues) ? queues.filter(q => q.status === 'CLOSED').map(q => `C${q.laneNumber}`).join(', ') : ''

  const avgQueueLength = activeCount > 0 ? (activeQueues.reduce((acc, q) => acc + q.currentQueueLength, 0) / activeCount).toFixed(1) : '0.0'
  
  const customersServedHr = activeQueues.reduce((acc, q) => acc + Math.round(q.processingRateItemsPerMinute * 1.5), 0)

  const highestRiskQueue = activeQueues.reduce((prev, curr) => (curr.currentWaitTimeSeconds > prev.currentWaitTimeSeconds) ? curr : prev, activeQueues[0] || null)
  const highestRiskWaitMin = highestRiskQueue ? (highestRiskQueue.currentWaitTimeSeconds / 60).toFixed(1) : '0'


  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 select-none font-mono">
      {/* 1. Active Counters */}
      <div className="rounded-lg bg-[#0F172A] border border-cyan-500/40 p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
            Active Counters
          </span>
          <div className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
            <ListOrdered className="h-3 w-3" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {activeCount}/{totalCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{assistedCount} Assisted, {selfCount} Self</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-cyan-400">{openLaneCodes || 'None'} Open</span>
          <span className="text-amber-400">{closedLanes ? `${closedLanes} Standby` : ''}</span>
        </div>
      </div>

      {/* 2. Average Queue */}
      <div className="rounded-lg bg-[#0F172A] border border-cyan-500/30 p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
            Average Queue
          </span>
          <div className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
            <Users className="h-3 w-3" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight flex items-baseline gap-1">
            <span>{avgQueueLength}</span>
            <span className="text-xs text-slate-400 font-normal">people</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across active lanes</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-emerald-400 flex items-center gap-0.5">
            <ArrowDownRight className="h-3 w-3" /> -0.8
          </span>
          <span className="text-slate-500 text-[9px]">vs peak</span>
        </div>
      </div>

      {/* 3. Average Wait */}
      <div className="rounded-lg bg-[#0F172A] border border-emerald-500/30 p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
            Average Wait
          </span>
          <div className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
            <Clock className="h-3 w-3" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight flex items-baseline gap-1">
            <span>{avgWaitMin}</span>
            <span className="text-xs text-slate-400 font-normal">min</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Target SLA: &lt;3.0 min</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-emerald-400 flex items-center gap-0.5">
            <ArrowDownRight className="h-3 w-3" /> 18% lower
          </span>
          <span className="text-slate-500 text-[9px]">than yesterday</span>
        </div>
      </div>

      {/* 4. Customers Served / Hour */}
      <div className="rounded-lg bg-[#0F172A] border border-blue-500/30 p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
            Customers Served / Hr
          </span>
          <div className="p-1 rounded bg-blue-950 text-blue-400 border border-blue-500/30">
            <Zap className="h-3 w-3" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-blue-300 tracking-tight">{customersServedHr}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Peak Capacity: 180/hr</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-emerald-400 flex items-center gap-0.5">
            <ArrowUpRight className="h-3 w-3" /> Live
          </span>
          <span className="text-slate-500 text-[9px]">Throughput</span>
        </div>
      </div>

      {/* 5. Highest Risk Counter */}
      <div className="rounded-lg bg-[#0F172A] border border-rose-500/40 p-3 flex flex-col justify-between shadow-sm col-span-2 md:col-span-1">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
            Highest Risk Counter
          </span>
          <div className="p-1 rounded bg-rose-950 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="h-3 w-3 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">
            Counter C{highestRiskQueue?.laneNumber || 1}
          </div>
          <div className="text-[10px] text-rose-300/90 font-medium mt-0.5">
            Queue: {highestRiskQueue?.currentQueueLength || 0} • Wait: {highestRiskWaitMin} min
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-rose-400 font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
            {highestRiskQueue?.status === 'CONGESTED' ? 'High' : 'Normal'} Congestion Risk
          </span>
          <span className="text-cyan-400">Monitoring</span>
        </div>
      </div>
    </div>
  )
}
