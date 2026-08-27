import React from 'react'
import { X, UserCheck, MapPin, CheckCircle2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OperationalIncident } from './incidentData'

interface IncidentAssignModalProps {
  incident: OperationalIncident | null
  onClose: () => void
  onConfirm: (incident: OperationalIncident) => void
}

export const IncidentAssignModal: React.FC<IncidentAssignModalProps> = ({
  incident,
  onClose,
  onConfirm,
}) => {
  if (!incident) return null

  const staffName = incident.suggestedStaffName || 'Marcus Vance'
  const staffId = incident.suggestedStaffId || 'S02'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-sky-50 text-sky-600 border border-sky-200">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Assign Incident Owner
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

        {/* Incident Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs shadow-2xs">
          <div className="font-bold text-slate-900 text-xs">
            {incident.title}
          </div>
          <div className="text-[11px] text-slate-600 font-sans">
            {incident.recommendation}
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between mt-2 shadow-2xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Recommended Staff</span>
              <strong className="text-slate-900 text-xs font-bold">{staffName} ({staffId})</strong>
            </div>

            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              Available Now
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
          >
            Cancel
          </Button>

          <Button
            variant="action"
            size="sm"
            onClick={() => onConfirm(incident)}
            className="text-xs px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
          >
            Confirm Assignment
          </Button>
        </div>
      </div>
    </div>
  )
}
