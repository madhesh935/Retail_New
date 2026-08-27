import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Box,
  Camera,
  PackageCheck,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Scan,
  MessageSquare,
} from 'lucide-react'
import { Shelf3DData } from '../scene/StoreShelves3D'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { cn } from '@/lib/utils'

interface TwinShelfDrawerProps {
  shelf: Shelf3DData | null
  onClose: () => void
}

export const TwinShelfDrawer: React.FC<TwinShelfDrawerProps> = ({ shelf, onClose }) => {
  const navigate = useNavigate()
  const [isReplenishing, setIsReplenishing] = useState(false)

  if (!shelf) return null

  const isCritical = shelf.status === 'CRITICAL' || shelf.status === 'OUT_OF_STOCK'

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200 z-10 flex flex-col shadow-2xl p-5 animate-in slide-in-from-right duration-200 select-none">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs shrink-0">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {shelf.name}
                </h3>
                <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200/80 font-bold">
                  {shelf.code}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {shelf.zone} · Computer Vision Verified
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Status & Availability Meter */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-semibold">Shelf Status</span>
              <StatusBadge
                status={isCritical ? 'CRITICAL' : 'ONLINE'}
                label={isCritical ? 'Critical Stockout Risk' : 'Optimal'}
                size="sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Availability Level</span>
                <span className={cn('font-mono font-bold', isCritical ? 'text-rose-700' : 'text-emerald-700')}>
                  {shelf.availability}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={cn('h-full transition-all', isCritical ? 'bg-rose-500' : 'bg-emerald-500')}
                  style={{ width: `${shelf.availability}%` }}
                />
              </div>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-medium">Visible Units</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {shelf.visibleUnits} units
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-medium">POS Inventory</span>
                <span className="text-lg font-bold text-slate-700 font-mono">
                  {shelf.posInventory} units
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-medium">Shopper Demand</span>
                <span className="text-base font-bold text-amber-800">
                  {shelf.demand}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-medium">Stock-Out Forecast</span>
                <span className="text-base font-bold text-rose-700 font-mono">
                  {shelf.stockoutPrediction}
                </span>
              </div>
            </div>

            {/* Replenishment Priority & Planogram */}
            <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <span>Restock Priority: <strong className="text-rose-700 font-bold font-mono">{shelf.replenishmentPriority}/100</strong></span>
              <span>Planogram: <strong className="text-emerald-700 font-bold font-mono">{shelf.planogramScore}%</strong></span>
            </div>
          </div>

          {/* SKU Information */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Active Facing SKU</span>
            <div className="text-xs font-bold text-slate-900">{shelf.sku}</div>
          </div>

          {/* Compact Live RTSP Camera Feed Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <Camera className="h-3.5 w-3.5 text-blue-600" />
                <span>Stream: {shelf.camera}</span>
              </span>
              <span className="text-emerald-700 font-bold font-mono text-[11px] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                30 FPS Live
              </span>
            </div>

            <div className="relative h-28 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden p-2.5 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-sky-300 font-mono z-10">
                <span className="flex items-center gap-1 font-bold">
                  <Scan className="h-3 w-3" /> ShelfEye CV-Det
                </span>
                <span className="bg-emerald-600 px-1.5 py-0.2 rounded text-white font-bold text-[9px]">
                  LIVE FEED
                </span>
              </div>

              {/* Bounding box indicator */}
              <div className="self-center my-auto px-2 py-1 rounded-md border border-rose-400 bg-rose-500/10 text-center pointer-events-none font-mono">
                <div className="text-[10px] text-rose-300 font-bold">FACING_DEPLETED: {shelf.visibleUnits} / 24</div>
                <div className="text-[9px] text-slate-300">CONF: 0.94 • 14.8ms</div>
              </div>

              <div className="text-[9px] text-slate-400 z-10 flex items-center justify-between font-mono">
                <span>RTSP: rtsp://edge-jetson:8554/cam04</span>
                <span className="text-sky-300 font-bold">1080p</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {isReplenishing ? (
                <div className="col-span-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Restocker Liam O&apos;Connor Dispatched
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsReplenishing(true)}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PackageCheck className="h-4 w-4" />
                  <span>Assign Refill</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose()
                  navigate('/inventory')
                }}
                className="py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 bg-white hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ExternalLink className="h-4 w-4 text-slate-500" />
                <span>Open Inventory</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px]">UUID: #{shelf.code}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
