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
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none h-full min-h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#1E293B] text-rose-400">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide">
              Priority Incidents
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Urgent store issues requiring immediate manager attention
            </p>
          </div>
        </div>

        <span className="text-[10px] text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40 font-medium">
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
                'p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between space-y-2.5',
                isCritical
                  ? 'bg-[#0F172A] border-rose-500/40 hover:border-rose-400'
                  : 'bg-[#0F172A] border-amber-500/40 hover:border-amber-400'
              )}
            >
              {/* Header: Severity, Title, Zone, Detected */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-semibold uppercase border',
                      isCritical
                        ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                        : 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                    )}
                  >
                    {inc.severity}
                  </span>

                  <h4 className="text-xs font-semibold text-white">
                    {inc.title}
                  </h4>

                  <span className="text-[10px] text-slate-400 bg-[#090D14] px-2 py-0.5 rounded border border-[#1E293B]">
                    {inc.zone}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400">
                  Detected: <strong className="text-slate-300">{inc.detectedTime}</strong>
                </div>
              </div>

              {/* Primary Metric & Recommendation Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-[#090D14] p-2.5 rounded-lg border border-[#1E293B]">
                <div>
                  <span className="text-[10px] text-slate-500 block font-medium">Condition & Forecast</span>
                  <div className="text-white font-medium text-xs mt-0.5">{inc.primaryMetric}</div>
                  <div className="text-[10px] text-amber-400 font-medium">{inc.forecastText}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block font-medium">Recommended Action</span>
                  <div className="text-emerald-400 font-semibold text-xs mt-0.5">{inc.recommendation}</div>
                  <div className="text-[10px] text-slate-400">
                    Owner: <strong className="text-white">{inc.assignedStaffName || 'Unassigned'}</strong>
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
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
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
                      className="text-[11px] text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="h-3 w-3 text-cyan-400" />
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
                      className="h-7 px-3 text-[11px] gap-1"
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
                    className="h-7 px-2.5 text-[11px] text-slate-300 border-[#1E293B] hover:bg-[#1E293B]"
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
