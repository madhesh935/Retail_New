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
    <div className="rounded-lg border border-cyan-500/40 bg-[#090D14] p-3 space-y-2.5 select-none font-mono text-xs shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
        <div className="flex items-center gap-1.5 font-bold text-white uppercase text-xs">
          <Camera className="h-3.5 w-3.5 text-cyan-400" />
          <span>{locationTitle} — Live Camera Evidence ({cameraCode})</span>
        </div>

        {/* Raw vs AI Overlay Tabs */}
        <div className="flex items-center gap-1 bg-[#0F172A] p-0.5 rounded border border-[#1E293B] text-[10px]">
          <button
            onClick={() => setFeedMode('RAW')}
            className={cn(
              'px-2 py-0.5 rounded transition-colors cursor-pointer',
              feedMode === 'RAW'
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            )}
          >
            Raw Feed
          </button>
          <button
            onClick={() => setFeedMode('AI_OVERLAY')}
            className={cn(
              'px-2 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1',
              feedMode === 'AI_OVERLAY'
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Scan className="h-2.5 w-2.5 text-cyan-400" />
            <span>AI Overlay</span>
          </button>
        </div>
      </div>

      {/* Simulated Live Stream Preview */}
      <div className="relative h-44 rounded bg-[#070A0F] border border-[#1E293B] overflow-hidden p-2 flex flex-col justify-between">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #38BDF8 0px, transparent 1px, transparent 4px)`,
          }}
        />

        <div className="flex justify-between text-[9px] text-cyan-300 z-10">
          <span>RTSP // {cameraCode} • 30 FPS</span>
          <span className="bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/40 font-bold">
            CONGESTION DETECTED
          </span>
        </div>

        {/* AI Overlay Visual Bounding Boxes */}
        {feedMode === 'AI_OVERLAY' && (
          <div className="self-center my-auto p-2 rounded border border-cyan-500/60 bg-cyan-950/30 text-center space-y-1 pointer-events-none">
            <div className="text-[10px] text-cyan-300 font-bold">
              Queue Polygon ROI: {detectedQueueCount} Anonymous Tracks
            </div>
            <div className="text-[8px] text-slate-400 font-mono">
              [T-1082..T-1089] • 94.2% Spatial Confidence • Jetson TensorRT
            </div>
          </div>
        )}

        <div className="flex justify-between text-[8px] text-slate-400 z-10">
          <span>Latency: 13.8ms</span>
          <span className="text-white font-bold">{locationTitle}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-center">
        <div className="bg-[#0F172A] p-1.5 rounded border border-[#1E293B]">
          <span className="text-slate-500 block">Detected Queue</span>
          <strong className="text-rose-400 text-xs">{detectedQueueCount} People</strong>
        </div>
        <div className="bg-[#0F172A] p-1.5 rounded border border-[#1E293B]">
          <span className="text-slate-500 block">Estimated Wait</span>
          <strong className="text-amber-400 text-xs">{estimatedWait}</strong>
        </div>
        <div className="bg-[#0F172A] p-1.5 rounded border border-[#1E293B]">
          <span className="text-slate-500 block">Predicted +5m</span>
          <strong className="text-rose-400 text-xs">{predictedQueue5Min} Shoppers</strong>
        </div>
        <div className="bg-[#0F172A] p-1.5 rounded border border-[#1E293B]">
          <span className="text-slate-500 block">Congestion Risk</span>
          <strong className="text-rose-400 text-xs">{congestionRisk}</strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between gap-2 flex-wrap">
        <Button
          variant="outline"
          size="xs"
          onClick={() => onOpenFullCamera && onOpenFullCamera(cameraCode, locationTitle)}
          className="text-[10px] h-6 px-2 text-cyan-300 border-[#1E293B] gap-1"
        >
          <Camera className="h-3 w-3 text-cyan-400" />
          <span>Open Full Camera Feed</span>
        </Button>

        <Button
          variant="action"
          size="xs"
          onClick={() => navigate('/queues')}
          className="text-[10px] h-6 px-2 gap-1 ml-auto"
        >
          <ExternalLink className="h-3 w-3" />
          <span>Open Queue Intelligence</span>
        </Button>
      </div>
    </div>
  )
}
