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
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none h-full min-h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-amber-400">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide">
              Traffic Forecast
            </h3>
          </div>
        </div>

        <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30 font-medium">
          Next Peak in ~45 min
        </span>
      </div>

      {/* 3 Core Forecast Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs mb-3">
        <div className="bg-[#090D14] p-3 rounded-lg border border-[#1E293B] space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Next Expected Peak</span>
          <div className="text-lg font-bold text-amber-300">19:00–19:30</div>
          <div className="text-[10px] text-slate-400">Evening rush window</div>
        </div>

        <div className="bg-[#090D14] p-3 rounded-lg border border-[#1E293B] space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Expected Occupancy</span>
          <div className="text-lg font-bold text-white">145–160</div>
          <div className="text-[10px] text-slate-400">46% store capacity</div>
        </div>

        <div className="bg-[#090D14] p-3 rounded-lg border border-[#1E293B] space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Likely Busiest Areas</span>
          <div className="text-sm font-bold text-rose-400 truncate">Beverages &amp; Checkout</div>
          <div className="text-[10px] text-slate-400">Registers C1, C2, C3</div>
        </div>
      </div>

      {/* Operational Recommendation Box */}
      <div className="p-3 rounded-lg bg-[#090D14] border border-[#1E293B] space-y-2 text-xs flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Recommended Preparation</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Prepare one additional checkout staff member before 19:00, and complete Cold Beverages (Shelf B4) replenishment to prevent peak stockout.
          </p>
        </div>

        <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between">
          <span className="text-[10px] text-slate-500">Actionable staffing &amp; inventory advisory</span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => navigate('/staff')}
            className="text-cyan-400 hover:text-cyan-300 gap-1 text-[11px] h-7 px-2 font-medium"
          >
            <span>View Staff Operations</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
