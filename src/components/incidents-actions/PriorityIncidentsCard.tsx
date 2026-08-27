import React from 'react'
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Camera,
  UserCheck,
  HelpCircle,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { OperationalIncident } from './incidentData'
import { WhyDialogData } from '@/components/command-center/WhyRecommendationDialog'

interface PriorityIncidentsCardProps {
  incidents: OperationalIncident[]
  onSelectIncident: (inc: OperationalIncident) => void
  onAssignStaff: (inc: OperationalIncident) => void
  onViewCamera?: (camCode: string, title: string) => void
  onOpenWhy?: (data: WhyDialogData) => void
}

export const PriorityIncidentsCard: React.FC<PriorityIncidentsCardProps> = ({
  incidents,
  onSelectIncident,
  onAssignStaff,
  onViewCamera,
  onOpenWhy,
}) => {
  // Top 3 priority unresolved incidents
  const priorityIncidents = incidents
    .filter((i) => i.status !== 'RESOLVED')
    .slice(0, 3)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none h-full min-h-[380px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">
              Priority Incidents
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Urgent store issues requiring immediate manager attention
            </p>
          </div>
        </div>

        <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-bold">
          Top {priorityIncidents.length} Urgent
        </span>
      </div>

      {/* 3 Priority Cards */}
      <div className="space-y-3 flex-1">
        {priorityIncidents.map((inc) => {
          const isCritical = inc.severity === 'CRITICAL'
          const isUnassigned = !inc.assignedStaffName

          return (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              className={cn(
                'p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 shadow-2xs',
                isCritical
                  ? 'bg-rose-50/20 border-rose-200 hover:border-rose-300'
                  : 'bg-amber-50/20 border-amber-200 hover:border-amber-300'
              )}
            >
              {/* Header: Severity, Title, Zone, Detected */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border',
                      isCritical
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    )}
                  >
                    {inc.severity}
                  </span>

                  <h4 className="text-xs font-bold text-slate-900">
                    {inc.title}
                  </h4>

                  <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs font-semibold">
                    {inc.zone}
                  </span>
                </div>

                <div className="text-[10px] text-slate-500">
                  Detected: <strong className="text-slate-900 font-mono">{inc.detectedTime}</strong>
                </div>
              </div>

              {/* Primary Metric & Recommendation Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Condition & Forecast</span>
                  <div className="text-slate-900 font-bold text-xs mt-0.5">{inc.primaryMetric}</div>
                  <div className="text-[10px] text-amber-800 font-semibold">{inc.forecastText}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">Recommended Action</span>
                  <div className="text-emerald-700 font-bold text-xs mt-0.5">{inc.recommendation}</div>
                  <div className="text-[10px] text-slate-500">
                    Owner: <strong className="text-slate-900">{inc.assignedStaffName || 'Unassigned'}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-2">
                  {inc.whyData && onOpenWhy && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenWhy(inc.whyData!)
                      }}
                      className="text-[11px] text-sky-700 hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="h-3 w-3" />
                      <span>Why?</span>
                    </button>
                  )}

                  {onViewCamera && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewCamera(inc.cameraCode, inc.title)
                      }}
                      className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="h-3 w-3 text-sky-600" />
                      <span>Camera</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isUnassigned && (
                    <Button
                      variant="action"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAssignStaff(inc)
                      }}
                      className="h-7 px-3 text-[11px] gap-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Assign</span>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectIncident(inc)
                    }}
                    className="h-7 px-2.5 text-[11px] text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs font-semibold"
                  >
                    <span>View Details</span>
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
