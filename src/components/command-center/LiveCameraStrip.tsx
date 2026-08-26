import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface CameraFeed {
  id: string
  name: string
  code: string
  summary: string
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL'
  type: 'people' | 'shelf' | 'queue' | 'exterior'
  resolution: string
  fps: number
  latencyMs: number
}

export const LiveCameraStrip: React.FC = () => {
  const navigate = useNavigate()
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null)

  const feeds: CameraFeed[] = [
    {
      id: 'cam-01',
      name: 'Entrance',
      code: 'C01',
      summary: '14 Inflow • Flow Nominal',
      status: 'NOMINAL',
      type: 'people',
      resolution: '1080p @ 30fps',
      fps: 30,
      latencyMs: 14,
    },
    {
      id: 'cam-02',
      name: 'Produce',
      code: 'C02',
      summary: '28 Shoppers • A1 92% Healthy',
      status: 'NOMINAL',
      type: 'people',
      resolution: '1080p @ 30fps',
      fps: 30,
      latencyMs: 16,
    },
    {
      id: 'cam-03',
      name: 'Beverages',
      code: 'C03',
      summary: 'B4 Low Stock (3 left)',
      status: 'CRITICAL',
      type: 'shelf',
      resolution: '1080p @ 29fps',
      fps: 29,
      latencyMs: 15,
    },
    {
      id: 'cam-05',
      name: 'Checkout',
      code: 'C05',
      summary: 'C1 Congested (8 in queue)',
      status: 'CRITICAL',
      type: 'queue',
      resolution: '1080p @ 30fps',
      fps: 30,
      latencyMs: 13,
    },
  ]

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 space-y-3 shadow-sm select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#131D31] text-cyan-400 border border-cyan-500/30">
            <Camera className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Live Cameras
          </h3>
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={() => navigate('/cameras')}
          className="text-slate-300 border-[#1E293B] hover:bg-[#131D31] text-xs gap-1 h-7 cursor-pointer"
        >
          <span>All Cameras</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>

      {/* 4 Main Camera Feeds in 4-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {feeds.map((feed) => {
          const isCritical = feed.status === 'CRITICAL'
          const isWarning = feed.status === 'WARNING'

          return (
            <div
              key={feed.id}
              className={cn(
                'rounded-lg bg-[#090D14] border p-2.5 transition-all flex flex-col justify-between space-y-2 group shadow-sm',
                isCritical
                  ? 'border-rose-500/50 hover:border-rose-400'
                  : isWarning
                  ? 'border-amber-500/40 hover:border-amber-400'
                  : 'border-[#1E293B] hover:border-cyan-500/40'
              )}
            >
              {/* Card Header: Camera ID & Live status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-[10px] font-mono font-bold text-cyan-300 bg-[#131D31] px-1.5 py-0.5 rounded border border-cyan-500/30">
                    {feed.code}
                  </span>
                  <span className="text-xs font-semibold text-white truncate">
                    {feed.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </div>
              </div>

              {/* Viewport Frame */}
              <div className="relative w-full h-24 rounded bg-[#070A0F] border border-[#1E293B] overflow-hidden flex flex-col justify-between p-2.5">
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, #38BDF8 1px, transparent 1px), linear-gradient(to bottom, #38BDF8 1px, transparent 1px)`,
                    backgroundSize: '18px 18px',
                  }}
                />

                <div className="z-10 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {feed.fps} FPS
                  </span>
                  {isCritical ? (
                    <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/50 text-[9px] font-mono font-bold flex items-center gap-1">
                      <AlertOctagon className="h-2.5 w-2.5" /> ALERT
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono flex items-center gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" /> OPTIMAL
                    </span>
                  )}
                </div>

                <div className="z-10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{feed.latencyMs}ms latency</span>
                  <span className="text-slate-500">{feed.resolution}</span>
                </div>
              </div>

              {/* Summary Text */}
              <p
                className={cn(
                  'text-[11px] leading-tight line-clamp-1 min-h-[16px]',
                  isCritical ? 'text-rose-300 font-medium' : 'text-slate-400'
                )}
              >
                {feed.summary}
              </p>

              {/* Action Button */}
              <Button
                variant="outline"
                size="xs"
                onClick={() => setSelectedCamera(feed)}
                className="w-full text-xs h-7 text-slate-300 border-[#1E293B] hover:bg-[#131D31] hover:text-white cursor-pointer font-sans"
              >
                View Feed
              </Button>
            </div>
          )
        })}
      </div>

      {/* Feed Detail Modal Dialog */}
      {selectedCamera && (
        <Dialog open={!!selectedCamera} onOpenChange={() => setSelectedCamera(null)}>
          <DialogContent className="max-w-xl bg-[#0F172A] border-[#1E293B] text-white p-5 font-sans">
            <DialogHeader className="border-b border-[#1E293B] pb-3">
              <DialogTitle className="text-base font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-300 bg-[#131D31] px-2 py-0.5 rounded border border-cyan-500/30 text-xs">
                    {selectedCamera.code}
                  </span>
                  <span>{selectedCamera.name} • Live Stream</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE (30 FPS)
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div className="relative w-full h-56 rounded-lg bg-[#070A0F] border border-[#1E293B] overflow-hidden flex flex-col justify-between p-3">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                  <span>Stream: Hardware-Accelerated</span>
                  <span>Latency: {selectedCamera.latencyMs}ms</span>
                </div>

                <div className="self-center text-center">
                  <Camera className="h-10 w-10 text-cyan-400/50 mx-auto mb-2" />
                  <p className="text-xs font-mono text-slate-400">
                    Live Feed Active • {selectedCamera.resolution}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Detection: Active</span>
                  <span className="text-emerald-400">Inference Nominal</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#090D14] border border-[#1E293B] space-y-1">
                <span className="text-xs font-semibold text-white block">Current AI Detection Summary</span>
                <p className="text-xs text-slate-300">{selectedCamera.summary}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
