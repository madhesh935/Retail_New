import React from 'react'
import {
  Compass,
  Info,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CanonicalZoneAnalytics,
} from './shopperData'

interface ZonePerformanceTableProps {
  zones: CanonicalZoneAnalytics[]
  checkoutZone?: CanonicalZoneAnalytics | null
  selectedZoneId?: string | null
  onSelectZone: (zone: CanonicalZoneAnalytics) => void
}

export const ZonePerformanceTable: React.FC<ZonePerformanceTableProps> = ({
  zones,
  checkoutZone,
  selectedZoneId,
  onSelectZone,
}) => {
  const rows = checkoutZone ? [...zones, checkoutZone] : zones
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-sky-50 text-sky-600 border border-sky-200">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Zone Performance
            </h3>
          </div>
        </div>

        <span className="text-[11px] text-slate-500">
          {rows.length} live zones
        </span>
      </div>

      {/* Clean Table */}
      <div className="overflow-x-auto my-2">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] text-slate-500 font-medium">
              <th className="py-2.5 px-3">Zone</th>
              <th className="py-2.5 px-3 text-center">Visitors Today</th>
              <th className="py-2.5 px-3 text-center">Avg Dwell</th>
              <th className="py-2.5 px-3 text-center">Traffic</th>
              <th className="py-2.5 px-3 text-center">Shelf Availability</th>
              <th className="py-2.5 px-3 text-center">Opportunity Risk</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {zones.map((zone) => {
              const isSelected = selectedZoneId === zone.id
              const isHighRisk = zone.opportunityRisk === 'HIGH'
              const isMedRisk = zone.opportunityRisk === 'MEDIUM'

              return (
                <tr
                  key={zone.id}
                  onClick={() => onSelectZone(zone)}
                  className={cn(
                    'hover:bg-slate-50 transition-colors cursor-pointer',
                    isSelected && 'bg-sky-50/50'
                  )}
                >
                  {/* Zone Name */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 text-xs">
                      {zone.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {zone.aisle}
                    </div>
                  </td>

                  {/* Visitors */}
                  <td className="py-3 px-3 text-center font-bold text-slate-900 font-mono">
                    {zone.visitors}
                  </td>

                  {/* Avg Dwell */}
                  <td className="py-3 px-3 text-center text-slate-600 font-sans">
                    {zone.avgDwellLabel}
                  </td>

                  {/* Traffic Level */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase border',
                        zone.trafficLevel === 'High'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : zone.trafficLevel === 'Medium'
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      )}
                    >
                      {zone.trafficLevel}
                    </span>
                  </td>

                  {/* Shelf Availability */}
                  <td className="py-3 px-3 text-center font-bold font-mono">
                    <span
                      className={cn(
                        zone.shelfAvailability < 70
                          ? 'text-rose-700'
                          : zone.shelfAvailability < 85
                          ? 'text-amber-800'
                          : 'text-emerald-700'
                      )}
                    >
                      {zone.shelfAvailability}%
                    </span>
                  </td>

                  {/* Opportunity Risk */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border',
                        isHighRisk
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isMedRisk
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
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
                      className="inline-flex items-center gap-1 text-[11px] text-sky-700 hover:text-sky-800 font-semibold cursor-pointer"
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
      {checkoutZone && (
        <div className="mt-2 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs font-sans">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{checkoutZone.name}:</span>
            <span className="text-slate-600">
              {checkoutZone.visitors} customer transitions · {checkoutZone.avgDwellLabel} average queue wait
            </span>
          </div>
          <button
            onClick={() => onSelectZone(checkoutZone)}
            className="text-sky-700 hover:text-sky-800 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <span>View Checkout Cameras →</span>
          </button>
        </div>
      )}
    </div>
  )
}
