import React, { useState } from 'react'
import {
  Camera,
  Eye,
  Scan,
  ChevronDown,
  ChevronUp,
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
  const [showTechDetails, setShowTechDetails] = useState(false)

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none h-full min-h-[380px]">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E293B] mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-slate-300">
            <Camera className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide flex items-center gap-2">
              <span>Live Shelf Evidence</span>
            </h3>
            <span className="text-[11px] text-slate-400">
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
                ? 'bg-[#1E293B] text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Scan className="h-3 w-3" />
            <span>AI Overlay</span>
          </button>
        </div>
      </div>

      {/* Simulated Live Camera Player with AI Computer Vision Bounding Boxes */}
      <div className="relative h-48 rounded-lg bg-[#070A0F] border border-[#1E293B] overflow-hidden p-3 flex flex-col justify-between shadow-inner">
        {/* Subtle scanline texture */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #38BDF8 0px, transparent 1px, transparent 4px)`,
          }}
        />

        {/* Top HUD Banner */}
        <div className="flex items-center justify-between text-[10px] z-10">
          <span className="flex items-center gap-1.5 font-medium text-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Camera {cameraCode} · Live</span>
          </span>
          <span className="bg-[#0F172A]/90 px-2 py-0.5 rounded border border-[#1E293B] text-slate-300 text-[10px]">
            {shelfName}
          </span>
        </div>

        {/* AI Vision Overlay Elements */}
        {overlayMode === 'AI_OVERLAY' && (
          <div className="absolute inset-0 p-5 flex flex-col justify-center pointer-events-none">
            {/* Shelf Region of Interest (ROI) Guide Outline */}
            <div className="relative w-full h-28 border border-cyan-500/50 bg-cyan-950/10 rounded p-2 flex flex-col justify-between">
              {/* ROI Label */}
              <div className="absolute -top-2.5 left-2 bg-[#0F172A] px-1.5 py-0.5 rounded border border-cyan-500/60 text-[9px] text-cyan-300 font-mono">
                ROI: SHELF_{shelfCode}
              </div>

              {/* Detected Products Bounding Boxes */}
              <div className="grid grid-cols-6 gap-2 h-full items-center">
                {/* Detected Product Boxes (Green) */}
                {Array.from({ length: Math.min(visibleUnits, 3) }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-16 rounded border border-emerald-400/80 bg-emerald-950/40 p-1 flex flex-col justify-between"
                  >
                    <span className="text-[7px] text-emerald-300 font-mono bg-emerald-950 px-1 rounded w-fit">
                      PRESENT
                    </span>
                    <span className="text-[7px] text-emerald-400 font-mono self-end">0.96</span>
                  </div>
                ))}

                {/* Empty Slot Gap Areas (Dashed Red Alert Boxes) */}
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="h-16 rounded border border-dashed border-rose-500/80 bg-rose-950/30 p-1 flex flex-col justify-between"
                  >
                    <span className="text-[7px] text-rose-300 font-mono bg-rose-950 px-1 rounded w-fit">
                      GAP
                    </span>
                    <span className="text-[7px] text-rose-400 font-mono self-end">EMPTY</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Stream Status */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 z-10 bg-[#0F172A]/80 px-2 py-1 rounded border border-[#1E293B]">
          <span>Updated 1 sec ago</span>
          <span className="font-medium text-slate-200">
            Shelf Availability: <strong className="text-rose-400">{availability}%</strong> ({visibleUnits} units visible)
          </span>
        </div>
      </div>

      {/* Optional Technical Details Accordion */}
      <div className="pt-2 border-t border-[#1E293B]">
        <button
          onClick={() => setShowTechDetails(!showTechDetails)}
          className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer font-medium"
        >
          <span>Technical Details</span>
          {showTechDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showTechDetails && (
          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#1E293B] text-[10px] text-slate-300 font-mono bg-[#090D14] p-2 rounded">
            <div>
              <span className="text-slate-500 block">Inference Confidence</span>
              <span className="text-emerald-400 font-bold">{confidence}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Edge Latency</span>
              <span className="text-cyan-400 font-bold">{latencyMs} ms</span>
            </div>
            <div>
              <span className="text-slate-500 block">RTSP Source</span>
              <span className="text-slate-200 font-bold">rtsp://10.0.4.12:554/ch4</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
