import React from 'react'
import { Footprints, PackageCheck, Clock, UserCheck, TrendingUp } from 'lucide-react'
import { FootfallTrendEChart } from './charts/FootfallTrendEChart'
import { ShelfHealthEChart } from './charts/ShelfHealthEChart'
import { QueueWaitTimeEChart } from './charts/QueueWaitTimeEChart'
import { StaffResponseEChart } from './charts/StaffResponseEChart'

export const FourCoreTrendGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 select-none font-mono">
      {/* 1. Footfall Trend */}
      <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E293B] mb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase">
            <Footprints className="h-3.5 w-3.5 text-cyan-400" />
            <span>1. Footfall Volume Trend</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">+12% vs Yesterday</span>
        </div>
        <FootfallTrendEChart />
      </div>

      {/* 2. Shelf Health */}
      <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E293B] mb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase">
            <PackageCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>2. Shelf Availability Health</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">91% Current (SLA 90%)</span>
        </div>
        <ShelfHealthEChart />
      </div>

      {/* 3. Queue Waiting Time */}
      <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E293B] mb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>3. Checkout Queue Wait Time</span>
          </div>
          <span className="text-[10px] text-cyan-300 font-semibold">2.7 min Avg (Target &lt;3m)</span>
        </div>
        <QueueWaitTimeEChart />
      </div>

      {/* 4. Staff Response Time */}
      <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-3.5 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E293B] mb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase">
            <UserCheck className="h-3.5 w-3.5 text-purple-400" />
            <span>4. Staff Dispatch Response Time</span>
          </div>
          <span className="text-[10px] text-purple-300 font-semibold">3.2 min Avg (SLA &lt;5m)</span>
        </div>
        <StaffResponseEChart />
      </div>
    </div>
  )
}
