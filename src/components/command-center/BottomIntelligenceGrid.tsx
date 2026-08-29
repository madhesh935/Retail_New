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
import { formatNumber, formatTimeAgo } from '@/lib/utils'

/** StaffTask.createdAt arrives pre-formatted as "8h ago" / "12m ago" / "Just now" — approximate an
 * age in ms so these can be sorted alongside incidents' raw ISO timestamps. */
function approxAgeMs(relative: string): number {
  if (/just now/i.test(relative)) return 0
  const match = relative.match(/(\d+)\s*([smhd])/i)
  if (!match) return Number.MAX_SAFE_INTEGER
  const value = Number(match[1])
  const unitMs = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2].toLowerCase() as 's' | 'm' | 'h' | 'd']
  return value * unitMs
}

export const BottomIntelligenceGrid: React.FC = () => {
  const [refillTriggered, setRefillTriggered] = useState<Record<string, boolean>>({})

  const todaysTotalFootfall = useAppStore((s) => s.todaysTotalFootfall)
  const queues = useAppStore((s) => s.queues)
  const shelfItems = useAppStore((s) => s.shelfItems)
  const staffMembers = useAppStore((s) => s.staffMembers)
  const pendingTasks = useAppStore((s) => s.pendingTasks)
  const incidents = useAppStore((s) => s.incidents)
  const dispatchRealTask = useAppStore((s) => s.dispatchRealTask)

  // ── Live queue data from the model ──────────────────────
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

  // ── Live stock-out risks from shelf inventory ──────────────────────
  const riskyShelves = [...shelfItems]
    .filter((s) => s.status === 'CRITICAL' || s.status === 'OUT_OF_STOCK' || s.status === 'LOW')
    .sort((a, b) => a.currentCount - b.currentCount)
    .slice(0, 3)
  const availableStaff = staffMembers.filter((s) => s.status === 'ON_DUTY_AVAILABLE')

  const handleQuickRefill = (shelf: (typeof shelfItems)[number]) => {
    setRefillTriggered((prev) => ({ ...prev, [shelf.shelfId]: true }))
    dispatchRealTask({
      title: `Restock ${shelf.shelfId} — ${shelf.productName}`,
      type: 'RESTOCK',
      priority: shelf.status === 'OUT_OF_STOCK' ? 'CRITICAL' : 'HIGH',
      target_location: `Shelf ${shelf.shelfId}`,
      description: `${shelf.currentCount} visible units, ${shelf.backroomUnits || 0} in backroom.`,
      assigned_staff_id: availableStaff[0]?.id,
    })
  }

  // ── Recent activity from real incidents + staff tasks ──────────────────────
  // Incidents carry a raw ISO timestamp; StaffTask.createdAt arrives pre-formatted
  // as "8h ago" (see mapStaffTask), so each branch computes age its own way and
  // only the pre-formatted display label differs in origin.
  type ActivityEntry = { displayTime: string; ageMs: number; title: string; status: string }
  const recentActivity: ActivityEntry[] = [
    ...incidents
      .filter((i) => i.status === 'RESOLVED' && (i.resolvedAt || i.timestamp))
      .map((i) => {
        const iso = i.resolvedAt || i.timestamp
        return {
          displayTime: formatTimeAgo(iso),
          ageMs: Date.now() - Date.parse(iso),
          title: i.title,
          status: 'Completed',
        }
      }),
    ...pendingTasks
      .filter((t) => t.createdAt)
      .map((t) => ({
        displayTime: t.createdAt,
        ageMs: approxAgeMs(t.createdAt),
        title: t.assignedStaffName ? `${t.title} — ${t.assignedStaffName}` : t.title,
        status: t.status === 'COMPLETED' ? 'Completed' : t.status === 'IN_PROGRESS' ? 'In Progress' : 'Acknowledged',
      })),
  ]
    .sort((a, b) => a.ageMs - b.ageMs)
    .slice(0, 4)

  const statusBadgeClass = (status: string) =>
    status === 'Completed'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status === 'In Progress'
        ? 'bg-sky-50 text-sky-700 border-sky-200'
        : 'bg-amber-50 text-amber-700 border-amber-200'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 select-none font-sans">
      {/* 1. Occupancy Snapshot Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <TrendingUp className="h-3.5 w-3.5 text-sky-600" />
            <span>Occupancy Snapshot</span>
          </div>
        </div>

        <div className="my-1">
          <FootfallTrendChart />
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="font-sans">Today&apos;s footfall</span>
          <span className="text-slate-900 font-bold">{formatNumber(todaysTotalFootfall)}</span>
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
            {riskyShelves.length} Flagged
          </span>
        </div>

        <div className="my-2 space-y-2 text-xs">
          {riskyShelves.length === 0 && (
            <div className="text-[11px] text-slate-400 text-center py-4">No shelves at risk</div>
          )}
          {riskyShelves.map((shelf) => {
            const pct = shelf.capacityCount > 0 ? Math.round((shelf.currentCount / shelf.capacityCount) * 100) : 0
            const isOos = shelf.status === 'OUT_OF_STOCK'
            return (
              <div
                key={shelf.id}
                className={`p-2 rounded-lg border flex items-center justify-between shadow-2xs ${isOos ? 'bg-rose-50/20 border-rose-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <div>
                  <span className="font-semibold text-slate-900 block">{shelf.productName}</span>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Shelf {shelf.shelfId} • <strong className={isOos ? 'text-rose-600 font-semibold' : 'text-amber-700 font-semibold'}>{pct}%</strong> ({shelf.currentCount} visible)
                  </div>
                </div>
                {refillTriggered[shelf.shelfId] ? (
                  <span className="text-emerald-700 text-[10px] font-bold">Dispatched</span>
                ) : (
                  <Button
                    variant={isOos ? 'action' : 'outline'}
                    size="xs"
                    onClick={() => handleQuickRefill(shelf)}
                    className={isOos ? 'text-[11px] h-6 px-2 font-medium bg-amber-600 hover:bg-amber-700 text-white' : 'text-[11px] h-6 px-2 text-slate-700 border-slate-200 bg-white hover:bg-slate-50'}
                  >
                    Refill
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Available staff</span>
          <span className={availableStaff.length > 0 ? 'text-emerald-700 font-medium' : 'text-rose-600 font-medium'}>
            {availableStaff.length}
          </span>
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
            Live
          </span>
        </div>

        <div className="my-2 space-y-1.5 text-xs">
          {recentActivity.length === 0 && (
            <div className="text-[11px] text-slate-400 text-center py-4">No recent activity</div>
          )}
          {recentActivity.map((entry, idx) => (
            <div key={idx} className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5 shadow-2xs">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-mono font-bold">{entry.displayTime}</span>
                <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${statusBadgeClass(entry.status)}`}>
                  {entry.status}
                </span>
              </div>
              <div className="text-xs font-medium text-slate-800 truncate">
                {entry.title}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>{pendingTasks.length} tracked tasks</span>
        </div>
      </div>
    </div>
  )
}
