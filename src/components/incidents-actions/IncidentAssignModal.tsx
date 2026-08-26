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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-lg border border-[#1E293B] bg-[#0B0F17] p-5 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#1E293B] text-cyan-400">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">
                Assign Incident Owner
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

        {/* Incident Summary */}
        <div className="p-3.5 rounded-lg bg-[#0F172A] border border-[#1E293B] space-y-2 text-xs">
          <div className="font-semibold text-white text-xs">
            {incident.title}
          </div>
          <div className="text-[11px] text-slate-300">
            {incident.recommendation}
          </div>

          <div className="p-2.5 rounded bg-[#090D14] border border-[#1E293B] flex items-center justify-between mt-2">
            <div>
              <span className="text-[10px] text-slate-500 block">Recommended Staff</span>
              <strong className="text-white text-xs">{staffName} ({staffId})</strong>
            </div>

            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-medium">
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
            className="text-xs text-slate-300 border-[#1E293B] hover:bg-[#1E293B]"
          >
            Cancel
          </Button>

          <Button
            variant="action"
            size="sm"
            onClick={() => onConfirm(incident)}
            className="text-xs px-4"
          >
            Confirm Assignment
          </Button>
        </div>
      </div>
    </div>
  )
}
