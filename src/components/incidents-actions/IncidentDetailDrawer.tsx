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
  onResolve?: (incident: OperationalIncident) => void
}

export const IncidentDetailDrawer: React.FC<IncidentDetailDrawerProps> = ({
  incident,
  onClose,
  onAssignStaff,
  onViewCamera,
  onResolve,
}) => {
  const navigate = useNavigate()
  const [showAiOverlay, setShowAiOverlay] = useState(true)

  if (!incident) return null

  const isCritical = incident.severity === 'CRITICAL'
  const isHigh = incident.severity === 'HIGH'
  const isResolved = incident.status === 'RESOLVED'

  // Only the detection step has a real recorded timestamp on the incident;
  // the later lifecycle stages aren't individually timestamped, so we show
  // their state without inventing a specific clock time for them.
  const timelineEvents = [
    { time: incident.detectedTime, label: 'Incident Detected on Floor Sensor', status: 'COMPLETED' },
    { time: null, label: 'Recommended Action Created', status: 'COMPLETED' },
    {
      time: null,
      label: incident.assignedStaffName
        ? `Assigned to ${incident.assignedStaffName}`
        : 'Awaiting Staff Assignment',
      status: incident.assignedStaffName ? 'COMPLETED' : 'PENDING',
    },
    {
      time: isResolved ? incident.durationText || null : null,
      label: isResolved ? 'Resolution Confirmed' : 'Resolution in Progress',
      status: isResolved ? 'COMPLETED' : 'PENDING',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-lg h-full bg-white border-l border-slate-200 z-10 flex flex-col shadow-2xl p-4 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs',
                isCritical
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              )}
            >
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                {incident.title}
              </h3>
              <span className="text-[11px] text-slate-500">
                Incident #{incident.code} · {incident.zone}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
          {/* 1. Camera Evidence Preview */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 font-bold text-slate-900">
                <Camera className="h-3.5 w-3.5 text-sky-600" />
                <span>Camera {incident.cameraCode} Evidence</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAiOverlay(!showAiOverlay)}
                  className={cn(
                    'px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-colors cursor-pointer',
                    showAiOverlay
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : 'bg-white text-slate-600 border-slate-200'
                  )}
                >
                  Overlay {showAiOverlay ? 'ON' : 'OFF'}
                </button>
                {onViewCamera && (
                  <button
                    onClick={() => onViewCamera(incident.cameraCode, incident.zone)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold border border-sky-200 bg-sky-50 text-sky-700 cursor-pointer"
                  >
                    View Live Feed
                  </button>
                )}
              </div>
            </div>

            {/* Simulated Live Stream Preview */}
            <div className="relative h-44 rounded-xl bg-[#070A0F] border border-slate-200 overflow-hidden p-2 flex flex-col justify-between shadow-inner">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, #2DD4BF 0px, transparent 1px, transparent 4px)`,
                }}
              />

              <div className="flex justify-between text-[9px] text-sky-300 z-10 font-mono">
                <span>Camera {incident.cameraCode}</span>
                <span className="bg-rose-950 text-rose-200 px-1.5 py-0.5 rounded border border-rose-700 font-bold">
                  {incident.severity}
                </span>
              </div>

              {/* Bounding Box Simulation */}
              {showAiOverlay && (
                <div className="self-center my-auto p-2.5 rounded-lg border border-sky-500/50 bg-sky-950/25 text-center space-y-0.5 pointer-events-none font-sans">
                  <div className="text-[11px] text-sky-300 font-bold">{incident.primaryMetric}</div>
                  <div className="text-[9px] text-slate-400 font-mono">Spatial telemetry verified</div>
                </div>
              )}

              <div className="flex justify-between text-[10px] text-slate-300 z-10 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 font-mono">
                <span>Location: {incident.zone}</span>
                <span className="text-slate-200">{incident.detectedTime}</span>
              </div>
            </div>
          </div>

          {/* 2. Detected Condition & Forecast */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Condition & Forecast
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Primary Metric</span>
                <span className="font-bold text-slate-900 text-xs mt-0.5 block">{incident.primaryMetric}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Forecast</span>
                <span className="font-bold text-amber-800 text-xs mt-0.5 block">{incident.forecastText}</span>
              </div>
            </div>
          </div>

          {/* 3. Recommended Action & Staff Ownership */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Operational Action & Owner
            </span>
            <div className="font-bold text-emerald-700 text-xs">
              {incident.recommendation}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Assigned Owner:</span>
                <strong className="text-slate-900 font-bold">
                  {incident.assignedStaffName || 'Unassigned'}
                </strong>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Suggested Match:</span>
                <strong className="text-sky-700 font-bold">
                  {incident.suggestedStaffName || '—'}
                </strong>
              </div>
            </div>

            <div className="flex gap-2">
              {onAssignStaff && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => onAssignStaff(incident)}
                  className="flex-1 h-7 text-[11px] font-semibold text-sky-700 border-sky-200 bg-white hover:bg-sky-50 shadow-2xs"
                >
                  {incident.assignedStaffName ? 'Reassign Staff' : 'Assign Staff'}
                </Button>
              )}
              {onResolve && !isResolved && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => onResolve(incident)}
                  className="flex-1 h-7 text-[11px] font-semibold text-emerald-700 border-emerald-200 bg-white hover:bg-emerald-50 shadow-2xs"
                >
                  Mark Resolved
                </Button>
              )}
            </div>
          </div>

          {/* 4. Chronological Timeline */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              Incident Lifecycle Timeline
            </span>

            <div className="space-y-2">
              {timelineEvents.map((evt, idx) => {
                const isDone = evt.status === 'COMPLETED'

                return (
                  <div key={idx} className="flex items-start gap-2 text-xs font-sans">
                    <div className="pt-1">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full block',
                          isDone ? 'bg-emerald-500' : 'bg-slate-300'
                        )}
                      />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className={isDone ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                        {evt.label}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">{evt.time}</span>
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
                className="w-full justify-between h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold"
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
                navigate(`/digital-twin?zone=${incident.zoneId}`)
              }}
              className="w-full justify-between h-8 text-xs text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs font-sans"
            >
              <span className="flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-sky-600" />
                <span>Show on 3D Digital Twin</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Incident #{incident.code}</span>
          <Button variant="ghost" size="xs" onClick={onClose} className="h-7 text-[11px] text-slate-500 hover:text-slate-900">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
