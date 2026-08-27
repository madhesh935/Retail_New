import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Compass,
  Users,
  Clock,
  Box,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { Zone3DData } from '../scene/ZoneLabels3D'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'

interface TwinZoneDrawerProps {
  zone: Zone3DData | null
  onClose: () => void
}

export const TwinZoneDrawer: React.FC<TwinZoneDrawerProps> = ({ zone, onClose }) => {
  const navigate = useNavigate()

  if (!zone) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200 z-10 flex flex-col shadow-2xl p-4 animate-in slide-in-from-right duration-200 select-none font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs shadow-2xs">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-sans">
                {zone.name}
              </h3>
              <span className="text-[10px] text-sky-700 font-medium font-mono">
                Zone ID: {zone.code} • Spatial Sensor Analytics
              </span>
            </div>
          </div>

          <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs">
          {/* Spatial Metrics Grid */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Footfall Density</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                {zone.trafficDensity} TRAFFIC
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-sans text-[11px]">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Current Shoppers</span>
                <span className="text-base font-bold text-sky-700 font-mono">
                  {zone.currentShoppers} active
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Avg Dwell Time</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {zone.avgDwellSeconds} sec
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Shelf Health</span>
                <span className="text-base font-bold text-amber-800 font-mono">
                  {zone.shelfHealthPercent}%
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Critical Shelves</span>
                <span className="text-base font-bold text-rose-700 font-mono">
                  {zone.criticalShelvesCount} shelves
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
              <span>Opportunity Risk: <strong className="text-rose-700">{zone.opportunityRisk}</strong></span>
              <span className="text-sky-700 font-semibold">High Revenue Zone</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 space-y-2">
            <Button
              variant="action"
              size="sm"
              onClick={() => {
                onClose()
                navigate('/shopper-analytics')
              }}
              className="w-full gap-1 text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Open Shopper Analytics</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose()
                navigate('/inventory')
              }}
              className="w-full gap-1 text-xs border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs font-semibold"
            >
              <Box className="h-3.5 w-3.5" />
              <span>Inspect Zone Shelves in Inventory</span>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Spatial Zone Index: #{zone.code}</span>
          <Button variant="ghost" size="xs" onClick={onClose} className="h-6 text-[10px] text-slate-600 hover:text-slate-900">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
