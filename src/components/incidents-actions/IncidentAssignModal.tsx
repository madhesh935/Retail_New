import React, { useState, useEffect } from 'react'
import { X, UserCheck, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OperationalIncident } from './incidentData'

export interface AssignableStaffOption {
  id: string
  name: string
  role?: string
}

interface IncidentAssignModalProps {
  incident: OperationalIncident | null
  staffOptions: AssignableStaffOption[]
  onClose: () => void
  onConfirm: (incident: OperationalIncident, staff: AssignableStaffOption) => void
}

export const IncidentAssignModal: React.FC<IncidentAssignModalProps> = ({
  incident,
  staffOptions,
  onClose,
  onConfirm,
}) => {
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)

  useEffect(() => {
    setSelectedStaffId(staffOptions[0]?.id ?? null)
  }, [incident?.id, staffOptions])

  if (!incident) return null

  const selectedStaff = staffOptions.find((s) => s.id === selectedStaffId) || null

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

          <div className="mt-2 space-y-1.5">
            <span className="text-[10px] text-slate-500 block">Assign Available Staff</span>
            {staffOptions.length === 0 && (
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-500">
                No available staff members right now.
              </div>
            )}
            {staffOptions.map((staff) => (
              <button
                key={staff.id}
                type="button"
                onClick={() => setSelectedStaffId(staff.id)}
                className={`w-full p-2.5 rounded-lg border flex items-center justify-between text-left transition-colors shadow-2xs ${
                  selectedStaffId === staff.id
                    ? 'bg-sky-50 border-sky-300'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <strong className="text-slate-900 text-xs font-bold">
                    {staff.name} ({staff.id})
                  </strong>
                  {staff.role && (
                    <span className="block text-[10px] text-slate-500">{staff.role}</span>
                  )}
                </div>
                {selectedStaffId === staff.id && (
                  <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                )}
              </button>
            ))}
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
            disabled={!selectedStaff}
            onClick={() => selectedStaff && onConfirm(incident, selectedStaff)}
            className="text-xs px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Assignment
          </Button>
        </div>
      </div>
    </div>
  )
}
