import React, { useMemo, useState } from 'react'
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
  CanonicalZoneAnalytics,
} from '@/components/shopper-analytics/shopperData'
import { useAppStore } from '@/store/useAppStore'
import { zonesToAnalytics } from '@/services/api/livePageAdapters'

export const ShopperAnalyticsPage: React.FC = () => {
  const storeZones = useAppStore((s) => s.zones)
  const shelfItems = useAppStore((s) => s.shelfItems)
  const cameras = useAppStore((s) => s.cameras)

  const zoneAnalytics = useMemo(
    () =>
      zonesToAnalytics(
        storeZones,
        shelfItems,
        cameras.map((c) => ({ code: c.code, zoneId: c.zoneId }))
      ),
    [storeZones, shelfItems, cameras]
  )

  const shoppingZones = useMemo(() => zoneAnalytics.filter((z) => !z.isCheckout), [zoneAnalytics])
  const checkoutZone = useMemo(
    () => zoneAnalytics.find((z) => z.isCheckout) || null,
    [zoneAnalytics]
  )

  const [selectedZone, setSelectedZone] = useState<CanonicalZoneAnalytics | null>(null)

  const handleSelectZone = (zone: CanonicalZoneAnalytics) => {
    setSelectedZone(zone)
  }

  const handleCloseDrawer = () => {
    setSelectedZone(null)
  }

  return (
    <div className="space-y-4 select-none pb-6">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 font-sans">
            <Users className="h-4 w-4 text-sky-600" />
            <span>Shopper Analytics</span>
          </h1>
        </div>
        <div className="text-[11px] text-slate-500 font-medium">
          {zoneAnalytics.length} live zones from store DB
        </div>
      </div>

      <ShopperKpiRow shoppingZones={shoppingZones} />

      <StoreHeatmapCard
        zones={zoneAnalytics}
        selectedZoneId={selectedZone?.id}
        onSelectZone={handleSelectZone}
      />

      <ZonePerformanceTable
        zones={shoppingZones}
        checkoutZone={checkoutZone}
        selectedZoneId={selectedZone?.id}
        onSelectZone={handleSelectZone}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col">
          <CustomerFlowMap />
        </div>

        <div className="lg:col-span-6 xl:col-span-5 flex flex-col">
          <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-full min-h-[420px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-purple-50 text-purple-600 border border-purple-200">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 tracking-wide font-sans">
                    Shopper Interest vs Shelf Availability
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-sans">
                    Quadrants identifying high-interest areas needing replenishment
                  </p>
                </div>
              </div>
            </div>
            <EngagementVsAvailabilityChart zones={shoppingZones} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <DwellAnalyticsCard shoppingZones={shoppingZones} checkoutZone={checkoutZone} />
        <PeakForecastCard />
      </div>

      <ZoneCameraDrawer
        zone={selectedZone}
        isOpen={!!selectedZone}
        onClose={handleCloseDrawer}
      />
    </div>
  )
}
