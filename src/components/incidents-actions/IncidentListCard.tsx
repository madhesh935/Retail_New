import React from 'react'
import {
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  UserCheck,
  Camera,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { OperationalIncident } from './incidentData'

interface IncidentListCardProps {
  incidents: OperationalIncident[]
  selectedIncidentId?: string | null
  onSelectIncident: (inc: OperationalIncident) => void
  onAssignStaff?: (inc: OperationalIncident) => void
  onViewCamera?: (camCode: string, title: string) => void
}

export const IncidentListCard: React.FC<IncidentListCardProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onAssignStaff,
  onViewCamera,
}) => {
  if (incidents.length === 0) {
    return (
      <div className="p-8 rounded-lg bg-[#0F172A] border border-[#1E293B] text-center space-y-1 select-none">
        <div className="font-semibold text-white text-xs">No active incidents matching filters</div>
        <div className="text-[11px] text-slate-400">Store operations are currently normal</div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[#1E293B] bg-[#0F172A] p-4 flex flex-col justify-between shadow-sm select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-2">
        <h3 className="text-xs font-semibold text-white tracking-wide">
          All Store Incidents
        </h3>
        <span className="text-[11px] text-slate-400">
          {incidents.length} incidents listed
        </span>
      </div>

      {/* Table Format */}
      <div className="overflow-x-auto my-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E293B] text-[11px] text-slate-400 font-medium">
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Incident</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3">Detected</th>
              <th className="py-2.5 px-3">Owner</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B] text-xs">
            {incidents.map((inc) => {
              const isSelected = selectedIncidentId === inc.id
              const isCritical = inc.severity === 'CRITICAL'
              const isHigh = inc.severity === 'HIGH'
              const isResolved = inc.status === 'RESOLVED'

              return (
                <tr
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className={cn(
                    'hover:bg-[#131D31] transition-colors cursor-pointer',
                    isSelected && 'bg-[#131D31]'
                  )}
                >
                  {/* Severity Badge */}
                  <td className="py-2.5 px-3">
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase border',
                        isCritical
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                          : isHigh
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                          : isResolved
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                          : 'bg-[#1E293B] text-cyan-300 border-slate-700'
                      )}
                    >
                      {inc.severity}
                    </span>
                  </td>

                  {/* Incident Title */}
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-white text-xs">
                      {inc.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-xs">
                      {inc.recommendation}
                    </div>
                  </td>

                  {/* Location Zone */}
                  <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                    {inc.zone}
                  </td>

                  {/* Detected Time */}
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] font-mono">
                    {inc.detectedTime}
                  </td>

                  {/* Owner */}
                  <td className="py-2.5 px-3">
                    {inc.assignedStaffName ? (
                      <span className="font-medium text-white text-xs">
                        {inc.assignedStaffName}
                      </span>
                    ) : (
                      <span className="text-amber-400 text-[11px] font-medium">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase',
                        inc.status === 'NEEDS_ACTION'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                          : inc.status === 'IN_PROGRESS'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                          : inc.status === 'RESOLVED'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                          : 'bg-[#1E293B] text-slate-300'
                      )}
                    >
                      {inc.status.replace(/_/g, ' ')}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectIncident(inc)
                      }}
                      className="inline-flex items-center gap-0.5 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                    >
                      <span>View</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
