import React from 'react'
import {
  X,
  Camera,
  Scan,
  Boxes,
  Compass,
  ArrowRight,
  Users,
  Footprints,
  Clock,
  PackageCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CanonicalZoneAnalytics } from './shopperData'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { zonesToAnalytics } from '@/services/api/livePageAdapters'

interface ZoneCameraDrawerProps {
  zone?: CanonicalZoneAnalytics | null
  cameraCode?: string | null
  zoneName?: string | null
  isOpen?: boolean
  onClose: () => void
}

export const ZoneCameraDrawer: React.FC<ZoneCameraDrawerProps> = ({
  zone: propZone,
  cameraCode,
  zoneName,
  isOpen = true,
  onClose,
}) => {
  const navigate = useNavigate()

  // Real zone/camera associations from the store — the previous static mock
  // mapping (CANONICAL_ZONE_ANALYTICS) had camera codes wired to different
  // zones than the live backend, so a real camera code could resolve to a
  // completely unrelated zone's fabricated stats.
  const storeZones = useAppStore((s) => s.zones)
  const shelfItems = useAppStore((s) => s.shelfItems)
  const storeCameras = useAppStore((s) => s.cameras)
  const liveZoneAnalytics = React.useMemo(
    () =>
      zonesToAnalytics(
        storeZones,
        shelfItems,
        storeCameras.map((c) => ({ code: c.code, zoneId: c.zoneId }))
      ),
    [storeZones, shelfItems, storeCameras]
  )

  const activeZone =
    propZone ||
    liveZoneAnalytics.find(
      (z) =>
        (cameraCode && z.cameraCode.toLowerCase() === cameraCode.toLowerCase()) ||
        (zoneName && z.name.toLowerCase().includes(zoneName.toLowerCase()))
    ) ||
    null

  if (!isOpen) return null
  if (!propZone && !cameraCode) return null

  if (!activeZone) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end select-none font-sans">
        <div
          className="fixed inset-0 bg-slate-900/35 backdrop-blur-[2px] transition-opacity animate-in fade-in-0"
          onClick={onClose}
        />
        <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200/90 z-10 flex flex-col shadow-[-12px_0_40px_-12px_rgb(15_23_42/0.18)] animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                <Camera className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
                  {zoneName || cameraCode || 'Unknown Camera'}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">No live data for this camera</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 rounded-lg shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-6">
            <div className="p-2.5 rounded-full bg-slate-50 border border-slate-200 text-slate-400">
              <Camera className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-700">No live data for this camera</h4>
            <p className="text-[11px] text-slate-500 max-w-xs">
              This camera code doesn&apos;t match a zone currently reporting live occupancy data from the store backend.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const shelfHealthy = activeZone.shelfAvailability >= 80

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none font-sans">
      <div
        className="fixed inset-0 bg-slate-900/35 backdrop-blur-[2px] transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200/90 z-10 flex flex-col shadow-[-12px_0_40px_-12px_rgb(15_23_42/0.18)] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl erp-brand-mark text-white flex items-center justify-center shrink-0">
              <Camera className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
                {activeZone.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  {activeZone.aisle}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] font-bold text-sky-700 font-mono">
                  {activeZone.cameraCode}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 rounded-lg shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Live camera preview — realistic ops panel, not neon HUD */}
          <div className="relative h-56 rounded-2xl overflow-hidden border border-slate-800/80 shadow-[var(--shadow-erp-md)] bg-slate-950">
            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage: `
                  linear-gradient(160deg, rgba(15,118,110,0.35) 0%, transparent 45%),
                  linear-gradient(0deg, rgba(2,6,23,0.92) 0%, transparent 55%),
                  radial-gradient(ellipse at 30% 40%, rgba(15,118,110,0.2), transparent 50%),
                  repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)
                `,
              }}
            />

            <div className="absolute inset-0 flex flex-col justify-between p-3.5 z-10">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/55 border border-white/10 text-[11px] font-semibold text-white backdrop-blur-sm">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  Live · {activeZone.cameraCode}
                </span>
                <span className="px-2 py-1 rounded-lg bg-black/45 border border-white/10 text-[10px] font-medium text-slate-200 backdrop-blur-sm truncate max-w-[45%]">
                  {activeZone.name}
                </span>
              </div>

              <div className="self-center px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 backdrop-blur-md text-center shadow-lg">
                <div className="text-[12px] text-white font-bold flex items-center justify-center gap-1.5">
                  <Scan className="h-3.5 w-3.5 text-teal-300" />
                  <span>{activeZone.currentOccupancy} Active Shoppers</span>
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5 font-medium">
                  Anonymous occupancy tracking
                </div>
              </div>

              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/55 border border-white/10 text-[10px] font-medium text-slate-200 backdrop-blur-sm">
                <span>Edge sensor feed</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                label: 'Current Shoppers',
                value: String(activeZone.currentOccupancy),
                icon: Users,
                tone: 'sky' as const,
              },
              {
                label: 'Visitors Today',
                value: String(activeZone.visitors),
                icon: Footprints,
                tone: 'sky' as const,
              },
              {
                label: 'Avg Dwell',
                value: activeZone.avgDwellLabel,
                icon: Clock,
                tone: 'slate' as const,
              },
              {
                label: 'Shelf Availability',
                value: `${activeZone.shelfAvailability}%`,
                icon: PackageCheck,
                tone: shelfHealthy ? ('emerald' as const) : ('amber' as const),
              },
            ].map((metric) => {
              const Icon = metric.icon
              return (
                <div
                  key={metric.label}
                  className={cn(
                    'rounded-xl border p-3 bg-gradient-to-b from-white to-slate-50/80 shadow-[0_1px_2px_rgb(15_23_42/0.04)]',
                    metric.tone === 'emerald' && 'border-emerald-200/90',
                    metric.tone === 'amber' && 'border-amber-200/90',
                    metric.tone === 'sky' && 'border-slate-200/90',
                    metric.tone === 'slate' && 'border-slate-200/90'
                  )}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-slate-500">
                      {metric.label}
                    </span>
                    <span
                      className={cn(
                        'p-1 rounded-md border',
                        metric.tone === 'emerald' && 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
                        metric.tone === 'amber' && 'bg-amber-50 text-amber-700 border-amber-200/80',
                        metric.tone === 'sky' && 'bg-sky-50 text-sky-700 border-sky-200/80',
                        metric.tone === 'slate' && 'bg-slate-50 text-slate-600 border-slate-200/80'
                      )}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                  </div>
                  <div
                    className={cn(
                      'text-xl font-extrabold font-mono tracking-tight',
                      metric.tone === 'emerald' && 'text-emerald-700',
                      metric.tone === 'amber' && 'text-amber-700',
                      (metric.tone === 'sky' || metric.tone === 'slate') && 'text-slate-900'
                    )}
                  >
                    {metric.value}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-slate-200/90 bg-sky-50/40 p-3.5 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-sky-800">
              Zone Operational Summary
            </span>
            <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
              {activeZone.description}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white border border-slate-200 text-slate-600">
                Traffic · {activeZone.trafficLevel}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white border border-slate-200 text-slate-600">
                Engagement · {activeZone.engagementSignal}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-1">
            <Button
              variant="action"
              size="lg"
              onClick={() => {
                onClose()
                navigate('/inventory')
              }}
              className="w-full justify-between h-10 text-[13px] rounded-xl"
            >
              <span className="flex items-center gap-2">
                <Boxes className="h-4 w-4" />
                <span>View Zone Inventory</span>
              </span>
              <ArrowRight className="h-4 w-4 opacity-80" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                onClose()
                navigate(`/digital-twin?cam=${encodeURIComponent(activeZone.cameraCode)}`)
              }}
              className="w-full justify-between h-10 text-[13px] rounded-xl border-sky-200 text-sky-800 hover:bg-sky-50 hover:border-sky-300"
            >
              <span className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-sky-600" />
                <span>Show on 3D Digital Twin</span>
              </span>
              <ArrowRight className="h-4 w-4 opacity-70" />
            </Button>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-mono font-semibold text-slate-600">{activeZone.cameraCode}</span>
          <Button
            variant="ghost"
            size="xs"
            onClick={onClose}
            className="h-7 text-[11px] text-slate-500 hover:text-slate-900 font-semibold"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
