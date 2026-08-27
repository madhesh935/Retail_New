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

      <div className="relative w-full max-w-md h-full bg-white border-l border-slate-200 z-10 flex flex-col shadow-2xl p-4 animate-in slide-in-from-right duration-200 select-none font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 font-bold text-xs shadow-2xs">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-sans">
                {camera.name}
              </h3>
              <span className="text-[10px] text-sky-700 font-mono font-bold">
                {camera.code} • {camera.zone}
              </span>
            </div>
          </div>

          <Button variant="ghost" size="icon-xs" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs">
          {/* Simulated Video Feed Player */}
          <div className="relative h-48 rounded-xl bg-slate-950 border border-slate-200 overflow-hidden p-2.5 flex flex-col justify-between shadow-inner">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, #2DD4BF 0px, transparent 1px, transparent 4px)`,
              }}
            />

            <div className="flex items-center justify-between text-[10px] text-sky-300 font-mono z-10">
              <span className="flex items-center gap-1 font-bold">
                <Scan className="h-3 w-3" /> DeepStream Pipeline
              </span>
              <span className="bg-emerald-600 px-1.5 py-0.5 rounded text-white font-bold">
                ● LIVE
              </span>
            </div>

            {/* Bounding box simulation */}
            <div className="self-center my-auto p-2 rounded-lg border border-sky-400/80 bg-sky-500/10 text-center pointer-events-none backdrop-blur-xs font-mono">
              <div className="text-[10px] text-sky-300 font-bold">DETECTION_ACTIVE: {camera.aiModel}</div>
              <div className="text-[9px] text-slate-400">INFERENCE_LATENCY: {camera.latencyMs}ms</div>
            </div>

            <div className="text-[10px] text-slate-400 z-10 flex items-center justify-between font-mono">
              <span>{camera.resolution}</span>
              <span className="text-emerald-400 font-bold">{camera.fps} FPS</span>
            </div>
          </div>

          {/* Camera Hardware Specs */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Edge Pipeline State</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Nominal
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-sans">Frame Rate</span>
                <span className="text-base font-bold text-slate-900">
                  {camera.fps} FPS
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-sans">Pipeline Latency</span>
                <span className="text-base font-bold text-sky-700">
                  {camera.latencyMs} ms
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <div>Loaded AI Model: <strong className="text-slate-900">{camera.aiModel}</strong></div>
              <div>Camera Mount: <strong className="text-slate-900">Overhead Ceiling (Y=5.0m)</strong></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Camera Stream: rtsp://edge-jetson:8554/{camera.code.toLowerCase()}</span>
          <Button variant="ghost" size="xs" onClick={onClose} className="h-6 text-[10px] text-slate-600 hover:text-slate-900">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
