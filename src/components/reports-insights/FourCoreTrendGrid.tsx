import React from 'react'
import { Footprints, PackageCheck, Clock, UserCheck, TrendingUp } from 'lucide-react'
import { FootfallTrendEChart } from './charts/FootfallTrendEChart'
import { ShelfHealthEChart } from './charts/ShelfHealthEChart'
import { QueueWaitTimeEChart } from './charts/QueueWaitTimeEChart'
import { StaffResponseEChart } from './charts/StaffResponseEChart'

export const FourCoreTrendGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 select-none font-sans">
      {/* 1. Footfall Trend */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase">
            <Footprints className="h-3.5 w-3.5 text-sky-600" />
            <span>1. Footfall Volume Trend</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">+12% vs Yesterday</span>
        </div>
        <FootfallTrendEChart />
      </div>

      {/* 2. Shelf Health */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase">
            <PackageCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>2. Shelf Availability Health</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">91% Current (SLA 90%)</span>
        </div>
        <ShelfHealthEChart />
      </div>

      {/* 3. Queue Waiting Time */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>3. Checkout Queue Wait Time</span>
          </div>
          <span className="text-[10px] text-sky-700 font-semibold">2.7 min Avg (Target &lt;3m)</span>
        </div>
        <QueueWaitTimeEChart />
      </div>

      {/* 4. Staff Response Time */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase">
            <UserCheck className="h-3.5 w-3.5 text-purple-600" />
            <span>4. Staff Dispatch Response Time</span>
          </div>
          <span className="text-[10px] text-purple-700 font-semibold">3.2 min Avg (SLA &lt;5m)</span>
        </div>
        <StaffResponseEChart />
      </div>
    </div>
  )
}
