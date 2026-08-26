import React, { useState } from 'react'
import {
  Users,
  Sparkles,
} from 'lucide-react'
import { ShopperKpiRow } from '@/components/shopper-analytics/ShopperKpiRow'
import { StoreHeatmapCard } from '@/components/shopper-analytics/StoreHeatmapCard'
import { ZonePerformanceTable } from '@/components/shopper-analytics/ZonePerformanceTable'
import { CustomerFlowMap } from '@/components/shopper-analytics/CustomerFlowMap'
import { EngagementVsAvailabilityChart } from '@/components/shopper-analytics/EngagementVsAvailabilityChart'
import { DwellAnalyticsCard } from '@/components/shopper-analytics/DwellAnalyticsCard'
import { PeakForecastCard } from '@/components/shopper-analytics/PeakForecastCard'
import { ZoneCameraDrawer } from '@/components/shopper-analytics/ZoneCameraDrawer'
import {
  CANONICAL_ZONE_ANALYTICS,
  CanonicalZoneAnalytics,
} from '@/components/shopper-analytics/shopperData'

export const ShopperAnalyticsPage: React.FC = () => {
  // Selected zone for synchronized highlight and detail drawer
  const [selectedZone, setSelectedZone] = useState<CanonicalZoneAnalytics | null>(null)

  const handleSelectZone = (zone: CanonicalZoneAnalytics) => {
    setSelectedZone(zone)
  }

  const handleCloseDrawer = () => {
    setSelectedZone(null)
  }

  return (
    <div className="space-y-4 select-none pb-6">
      {/* ======================================================= */}
      {/* 1. PAGE HEADER */}
      {/* ======================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              <span>Shopper Analytics</span>
            </h1>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              Live Flow &amp; Density
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Updated 2 sec ago</span>
        </div>
      </div>

      {/* 2. Top 6 Shopper Analytics KPI Cards */}
      <ShopperKpiRow />

      {/* 4. Live Store Traffic Map */}
      <StoreHeatmapCard
        selectedZoneId={selectedZone?.id}
        onSelectZone={handleSelectZone}
      />

      {/* 5. Zone Performance Summary Table */}
      <ZonePerformanceTable
        selectedZoneId={selectedZone?.id}
        onSelectZone={handleSelectZone}
      />

      {/* 6. Shopper Flow Patterns (Left) & Interest vs Availability (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col">
          <CustomerFlowMap />
        </div>

        <div className="lg:col-span-6 xl:col-span-5 flex flex-col">
          <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none h-full min-h-[420px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-[#1E293B] text-purple-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white tracking-wide">
                    Shopper Interest vs Shelf Availability
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Quadrants identifying high-interest areas needing replenishment
                  </p>
                </div>
              </div>
            </div>

            {/* Scatter Chart */}
            <div className="my-1 flex-1 flex items-center justify-center">
              <EngagementVsAvailabilityChart onSelectZone={handleSelectZone} />
            </div>

            {/* Footer Alert */}
            <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
              <span className="text-rose-400 font-medium">
                Cold Beverages: 82% Interest / 61% Shelf Availability
              </span>
              <span className="text-amber-300 font-medium">Needs Attention</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Dwell Time by Zone (Left) & Traffic Forecast (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-6 flex flex-col">
          <DwellAnalyticsCard />
        </div>

        <div className="lg:col-span-6 flex flex-col">
          <PeakForecastCard />
        </div>
      </div>

      {/* Slide-over Zone Detail Drawer */}
      <ZoneCameraDrawer
        zone={selectedZone}
        onClose={handleCloseDrawer}
      />
    </div>
  )
}
