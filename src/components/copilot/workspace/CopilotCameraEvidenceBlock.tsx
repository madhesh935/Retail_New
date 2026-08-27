import React, { useState } from 'react'
import {
  Camera,
  Layers,
  Scan,
  Users,
  Clock,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface CopilotCameraEvidenceBlockProps {
  cameraCode?: string
  locationTitle?: string
  detectedQueueCount?: number
  estimatedWait?: string
  predictedQueue5Min?: number
  congestionRisk?: string
  onOpenFullCamera?: (cameraCode: string, title: string) => void
}

export const CopilotCameraEvidenceBlock: React.FC<CopilotCameraEvidenceBlockProps> = ({
  cameraCode = 'CAM-06',
  locationTitle = 'Checkout Counter C1',
  detectedQueueCount = 8,
  estimatedWait = '5.4 min',
  predictedQueue5Min = 13,
  congestionRisk = 'Critical (92%)',
  onOpenFullCamera,
}) => {
  const navigate = useNavigate()
  const [feedMode, setFeedMode] = useState<'AI_OVERLAY' | 'RAW'>('AI_OVERLAY')

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5 select-none font-sans text-xs shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase text-xs">
          <Camera className="h-3.5 w-3.5 text-sky-600" />
          <span>{locationTitle} — Live Camera Evidence ({cameraCode})</span>
        </div>

        {/* Raw vs AI Overlay Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
          <button
            onClick={() => setFeedMode('RAW')}
            className={cn(
              'px-2 py-0.5 rounded-md transition-colors cursor-pointer font-semibold',
              feedMode === 'RAW'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            Raw Feed
          </button>
          <button
            onClick={() => setFeedMode('AI_OVERLAY')}
            className={cn(
              'px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 font-semibold',
              feedMode === 'AI_OVERLAY'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            <Scan className="h-2.5 w-2.5 text-sky-600" />
            <span>AI Overlay</span>
          </button>
        </div>
      </div>

      {/* Simulated Live Stream Preview (Dark Viewport for CCTV/CV Contrast) */}
      <div className="relative h-44 rounded-xl bg-slate-950 border border-slate-200 overflow-hidden p-2.5 flex flex-col justify-between shadow-inner">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #2DD4BF 0px, transparent 1px, transparent 4px)`,
          }}
        />

        <div className="flex justify-between text-[9px] text-sky-300 z-10 font-mono">
          <span>RTSP // {cameraCode} • 30 FPS</span>
          <span className="bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/40 font-bold">
            CONGESTION DETECTED
          </span>
        </div>

        {/* AI Overlay Visual Bounding Boxes */}
        {feedMode === 'AI_OVERLAY' && (
          <div className="self-center my-auto p-2 rounded-lg border border-sky-500/60 bg-sky-950/40 text-center space-y-1 pointer-events-none backdrop-blur-xs">
            <div className="text-[10px] text-sky-300 font-bold font-mono">
              Queue Polygon ROI: {detectedQueueCount} Anonymous Tracks
            </div>
            <div className="text-[8px] text-slate-300 font-mono">
              [T-1082..T-1089] • 94.2% Spatial Confidence • Jetson TensorRT
            </div>
          </div>
        )}

        <div className="flex justify-between text-[8px] text-slate-400 z-10 font-mono">
          <span>Latency: 13.8ms</span>
          <span className="text-white font-bold">{locationTitle}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-center font-sans">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block">Detected Queue</span>
          <strong className="text-rose-700 text-xs font-mono font-bold">{detectedQueueCount} People</strong>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block">Estimated Wait</span>
          <strong className="text-amber-800 text-xs font-mono font-bold">{estimatedWait}</strong>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block">Predicted +5m</span>
          <strong className="text-rose-700 text-xs font-mono font-bold">{predictedQueue5Min} Shoppers</strong>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block">Congestion Risk</span>
          <strong className="text-rose-700 text-xs font-mono font-bold">{congestionRisk}</strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap font-sans">
        <Button
          variant="outline"
          size="xs"
          onClick={() => onOpenFullCamera && onOpenFullCamera(cameraCode, locationTitle)}
          className="text-[10px] h-6 px-2 text-slate-700 border-slate-200 bg-white hover:bg-slate-50 gap-1 shadow-2xs font-semibold"
        >
          <Camera className="h-3 w-3 text-sky-600" />
          <span>Open Full Camera Feed</span>
        </Button>

        <Button
          variant="action"
          size="xs"
          onClick={() => navigate('/queues')}
          className="text-[10px] h-6 px-2.5 gap-1 ml-auto bg-sky-600 hover:bg-sky-700 text-white font-semibold"
        >
          <ExternalLink className="h-3 w-3" />
          <span>Open Queue Intelligence</span>
        </Button>
      </div>
    </div>
  )
}
