import React, { useState } from 'react'
import {
  Flame,
  Layers,
} from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'
import { CanonicalZoneAnalytics } from './shopperData'
import { useAppStore } from '@/store/useAppStore'

export type TrafficTimeRange = 'LIVE' | 'LAST_HOUR' | 'TODAY' | '7_DAYS'
export type MapViewMode = 'HEATMAP' | 'ZONE_VIEW'

interface StoreHeatmapCardProps {
  zones: CanonicalZoneAnalytics[]
  selectedZoneId?: string | null
  onSelectZone: (zone: CanonicalZoneAnalytics) => void
}

const zoneCardBase =
  'p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-28 relative group bg-white shadow-sm'

export const StoreHeatmapCard: React.FC<StoreHeatmapCardProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
}) => {
  const [timeRange, setTimeRange] = useState<TrafficTimeRange>('LIVE')
  const [viewMode, setViewMode] = useState<MapViewMode>('HEATMAP')
  const [hoveredZone, setHoveredZone] = useState<CanonicalZoneAnalytics | null>(null)
  const todaysTotalFootfall = useAppStore((s) => s.todaysTotalFootfall)

  const shopping = zones.filter((z) => !z.isCheckout)
  const checkoutZone = zones.find((z) => z.isCheckout)

  const cardClass = (zoneId: string, extraIdle?: string) =>
    cn(
      zoneCardBase,
      selectedZoneId === zoneId
        ? 'border-sky-500 ring-2 ring-sky-200'
        : cn('border-slate-200 hover:border-slate-300 hover:shadow-md', extraIdle)
    )

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <span>Live Store Traffic Map</span>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-semibold">
                {timeRange.replace(/_/g, ' ')}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 shadow-2xs">
            {(
              [
                { key: 'LIVE', label: 'Live' },
                { key: 'LAST_HOUR', label: 'Last Hour' },
                { key: 'TODAY', label: 'Today' },
                { key: '7_DAYS', label: '7 Days' },
              ] as { key: TrafficTimeRange; label: string }[]
            ).map((range) => (
              <button
                key={range.key}
                onClick={() => setTimeRange(range.key)}
                className={cn(
                  'px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px] font-medium',
                  timeRange === range.key
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>

          <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 shadow-2xs">
            <button
              onClick={() => setViewMode('HEATMAP')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px] font-medium flex items-center gap-1',
                viewMode === 'HEATMAP'
                  ? 'bg-white text-amber-700 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <Flame className="h-3 w-3" />
              <span>Heatmap</span>
            </button>
            <button
              onClick={() => setViewMode('ZONE_VIEW')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px] font-medium flex items-center gap-1',
                viewMode === 'ZONE_VIEW'
                  ? 'bg-white text-sky-700 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <Layers className="h-3 w-3" />
              <span>Zone View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Floor Spatial Map — light theme */}
      <div className="relative w-full h-[360px] my-3 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden p-3">
        {viewMode === 'HEATMAP' && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-300">
            <div className="absolute top-[20%] right-[12%] w-52 h-40 rounded-full bg-rose-400/20 blur-3xl" />
            <div className="absolute top-[20%] left-[8%] w-52 h-40 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute bottom-[10%] right-[10%] w-60 h-36 rounded-full bg-rose-400/25 blur-3xl" />
            <div className="absolute top-[20%] left-[40%] w-44 h-36 rounded-full bg-sky-400/15 blur-3xl" />
          </div>
        )}

        <div className="relative w-full h-full flex flex-col justify-between z-10">
          <div className="flex justify-center">
            <div className="w-64 py-2 px-3 rounded-lg bg-white border border-slate-200 text-center shadow-sm flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">Store Entrance & Lobby</span>
              <span className="text-[10px] text-sky-700 font-medium font-mono">Inflow: {formatNumber(todaysTotalFootfall)} / day</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1 content-center">
            {[...shopping, ...(checkoutZone ? [checkoutZone] : [])].map((zone) => (
              <button
                key={zone.id}
                onClick={() => onSelectZone(zone)}
                onMouseEnter={() => setHoveredZone(zone)}
                onMouseLeave={() => setHoveredZone(null)}
                className={cardClass(
                  zone.id,
                  zone.opportunityRisk === 'HIGH' ? 'border-rose-200 hover:border-rose-300' : undefined
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-xs">{zone.name}</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {zone.trafficLevel.toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <span>{zone.visitors} visitors today</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>
                    Dwell: <strong className="text-slate-800">{zone.avgDwellLabel}</strong>
                  </span>
                  <span>
                    Shelf: <strong className="text-emerald-700">{zone.shelfAvailability}%</strong>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {hoveredZone && (
          <div className="absolute top-2 right-2 bg-white border border-slate-200 p-2.5 rounded-xl text-xs shadow-xl pointer-events-none z-20 w-48 space-y-1">
            <div className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-1 flex justify-between">
              <span>{hoveredZone.name}</span>
              <span className="text-sky-700 font-mono text-[10px]">{hoveredZone.aisle}</span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-0.5 pt-0.5 font-sans">
              <div className="flex justify-between"><span>Visitors Today:</span> <strong className="text-slate-900 font-mono">{hoveredZone.visitors}</strong></div>
              <div className="flex justify-between"><span>Current Inside:</span> <strong className="text-sky-700 font-mono">{hoveredZone.currentOccupancy}</strong></div>
              <div className="flex justify-between"><span>Avg Dwell:</span> <strong className="text-slate-900 font-mono">{hoveredZone.avgDwellLabel}</strong></div>
              <div className="flex justify-between"><span>Traffic Level:</span> <strong className="text-amber-800 font-mono">{hoveredZone.trafficLevel}</strong></div>
              <div className="flex justify-between"><span>Shelf Availability:</span> <strong className="text-emerald-700 font-mono">{hoveredZone.shelfAvailability}%</strong></div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-sans">
        <span>Click any zone to view live camera evidence and deep analytics</span>
        <span className="text-sky-700 font-semibold">● Store Map Synchronized</span>
      </div>
    </div>
  )
}
