import React from 'react'
import {
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export const PeakForecastCard: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-full min-h-[380px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Traffic Forecast
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-semibold">
          Next Peak in ~45 min
        </span>
      </div>

      {/* 3 Core Forecast Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs mb-3">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-500 block font-medium">Next Expected Peak</span>
          <div className="text-lg font-bold text-amber-800">19:00–19:30</div>
          <div className="text-[10px] text-slate-500">Evening rush window</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-500 block font-medium">Expected Occupancy</span>
          <div className="text-lg font-bold text-slate-900">145–160</div>
          <div className="text-[10px] text-slate-500">46% store capacity</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
          <span className="text-[10px] text-slate-500 block font-medium">Likely Busiest Areas</span>
          <div className="text-sm font-bold text-rose-700 truncate">Beverages &amp; Checkout</div>
          <div className="text-[10px] text-slate-500">Registers C1, C2, C3</div>
        </div>
      </div>

      {/* Operational Recommendation Box */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs flex-1 flex flex-col justify-between shadow-2xs">
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-sky-600" />
            <span>Recommended Preparation</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
            Prepare one additional checkout staff member before 19:00, and complete Cold Beverages (Shelf B4) replenishment to prevent peak stockout.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">Actionable staffing &amp; inventory advisory</span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => navigate('/staff')}
            className="text-sky-700 hover:text-sky-800 gap-1 text-[11px] h-7 px-2 font-semibold"
          >
            <span>View Staff Operations</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
