import React, { useState } from 'react'
import {
  X,
  ShieldAlert,
  Clock,
  Camera,
  CheckCircle2,
  UserCheck,
  ArrowRight,
  Compass,
  Layers,
  Scan,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OperationalIncident } from './incidentData'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface IncidentDetailDrawerProps {
  incident: OperationalIncident | null
  onClose: () => void
  onAssignStaff?: (incident: OperationalIncident) => void
  onViewCamera?: (camCode: string, title: string) => void
}

export const IncidentDetailDrawer: React.FC<IncidentDetailDrawerProps> = ({
  incident,
  onClose,
  onAssignStaff,
  onViewCamera,
}) => {
  const navigate = useNavigate()
  const [showAiOverlay, setShowAiOverlay] = useState(true)

  if (!incident) return null

  const isCritical = incident.severity === 'CRITICAL'
  const isHigh = incident.severity === 'HIGH'
  const isResolved = incident.status === 'RESOLVED'

  const timelineEvents = [
    { time: incident.detectedTime, label: 'Incident Detected on Floor Sensor', status: 'COMPLETED' },
    { time: '18:42:20', label: 'Recommended Action Created', status: 'COMPLETED' },
    {
      time: '18:43:10',
      label: incident.assignedStaffName
        ? `Assigned to ${incident.assignedStaffName}`
        : 'Awaiting Staff Assignment',
      status: incident.assignedStaffName ? 'COMPLETED' : 'PENDING',
    },
    {
      time: '18:45:00',
      label: isResolved ? 'Resolution Confirmed' : 'Resolution in Progress',
      status: isResolved ? 'COMPLETED' : 'PENDING',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-lg h-full bg-[#0B0F17] border-l border-[#1E293B] z-10 flex flex-col shadow-2xl p-4 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs',
                isCritical
                  ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                  : 'bg-amber-950 text-amber-400 border border-amber-500/40'
              )}
            >
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">
                {incident.title}
              </h3>
              <span className="text-[11px] text-slate-400">
                Incident #{incident.code} · {incident.zone}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
          {/* 1. Camera Evidence Preview */}
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <Camera className="h-3.5 w-3.5 text-cyan-400" />
                <span>Camera {incident.cameraCode} Evidence</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAiOverlay(!showAiOverlay)}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer',
                    showAiOverlay
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                      : 'bg-[#090D14] text-slate-400 border-[#1E293B]'
                  )}
                >
                  Overlay {showAiOverlay ? 'ON' : 'OFF'}
                </button>
                <span className="text-emerald-400 font-medium text-[10px]">● Live</span>
              </div>
            </div>

            {/* Simulated Live Stream Preview */}
            <div className="relative h-44 rounded-lg bg-[#070A0F] border border-[#1E293B] overflow-hidden p-2 flex flex-col justify-between">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, #38BDF8 0px, transparent 1px, transparent 4px)`,
                }}
              />

              <div className="flex justify-between text-[9px] text-cyan-300 z-10">
                <span>Camera {incident.cameraCode}</span>
                <span className="bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/40 font-medium">
                  {incident.severity}
                </span>
              </div>

              {/* Bounding Box Simulation */}
              {showAiOverlay && (
                <div className="self-center my-auto p-2.5 rounded-lg border border-cyan-500/50 bg-cyan-950/25 text-center space-y-0.5 pointer-events-none">
                  <div className="text-[11px] text-cyan-300 font-semibold">{incident.primaryMetric}</div>
                  <div className="text-[9px] text-slate-400">Spatial telemetry verified</div>
                </div>
              )}

              <div className="flex justify-between text-[10px] text-slate-400 z-10 bg-[#0F172A]/80 px-2 py-0.5 rounded border border-[#1E293B]">
                <span>Location: {incident.zone}</span>
                <span className="text-slate-300">{incident.detectedTime}</span>
              </div>
            </div>
          </div>

          {/* 2. Detected Condition & Forecast */}
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">
              Condition & Forecast
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#090D14] p-2.5 rounded-lg border border-[#1E293B]">
                <span className="text-[10px] text-slate-500 block">Primary Metric</span>
                <span className="font-semibold text-white text-xs mt-0.5 block">{incident.primaryMetric}</span>
              </div>
              <div className="bg-[#090D14] p-2.5 rounded-lg border border-[#1E293B]">
                <span className="text-[10px] text-slate-500 block">Forecast</span>
                <span className="font-semibold text-amber-300 text-xs mt-0.5 block">{incident.forecastText}</span>
              </div>
            </div>
          </div>

          {/* 3. Recommended Action & Staff Ownership */}
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">
              Operational Action & Owner
            </span>
            <div className="font-semibold text-emerald-400 text-xs">
              {incident.recommendation}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1E293B] text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Assigned Owner:</span>
                <strong className="text-white font-medium">
                  {incident.assignedStaffName || 'Unassigned'}
                </strong>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Suggested Match:</span>
                <strong className="text-cyan-300 font-medium">
                  {incident.suggestedStaffName || 'S02 Marcus Vance'}
                </strong>
              </div>
            </div>
          </div>

          {/* 4. Chronological Timeline */}
          <div className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">
              Incident Lifecycle Timeline
            </span>

            <div className="space-y-2">
              {timelineEvents.map((evt, idx) => {
                const isDone = evt.status === 'COMPLETED'

                return (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <div className="pt-1">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full block',
                          isDone ? 'bg-emerald-400' : 'bg-slate-600'
                        )}
                      />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className={isDone ? 'text-slate-200' : 'text-slate-500'}>
                        {evt.label}
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">{evt.time}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 5. Direct Navigation Links */}
          <div className="space-y-2 pt-1">
            {incident.sourcePageUrl && (
              <Button
                variant="action"
                size="sm"
                onClick={() => {
                  onClose()
                  navigate(incident.sourcePageUrl!)
                }}
                className="w-full justify-between h-8 text-xs"
              >
                <span>Open in {incident.sourcePageName}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose()
                navigate('/digital-twin')
              }}
              className="w-full justify-between h-8 text-xs text-slate-300 border-[#1E293B] hover:bg-[#1E293B]"
            >
              <span className="flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-cyan-400" />
                <span>Show on 3D Digital Twin</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
          <span>Incident #{incident.code}</span>
          <Button variant="ghost" size="xs" onClick={onClose} className="h-7 text-[11px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
