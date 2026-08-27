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
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-full min-h-[380px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
            <TrendingDown className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Depletion Forecast
            </h3>
            <span className="text-[11px] text-slate-500">
              {shelfName} · {skuName}
            </span>
          </div>
        </div>

        <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
          Fast Depletion
        </span>
      </div>

      {/* Depletion Chart */}
      <div className="my-2 flex-1 flex flex-col justify-center">
        <DepletionAreaChart currentAvailability={availability} />
      </div>

      {/* Four Clean Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 block font-medium">Current Shelf</span>
          <span className="text-base font-bold text-rose-700">{availability}%</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 block font-medium">Demand</span>
          <span className="text-base font-bold text-slate-900">{consumptionRate}</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 block font-medium">Expected Empty</span>
          <span className="text-base font-bold text-rose-700">{predictedStockout}</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 block font-medium">Replenish By</span>
          <span className="text-base font-bold text-amber-700">{replenishmentDeadline}</span>
        </div>
      </div>
    </div>
  )
}
