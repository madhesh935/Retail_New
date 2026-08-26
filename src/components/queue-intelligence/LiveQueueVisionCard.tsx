import React, { useState } from 'react'
import {
  Camera,
  Eye,
  Scan,
  Users,
  Layers,
  Sparkles,
  CheckCircle2,
  Cpu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LiveQueueVisionCardProps {
  laneCode: string
  laneName: string
  queueCount: number
  waitTime: string
}

export const LiveQueueVisionCard: React.FC<LiveQueueVisionCardProps> = ({
  laneCode = 'C1',
  laneName = 'Counter C1 (Assisted)',
  queueCount = 8,
  waitTime = '5.4 min',
}) => {
  const [overlayMode, setOverlayMode] = useState<'AI_OVERLAY' | 'RAW_FEED'>('AI_OVERLAY')

  const detectedShoppers = [
    { trackId: 'T-1082', position: 'POS Register Desk', conf: '0.98' },
    { trackId: 'T-1085', position: 'Queue Pos #2', conf: '0.95' },
    { trackId: 'T-1090', position: 'Queue Pos #3', conf: '0.94' },
    { trackId: 'T-1093', position: 'Queue Pos #4', conf: '0.92' },
    { trackId: 'T-1097', position: 'Queue Pos #5', conf: '0.96' },
    { trackId: 'T-1102', position: 'Queue Pos #6', conf: '0.91' },
    { trackId: 'T-1105', position: 'Queue Pos #7', conf: '0.94' },
    { trackId: 'T-1110', position: 'Queue Pos #8 (Tail)', conf: '0.93' },
  ]

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none font-mono">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E293B] mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Camera className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Live Checkout Edge Vision Pipeline</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/40 font-normal">
                CAM-06 ({laneCode})
              </span>
            </h3>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center rounded-md bg-[#090D14] p-0.5 border border-[#1E293B] text-xs">
          <button
            onClick={() => setOverlayMode('AI_OVERLAY')}
            className={cn(
              'px-2.5 py-1 rounded transition-all font-bold cursor-pointer text-[11px] flex items-center gap-1',
              overlayMode === 'AI_OVERLAY'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Scan className="h-3 w-3" />
            <span>AI Overlay</span>
          </button>

          <button
            onClick={() => setOverlayMode('RAW_FEED')}
            className={cn(
              'px-2.5 py-1 rounded transition-all cursor-pointer text-[11px] flex items-center gap-1',
              overlayMode === 'RAW_FEED'
                ? 'bg-[#1E293B] text-white font-bold'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Eye className="h-3 w-3" />
            <span>Raw Feed</span>
          </button>
        </div>
      </div>

      {/* Simulated Live Video Player */}
      <div className="relative h-64 rounded-lg bg-[#070A0F] border border-[#1E293B] overflow-hidden p-3 flex flex-col justify-between shadow-inner">
        {/* Scanline pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #38BDF8 0px, transparent 1px, transparent 4px)`,
          }}
        />

        {/* Top HUD */}
        <div className="flex items-center justify-between text-[10px] text-cyan-300 z-10">
          <span className="flex items-center gap-1 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>RTSP STREAM • CAM-06 (Overhead Checkout)</span>
          </span>
          <span className="bg-[#0F172A] px-2 py-0.5 rounded border border-[#1E293B] text-slate-300">
            {laneName}
          </span>
        </div>

        {/* AI Overlay Layer */}
        {overlayMode === 'AI_OVERLAY' && (
          <div className="absolute inset-0 p-5 flex flex-col justify-center pointer-events-none">
            {/* Queue Polygon Boundary ROI Frame */}
            <div className="relative w-full h-44 border-2 border-dashed border-rose-500/70 bg-rose-950/10 rounded-lg p-2 flex flex-col justify-between">
              {/* Polygon Label */}
              <div className="absolute -top-3 left-3 bg-[#0F172A] px-2 py-0.5 rounded border border-rose-500/60 text-[9px] text-rose-300 font-bold flex items-center gap-1">
                <span>QUEUE_POLYGON_ROI: {laneCode}</span>
                <span className="text-white">({queueCount} PERSONS DETECTED)</span>
              </div>

              {/* Service Desk Register Zone (Counter Box) */}
              <div className="absolute top-2 left-2 w-24 h-16 rounded border-2 border-cyan-400 bg-cyan-950/30 p-1 flex flex-col justify-between">
                <span className="text-[7px] text-cyan-300 font-bold bg-cyan-950 px-1 rounded w-fit">
                  POS REGISTER C1
                </span>
                <span className="text-[7px] text-cyan-400 self-end">SERVICE ZONE</span>
              </div>

              {/* Person Bounding Boxes with Track IDs */}
              <div className="grid grid-cols-4 gap-2 h-full items-center ml-28">
                {detectedShoppers.slice(0, 4).map((shopper, idx) => (
                  <div
                    key={shopper.trackId}
                    className="h-24 rounded border border-rose-400 bg-rose-950/40 p-1 flex flex-col justify-between"
                  >
                    <span className="text-[7px] text-rose-200 font-bold bg-rose-950 px-1 rounded w-fit">
                      {shopper.trackId}
                    </span>
                    <span className="text-[7px] text-rose-300 self-end">CONF: {shopper.conf}</span>
                  </div>
                ))}
              </div>

              {/* Bottom ROI Metrics */}
              <div className="flex items-center justify-between text-[8px] text-slate-400">
                <span>Model: QueueSense-Temporal-v2.4</span>
                <span>Inference Latency: 13.8ms • DeepStream 6.3</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom HUD */}
        <div className="flex items-center justify-between text-[10px] text-slate-300 z-10 pt-1">
          <span>Target Counter: <strong className="text-white">{laneCode} (Elena Rostova)</strong></span>
          <div className="flex items-center gap-3">
            <span>Inference: <strong className="text-emerald-400">30 FPS</strong></span>
            <span>Detected Queue: <strong className="text-rose-400">{queueCount} Shoppers ({waitTime})</strong></span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-400 mt-2">
        <span className="flex items-center gap-1">
          <Cpu className="h-3 w-3 text-cyan-400" />
          <span>Real-Time Person Tracking &amp; Queue Polygon Extraction</span>
        </span>
        <span className="text-emerald-400 font-bold">100% Edge Processing</span>
      </div>
    </div>
  )
}
