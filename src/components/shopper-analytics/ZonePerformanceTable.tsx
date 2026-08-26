import React from 'react'
import {
  Compass,
  Info,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SHOPPING_ZONES,
  CHECKOUT_ZONE,
  CanonicalZoneAnalytics,
} from './shopperData'

interface ZonePerformanceTableProps {
  selectedZoneId?: string | null
  onSelectZone: (zone: CanonicalZoneAnalytics) => void
}

export const ZonePerformanceTable: React.FC<ZonePerformanceTableProps> = ({
  selectedZoneId,
  onSelectZone,
}) => {
  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-slate-300">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide">
              Zone Performance
            </h3>
          </div>
        </div>

        <span className="text-[11px] text-slate-400">
          5 Main Shopping Zones
        </span>
      </div>

      {/* Clean Table */}
      <div className="overflow-x-auto my-2">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E293B] text-[11px] text-slate-400 font-medium">
              <th className="py-2.5 px-3">Zone</th>
              <th className="py-2.5 px-3 text-center">Visitors Today</th>
              <th className="py-2.5 px-3 text-center">Avg Dwell</th>
              <th className="py-2.5 px-3 text-center">Traffic</th>
              <th className="py-2.5 px-3 text-center">Shelf Availability</th>
              <th className="py-2.5 px-3 text-center">Opportunity Risk</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B] text-xs">
            {SHOPPING_ZONES.map((zone) => {
              const isSelected = selectedZoneId === zone.id
              const isHighRisk = zone.opportunityRisk === 'HIGH'
              const isMedRisk = zone.opportunityRisk === 'MEDIUM'

              return (
                <tr
                  key={zone.id}
                  onClick={() => onSelectZone(zone)}
                  className={cn(
                    'hover:bg-[#131D31] transition-colors cursor-pointer',
                    isSelected && 'bg-[#131D31]'
                  )}
                >
                  {/* Zone Name */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white text-xs">
                      {zone.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {zone.aisle}
                    </div>
                  </td>

                  {/* Visitors */}
                  <td className="py-3 px-3 text-center font-semibold text-white">
                    {zone.visitors}
                  </td>

                  {/* Avg Dwell */}
                  <td className="py-3 px-3 text-center text-slate-300">
                    {zone.avgDwellLabel}
                  </td>

                  {/* Traffic Level */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase',
                        zone.trafficLevel === 'High'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                          : zone.trafficLevel === 'Medium'
                          ? 'bg-[#1E293B] text-slate-200'
                          : 'bg-[#1E293B]/60 text-slate-400'
                      )}
                    >
                      {zone.trafficLevel}
                    </span>
                  </td>

                  {/* Shelf Availability */}
                  <td className="py-3 px-3 text-center font-semibold">
                    <span
                      className={cn(
                        zone.shelfAvailability < 70
                          ? 'text-rose-400'
                          : zone.shelfAvailability < 85
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      )}
                    >
                      {zone.shelfAvailability}%
                    </span>
                  </td>

                  {/* Opportunity Risk */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase',
                        isHighRisk
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                          : isMedRisk
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      )}
                      title="High shopper activity combined with limited shelf availability."
                    >
                      {zone.opportunityRisk === 'HIGH'
                        ? 'High Risk'
                        : zone.opportunityRisk === 'MEDIUM'
                        ? 'Medium Risk'
                        : 'Normal'}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectZone(zone)
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                    >
                      <span>Details</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Checkout Separate Section */}
      <div className="mt-2 pt-3 border-t border-[#1E293B] bg-[#090D14] p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Checkout Plaza (Registers C1–C4):</span>
          <span className="text-slate-400">
            {CHECKOUT_ZONE.visitors} customer transitions · {CHECKOUT_ZONE.avgDwellLabel} average queue wait
          </span>
        </div>
        <button
          onClick={() => onSelectZone(CHECKOUT_ZONE)}
          className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] flex items-center gap-1 cursor-pointer"
        >
          <span>View Checkout Cameras →</span>
        </button>
      </div>
    </div>
  )
}
