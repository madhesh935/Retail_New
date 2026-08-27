import React from 'react'
import {
  Clock,
  Info,
} from 'lucide-react'
import { CanonicalZoneAnalytics } from './shopperData'

interface DwellAnalyticsCardProps {
  shoppingZones?: CanonicalZoneAnalytics[]
  checkoutZone?: CanonicalZoneAnalytics | null
}

export const DwellAnalyticsCard: React.FC<DwellAnalyticsCardProps> = ({
  shoppingZones = [],
  checkoutZone = null,
}) => {
  // Sort shopping zones by dwell descending
  const sortedShoppingZones = [...shoppingZones].sort(
    (a, b) => b.avgDwellMinutes - a.avgDwellMinutes
  )

  const maxDwell = Math.max(5, ...sortedShoppingZones.map((z) => z.avgDwellMinutes), checkoutZone?.avgDwellMinutes || 0)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-full min-h-[380px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Dwell Time by Zone
            </h3>
          </div>
        </div>

        <span className="text-[11px] text-slate-500">
          Store Avg: <strong className="text-slate-900">18.4 min</strong>
        </span>
      </div>

      {/* Horizontal Ranked Bar Chart */}
      <div className="space-y-3 flex-1 justify-center flex flex-col my-1">
        {sortedShoppingZones.map((zone) => {
          const widthPct = Math.round((zone.avgDwellMinutes / maxDwell) * 100)

          return (
            <div key={zone.id} className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-xs flex items-center gap-2">
                  <span>{zone.name}</span>
                  <span className="text-[10px] text-slate-500 font-normal">({zone.aisle})</span>
                </span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {zone.avgDwellLabel}
                </span>
              </div>

              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
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
      <div className="mt-2 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-2xs font-sans">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-800">Checkout Queue Wait:</span>
          <span className="text-slate-600">
            {checkoutZone?.avgDwellLabel || '—'} average service wait (Queue friction, not product browsing)
          </span>
        </div>
      </div>
    </div>
  )
}
