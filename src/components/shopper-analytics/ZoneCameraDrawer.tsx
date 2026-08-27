import React from 'react'
import {
  X,
  Camera,
  Scan,
  Boxes,
  Compass,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CanonicalZoneAnalytics, CANONICAL_ZONE_ANALYTICS } from './shopperData'
import { useNavigate } from 'react-router-dom'

interface ZoneCameraDrawerProps {
  zone?: CanonicalZoneAnalytics | null
  cameraCode?: string | null
  zoneName?: string | null
  onClose: () => void
}

export const ZoneCameraDrawer: React.FC<ZoneCameraDrawerProps> = ({
  zone: propZone,
  cameraCode,
  zoneName,
  onClose,
}) => {
  const navigate = useNavigate()

  // Resolve active zone object either from propZone or matching by cameraCode/zoneName
  const activeZone =
    propZone ||
    CANONICAL_ZONE_ANALYTICS.find(
      (z) =>
        (cameraCode && z.cameraCode.toLowerCase() === cameraCode.toLowerCase()) ||
        (zoneName && z.name.toLowerCase().includes(zoneName.toLowerCase()))
    ) ||
    (cameraCode
      ? {
          id: 'custom-cam',
          code: 'ZONE',
          name: zoneName || `Camera ${cameraCode}`,
          aisle: 'Store Zone',
          visitors: 280,
          currentOccupancy: 12,
          avgDwellMinutes: 2.5,
          avgDwellLabel: '2.5 min',
          trafficLevel: 'Medium' as const,
          engagementSignal: 'High' as const,
          shelfAvailability: 85,
          opportunityRisk: 'NORMAL' as const,
          cameraCode: cameraCode || 'CAM-01',
          description: 'Live spatial camera feed',
          interestScore: 70,
        }
      : null)

  if (!propZone && !cameraCode) return null
  if (!activeZone) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200 z-10 flex flex-col shadow-2xl p-4 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                {activeZone.name}
              </h3>
              <span className="text-[11px] text-slate-500">
                {activeZone.aisle} · Camera {activeZone.cameraCode}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs">
          {/* Simulated Video Player */}
          <div className="relative h-52 rounded-xl bg-[#070A0F] border border-slate-200 overflow-hidden p-3 flex flex-col justify-between shadow-inner">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, #38BDF8 0px, transparent 1px, transparent 4px)`,
              }}
            />

            <div className="flex items-center justify-between text-[10px] z-10 font-mono">
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Camera {activeZone.cameraCode} · Live</span>
              </span>
              <span className="bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-700 text-slate-200 text-[10px]">
                {activeZone.name}
              </span>
            </div>

            {/* Bounding Box HUD simulation */}
            <div className="self-center my-auto p-2 rounded-lg border border-sky-500/50 bg-sky-950/20 text-center pointer-events-none space-y-0.5 font-sans">
              <div className="text-[11px] text-sky-300 font-bold flex items-center justify-center gap-1">
                <Scan className="h-3 w-3" />
                <span>{activeZone.currentOccupancy} Active Shoppers</span>
              </div>
              <div className="text-[9px] text-slate-400 font-mono">Anonymous spatial coordinate tracking</div>
            </div>

            <div className="text-[10px] text-slate-300 z-10 flex items-center justify-between bg-slate-900/80 px-2 py-1 rounded-md border border-slate-700 font-mono">
              <span>Live Sensor Feed</span>
              <span className="text-emerald-400 font-bold">● Online</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-medium">Current Shoppers</span>
              <span className="text-base font-bold text-slate-900 font-mono">{activeZone.currentOccupancy}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-medium">Visitors Today</span>
              <span className="text-base font-bold text-slate-900 font-mono">{activeZone.visitors}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-medium">Avg Dwell</span>
              <span className="text-base font-bold text-slate-900">{activeZone.avgDwellLabel}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-medium">Shelf Availability</span>
              <span className="text-base font-bold text-emerald-700 font-mono">{activeZone.shelfAvailability}%</span>
            </div>
          </div>

          {/* Zone Description */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs shadow-2xs">
            <span className="text-[10px] text-slate-500 font-semibold block">Zone Operational Summary</span>
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
              {activeZone.description}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            <Button
              variant="action"
              size="sm"
              onClick={() => {
                onClose()
                navigate('/inventory')
              }}
              className="w-full justify-between h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold"
            >
              <span className="flex items-center gap-1.5">
                <Boxes className="h-3.5 w-3.5" />
                <span>View Zone Inventory</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose()
                navigate('/digital-twin')
              }}
              className="w-full justify-between h-8 text-xs text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
            >
              <span className="flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-sky-600" />
                <span>Show on 3D Digital Twin</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Camera {activeZone.cameraCode}</span>
          <Button variant="ghost" size="xs" onClick={onClose} className="h-7 text-[11px] text-slate-500 hover:text-slate-900">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
