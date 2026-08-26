import React from 'react'
import {
  Users,
  Footprints,
  Clock,
  Flame,
  Compass,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { formatNumber } from '@/lib/utils'
import { SHOPPING_ZONES } from './shopperData'

export const ShopperKpiRow: React.FC = () => {
  const currentOccupancy = useAppStore((s) => s.currentOccupancy) || 142
  const todaysTotalFootfall = useAppStore((s) => s.todaysTotalFootfall) || 1840
  const storeInfo = useAppStore((s) => s.storeInfo)

  const maxCap = storeInfo?.maxCapacity || 350
  const occupancyPct = Math.round((currentOccupancy / maxCap) * 100)

  // Find canonical busiest shopping zone by visitor count (Produce: 410)
  const busiestZone = [...SHOPPING_ZONES].sort((a, b) => b.visitors - a.visitors)[0]

  // Find canonical highest engagement zone by dwell (Electronics: 4.2 min)
  const highestEngagementZone = [...SHOPPING_ZONES].sort(
    (a, b) => b.avgDwellMinutes - a.avgDwellMinutes
  )[0]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 select-none">
      {/* 1. Today's Footfall */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Today&apos;s Footfall</span>
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {formatNumber(todaysTotalFootfall)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Total store entries</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] flex items-center text-[11px] text-emerald-400 font-medium gap-0.5">
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span>+12% vs yesterday</span>
        </div>
      </div>

      {/* 2. Current Occupancy */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Current Occupancy</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {currentOccupancy}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {occupancyPct}% of {maxCap} capacity
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] flex items-center text-[11px] text-emerald-400 font-medium gap-0.5">
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span>+14% vs typical hr</span>
        </div>
      </div>

      {/* 3. Average Visit Duration */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Avg Visit Duration</span>
          <span className="h-2 w-2 rounded-full bg-blue-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-white tracking-tight">
            18.4 <span className="text-xs font-normal text-slate-400">min</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Full store journey</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] flex items-center text-[11px] text-emerald-400 font-medium gap-0.5">
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span>+2.1 min vs average</span>
        </div>
      </div>

      {/* 4. Peak Hour */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Peak Hour</span>
          <span className="h-2 w-2 rounded-full bg-amber-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-amber-300 tracking-tight">
            18:00–19:00
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">420 visitors / hr</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-amber-400 font-medium">
          Evening peak expected
        </div>
      </div>

      {/* 5. Busiest Shopping Zone */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Busiest Shopping Zone</span>
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
        </div>
        <div>
          <div className="text-lg font-bold text-white tracking-tight truncate">
            {busiestZone.name}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{busiestZone.visitors} visitors</div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-cyan-400 font-medium">
          {busiestZone.aisle}
        </div>
      </div>

      {/* 6. Highest Engagement */}
      <div className="rounded-lg bg-[#0F172A] border border-[#1E293B] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[11px] font-medium text-slate-400">Highest Engagement</span>
          <span className="h-2 w-2 rounded-full bg-purple-400" />
        </div>
        <div>
          <div className="text-lg font-bold text-purple-300 tracking-tight truncate">
            {highestEngagementZone.name}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {highestEngagementZone.avgDwellLabel} avg dwell
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-[#1E293B] text-[11px] text-purple-300 font-medium">
          Product comparison
        </div>
      </div>
    </div>
  )
}
