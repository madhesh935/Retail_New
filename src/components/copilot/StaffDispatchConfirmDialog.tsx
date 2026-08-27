import React from 'react'
import {
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  X,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StaffDispatchConfirmDialogProps {
  isOpen: boolean
  staffId: string
  taskTitle: string
  onConfirm: () => void
  onCancel: () => void
}

export const StaffDispatchConfirmDialog: React.FC<StaffDispatchConfirmDialogProps> = ({
  isOpen,
  staffId,
  taskTitle,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in-0"
        onClick={onCancel}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl z-10 space-y-3.5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-amber-50 border border-amber-200 text-amber-600">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Confirm Staff Allocation Dispatch
              </h3>
              <span className="text-[10px] text-slate-500">Manager Authorization Required</span>
            </div>
          </div>

          <Button variant="ghost" size="icon-xs" onClick={onCancel} className="text-slate-400 hover:text-slate-900">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Dispatch Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Target Employee:</span>
            <strong className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 font-mono font-bold">
              Associate {staffId}
            </strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Assigned Mission:</span>
            <strong className="text-slate-900 text-xs font-bold">{taskTitle}</strong>
          </div>

          <div className="pt-2 border-t border-slate-200/60 text-[10px] text-amber-800 font-sans leading-tight">
            Dispatch notification will be pushed immediately to the associate&apos;s mobile handheld device with walking route and priority level.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs text-slate-500 hover:text-slate-900">
            Cancel
          </Button>
          <Button variant="action" size="sm" onClick={onConfirm} className="gap-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Confirm & Dispatch</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
