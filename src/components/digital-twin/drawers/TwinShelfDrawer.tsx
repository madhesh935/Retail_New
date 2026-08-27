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
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200 z-10 flex flex-col shadow-2xl p-4 animate-in slide-in-from-right duration-200 select-none font-sans">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 font-bold text-xs shadow-2xs font-mono">
              {shelf.code}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-sans">
                {shelf.name}
              </h3>
              <span className="text-[10px] text-sky-700 font-medium font-mono">
                {shelf.zone} • Vision Verified
              </span>
            </div>
          </div>

          <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs">
          {/* Status & Availability Meter */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Shelf Status</span>
              <StatusBadge
                status={isCritical ? 'CRITICAL' : 'ONLINE'}
                label={isCritical ? 'Critical Stockout Risk' : 'Optimal'}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Availability Level</span>
                <span className={isCritical ? 'text-rose-700 font-mono' : 'text-emerald-700 font-mono'}>
                  {shelf.availability}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    isCritical ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${shelf.availability}%` }}
                />
              </div>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Visible Units</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {shelf.visibleUnits} units
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">POS Inventory</span>
                <span className="text-base font-bold text-slate-700 font-mono">
                  {shelf.posInventory} units
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Shopper Demand</span>
                <span className="text-base font-bold text-amber-800 font-mono">
                  {shelf.demand}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Stock-Out Prediction</span>
                <span className="text-base font-bold text-rose-700 font-mono">
                  {shelf.stockoutPrediction}
                </span>
              </div>
            </div>

            {/* Replenishment Priority & Planogram */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
              <span>Replenishment Priority: <strong className="text-rose-700 font-mono">{shelf.replenishmentPriority}/100</strong></span>
              <span>Planogram: <strong className="text-emerald-700 font-mono">{shelf.planogramScore}%</strong></span>
            </div>
          </div>

          {/* SKU Information */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Active Facing SKU</span>
            <div className="text-xs font-bold text-slate-900">{shelf.sku}</div>
          </div>

          {/* Compact Live RTSP Camera Feed Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1 font-mono">
                <Camera className="h-3.5 w-3.5 text-sky-600" />
                <span>Camera Stream: {shelf.camera}</span>
              </span>
              <span className="text-emerald-700 font-bold font-mono">30 FPS</span>
            </div>

            <div className="relative h-28 rounded-xl bg-slate-950 border border-slate-200 overflow-hidden p-2 flex flex-col justify-between shadow-inner">
              {/* Scanline pattern */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, #2DD4BF 0px, transparent 1px, transparent 4px)`,
                }}
              />

              <div className="flex items-center justify-between text-[9px] text-sky-300 font-mono z-10">
                <span className="flex items-center gap-1 font-bold">
                  <Scan className="h-3 w-3" /> ShelfEye CV-Det
                </span>
                <span className="bg-emerald-600 px-1 py-0.5 rounded text-white font-bold">
                  LIVE FEED
                </span>
              </div>

              {/* Bounding box indicator */}
              <div className="self-center my-auto p-1.5 rounded-md border border-rose-400 bg-rose-500/10 text-center pointer-events-none font-mono">
                <div className="text-[9px] text-rose-300 font-bold">FACING_DEPLETED: 3 / 24</div>
                <div className="text-[8px] text-slate-300">CONF: 0.94 • 14.8ms</div>
              </div>

              <div className="text-[9px] text-slate-400 z-10 flex items-center justify-between font-mono">
                <span>RTSP Stream: rtsp://edge-jetson:8554/cam04</span>
                <span className="text-sky-300 font-bold">1080p</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Assign Replenishment | Open Inventory | View Camera | Ask AI */}
          <div className="pt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {isReplenishing ? (
                <div className="col-span-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-center flex items-center justify-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4" /> Restocker Liam O&apos;Connor Dispatched
                </div>
              ) : (
                <Button
                  variant="action"
                  size="sm"
                  onClick={() => setIsReplenishing(true)}
                  className="gap-1 text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                >
                  <PackageCheck className="h-3.5 w-3.5" />
                  <span>Assign Replenish</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose()
                  navigate('/inventory')
                }}
                className="gap-1 text-xs border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs font-semibold"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open Inventory</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  onClose()
                  navigate('/digital-twin')
                }}
                className="text-sky-700 hover:text-sky-800 text-[11px] gap-1 font-semibold"
              >
                <Camera className="h-3 w-3" /> View Full Camera
              </Button>

              <Button
                variant="ghost"
                size="xs"
                onClick={() => alert(`AI Assistant Insight: Shelf B4 has depleted at 0.33 units/min during peak rush hour. Recommended restock quantity: 24 units from Backroom Bay 3B.`)}
                className="text-purple-700 hover:text-purple-800 text-[11px] gap-1 font-semibold"
              >
                <MessageSquare className="h-3 w-3" /> Ask AI Agent
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Entity UUID: #TWIN-SHELF-{shelf.code}</span>
          <Button variant="ghost" size="xs" onClick={onClose} className="h-6 text-[10px] text-slate-600 hover:text-slate-900">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
