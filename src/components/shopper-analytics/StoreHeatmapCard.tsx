import React, { useState } from 'react'
import {
  Flame,
  Users,
  Eye,
  Layers,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CANONICAL_ZONE_ANALYTICS, CanonicalZoneAnalytics } from './shopperData'

export type TrafficTimeRange = 'LIVE' | 'LAST_HOUR' | 'TODAY' | '7_DAYS'
export type MapViewMode = 'HEATMAP' | 'ZONE_VIEW'

interface StoreHeatmapCardProps {
  selectedZoneId?: string | null
  onSelectZone: (zone: CanonicalZoneAnalytics) => void
}

export const StoreHeatmapCard: React.FC<StoreHeatmapCardProps> = ({
  selectedZoneId,
  onSelectZone,
}) => {
  const [timeRange, setTimeRange] = useState<TrafficTimeRange>('LIVE')
  const [viewMode, setViewMode] = useState<MapViewMode>('HEATMAP')
  const [hoveredZone, setHoveredZone] = useState<CanonicalZoneAnalytics | null>(null)

  const produceZone = CANONICAL_ZONE_ANALYTICS.find((z) => z.id === 'zone-produce')!
  const beverageZone = CANONICAL_ZONE_ANALYTICS.find((z) => z.id === 'zone-beverages')!
  const dairyZone = CANONICAL_ZONE_ANALYTICS.find((z) => z.id === 'zone-dairy')!
  const electronicsZone = CANONICAL_ZONE_ANALYTICS.find((z) => z.id === 'zone-electronics')!
  const householdZone = CANONICAL_ZONE_ANALYTICS.find((z) => z.id === 'zone-household')!
  const checkoutZone = CANONICAL_ZONE_ANALYTICS.find((z) => z.id === 'zone-checkout')!

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

        {/* Filters & View Mode */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Time Range Pills */}
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

          {/* Heatmap vs Zone View Toggle */}
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

      {/* Main Floor Spatial Map Canvas */}
      <div className="relative w-full h-[360px] my-3 rounded-xl bg-[#070A0F] border border-slate-200 overflow-hidden p-3">
        {/* Soft Heat Density Radial Overlays (Visible in Heatmap Mode) */}
        {viewMode === 'HEATMAP' && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-300">
            {/* Beverages Hotspot (High Traffic - Warm Rose/Red) */}
            <div className="absolute top-[20%] right-[12%] w-52 h-40 rounded-full bg-rose-500/25 blur-3xl" />
            {/* Fresh Produce Hotspot (High Traffic - Warm Amber/Rose) */}
            <div className="absolute top-[20%] left-[8%] w-52 h-40 rounded-full bg-amber-500/25 blur-3xl" />
            {/* Checkout Hotspot (High Throughput - Rose) */}
            <div className="absolute bottom-[10%] right-[10%] w-60 h-36 rounded-full bg-rose-600/30 blur-3xl" />
            {/* Dairy Hotspot (Medium Traffic - Amber/Cyan) */}
            <div className="absolute top-[20%] left-[40%] w-44 h-36 rounded-full bg-cyan-500/20 blur-3xl" />
          </div>
        )}

        {/* Store Zone Layout Grid */}
        <div className="relative w-full h-full flex flex-col justify-between z-10">
          {/* Top Row: Store Entrance Lobby */}
          <div className="flex justify-center">
            <div className="w-64 py-2 px-3 rounded-lg bg-slate-900/90 border border-slate-700 text-center shadow-sm flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-200">Store Entrance & Lobby</span>
              <span className="text-[10px] text-sky-400 font-medium font-mono">Inflow: 1,840 / day</span>
            </div>
          </div>

          {/* Middle Row 1: Produce | Dairy | Beverages */}
          <div className="grid grid-cols-3 gap-3">
            {/* Fresh Produce */}
            <button
              onClick={() => onSelectZone(produceZone)}
              onMouseEnter={() => setHoveredZone(produceZone)}
              onMouseLeave={() => setHoveredZone(null)}
              className={cn(
                'p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-28 relative group',
                selectedZoneId === produceZone.id
                  ? 'bg-slate-900/95 border-sky-400 shadow-sm ring-2 ring-sky-400'
                  : 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs">{produceZone.name}</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30">
                  HIGH
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                <span>{produceZone.visitors} visitors today</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700">
                <span>Dwell: <strong className="text-white">{produceZone.avgDwellLabel}</strong></span>
                <span>Shelf: <strong className="text-emerald-400">{produceZone.shelfAvailability}%</strong></span>
              </div>
            </button>

            {/* Dairy & Chilled */}
            <button
              onClick={() => onSelectZone(dairyZone)}
              onMouseEnter={() => setHoveredZone(dairyZone)}
              onMouseLeave={() => setHoveredZone(null)}
              className={cn(
                'p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-28 relative group',
                selectedZoneId === dairyZone.id
                  ? 'bg-slate-900/95 border-sky-400 shadow-sm ring-2 ring-sky-400'
                  : 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs">{dairyZone.name}</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-600">
                  MEDIUM
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                <span>{dairyZone.visitors} visitors today</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700">
                <span>Dwell: <strong className="text-white">{dairyZone.avgDwellLabel}</strong></span>
                <span>Shelf: <strong className="text-amber-300">{dairyZone.shelfAvailability}%</strong></span>
              </div>
            </button>

            {/* Cold Beverages */}
            <button
              onClick={() => onSelectZone(beverageZone)}
              onMouseEnter={() => setHoveredZone(beverageZone)}
              onMouseLeave={() => setHoveredZone(null)}
              className={cn(
                'p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-28 relative group',
                selectedZoneId === beverageZone.id
                  ? 'bg-slate-900/95 border-sky-400 shadow-sm ring-2 ring-sky-400'
                  : 'bg-slate-900/80 border-rose-500/60 hover:border-rose-400'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs">{beverageZone.name}</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40">
                  HIGH
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                <span>{beverageZone.visitors} visitors today</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700">
                <span>Dwell: <strong className="text-white">{beverageZone.avgDwellLabel}</strong></span>
                <span>Shelf: <strong className="text-rose-400">{beverageZone.shelfAvailability}%</strong></span>
              </div>
            </button>
          </div>

          {/* Middle Row 2: Household | Electronics | Checkout */}
          <div className="grid grid-cols-3 gap-3">
            {/* Household & Essentials */}
            <button
              onClick={() => onSelectZone(householdZone)}
              onMouseEnter={() => setHoveredZone(householdZone)}
              onMouseLeave={() => setHoveredZone(null)}
              className={cn(
                'p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-28 relative group',
                selectedZoneId === householdZone.id
                  ? 'bg-slate-900/95 border-sky-400 shadow-sm ring-2 ring-sky-400'
                  : 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs">{householdZone.name}</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  LOW
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                <span>{householdZone.visitors} visitors today</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700">
                <span>Dwell: <strong className="text-white">{householdZone.avgDwellLabel}</strong></span>
                <span>Shelf: <strong className="text-emerald-400">{householdZone.shelfAvailability}%</strong></span>
              </div>
            </button>

            {/* Electronics & Gadgets */}
            <button
              onClick={() => onSelectZone(electronicsZone)}
              onMouseEnter={() => setHoveredZone(electronicsZone)}
              onMouseLeave={() => setHoveredZone(null)}
              className={cn(
                'p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-28 relative group',
                selectedZoneId === electronicsZone.id
                  ? 'bg-slate-900/95 border-sky-400 shadow-sm ring-2 ring-sky-400'
                  : 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs">{electronicsZone.name}</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
                  HIGH DWELL
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                <span>{electronicsZone.visitors} visitors today</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700">
                <span>Dwell: <strong className="text-purple-300">{electronicsZone.avgDwellLabel}</strong></span>
                <span>Shelf: <strong className="text-emerald-400">{electronicsZone.shelfAvailability}%</strong></span>
              </div>
            </button>

            {/* Checkout Plaza */}
            <button
              onClick={() => onSelectZone(checkoutZone)}
              onMouseEnter={() => setHoveredZone(checkoutZone)}
              onMouseLeave={() => setHoveredZone(null)}
              className={cn(
                'p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between h-28 relative group',
                selectedZoneId === checkoutZone.id
                  ? 'bg-slate-900/95 border-sky-400 shadow-sm ring-2 ring-sky-400'
                  : 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-xs">{checkoutZone.name}</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30">
                  REGISTERS C1–C4
                </span>
              </div>
              <div className="text-[11px] text-slate-300">
                <span>{checkoutZone.visitors} transitions</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-700">
                <span>Queue Wait: <strong className="text-amber-300">{checkoutZone.avgDwellLabel}</strong></span>
                <span>Staff: <strong className="text-emerald-400">3 Active</strong></span>
              </div>
            </button>
          </div>
        </div>

        {/* Hover Tooltip Overlay */}
        {hoveredZone && (
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md border border-slate-200 p-2.5 rounded-xl text-xs shadow-xl pointer-events-none z-20 w-48 space-y-1">
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

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-sans">
        <span>Click any zone to view live camera evidence and deep analytics</span>
        <span className="text-sky-700 font-semibold">● Store Map Synchronized</span>
      </div>
    </div>
  )
}
