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
      <div className="p-8 rounded-xl bg-white border border-slate-200 text-center space-y-1 select-none shadow-2xs font-sans">
        <div className="font-bold text-slate-900 text-xs">No active incidents matching filters</div>
        <div className="text-[11px] text-slate-500">Store operations are currently normal</div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between shadow-2xs select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
        <h3 className="text-xs font-bold text-slate-900 tracking-wide">
          All Store Incidents
        </h3>
        <span className="text-[11px] text-slate-500">
          {incidents.length} incidents listed
        </span>
      </div>

      {/* Table Format */}
      <div className="overflow-x-auto my-1">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] text-slate-500 font-medium">
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Incident</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3">Detected</th>
              <th className="py-2.5 px-3">Owner</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
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
                    'hover:bg-slate-50 transition-colors cursor-pointer',
                    isSelected && 'bg-sky-50/50'
                  )}
                >
                  {/* Severity Badge */}
                  <td className="py-2.5 px-3">
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border',
                        isCritical
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isHigh
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : isResolved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      )}
                    >
                      {inc.severity}
                    </span>
                  </td>

                  {/* Incident Title */}
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900 text-xs">
                      {inc.title}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-xs">
                      {inc.recommendation}
                    </div>
                  </td>

                  {/* Location Zone */}
                  <td className="py-2.5 px-3 text-slate-700 font-medium text-[11px]">
                    {inc.zone}
                  </td>

                  {/* Detected Time */}
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] font-mono">
                    {inc.detectedTime}
                  </td>

                  {/* Owner */}
                  <td className="py-2.5 px-3">
                    {inc.assignedStaffName ? (
                      <span className="font-semibold text-slate-900 text-xs">
                        {inc.assignedStaffName}
                      </span>
                    ) : (
                      <span className="text-amber-800 text-[11px] font-bold">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border',
                        inc.status === 'NEEDS_ACTION'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : inc.status === 'IN_PROGRESS'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : inc.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
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
                      className="inline-flex items-center gap-0.5 text-[11px] text-sky-700 hover:text-sky-800 font-semibold cursor-pointer"
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
