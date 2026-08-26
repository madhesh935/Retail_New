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
      <div className="relative w-full max-w-md h-full bg-[#0B0F17] border-l border-[#1E293B] z-10 flex flex-col shadow-2xl p-4 animate-in slide-in-from-right duration-200 select-none font-mono">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
              {shelf.code}
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase font-sans">
                {shelf.name}
              </h3>
              <span className="text-[10px] text-cyan-400">
                {shelf.zone} • Vision Verified
              </span>
            </div>
          </div>

          <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs">
          {/* Status & Availability Meter */}
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Shelf Status</span>
              <StatusBadge
                status={isCritical ? 'CRITICAL' : 'ONLINE'}
                label={isCritical ? 'Critical Stockout Risk' : 'Optimal'}
                size="sm"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">Availability Level</span>
                <span className={isCritical ? 'text-rose-400' : 'text-emerald-400'}>
                  {shelf.availability}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    isCritical ? 'bg-rose-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${shelf.availability}%` }}
                />
              </div>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
              <div className="bg-[#090D14] p-2 rounded border border-[#1E293B]">
                <span className="text-[10px] text-slate-500 block">Visible Units</span>
                <span className="text-base font-bold text-white">
                  {shelf.visibleUnits} units
                </span>
              </div>
              <div className="bg-[#090D14] p-2 rounded border border-[#1E293B]">
                <span className="text-[10px] text-slate-500 block">POS Inventory</span>
                <span className="text-base font-bold text-slate-200">
                  {shelf.posInventory} units
                </span>
              </div>
              <div className="bg-[#090D14] p-2 rounded border border-[#1E293B]">
                <span className="text-[10px] text-slate-500 block">Shopper Demand</span>
                <span className="text-base font-bold text-amber-400">
                  {shelf.demand}
                </span>
              </div>
              <div className="bg-[#090D14] p-2 rounded border border-[#1E293B]">
                <span className="text-[10px] text-slate-500 block">Stock-Out Prediction</span>
                <span className="text-base font-bold text-rose-400">
                  {shelf.stockoutPrediction}
                </span>
              </div>
            </div>

            {/* Replenishment Priority & Planogram */}
            <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px]">
              <span>Replenishment Priority: <strong className="text-rose-400">{shelf.replenishmentPriority}/100</strong></span>
              <span>Planogram: <strong className="text-emerald-400">{shelf.planogramScore}%</strong></span>
            </div>
          </div>

          {/* SKU Information */}
          <div className="p-2.5 rounded bg-[#090D14] border border-[#1E293B] space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">Active Facing SKU</span>
            <div className="text-xs font-bold text-white font-sans">{shelf.sku}</div>
          </div>

          {/* Compact Live RTSP Camera Feed Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Camera className="h-3.5 w-3.5 text-cyan-400" />
                <span>Camera Stream: {shelf.camera}</span>
              </span>
              <span className="text-emerald-400 font-bold">30 FPS</span>
            </div>

            <div className="relative h-28 rounded-lg bg-[#070A0F] border border-[#1E293B] overflow-hidden p-2 flex flex-col justify-between">
              {/* Scanline pattern */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, #38BDF8 0px, transparent 1px, transparent 4px)`,
                }}
              />

              <div className="flex items-center justify-between text-[9px] text-cyan-400 z-10">
                <span className="flex items-center gap-1 font-bold">
                  <Scan className="h-3 w-3" /> ShelfEye CV-Det
                </span>
                <span className="bg-emerald-950 px-1 py-0.5 rounded border border-emerald-500/40 text-emerald-300">
                  LIVE FEED
                </span>
              </div>

              {/* Bounding box indicator */}
              <div className="self-center my-auto p-1.5 rounded border border-rose-500/80 bg-rose-950/20 text-center pointer-events-none">
                <div className="text-[9px] text-rose-300 font-bold">FACING_DEPLETED: 3 / 24</div>
                <div className="text-[8px] text-slate-400">CONF: 0.94 • 14.8ms</div>
              </div>

              <div className="text-[9px] text-slate-400 z-10 flex items-center justify-between">
                <span>RTSP Stream: rtsp://edge-jetson:8554/cam04</span>
                <span className="text-cyan-400 font-bold">1080p</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Assign Replenishment | Open Inventory | View Camera | Ask AI */}
          <div className="pt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {isReplenishing ? (
                <div className="col-span-2 p-2 rounded bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Restocker Liam O&apos;Connor Dispatched
                </div>
              ) : (
                <Button
                  variant="action"
                  size="sm"
                  onClick={() => setIsReplenishing(true)}
                  className="gap-1 text-xs"
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
                className="gap-1 text-xs border-[#1E293B] text-slate-300 hover:text-white"
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
                className="text-cyan-400 hover:text-cyan-300 text-[11px] gap-1"
              >
                <Camera className="h-3 w-3" /> View Full Camera
              </Button>

              <Button
                variant="ghost"
                size="xs"
                onClick={() => alert(`AI Assistant Insight: Shelf B4 has depleted at 0.33 units/min during peak rush hour. Recommended restock quantity: 24 units from Backroom Bay 3B.`)}
                className="text-indigo-400 hover:text-indigo-300 text-[11px] gap-1"
              >
                <MessageSquare className="h-3 w-3" /> Ask AI Agent
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-500">
          <span>Entity UUID: #TWIN-SHELF-{shelf.code}</span>
          <Button variant="ghost" size="xs" onClick={onClose} className="h-6 text-[10px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
