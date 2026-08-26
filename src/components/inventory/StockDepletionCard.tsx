import React from 'react'
import { TrendingDown } from 'lucide-react'
import { DepletionAreaChart } from './charts/DepletionAreaChart'

interface StockDepletionCardProps {
  shelfName: string
  skuName: string
  availability: number
  consumptionRate: string
  predictedStockout: string
  replenishmentDeadline: string
  onDispatchRefill?: () => void
}

export const StockDepletionCard: React.FC<StockDepletionCardProps> = ({
  shelfName,
  skuName,
  availability,
  consumptionRate,
  predictedStockout,
  replenishmentDeadline,
}) => {
  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none h-full min-h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-rose-400">
            <TrendingDown className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide">
              Depletion Forecast
            </h3>
            <span className="text-[11px] text-slate-400">
              {shelfName} · {skuName}
            </span>
          </div>
        </div>

        <span className="text-[10px] text-rose-400 font-medium bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40">
          Fast Depletion
        </span>
      </div>

      {/* Depletion Chart */}
      <div className="my-2 flex-1 flex flex-col justify-center">
        <DepletionAreaChart currentAvailability={availability} />
      </div>

      {/* Four Clean Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1E293B] text-xs">
        <div className="bg-[#090D14] p-2.5 rounded border border-[#1E293B]">
          <span className="text-[10px] text-slate-400 block font-medium">Current Shelf</span>
          <span className="text-base font-bold text-rose-400">{availability}%</span>
        </div>

        <div className="bg-[#090D14] p-2.5 rounded border border-[#1E293B]">
          <span className="text-[10px] text-slate-400 block font-medium">Demand</span>
          <span className="text-base font-bold text-white">{consumptionRate}</span>
        </div>

        <div className="bg-[#090D14] p-2.5 rounded border border-[#1E293B]">
          <span className="text-[10px] text-slate-400 block font-medium">Expected Empty</span>
          <span className="text-base font-bold text-rose-400">{predictedStockout}</span>
        </div>

        <div className="bg-[#090D14] p-2.5 rounded border border-[#1E293B]">
          <span className="text-[10px] text-slate-400 block font-medium">Replenish By</span>
          <span className="text-base font-bold text-amber-300">{replenishmentDeadline}</span>
        </div>
      </div>
    </div>
  )
}
