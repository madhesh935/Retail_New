import React, { useState } from 'react'
import {
  Camera,
  Eye,
  Scan,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LiveShelfVisionCardProps {
  shelfCode: string
  shelfName: string
  cameraCode: string
  skuName: string
  availability: number
  visibleUnits: number
  totalFacings?: number
  confidence?: string
  latencyMs?: number
}

export const LiveShelfVisionCard: React.FC<LiveShelfVisionCardProps> = ({
  shelfCode,
  shelfName,
  cameraCode,
  skuName,
  availability,
  visibleUnits,
  confidence = '94.2%',
  latencyMs = 14.8,
}) => {
  const [overlayMode, setOverlayMode] = useState<'AI_OVERLAY' | 'RAW_FEED'>('AI_OVERLAY')

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none h-full min-h-[400px]">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E293B] mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Camera className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <span>Live Shelf Evidence</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-sans">
              Camera {cameraCode} · Shelf {shelfCode}
            </span>
          </div>
        </div>

        {/* Live Feed vs AI Overlay Toggle */}
        <div className="flex items-center rounded-lg bg-[#090D14] p-1 border border-[#1E293B] text-xs">
          <button
            onClick={() => setOverlayMode('RAW_FEED')}
            className={cn(
              'px-3 py-1 rounded-md transition-all cursor-pointer text-[11px] font-medium flex items-center gap-1.5',
              overlayMode === 'RAW_FEED'
                ? 'bg-[#1E293B] text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Eye className="h-3 w-3" />
            <span>Live Feed</span>
          </button>

          <button
            onClick={() => setOverlayMode('AI_OVERLAY')}
            className={cn(
              'px-3 py-1 rounded-md transition-all cursor-pointer text-[11px] font-medium flex items-center gap-1.5',
              overlayMode === 'AI_OVERLAY'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Scan className="h-3 w-3" />
            <span>AI Overlay</span>
          </button>
        </div>
      </div>

      {/* Simulated Live Camera Player with AI Computer Vision Bounding Boxes - Full Responsive Size */}
      <div className="relative flex-1 min-h-[300px] rounded-xl bg-[#070A0F] border border-[#1E293B] overflow-hidden p-3.5 flex flex-col justify-between shadow-inner">
        {/* Subtle scanline texture */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #38BDF8 0px, transparent 1px, transparent 4px)`,
          }}
        />

        {/* Top HUD Banner */}
        <div className="flex items-center justify-between text-xs z-10 font-mono">
          <span className="flex items-center gap-2 font-bold text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Camera {cameraCode} · Live</span>
          </span>
          <span className="bg-[#0F172A]/90 px-2.5 py-1 rounded border border-[#1E293B] text-slate-300 text-xs">
            {shelfName}
          </span>
        </div>

        {/* AI Vision Overlay Elements */}
        {overlayMode === 'AI_OVERLAY' && (
          <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-center pointer-events-none">
            {/* Shelf Region of Interest (ROI) Guide Outline */}
            <div className="relative w-full h-44 sm:h-48 border-2 border-cyan-500/60 bg-cyan-950/15 rounded-xl p-3 flex flex-col justify-between shadow-lg">
              {/* ROI Label */}
              <div className="absolute -top-3 left-3 bg-[#0F172A] px-2 py-0.5 rounded border border-cyan-500/60 text-[10px] text-cyan-300 font-mono font-bold shadow-sm">
                ROI: SHELF_{shelfCode}
              </div>

              {/* Detected Products Bounding Boxes */}
              <div className="grid grid-cols-6 gap-2 sm:gap-3 h-full items-center">
                {/* Detected Product Boxes (Green) */}
                {Array.from({ length: Math.min(visibleUnits, 3) }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-28 sm:h-32 rounded-lg border-2 border-emerald-400/90 bg-emerald-950/50 p-1.5 flex flex-col justify-between shadow-sm"
                  >
                    <span className="text-[8px] text-emerald-300 font-mono font-bold bg-emerald-950/90 px-1.5 py-0.5 rounded w-fit border border-emerald-500/40">
                      PRESENT
                    </span>
                    <span className="text-[8px] text-emerald-400 font-mono font-bold self-end bg-black/60 px-1 rounded">0.96</span>
                  </div>
                ))}

                {/* Empty Slot Gap Areas (Dashed Red Alert Boxes) */}
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="h-28 sm:h-32 rounded-lg border-2 border-dashed border-rose-500/90 bg-rose-950/40 p-1.5 flex flex-col justify-between animate-pulse"
                  >
                    <span className="text-[8px] text-rose-300 font-mono font-bold bg-rose-950/90 px-1.5 py-0.5 rounded w-fit border border-rose-500/40">
                      GAP
                    </span>
                    <span className="text-[8px] text-rose-400 font-mono font-bold self-end bg-black/60 px-1 rounded">EMPTY</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Stream Status */}
        <div className="flex items-center justify-between text-xs text-slate-300 z-10 bg-[#0F172A]/90 px-3 py-2 rounded-lg border border-[#1E293B] font-mono mt-auto">
          <span>Updated 1 sec ago</span>
          <span className="font-medium text-slate-200">
            Shelf Availability: <strong className="text-rose-400 font-bold">{availability}%</strong> ({visibleUnits} units visible)
          </span>
        </div>
      </div>
    </div>
  )
}

