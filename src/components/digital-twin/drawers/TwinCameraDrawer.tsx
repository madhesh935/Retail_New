import React from 'react'
import {
  X,
  Camera,
  Activity,
  Cpu,
  Scan,
  CheckCircle2,
  Maximize2,
} from 'lucide-react'
import { Camera3DData } from '../scene/CameraCoverage3D'
import { Button } from '@/components/ui/button'

interface TwinCameraDrawerProps {
  camera: Camera3DData | null
  onClose: () => void
}

export const TwinCameraDrawer: React.FC<TwinCameraDrawerProps> = ({ camera, onClose }) => {
  if (!camera) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md h-full bg-[#0B0F17] border-l border-[#1E293B] z-10 flex flex-col shadow-2xl p-4 animate-in slide-in-from-right duration-200 select-none font-mono">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase font-sans">
                {camera.name}
              </h3>
              <span className="text-[10px] text-cyan-400">
                {camera.code} • {camera.zone}
              </span>
            </div>
          </div>

          <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs">
          {/* Simulated Video Feed Player */}
          <div className="relative h-48 rounded-lg bg-[#070A0F] border border-[#1E293B] overflow-hidden p-2.5 flex flex-col justify-between shadow-inner">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, #38BDF8 0px, transparent 1px, transparent 4px)`,
              }}
            />

            <div className="flex items-center justify-between text-[10px] text-cyan-400 z-10">
              <span className="flex items-center gap-1 font-bold">
                <Scan className="h-3 w-3" /> DeepStream Pipeline
              </span>
              <span className="bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/40 text-emerald-300 font-bold">
                ● LIVE
              </span>
            </div>

            {/* Bounding box simulation */}
            <div className="self-center my-auto p-2 rounded border border-cyan-500/70 bg-cyan-950/30 text-center pointer-events-none">
              <div className="text-[10px] text-cyan-300 font-bold">DETECTION_ACTIVE: {camera.aiModel}</div>
              <div className="text-[9px] text-slate-400">INFERENCE_LATENCY: {camera.latencyMs}ms</div>
            </div>

            <div className="text-[10px] text-slate-400 z-10 flex items-center justify-between">
              <span>{camera.resolution}</span>
              <span className="text-emerald-400 font-bold">{camera.fps} FPS</span>
            </div>
          </div>

          {/* Camera Hardware Specs */}
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Edge Pipeline State</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Nominal
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="bg-[#090D14] p-2 rounded border border-[#1E293B]">
                <span className="text-[10px] text-slate-500 block">Frame Rate</span>
                <span className="text-base font-bold text-white">
                  {camera.fps} FPS
                </span>
              </div>
              <div className="bg-[#090D14] p-2 rounded border border-[#1E293B]">
                <span className="text-[10px] text-slate-500 block">Pipeline Latency</span>
                <span className="text-base font-bold text-cyan-400">
                  {camera.latencyMs} ms
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1E293B] text-[11px] text-slate-300 space-y-1">
              <div>Loaded AI Model: <strong className="text-cyan-300">{camera.aiModel}</strong></div>
              <div>Camera Mount: <strong className="text-slate-200">Overhead Ceiling (Y=5.0m)</strong></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-500">
          <span>Camera Stream: rtsp://edge-jetson:8554/{camera.code.toLowerCase()}</span>
          <Button variant="ghost" size="xs" onClick={onClose} className="h-6 text-[10px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
