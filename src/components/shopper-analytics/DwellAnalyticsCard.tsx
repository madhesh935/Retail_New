import React from 'react'
import {
  Clock,
  Info,
} from 'lucide-react'
import { SHOPPING_ZONES, CHECKOUT_ZONE } from './shopperData'

export const DwellAnalyticsCard: React.FC = () => {
  // Sort shopping zones by dwell descending
  const sortedShoppingZones = [...SHOPPING_ZONES].sort(
    (a, b) => b.avgDwellMinutes - a.avgDwellMinutes
  )

  const maxDwell = 5.0 // scale baseline

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none h-full min-h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-blue-400">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide">
              Dwell Time by Zone
            </h3>
          </div>
        </div>

        <span className="text-[11px] text-slate-400">
          Store Avg: <strong className="text-white">18.4 min</strong>
        </span>
      </div>

      {/* Horizontal Ranked Bar Chart */}
      <div className="space-y-3 flex-1 justify-center flex flex-col my-1">
        {sortedShoppingZones.map((zone) => {
          const widthPct = Math.round((zone.avgDwellMinutes / maxDwell) * 100)

          return (
            <div key={zone.id} className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs flex items-center gap-2">
                  <span>{zone.name}</span>
                  <span className="text-[10px] text-slate-500 font-normal">({zone.aisle})</span>
                </span>
                <span className="font-mono font-bold text-white text-xs">
                  {zone.avgDwellLabel}
                </span>
              </div>

              <div className="h-2 w-full bg-[#090D14] rounded-full overflow-hidden border border-[#1E293B]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor:
                      zone.id === 'zone-electronics'
                        ? '#A855F7'
                        : zone.id === 'zone-produce'
                        ? '#10B981'
                        : zone.id === 'zone-dairy'
                        ? '#06B6D4'
                        : zone.id === 'zone-household'
                        ? '#64748B'
                        : '#F59E0B',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Separate Checkout Wait Time Callout */}
      <div className="mt-2 pt-3 border-t border-[#1E293B] bg-[#090D14] p-3 rounded-lg flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-300">Checkout Queue Wait:</span>
          <span className="text-slate-400">
            {CHECKOUT_ZONE.avgDwellLabel} average service wait (Queue friction, not product browsing)
          </span>
        </div>
      </div>
    </div>
  )
}
